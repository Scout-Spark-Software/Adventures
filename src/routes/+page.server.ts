import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ fetch }) => {
  const [featuredHikes, featuredCampingSites, featuredBackpacking, stats] = await Promise.all([
    fetch("/api/hikes?featured=true&limit=6").then((r) => r.json()),
    fetch("/api/camping-sites?featured=true&limit=6").then((r) => r.json()),
    fetch("/api/backpacking?featured=true&limit=6").then((r) => r.json()),
    fetch("/api/stats").then((r) =>
      r.ok
        ? (r.json() as Promise<{
            trails: number;
            campsites: number;
            backpacking: number;
            scouts: number;
          }>)
        : null
    ),
  ]);

  return {
    featuredHikes: featuredHikes || [],
    featuredCampingSites: featuredCampingSites || [],
    featuredBackpacking: featuredBackpacking || [],
    stats: stats ?? null,
  };
};
