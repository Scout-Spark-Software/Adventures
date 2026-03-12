const fs = require("fs");
const { execSync } = require("child_process");

const envFile = process.argv[2] || ".env";
const env = process.argv[3] || "production";

if (!fs.existsSync(envFile)) {
  console.error(`Error: ${envFile} not found`);
  process.exit(1);
}

const obj = {};
for (const line of fs.readFileSync(envFile, "utf8").split("\n")) {
  if (!line || line.startsWith("#")) continue;
  const idx = line.indexOf("=");
  if (idx === -1) continue;
  const key = line.slice(0, idx).trim();
  const val = line
    .slice(idx + 1)
    .trim()
    .replace(/^['"](.*)['"]$/, "$1");
  obj[key] = val;
}

fs.writeFileSync("secrets.json", JSON.stringify(obj, null, 2));
console.log(`Uploading ${Object.keys(obj).length} secrets to Cloudflare Pages (${env})...`);

try {
  execSync(
    `wrangler pages secret bulk secrets.json --project-name adventure-spark --env ${env}`,
    { stdio: "inherit" }
  );
  console.log("Secrets uploaded successfully.");
} finally {
  fs.unlinkSync("secrets.json");
  console.log("Cleaned up secrets.json");
}
