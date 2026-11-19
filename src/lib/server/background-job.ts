import { dev } from '$app/environment';

export type BackgroundJob = {
  kind: 'application-cover-letter' | 'chinese-reading' | 'chinese-song-lyric';
  id: string;
};

export async function dispatchJob(
  platform: App.Platform | undefined,
  job: BackgroundJob,
  runLocally: () => Promise<unknown>
) {
  if (dev) {
    void runLocally().catch((error) => console.error(`Local ${job.kind} job failed:`, error));
    return;
  }

  if (!platform?.env.JOBS) throw new Error('The background job queue is unavailable.');
  await platform.env.JOBS.send(job);
}
