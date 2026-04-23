import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  type _Object,
} from "@aws-sdk/client-s3";
import { error } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export type FileType = "image" | "document";

export function validateFile(file: File, fileType: FileType): void {
  const allowedTypes = fileType === "image" ? ALLOWED_IMAGE_TYPES : ALLOWED_DOCUMENT_TYPES;

  if (!allowedTypes.includes(file.type)) {
    throw error(
      400,
      `Invalid file type. Allowed types for ${fileType}: ${allowedTypes.join(", ")}`
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    throw error(400, `File size exceeds maximum of ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  }
}

/** Strips leading slashes to produce a valid R2/S3 object key. */
function toKey(pathname: string): string {
  return pathname.replace(/^\/+/, "");
}

let _s3Client: S3Client | undefined;

function getS3Client(): S3Client {
  if (_s3Client) return _s3Client;

  const accountId = env.R2_ACCOUNT_ID;
  const accessKeyId = env.R2_ACCESS_KEY_ID;
  const secretAccessKey = env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw error(500, "R2 storage not configured");
  }

  const endpoint = env.R2_ENDPOINT_OVERRIDE ?? `https://${accountId}.r2.cloudflarestorage.com`;

  _s3Client = new S3Client({
    region: "auto",
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: Boolean(env.R2_ENDPOINT_OVERRIDE),
  });

  return _s3Client;
}

function getPublicUrl(key: string): string {
  let base = env.R2_PUBLIC_URL;
  if (!base) {
    throw error(500, "R2_PUBLIC_URL not configured");
  }
  if (!base.startsWith("http://") && !base.startsWith("https://")) {
    base = `https://${base}`;
  }
  return `${base.replace(/\/$/, "")}/${key}`;
}

function getBucketName(): string {
  const bucket = env.R2_BUCKET_NAME;
  if (!bucket) {
    throw error(500, "R2_BUCKET_NAME not configured");
  }
  return bucket;
}

export async function uploadFile(
  file: File,
  fileType: FileType,
  path: string
): Promise<{ url: string; pathname: string }> {
  validateFile(file, fileType);

  const client = getS3Client();
  const bucket = getBucketName();
  const key = toKey(path);

  const arrayBuffer = await file.arrayBuffer();

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: new Uint8Array(arrayBuffer),
      ContentType: file.type,
      ContentLength: file.size,
      // Paths include a timestamp so the content never changes at a given key.
      // Immutable caching maximises CDN cache hit rates and reduces R2 egress.
      CacheControl: "public, max-age=31536000, immutable",
    })
  );

  return { url: getPublicUrl(key), pathname: key };
}

export async function deleteFile(pathname: string): Promise<void> {
  const client = getS3Client();
  const bucket = getBucketName();
  // DeleteObjectCommand silently no-ops on missing keys — correct behaviour
  await client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: toKey(pathname),
    })
  );
}

export async function listFiles(prefix: string): Promise<_Object[]> {
  const client = getS3Client();
  const bucket = getBucketName();
  const key = toKey(prefix);
  const all: _Object[] = [];
  let continuationToken: string | undefined;

  do {
    const response = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: key,
        ContinuationToken: continuationToken,
      })
    );
    all.push(...(response.Contents ?? []));
    continuationToken = response.IsTruncated ? response.NextContinuationToken : undefined;
  } while (continuationToken);

  return all;
}
