# 01 — Project scaffold + accounts

**What to build:** A deployed Next.js app on Vercel with Neon Postgres wired up. An Editor can log in with email + password (Auth.js credentials provider) and can invite Writer accounts — no self-service signup.

**Blocked by:** None — can start immediately.

**Status:** blocked-on-user (deploy step needs the account owner's Neon/Vercel login)

- [ ] App deployed on Vercel, connected to Neon Postgres (free tier, per ADR 0004)
- [x] Auth.js credentials provider (email + password, no SSO) wired end to end
- [x] A seeded Editor account can log in and reach an authenticated shell page
- [x] Editor can invite a Writer account (invite-only — no self-service signup path exists)
- [x] Writer can log in with the invited credentials

## Comments

Code complete as of commit `0f437e8`: Next.js app scaffold, Drizzle `users` schema, Auth.js credentials provider (JWT sessions, no adapter needed), `/login` + `/dashboard` pages, Editor-only `inviteWriter` server action, `db/seed.ts` for the initial Editor. Typecheck, lint, and `next build` all pass locally.

Deploy is the one remaining checkbox — it needs a real Neon connection string and a Vercel login, neither of which the agent has. `scripts/deploy-setup.sh` is a step-by-step wizard for the account owner to run themselves: creates the Neon project, runs `db:push`/`db:seed` against it, generates `AUTH_SECRET`, and deploys to Vercel. Once that's run, flip the last checkbox and set Status to `resolved`.
