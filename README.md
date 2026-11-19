<p align="center">
  <img src="src/lib/assets/brand/logo-produck.png" alt="Produck" width="120" />
</p>

# Produck

Personal productivity workspace by [Edward Salim](https://github.com/Edward-Salim). Product management tooling, OKR tracking, fintech dashboards, and AI-assisted workflows.

## Stack

- **Framework:** SvelteKit
- **Database:** Neon (PostgreSQL) + Drizzle ORM
- **Styling:** Tailwind CSS + shadcn-svelte
- **Runtime:** Cloudflare Workers with Node.js compatibility
- **Package manager:** pnpm
- **Auth:** Custom credential-based sessions

## Getting Started

```sh
pnpm install
pnpm dev
```

Import Lucide icons individually, for example `import BookOpen from '@lucide/svelte/icons/book-open'`. This keeps the dev server from loading the full icon export list on a fresh start. ESLint rejects imports of runtime values from the package root while allowing type-only imports.

## Scripts

| Command          | Description                               |
| ---------------- | ----------------------------------------- |
| `pnpm dev`       | Start dev server                          |
| `pnpm build`     | Production build                          |
| `pnpm preview`   | Build and run the app locally in Wrangler |
| `pnpm deploy`    | Build and deploy to Cloudflare Workers    |
| `pnpm check`     | Type-check Svelte and TypeScript          |
| `pnpm lint`      | Check formatting and ESLint               |
| `pnpm test`      | Run tests with Node.js TypeScript support |
| `pnpm db:push`   | Push schema to Neon                       |
| `pnpm db:studio` | Open Drizzle Studio                       |

## Cloudflare deployment

Sign in with `pnpm exec wrangler login`, then run `pnpm deploy`. The Worker uses the
existing Neon database, the `produck-jobs` queue, and the private `BOOK_FILES` KV namespace.
Set production secrets through Wrangler or the Cloudflare dashboard. See `.env.example`
for the variable names. Preserve the existing `DATABASE_URL` and `DATA_ENCRYPTION_KEY` to
keep existing accounts, sessions, and encrypted records accessible.

Apply the database migrations before the first Worker deployment. The password verification
migration preserves the existing PBKDF2 hashes by running verification in Neon.

`pnpm preview` loads local secrets from `.env` and uses local Queue and KV bindings. To publish
a large book original to the production KV namespace, sign in with Wrangler or set
`CLOUDFLARE_API_TOKEN` with Workers KV write access before running `scripts/import-book-file.mjs`.
Large book files count toward the Workers KV storage allowance.

For deployments on push, connect the `main` branch in the Worker's Builds settings.
Use `pnpm build` as the build command and `pnpm exec wrangler deploy` as the deploy command.

## Book cover zoom

Bookshelf cover zoom is stored in `library_book.cover_zoom`. Use `1` for the original
cover or `1.025` for a 2.5% zoom. Values from `1` to `2` are supported. Update the
database directly, then refresh the bookshelf to see the change. No redeploy is needed
once the app version supporting this setting is deployed.

## Deprecated features

Job Board (`/jobs`) and Chinese Learning (`/chinese-learning`, including HSK, reading, and lyrics) are deprecated and no longer maintained. They are hidden from the sidebar and keyboard navigation, and excluded from last-page resume. Direct links still work and display a deprecation notice.

Their routes, components, server code, APIs, database tables, and assets are retained. Legacy Chinese learning URLs still redirect to the existing pages. To restore them, update `src/lib/constants/deprecated-features.ts` and re-add their navigation entries in `src/routes/(app)/+layout.svelte`.
