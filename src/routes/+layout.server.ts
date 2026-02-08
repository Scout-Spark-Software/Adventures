import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals }) => {
  const user = locals.user;

  if (!user) {
    return { user: null };
  }
  return {
    user: {
      ...user,
    },
  };
};
