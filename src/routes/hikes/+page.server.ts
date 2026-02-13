import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ fetch, url }) => {
  // Build params from all URL search params
  const params = new URLSearchParams();

  // Pass all filter params to the API
  const filterParams = [
    "status",
    "search",
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

  // Fetch hikes with filters
  const hikes = await fetch(`/api/hikes?${params.toString()}`).then((r) => r.json());

  // Fetch feature types for filter component
  const featureTypes = await fetch("/api/feature-types?active=true").then((r) => r.json());

  // Build current filters object for component
  const currentFilters: Record<string, string> = {};
  filterParams.forEach((param) => {
    const value = url.searchParams.get(param);
    if (value) currentFilters[param] = value;
  });

  return {
    hikes: hikes || [],
    featureTypes: featureTypes || [],
    currentFilters,
  };
};
