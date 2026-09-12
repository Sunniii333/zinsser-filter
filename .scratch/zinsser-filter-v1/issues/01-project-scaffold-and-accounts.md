# 01 — Project scaffold + accounts

**What to build:** A deployed Next.js app on Vercel with Neon Postgres wired up. An Editor can log in with email + password (Auth.js credentials provider) and can invite Writer accounts — no self-service signup.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] App deployed on Vercel, connected to Neon Postgres (free tier, per ADR 0004)
- [ ] Auth.js credentials provider (email + password, no SSO) wired end to end
- [ ] A seeded Editor account can log in and reach an authenticated shell page
- [ ] Editor can invite a Writer account (invite-only — no self-service signup path exists)
- [ ] Writer can log in with the invited credentials
