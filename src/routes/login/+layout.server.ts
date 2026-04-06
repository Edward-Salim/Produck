import type { LayoutServerLoad } from './$types.js';

// Override parent layout — don't query workspaces/projects for login page
export const load: LayoutServerLoad = async () => {
  return {
    workspaces: [],
    activeWorkspaceId: '',
    projects: [],
    lastProject: '',
    gaugeKRs: [],
    gaugeYear: 0,
    gaugeQuarter: 0
  };
};
