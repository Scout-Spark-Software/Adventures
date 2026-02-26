import { getUserRole } from "$lib/auth";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ fetch, url, locals }) => {
  const params = new URLSearchParams();

  const filterParams = [
    "status",
    "search",
    "difficulty",
    "trailType",
    "campingStyle",
    "minDistance",
    "maxDistance",
    "minDays",
    "maxDays",
    "minRating",
    "features",
    "dogFriendly",
    "councilId",
  ];

  filterParams.forEach((param) => {
    const value = url.searchParams.get(param);
    if (value) params.append(param, value);
  });

  if (!params.has("limit")) {
    params.append("limit", "50");
  }

  const [backpackingEntries, featureTypes, councils] = await Promise.all([
    fetch(`/api/backpacking?${params.toString()}`).then((r) => r.json()),
    fetch("/api/feature-types?active=true").then((r) => r.json()),
    fetch("/api/councils").then((r) => r.json()),
  ]);

  const currentFilters: Record<string, string> = {};
  filterParams.forEach((param) => {
    const value = url.searchParams.get(param);
    if (value) currentFilters[param] = value;
  });

  const userRole = locals.userId ? await getUserRole(locals.userId) : null;

  return {
    backpackingEntries: backpackingEntries || [],
    featureTypes: featureTypes || [],
    councils: councils || [],
    currentFilters,
    userRole,
  };
};
