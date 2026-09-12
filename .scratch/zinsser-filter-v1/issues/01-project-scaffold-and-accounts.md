# 01 — Project scaffold + accounts

**What to build:** A deployed Next.js app on Vercel with Neon Postgres wired up. An Editor can log in with email + password (Auth.js credentials provider) and can invite Writer accounts — no self-service signup.

**Blocked by:** None — can start immediately.

**Status:** resolved

- [x] App deployed on Vercel, connected to Neon Postgres (free tier, per ADR 0004)
- [x] Auth.js credentials provider (email + password, no SSO) wired end to end
- [x] A seeded Editor account can log in and reach an authenticated shell page
- [x] Editor can invite a Writer account (invite-only — no self-service signup path exists)
- [x] Writer can log in with the invited credentials

## Comments

Code complete as of commit `0f437e8`: Next.js app scaffold, Drizzle `users` schema, Auth.js credentials provider (JWT sessions, no adapter needed), `/login` + `/dashboard` pages, Editor-only `inviteWriter` server action, `db/seed.ts` for the initial Editor. Typecheck, lint, and `next build` all pass locally.

Deployed live at https://zinsser-filter.vercel.app (Neon project + GitHub repo `Sunniii333/zinsser-filter`, imported into Vercel via its dashboard rather than the CLI — the account owner's local terminal wasn't accepting keyboard input, so `scripts/deploy-setup.sh` went unused in favor of a browser-only GitHub+Vercel-dashboard path, run jointly with the agent). Verified end to end via browser automation: Editor login → dashboard, Editor invites a Writer, Writer logs in with those credentials and sees the dashboard without the invite form. The test Writer account created for verification was deleted afterward.
