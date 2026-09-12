# 04 — Explanation panel + Accept/Dismiss + feedback capture

**What to build:** Clicking a highlight opens an explanation panel, in order: which principle applies, why this passage triggers it, an illustrative rewrite where one exists, and Accept/Dismiss controls — all in plain language, no linguistic jargon. Every accept/dismiss is persisted with enough detail to retune the Rule later.

**Blocked by:** 03

**Status:** ready-for-agent

- [ ] Clicking a highlight opens a panel showing, in this order: principle, why-it-triggered explanation, illustrative rewrite (if one exists), Accept/Dismiss controls
- [ ] Copy is plain-language for a working writer — no POS tags, pattern syntax, or tier labels shown
- [ ] Tier C highlights explicitly state the decision depends on context the system can't see
- [ ] When a concrete rewrite exists, Accept applies it in one action
- [ ] When no concrete rewrite exists (Tier C), the panel offers only Dismiss + explanation, never a fabricated fix
- [ ] Every accept/dismiss is recorded with rule id, tier, matched span, and surrounding Sentence context
