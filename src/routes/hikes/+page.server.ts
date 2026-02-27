import { getUserRole } from "$lib/auth";
import type { PageServerLoad } from "./$types";

const PAGE_SIZE = 25;

export const load: PageServerLoad = async ({ fetch, url, locals }) => {
  const params = new URLSearchParams();

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

  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
  const offset = (page - 1) * PAGE_SIZE;

  params.set("limit", String(PAGE_SIZE));
  params.set("offset", String(offset));

  const [hikeResponse, featureTypes, councils] = await Promise.all([
    fetch(`/api/hikes?${params.toString()}`).then((r) => r.json()),
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
    hikes: hikeResponse?.data || [],
    total: hikeResponse?.total || 0,
    page,
    pageSize: PAGE_SIZE,
    featureTypes: featureTypes || [],
    councils: councils || [],
    currentFilters,
    userRole,
  };
};
