import type { Fetcher, KVNamespace, Queue } from '@cloudflare/workers-types';
import type { BackgroundJob } from '$lib/server/background-job.js';

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      session: {
        user: {
          id: string;
          email: string;
          displayName: string;
          role: string;
        };
      } | null;
    }
    // interface PageData {}
    interface PageState {
      articleDetail?: boolean;
      bookShelf?: 'work' | 'misc';
    }
    interface Platform {
      env: {
        ASSETS?: Fetcher;
        BOOK_FILES?: KVNamespace;
        JOBS?: Queue<BackgroundJob>;
      };
    }
  }
}

export {};
