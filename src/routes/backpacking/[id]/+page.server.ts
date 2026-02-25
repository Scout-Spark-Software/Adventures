import { loadDetailPage } from "$lib/server/detail-page-loader";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, fetch, locals }) => {
  return loadDetailPage({
    entityId: params.id,
    entityType: "backpacking",
    apiEndpoint: `/api/backpacking/${params.id}`,
    locals,
    fetch,
  });
};
