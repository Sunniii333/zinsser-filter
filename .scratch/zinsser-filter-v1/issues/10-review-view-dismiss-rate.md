# 10 — Review view: per-Rule dismiss-rate

**What to build:** An aggregated per-Rule dismiss-rate view, visible to both Writer and Editor, that the Editor uses to spot Rules that are too broad and retune by hand. Never broken out per Writer.

**Blocked by:** 01, 04

**Status:** ready-for-agent

- [ ] Review view shows dismiss rate aggregated per Rule id, computed from the feedback data captured in ticket 04
- [ ] Data is never broken out per Writer anywhere in this view (per ADR 0002 — a permanent data-model constraint, not just access control)
- [ ] View is visible to every Writer, not Editor-only
- [ ] Viewing the data never changes a Rule's behavior automatically — retuning stays a manual YAML edit by the Editor
