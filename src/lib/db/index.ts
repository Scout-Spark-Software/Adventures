import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { DATABASE_URL } from "$env/static/private";
import * as schema from "./schemas";

const databaseUrl = DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is not set.");
}

const sql = neon(databaseUrl);
export const db = drizzle(sql, { schema });
