import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ fetch }) => {
  const [featuredHikes, featuredCampingSites, featuredBackpacking, stats] = await Promise.all([
    fetch("/api/hikes?featured=true&limit=6").then((r) => r.json()).then((r) => r.data ?? r),
    fetch("/api/camping-sites?featured=true&limit=6").then((r) => r.json()).then((r) => r.data ?? r),
    fetch("/api/backpacking?featured=true&limit=6").then((r) => r.json()).then((r) => r.data ?? r),
    fetch("/api/stats").then((r) =>
      r.ok
        ? (r.json() as Promise<{
            trails: number;
            campsites: number;
            backpacking: number;
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
