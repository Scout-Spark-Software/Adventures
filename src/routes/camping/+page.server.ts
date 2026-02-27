import { getUserRole } from "$lib/auth";
import type { PageServerLoad } from "./$types";

const PAGE_SIZE = 25;

export const load: PageServerLoad = async ({ fetch, url, locals }) => {
  const params = new URLSearchParams();

  const filterParams = [
    "status",
    "search",
    "councilId",
    "siteType",
    "petPolicy",
    "firePolicy",
    "minCost",
    "maxCost",
    "minRating",
    "amenities",
    "facilities",
    "reservationRequired",
  ];

  filterParams.forEach((param) => {
    const value = url.searchParams.get(param);
    if (value) params.append(param, value);
  });

  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
  const offset = (page - 1) * PAGE_SIZE;

  params.set("limit", String(PAGE_SIZE));
  params.set("offset", String(offset));

  const [campingResponse, amenityTypes, facilityTypes, councils] = await Promise.all([
    fetch(`/api/camping-sites?${params.toString()}`).then((r) => r.json()),
    fetch("/api/amenity-types?active=true").then((r) => r.json()),
    fetch("/api/facility-types?active=true").then((r) => r.json()),
    fetch("/api/councils").then((r) => r.json()),
  ]);

  const currentFilters: Record<string, string> = {};
  filterParams.forEach((param) => {
    const value = url.searchParams.get(param);
    if (value) currentFilters[param] = value;
  });

  const userRole = locals.userId ? await getUserRole(locals.userId) : null;

  return {
    campingSites: campingResponse?.data || [],
    total: campingResponse?.total || 0,
    page,
    pageSize: PAGE_SIZE,
    amenityTypes: amenityTypes || [],
    facilityTypes: facilityTypes || [],
    councils: councils || [],
    currentFilters,
    userRole,
  };
};
