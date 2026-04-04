import { loadDetailPage } from "$lib/server/detail-page-loader";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const load: PageServerLoad = async ({ params, fetch, locals }) => {
  const data = await loadDetailPage({
    entityId: params.id,
    entityType: "backpacking",
    apiEndpoint: `/api/backpacking/${params.id}`,
    locals,
    fetch,
  });

  // Redirect UUID-based URLs to the canonical slug URL
  if (UUID_RE.test(params.id) && data.backpacking?.slug && data.backpacking.slug !== params.id) {
    throw redirect(301, `/backpacking/${data.backpacking.slug}`);
  }

  return data;
};
