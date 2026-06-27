export type JobRefreshError = {
  source: string;
  error: string;
};

export type JobRefreshStatus = {
  running: boolean;
  startedAt: string | null;
  finishedAt: string | null;
  fetched: number | null;
  total: number | null;
  errors: JobRefreshError[];
  message: string;
};

let status: JobRefreshStatus = {
  running: false,
  startedAt: null,
  finishedAt: null,
  fetched: null,
  total: null,
  errors: [],
  message: 'Idle'
};

const staleRefreshMs = 15 * 60 * 1000;

export function getJobRefreshStatus(): JobRefreshStatus {
  if (status.running && status.startedAt) {
    const startedAt = new Date(status.startedAt).getTime();
    if (Number.isFinite(startedAt) && Date.now() - startedAt > staleRefreshMs) {
      status = {
        ...status,
        running: false,
        finishedAt: new Date().toISOString(),
        message: 'Refresh status expired'
      };
    }
  }

  return status;
}

export function startJobRefresh() {
  status = {
    running: true,
    startedAt: new Date().toISOString(),
    finishedAt: null,
    fetched: null,
    total: null,
    errors: [],
    message: 'Fetching jobs'
  };
}

export function finishJobRefresh(result: {
  fetched?: number;
  total?: number;
  errors?: JobRefreshError[];
}) {
  status = {
    ...status,
    running: false,
    finishedAt: new Date().toISOString(),
    fetched: result.fetched ?? null,
    total: result.total ?? result.fetched ?? null,
    errors: result.errors ?? [],
    message: 'Refresh complete'
  };
}

export function failJobRefresh(err: unknown) {
  status = {
    ...status,
    running: false,
    finishedAt: new Date().toISOString(),
    message: err instanceof Error ? err.message : 'Refresh failed'
  };
}
