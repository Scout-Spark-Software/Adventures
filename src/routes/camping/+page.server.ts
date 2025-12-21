import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ fetch, url }) => {
  // Build params from all URL search params
  const params = new URLSearchParams();

  // Pass all filter params to the API
  const filterParams = [
    "status",
    "search",
    "siteType",
    "petPolicy",
    "firePolicy",
    "minCost",
    "maxCost",
    "amenities",
    "facilities",
    "reservationRequired",
  ];

  filterParams.forEach((param) => {
    const value = url.searchParams.get(param);
    if (value) params.append(param, value);
  });

  // Ensure limit is set for pagination
  if (!params.has("limit")) {
    params.append("limit", "50");
  }

  // Fetch camping sites with filters
  const campingSites = await fetch(
    `/api/camping-sites?${params.toString()}`,
  ).then((r) => r.json());

  // Fetch amenity types and facility types for filter component
  const amenityTypes = await fetch("/api/amenity-types?active=true").then((r) =>
    r.json(),
  );
  const facilityTypes = await fetch("/api/facility-types?active=true").then(
    (r) => r.json(),
  );

  // Build current filters object for component
  const currentFilters: Record<string, string> = {};
  filterParams.forEach((param) => {
    const value = url.searchParams.get(param);
    if (value) currentFilters[param] = value;
  });

  return {
    campingSites: campingSites || [],
    amenityTypes: amenityTypes || [],
    facilityTypes: facilityTypes || [],
    currentFilters,
  };
};
