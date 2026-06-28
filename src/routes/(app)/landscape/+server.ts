import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';

export const GET: RequestHandler = ({ url }) => {
  const project = url.searchParams.get('project');
  const target = project ? `/frameworks?project=${encodeURIComponent(project)}` : '/frameworks';

  throw redirect(308, target);
};
