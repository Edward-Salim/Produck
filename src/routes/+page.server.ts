import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = async ({ locals }) => {
  return {
    currentUser: locals.session?.user ?? null
  };
};
