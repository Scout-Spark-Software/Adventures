/**
 * One-time migration: copies files from Vercel Blob to Cloudflare R2 and
 * updates the fileUrl column in the database.
 *
 * Usage:
 *   npm run migrate:r2
 *
 * Idempotent — files already pointing to R2_PUBLIC_URL are skipped.
 * Safe to re-run if interrupted.
 */
import "dotenv/config";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, not, like } from "drizzle-orm";
import { files } from "../src/lib/db/schemas/files.js";

const {
  DATABASE_URL,
  R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET_NAME,
  R2_PUBLIC_URL,
} = process.env;

if (
  !DATABASE_URL ||
  !R2_ACCOUNT_ID ||
  !R2_ACCESS_KEY_ID ||
  !R2_SECRET_ACCESS_KEY ||
  !R2_BUCKET_NAME ||
  !R2_PUBLIC_URL
) {
  console.error(
    "Missing required env vars: DATABASE_URL, R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL"
  );
  process.exit(1);
}

const sql = neon(DATABASE_URL);
const db = drizzle(sql);

const client = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

const publicBase = R2_PUBLIC_URL.replace(/\/$/, "");

async function migrateFiles() {
  // Find all files not yet pointing at R2
  const legacyFiles = await db
    .select()
    .from(files)
    .where(not(like(files.fileUrl, `${publicBase}%`)));

  console.log(`Found ${legacyFiles.length} file(s) to migrate.`);

  let success = 0;
  let failed = 0;

  for (const file of legacyFiles) {
    try {
      const response = await fetch(file.fileUrl);
      if (!response.ok) {
        console.error(`  SKIP  ${file.id} — fetch failed: ${response.status} ${file.fileUrl}`);
        failed++;
        continue;
      }

      // Extract key from original URL: strip leading slash
      const key = new URL(file.fileUrl).pathname.replace(/^\/+/, "");
      const body = new Uint8Array(await response.arrayBuffer());

      await client.send(
        new PutObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: key,
          Body: body,
          ContentType: file.mimeType ?? "application/octet-stream",
          ContentLength: body.length,
        })
      );

      const newUrl = `${publicBase}/${key}`;
      await db.update(files).set({ fileUrl: newUrl }).where(eq(files.id, file.id));

      console.log(`  OK    ${file.id} → ${newUrl}`);
      success++;
    } catch (err) {
      console.error(`  FAIL  ${file.id}:`, err);
      failed++;
    }
  }

  console.log(`\nDone. ${success} migrated, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

migrateFiles().catch((err) => {
  console.error(err);
  process.exit(1);
});
