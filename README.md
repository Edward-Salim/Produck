<p align="center">
  <img src="src/lib/assets/brand/logo-produck.png" alt="Produck" width="120" />
</p>

# Produck

Personal productivity workspace by [Edward Salim](https://github.com/Edward-Salim). Product management tooling, OKR tracking, fintech dashboards, and AI-assisted workflows.

## Stack

- **Framework:** SvelteKit
- **Database:** Neon (PostgreSQL) + Drizzle ORM
- **Styling:** Tailwind CSS + shadcn-svelte
- **Runtime:** Node.js 22 (Netlify)
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
| `pnpm check`     | Type-check Svelte and TypeScript          |
| `pnpm lint`      | Check formatting and ESLint               |
| `pnpm test`      | Run tests with Node.js TypeScript support |
| `pnpm db:push`   | Push schema to Neon                       |
| `pnpm db:studio` | Open Drizzle Studio                       |
