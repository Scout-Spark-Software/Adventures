import type { LayoutServerLoad } from "./$types";
import { env } from "$env/dynamic/private";

export const load: LayoutServerLoad = async ({ locals }) => {
  const user = locals.user;
  const isPreview = env.ENV === "preview";

  if (!user) {
    return { user: null, isPreview };
  }
  return {
    user: { ...user },
    isPreview,
  };
};
