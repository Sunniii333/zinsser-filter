# Zinsser Filter v1

Status: ready-for-agent

## Problem Statement

A writer producing Thai prose has no way to catch the style problems Zinsser's principles target — throat-clearing filler, redundant light-verb constructions, nominalization, excessive qualifiers, unnecessary passive voice, redundant verb pairs — without a second human reader. Existing tools that could do this kind of flagging use an LLM, which means the reasoning behind any flag is opaque and the output changes between runs on identical input. For a Writer trying to *internalize* the principles (not just get edits done for them), an unexplainable or inconsistent flag teaches nothing.

## Solution

A web app where a Writer pastes or types Thai prose and gets deterministic, rule-based highlights over passages worth reconsidering. Every highlight traces to one named Rule and comes with plain-language teaching copy — which Zinsser principle it serves and why the passage triggered it — never a rewritten replacement. An Editor curates the Rule set (as YAML, not code) and a Team Dictionary of never-flag terms; each Writer keeps their own Personal Dictionary and picks their own genre Preset. Confidence Tiers (A/B/C) let a Writer calibrate how much to trust each highlight at a glance, and accept/dismiss decisions feed a review view the Editor uses to retune Rules over time.

## User Stories

**Core analysis loop**
1. As a Writer, I want passages that violate Zinsser's principles underlined as I write, so that I can find weak prose without a second reader.
2. As a Writer, I want analysis to run on my settled text (debounced), not on every keystroke, so that the editor doesn't feel laggy or jumpy while I'm actively typing.
3. As a Writer, I want my original text never mutated by the system, so that every change in the document is one I made deliberately.
4. As a Writer, I want highlighting to never interfere with normal typing, selection, or copy-paste, so that the tool stays out of my way.
5. As a Writer, I want identical text and identical Rule set to always produce identical highlights, so that I can trust the tool isn't behaving randomly.
6. As a Writer, I want every highlight traceable to a specific named Rule, so that I can understand exactly what triggered it.

**Teaching / explanation**
7. As a Writer, I want each highlight to explain *why* it was raised, so that I learn the principle behind it and eventually stop making the mistake.
8. As a Writer, I want the explanation panel to show, in order: which principle applies, why this passage triggers it, an illustrative rewrite where one exists, and Accept/Dismiss controls.
9. As a Writer, I want explanation copy written in plain language for a working writer, so that I'm never confronted with linguistic jargon (POS tags, pattern syntax, tier labels).
10. As a Writer, I want Tier C highlights to explicitly say the decision depends on context the system can't see, so that I don't mistake a heuristic guess for a confident correction.
11. As a Writer, applying a suggestion should be one action when a concrete rewrite exists, so that fixing an obvious case doesn't cost me more effort than it saves.
12. As a Writer, when no concrete rewrite exists (Tier C), I want the panel to only offer dismissal and explanation, so that the tool never pretends to know a fix it doesn't have.
13. As an Editor, I want my Writer to internalize style principles through repeated exposure to the explanations, so that I depend less on giving line edits myself over time.

**Confidence and trust calibration**
14. As a Writer, I want low-confidence (Tier C) suggestions visually distinct from high-confidence (Tier A) ones, so that I can calibrate how much attention each deserves without reading every tooltip.
15. As a Writer, I want all three tiers flagged by default, so that I see even merely-suspicious passages and decide for myself whether they matter.

**Rules and genre presets**
16. As a Writer, I want a sensible default Preset (Article) on first use, so that I can start writing without configuring anything.
17. As a novelist, I want to disable passive-voice flags via a Preset, so that intentional passive constructions in my genre aren't repeatedly questioned.
18. As a Writer, I want to pick my own Preset regardless of any team default, so that my genre of writing (which may differ from a teammate's) is respected.
19. As an Editor, I want to set the team's default Preset, so that a new Writer starts from a sensible baseline without me having to configure each account by hand.
20. As a Writer configuring a Custom preset, I want to toggle Rule families (not individual Rules or POS categories), so that the axis I'm reasoning about is always a writing principle, never an implementation detail.

**Handling system limitations**
21. As a Writer, I want to mark a domain term as acceptable in my Personal Dictionary, so that it stops being flagged in every draft I write.
22. As an Editor, I want to add a term to the Team Dictionary, so that shared jargon or brand names don't have to be added individually by every Writer.
23. As a Writer, I want to reach "never flag this" directly from a highlight's dismiss action, so that fixing a recurring false positive doesn't require digging through settings.
24. As a Writer, I want the system to degrade gracefully (fewer Rules firing) rather than crash when a word is unrecognized or the tokenizer fails, so that a bad edge case in my draft never blocks me from writing.

**Accounts and team**
25. As an Editor, I want to invite Writer accounts myself, so that access to the tool stays limited to my actual team.
26. As a Writer, I want my Personal Dictionary and accept/dismiss history to be private to my own account, so that using the tool doesn't expose my draft-by-draft editing habits to anyone else by default.
27. As a Writer, I want to see the same aggregated per-Rule dismiss-rate view the Editor sees, so that the tool's own self-assessment (which Rules are too noisy) is transparent to me too, not just management data.

**Rule maintenance**
28. As an Editor, I want per-Rule dismiss rates surfaced in an internal review view, so that I can identify Rules that are too broad and retune them.
29. As an Editor, I want every accept and dismiss recorded with Rule id, tier, matched span, and surrounding Sentence context, so that I have enough detail to actually retune a Rule, not just a raw count.
30. As an Editor, I want dismiss-rate data to inform my own retuning decisions rather than automatically change a Rule's behavior, so that the system never becomes non-deterministic or unpredictable between sessions.
31. As an Editor, I want to edit a Rule (pattern, tier, suppression, explanation) as a plain data file, so that tuning a Rule is a content change, never a code deploy.

## Implementation Decisions

**Core analysis seam** — a single deterministic function, `analyzeText(text, { rules, preset })` → an ordered list of Highlights (each carrying rule id, principle, tier, matched span as character offsets into the original text, and explanation copy). This function contains the entire pipeline — tokenization, POS lookup, pattern matching, suppression, tier assignment — and has no dependency on the database, auth, or UI layer. It is the one seam nearly all testing runs through.

**Tokenization**: PyThaiNLP `newmm` (dictionary/maximal-matching, not the deep-learning `attacut`) — chosen for determinism and debuggability over marginal accuracy gains, and because it fits Vercel Python Functions' constraints comfortably. Known multi-token compounds the Rules depend on (`ทำการ`, `มีการ`, `เกิดการ`, `ให้ความ`, `มีความ`) are normalized before pattern matching, and patterns are written defensively to also match the un-normalized/split form. Character offsets are preserved end-to-end so a Highlight's span maps back exactly into the Writer's original text, including whitespace/punctuation the tokenizer discards.

**Sentence boundary** (used for density Rules and cross-sentence exclusion): a heuristic, not a linguistic sentence splitter — whichever comes first scanning raw input: newline, double space, or one of `. ! ? ฯ`. See ADR 0001.

**Lexitron data**: only `telex-utf8.csv` (Thai-search direction) is ingested — 40,855 rows / 32,366 unique Thai headwords with POS in `t-cat` — loaded into an in-memory/indexed lookup at build or cold-start time, never queried over the network per-word. `etlex-utf8.csv` (English-search direction) is not used and is removed from the repo.

**Rule definition**: a declarative YAML record per Rule — id, principle, pattern, suppression, tier (A/B/C), explanation copy, enabled_in_presets. No in-app Rule-editing UI in v1; an Editor edits the YAML files directly and it ships like any other content change.

**Nominalization suppression** (the highest-priority, highest-difficulty Rule family): NOT a live "is this compound present in Lexitron as a noun" check — that mechanism was disproved against the real data (see ADR 0003). Suppression for `มีความ`/`ให้ความ` patterns is a hand-curated literal exception list inside each Rule's `suppression` field, maintained by the Editor the same way Rule tuning is.

**Qualifier density** (R6.4 equivalent): defaults, tunable later via the dismiss-rate feedback loop rather than hardcoded — a paragraph is text between blank lines; flag at ≥2 qualifiers in one Sentence or ≥3 in one paragraph; Tier C.

**Roles**: exactly two, Writer and Editor — no separate "Rule Maintainer" role in v1. Editor covers rule authoring/tuning and team administration (accounts, Team Dictionary). Accounts are invite-only (Editor creates/invites Writers; no self-service signup). Auth is email + password only (Auth.js credentials provider, no SSO).

**Review view**: dismiss-rate data is always aggregated per Rule id — never broken out per Writer, and this is not merely an access-control choice but a permanent constraint on the data model (see ADR 0002). It is visible to every Writer, not Editor-only.

**Personal Dictionary vs Team Dictionary**: two tiers. Personal Dictionary entries are scoped to one Writer's account. Team Dictionary entries, managed by the Editor, apply to every Writer's account. Both are consulted as suppression signals before a Highlight is emitted (R5.3 — suppression evaluated pre-emission, not as a post-filter, so suppression reasons can be logged for debugging without surfacing to the Writer).

**Preset**: a per-Writer setting, always Writer-overridable; Article is the default on first use. The Editor can set the team's default Preset but cannot lock a Writer's choice.

**Stack / deploy**: Next.js on Vercel; the analysis pipeline (the `analyzeText` seam) runs as Vercel Python Functions; data (accounts, Personal/Team Dictionary entries, feedback telemetry) lives in Neon Postgres via Vercel's Neon integration, free tier; Auth.js credentials provider for email+password auth. Viable on Vercel's free Hobby plan because usage is non-commercial — one Writer, one Editor (see ADR 0004). No external API calls of any kind from the analysis pipeline (offline-capable, self-contained).

**Feedback capture**: every accept/dismiss recorded with Rule id, tier, matched span, and surrounding Sentence context. This data is read by the Editor (and every Writer, per the review-view decision above) for manual retuning; nothing in the pipeline consumes it automatically. A Rule's tier is a value an Editor can revise by hand based on this data — never a value the system adjusts itself.

## Testing Decisions

- **`analyzeText` is the primary test target.** A good test here feeds a real Thai sentence/paragraph string plus a Rule set and Preset, and asserts on the returned Highlight list (rule id, tier, span) — never on intermediate tokenization or pattern-matching internals. This is the standard the whole Rule engine is tested against, across every Rule family (filler phrases, light-verb, nominalization Tiers B/C, qualifier density, passive voice, redundant verb pairs).
- Every shipped Rule needs at least one positive case (the pattern should fire) and, where a suppression list applies, at least one negative case proving the exception list actually suppresses it — this is what would have caught the §3.3 contradiction found during domain modeling before it shipped.
- The sentence-boundary heuristic and the compound-normalization step (`ทำการ`/`มีการ`/`เกิดการ`/`ให้ความ`/`มีความ`, including stacked/nested cases like `ได้มีการดำเนินการแก้ไข`) are deterministic pure functions in their own right and get direct unit tests independent of the full pipeline.
- No existing before/after draft corpus exists (confirmed during domain modeling); test sentences for nominalization and the other families are authored synthetically from the worked examples already in this domain, reviewed periodically by the Editor as real drafts surface edge cases.
- Account, Personal/Team Dictionary, and feedback-capture routes are tested as ordinary Next.js API-route/server-action integration tests against a real (test) Neon database — standard CRUD-plus-auth testing, not a novel seam, so no special test design is needed beyond following normal framework conventions.
- Trivial wiring (e.g. a route that only forwards to `analyzeText` and serializes the result) does not need its own test beyond what already covers `analyzeText` and basic route-reachability.

## Out of Scope

- Automatic rewriting or text generation — the system highlights and explains, it never produces replacement prose.
- Sentence-flow repair after a suggestion is applied (e.g. supplying a new connective once a filler phrase is removed) — the Writer's work, not the system's.
- Grammar or spelling correction — this is a style tool, not a proofreader.
- Cross-sentence or document-level analysis — all Rules operate within Sentence scope.
- Real-time multi-user collaboration, comments, or version history.
- English-language support, despite Lexitron's English-search direction being present in the source data.
- Automatic Rule learning/adaptation from feedback — retuning is always a human (Editor) decision.
- An in-app Rule-editing UI — Rules are edited as YAML files directly.
- Self-service account signup and SSO — invite-only, email+password.
- Per-Writer breakdowns of dismiss data anywhere in the product, including for the Editor.
- Locking a Writer's Preset choice — an Editor can only set the team default.
- Visual/UI design system details (component library, exact "Pastel Neo-Brutalism" styling) — noted as the intended design direction but not specified further here; a design pass happens separately from this spec.

## Further Notes

- This spec covers the full v1 scope from `intentt.md`, corrected where the requirements draft's assumptions didn't survive contact with the real data: the Lexitron entry count (§3.1) and, more importantly, the nominalization suppression mechanism (§3.3) — see ADR 0003 for the concrete contradiction found (`ความจำเป็น`/`ความช่วยเหลือ`/`การปรับปรุง` are all present in Lexitron exactly like the terms the spec expected to be absent).
- `intentt.md` §12 already flags that the true bottleneck is linguistic labor (writing/testing/tuning Thai patterns and teaching copy), not engineering — this spec doesn't change that reality, and the curated suppression-list decision above makes it slightly larger than `intentt.md` originally assumed.
- Given the small real-world scale (one Writer, one Editor, non-commercial), prefer the simplest viable implementation at every decision point the spec doesn't pin down — this is not a multi-tenant SaaS product.
