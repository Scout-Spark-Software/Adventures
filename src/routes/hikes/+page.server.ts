import { getUserRole } from "$lib/auth";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ fetch, url, locals }) => {
  // Build params from all URL search params
  const params = new URLSearchParams();

  // Pass all filter params to the API
  const filterParams = [
    "status",
    "search",
    "councilId",
    "difficulty",
    "trailType",
    "minDistance",
    "maxDistance",
    "minRating",
    "features",
    "dogFriendly",
  ];

  filterParams.forEach((param) => {
    const value = url.searchParams.get(param);
    if (value) params.append(param, value);
  });

  // Ensure limit is set for pagination
  if (!params.has("limit")) {
    params.append("limit", "50");
  }

  // Fetch hikes with filters and feature types and councils in parallel
  const [hikes, featureTypes, councils] = await Promise.all([
    fetch(`/api/hikes?${params.toString()}`).then((r) => r.json()),
    fetch("/api/feature-types?active=true").then((r) => r.json()),
    fetch("/api/councils").then((r) => r.json()),
  ]);

  // Build current filters object for component
  const currentFilters: Record<string, string> = {};
  filterParams.forEach((param) => {
    const value = url.searchParams.get(param);
    if (value) currentFilters[param] = value;
  });

  const userRole = locals.userId ? await getUserRole(locals.userId) : null;

  return {
    hikes: hikes || [],
    featureTypes: featureTypes || [],
    councils: councils || [],
    currentFilters,
    userRole,
  };
};
