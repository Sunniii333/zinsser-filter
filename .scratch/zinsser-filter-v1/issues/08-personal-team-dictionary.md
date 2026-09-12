# 08 — Personal & Team Dictionary suppression

**What to build:** A Writer can mark a term never-flag in their own Personal Dictionary, reachable directly from a highlight's Dismiss action. An Editor can mark a term never-flag for every Writer via the Team Dictionary. Both are consulted as suppression signals before a Highlight is ever emitted.

**Blocked by:** 01, 04

**Status:** ready-for-agent

- [ ] Writer can add a term to their Personal Dictionary directly from a highlight's Dismiss action, not only via a separate settings page
- [ ] Editor can add a term to the Team Dictionary
- [ ] Personal Dictionary entries are scoped to one Writer's account and private to that account
- [ ] Team Dictionary entries apply to every Writer's account
- [ ] Both dictionaries are consulted pre-emission (before a Highlight is emitted), not as a post-filter, per R5.3
- [ ] Test proving a Personal Dictionary entry suppresses a Highlight that would otherwise fire for that Writer only
- [ ] Test proving a Team Dictionary entry suppresses a Highlight for every Writer
