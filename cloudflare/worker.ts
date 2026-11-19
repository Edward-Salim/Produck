import type { ExportedHandler, Fetcher, KVNamespace, Queue } from '@cloudflare/workers-types';
import app from '../.svelte-kit/cloudflare/_worker.js';
import type { BackgroundJob } from '../src/lib/server/background-job.js';
import { processApplicationCoverLetterJob } from '../src/lib/server/application-cover-letter-jobs.js';
import { processChineseReadingJob } from '../src/lib/server/chinese-reading-jobs.js';
import { processChineseSongLyricImportJob } from '../src/lib/server/chinese-song-lyric-jobs.js';
import { connectDatabase } from '../src/lib/server/db/connect.js';

declare const FixedLengthStream: new (length: number) => {
  readable: ReadableStream<Uint8Array>;
  writable: WritableStream<Uint8Array>;
};

type Bindings = {
  ASSETS: Fetcher;
  BOOK_FILES: KVNamespace;
  JOBS: Queue<BackgroundJob>;
  DATABASE_URL: string;
  DEEPSEEK_API_KEY?: string;
  DEEPSEEK_MODEL?: string;
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (['www.produck.fun', 'produck.app', 'www.produck.app'].includes(url.hostname)) {
      url.hostname = 'produck.fun';
      url.protocol = 'https:';
      return Response.redirect(url, 301);
    }
    if (url.protocol === 'http:') {
      url.protocol = 'https:';
      return Response.redirect(url, 308);
    }

    const response = await app.fetch(request, env, ctx);
    const bookFile = /^\/api\/books\/[^/]+\/(file|download)$/.test(url.pathname);
    if (request.method !== 'GET' || response.status !== 200 || !bookFile || !response.body) {
      return response;
    }

    const length = Number(response.headers.get('content-length'));
    if (!Number.isSafeInteger(length) || length <= 0) return response;

    // Workers derive Content-Length from the stream and reject truncated downloads.
    const { readable, writable } = new FixedLengthStream(length);
    ctx.waitUntil(response.body.pipeTo(writable));
    return new Response(readable, response);
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
