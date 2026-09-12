# 02 — analyzeText core pipeline + filler-phrase Rule family

**What to build:** The deterministic `analyzeText(text, { rules, preset })` seam that the entire product runs through — tokenization, character-offset preservation, sentence-boundary detection, YAML rule loading, pattern matching, tier assignment — proven end to end against the filler-phrase Rule family (the simplest family, no suppression complexity). No database, auth, or UI dependency.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] `analyzeText(text, { rules, preset })` implemented as a pure function (Vercel Python Function), returning an ordered list of Highlights (rule id, principle, tier, matched span as character offsets into the original text, explanation copy)
- [ ] Tokenization via PyThaiNLP `newmm` (not `attacut`)
- [ ] Character offsets map back exactly into the Writer's original text, including whitespace/punctuation the tokenizer discards
- [ ] Sentence-boundary heuristic implemented as its own deterministic pure function with direct unit tests (newline, double space, or `. ! ? ฯ` — whichever comes first; see ADR 0001)
- [ ] Filler-phrase Rule family authored as YAML (id, principle, pattern, tier, explanation, enabled_in_presets) and detected by the pipeline
- [ ] Identical text + identical Rule set always produces identical highlights (determinism test)
- [ ] Every shipped Rule has at least one positive test case (pattern fires) feeding a real Thai sentence/paragraph and asserting on rule id/tier/span only — never on tokenization/pattern-matching internals
