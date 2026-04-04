import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config();

const sql = neon(process.env.DATABASE_URL!);

/**
 * Mirrors src/lib/utils/slugify.ts — duplicated here because scripts
 * run outside the SvelteKit build context.
 */
function toSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, " ")
    .trim()
    .replace(/[\s-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function backfillTable(tableName: string) {
  const rows = await sql.query(`SELECT id, name FROM ${tableName} WHERE slug IS NULL`);
  console.log(`${tableName}: ${rows.length} rows to backfill`);

  // Pre-load existing slugs to avoid conflicts with already-named rows
  const existingSlugs = await sql.query(`SELECT slug FROM ${tableName} WHERE slug IS NOT NULL`);
  const slugCounts: Record<string, number> = {};
  for (const { slug } of existingSlugs) {
    slugCounts[slug] = (slugCounts[slug] ?? 0) + 1;
  }

  for (const row of rows) {
    const base = toSlug(row.name) || row.id;
    let candidate = base;
    let counter = 2;

    while (slugCounts[candidate]) {
      candidate = `${base}-${counter++}`;
    }

    slugCounts[candidate] = 1;

    await sql.query(`UPDATE ${tableName} SET slug = $1 WHERE id = $2`, [candidate, row.id]);
    console.log(`  ${row.name} → ${candidate}`);
  }
}

async function main() {
  await backfillTable("hikes");
  await backfillTable("camping_sites");
  await backfillTable("backpacking");
  console.log("\nDone.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
