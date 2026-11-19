import type { ExportedHandler, Fetcher, KVNamespace, Queue } from '@cloudflare/workers-types';
import app from '../.svelte-kit/cloudflare/_worker.js';
import type { BackgroundJob } from '../src/lib/server/background-job.js';
import { processApplicationCoverLetterJob } from '../src/lib/server/application-cover-letter-jobs.js';
import { processChineseReadingJob } from '../src/lib/server/chinese-reading-jobs.js';
import { processChineseSongLyricImportJob } from '../src/lib/server/chinese-song-lyric-jobs.js';
import { connectDatabase } from '../src/lib/server/db/connect.js';

type Bindings = {
  ASSETS: Fetcher;
  BOOK_FILES: KVNamespace;
  JOBS: Queue<BackgroundJob>;
  DATABASE_URL: string;
  DEEPSEEK_API_KEY?: string;
  DEEPSEEK_MODEL?: string;
};

export default {
  fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (['www.produck.fun', 'produck.app', 'www.produck.app'].includes(url.hostname)) {
      url.hostname = 'produck.fun';
      url.protocol = 'https:';
      return Response.redirect(url, 301);
    }
    return app.fetch(request, env, ctx);
  },
  async queue(batch, env) {
    const { database, close } = connectDatabase(env.DATABASE_URL);
    try {
      for (const message of batch.messages) {
        const { kind, id } = message.body;
        switch (kind) {
          case 'application-cover-letter':
            await processApplicationCoverLetterJob(database, env, id);
            break;
          case 'chinese-reading':
            await processChineseReadingJob(database, env, id, env.ASSETS);
            break;
          case 'chinese-song-lyric':
            await processChineseSongLyricImportJob(database, env, id);
            break;
        }
        message.ack();
      }
    } finally {
      await close();
    }
  }
} satisfies ExportedHandler<Bindings, BackgroundJob>;
