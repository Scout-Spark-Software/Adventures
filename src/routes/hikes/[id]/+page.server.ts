import { loadDetailPage } from "$lib/server/detail-page-loader";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, fetch, locals }) => {
  return loadDetailPage({
    entityId: params.id,
    entityType: "hike",
    apiEndpoint: `/api/hikes/${params.id}`,
    locals,
    fetch,
  });
};
