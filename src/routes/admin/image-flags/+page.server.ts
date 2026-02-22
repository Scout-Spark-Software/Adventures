import { requireAdmin } from "$lib/auth/middleware";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, fetch }) => {
  await requireAdmin({ locals } as any);

  const [pendingRes, totalRes] = await Promise.all([
    fetch("/api/admin/image-flags?status=pending&limit=50"),
    fetch("/api/admin/image-flags?status=pending&limit=1"),
  ]);

  const flags = pendingRes.ok ? await pendingRes.json() : [];

  return { flags };
};
