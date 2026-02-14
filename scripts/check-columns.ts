import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config();

const sql = neon(process.env.DATABASE_URL!);

async function checkColumns() {
  const result = await sql`
    SELECT column_name, data_type, udt_name
    FROM information_schema.columns
    WHERE table_name = 'hikes'
    ORDER BY ordinal_position;
  `;

  console.log("Hikes table columns:\n");
  result.forEach((col: { column_name: string; data_type: string; udt_name: string }) => {
    console.log(`  ${col.column_name} - ${col.data_type} (${col.udt_name})`);
  });

  console.log(`\nTotal columns: ${result.length}`);
}

checkColumns();
