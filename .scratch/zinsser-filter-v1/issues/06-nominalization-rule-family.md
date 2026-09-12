# 06 — Nominalization Rule family with curated suppression

**What to build:** Detection of nominalization (มีความ/ให้ความ patterns), Tiers B and C, with the hand-curated suppression exception list from ADR 0003 (not a live Lexitron dictionary lookup, which was disproved against the real data).

**Blocked by:** 05

**Status:** ready-for-agent

- [ ] Nominalization Rule family authored as YAML with a hand-curated literal suppression exception list in the `suppression` field (e.g. ความสุข, ความรัก)
- [ ] Tier B and Tier C variants assigned per the worked examples in the domain docs
- [ ] Positive test cases proving the pattern fires (e.g. ความจำเป็น, ความช่วยเหลือ, การปรับปรุง — per ADR 0003, these must fire despite being present in Lexitron)
- [ ] Negative test cases proving the suppression exception list actually suppresses the curated terms
