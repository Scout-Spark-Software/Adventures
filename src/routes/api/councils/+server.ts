import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { db } from "$lib/db";
import { councils } from "$lib/db/schemas";
import { asc } from "drizzle-orm";

export const GET: RequestHandler = async () => {
  const rows = await db
    .select({
      id: councils.id,
      councilNumber: councils.councilNumber,
      name: councils.name,
      headquartersCity: councils.headquartersCity,
      headquartersState: councils.headquartersState,
    })
    .from(councils)
    .orderBy(asc(councils.councilNumber));

  return json(rows, {
    headers: {
      "Cache-Control": "s-maxage=86400, stale-while-revalidate=3600",
    },
  });
};
