import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { sql } from "drizzle-orm";
import dotenv from "dotenv";
dotenv.config();

const db = drizzle(neon(process.env.DATABASE_URL!));

async function main() {
  // Delete duplicate hikes — keep the OLDEST row (lowest created_at) per name
  // so any existing favorites/ratings/notes referencing it remain valid
  const hikeResult = await db.execute(sql`
    DELETE FROM hikes
    WHERE id NOT IN (
      SELECT DISTINCT ON (name) id
      FROM hikes
      ORDER BY name, created_at ASC
    )
  `);
  console.log(`Deleted ${hikeResult.rowCount} duplicate hike(s)`);

  // Delete duplicate camping sites
  const campResult = await db.execute(sql`
    DELETE FROM camping_sites
    WHERE id NOT IN (
      SELECT DISTINCT ON (name) id
      FROM camping_sites
      ORDER BY name, created_at ASC
    )
  `);
  console.log(`Deleted ${campResult.rowCount} duplicate camping site(s)`);

  // Verify clean
  const [hikeDups, campDups] = await Promise.all([
    db.execute(sql`SELECT name, COUNT(*) as cnt FROM hikes GROUP BY name HAVING COUNT(*) > 1`),
    db.execute(sql`SELECT name, COUNT(*) as cnt FROM camping_sites GROUP BY name HAVING COUNT(*) > 1`),
  ]);
  console.log("Remaining hike duplicates:", hikeDups.rows.length || "none");
  console.log("Remaining camping duplicates:", campDups.rows.length || "none");
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
