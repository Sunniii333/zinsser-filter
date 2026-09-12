# 05 — Light-verb construction Rule family

**What to build:** Detection of redundant light-verb constructions (ทำการ/มีการ/เกิดการ), including a compound-normalization step the pattern matching relies on, so these are highlighted in the same pipeline as the filler-phrase family.

**Blocked by:** 02

**Status:** ready-for-agent

- [ ] Compound normalization implemented as its own deterministic pure function for ทำการ/มีการ/เกิดการ/ให้ความ/มีความ, including nested/stacked cases (e.g. ได้มีการดำเนินการแก้ไข), with direct unit tests independent of the full pipeline
- [ ] Patterns are written defensively to also match the un-normalized/split form
- [ ] Light-verb Rule family authored as YAML and detected by `analyzeText`
- [ ] Positive test cases for the light-verb family (pattern fires on real Thai sentences)
