# 07 — Qualifier density, passive voice, and redundant verb-pair Rule families

**What to build:** The three remaining Rule families, each detected end to end by `analyzeText` with their own tests.

**Blocked by:** 02

**Status:** ready-for-agent

- [ ] Qualifier density Rule (Tier C): a paragraph is text between blank lines; flags at ≥2 qualifiers in one Sentence or ≥3 in one paragraph; defaults are data (YAML), not hardcoded, since they're expected to be retuned later via the dismiss-rate feedback loop
- [ ] Passive-voice Rule authored as YAML and detected by `analyzeText`
- [ ] Redundant verb-pair Rule authored as YAML and detected by `analyzeText`
- [ ] Each of the three families has at least one positive test case; the qualifier-density boundary conditions (exactly 2 in a sentence, exactly 3 in a paragraph) are covered
