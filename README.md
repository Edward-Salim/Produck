<p align="center">
  <img src="src/lib/assets/logo-produck.png" alt="Produck" width="120" />
</p>

# Produck

Personal productivity workspace by [Edward Salim](https://github.com/Edward-Salim). Product management tooling, OKR tracking, fintech dashboards, and AI-assisted workflows.

## Stack

- **Framework:** SvelteKit
- **Database:** Neon (PostgreSQL) + Drizzle ORM
- **Styling:** Tailwind CSS + shadcn-svelte
- **Runtime:** Bun
- **Auth:** Custom credential-based sessions

## Getting Started

```sh
pnpm install
pnpm dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server |
| `pnpm build` | Production build |
| `pnpm check` | Type-check + lint |
| `pnpm db:push` | Push schema to Neon |
| `pnpm db:studio` | Open Drizzle Studio |
