# Zinsser Filter

A deterministic, rule-based Thai writing assistant. See `CONTEXT.md` and `docs/adr/` for the domain model and architecture decisions, and `.scratch/zinsser-filter-v1/` for the spec and issues.

## Stack

Next.js (App Router) on Vercel, Neon Postgres via Drizzle ORM, Auth.js credentials provider (email + password, invite-only — no self-service signup).

## Local development

```bash
npm install
npm run dev
```

Needs a `.env.local` with:

```
DATABASE_URL=       # Neon Postgres connection string
AUTH_SECRET=        # random secret, e.g. `openssl rand -base64 32`
```

Then create the tables and seed the Editor account:

```bash
npm run db:push
EDITOR_EMAIL=you@example.com EDITOR_PASSWORD=... npm run db:seed
```

## Going live (Neon + Vercel)

If you don't already have a Neon database or a Vercel account, run:

```bash
bash scripts/deploy-setup.sh
```

It walks you through creating both, sets up the database, and deploys. Re-run it any time — it remembers values you've already entered.
