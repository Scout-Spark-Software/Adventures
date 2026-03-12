import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { env } from "$env/dynamic/private";
import * as schema from "./schemas";

let _db: ReturnType<typeof drizzle<typeof schema>> | undefined;

function getDb() {
  if (!_db) {
    if (!env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set.");
    }
    _db = drizzle(neon(env.DATABASE_URL), { schema });
  }
  return _db;
}

export const db = new Proxy({} as ReturnType<typeof getDb>, {
  get(_, prop) {
    return Reflect.get(getDb(), prop);
  },
});
