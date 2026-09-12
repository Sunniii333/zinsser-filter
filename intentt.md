# Requirements: Rule-Based Thai Writing Assistant

**Version:** 0.1 (pre-implementation draft)
**Status:** Awaiting stakeholder confirmation before system design
**Date:** 2026-09-12

---

## 1. Core Intent

A web application that analyzes Thai prose against a curated set of writing-style rules derived from William Zinsser's principles, and highlights passages worth reconsidering — **without using an LLM**. The system is deterministic, rule-based, and transparent: every highlight traces to a named rule and an explainable reason.

The system does not claim a passage is *wrong*. It says the passage is *worth considering*. This is a factual statement about the system's epistemic position, not a politeness convention: a rule engine sees POS sequences within a sentence, but authorial intent, genre convention, and cross-sentence context live outside its reach.

### 1.1 Secondary intent (discovered during stakeholder interview)

The tool is also a **teaching instrument**. The editor stakeholder's stated goal is for their writers to *internalize Zinsser's principles*, not merely to accept mechanical corrections. This elevates explanation copy from a nice-to-have to a first-class deliverable: every rule ships with its pedagogical text, and a rule without good explanation copy is not considered done.

---

## 2. Pipeline Architecture

```
Input text
   ↓
[1] Tokenization        → segment Thai text into words
   ↓
[2] POS Lookup          → assign part-of-speech via Lexitron + fallback
   ↓
[3] Pattern Matching    → match POS/lexical sequences against rule patterns
   ↓
[4] Rule Evaluation     → apply suppression logic, assign confidence tier
   ↓
[5] Highlight Rendering → inline underline + explanation tooltip + accept/dismiss
   ↓
[6] Feedback Capture    → per-decision telemetry feeding manual rule curation
```

Each stage is independently testable. Stage 6 does not feed back into stages 1–4 automatically — see §8.

---

## 3. Language Data Layer

### 3.1 Lexitron scope correction

**Important correction to the original project assumption.** The figure of ~130,000 words is the *sum of both directions* in Lexitron 2.0 (Thai→English ~53,000 entries, English→Thai ~83,000 entries). The usable Thai-side lexicon is approximately **53,000 entries**, not 130,000. All coverage estimates and rule-design decisions must be based on the 53,000 figure.

### 3.2 What Lexitron provides

| Field | Use in this system |
|---|---|
| Thai headword (lemma) | Dictionary membership test |
| Part of speech | Primary POS source for pattern matching |
| Synonyms | Reserved — not used in v1 |
| Example sentences | Reserved — potential source for rule test corpus |

### 3.3 Lexitron's second, non-obvious role

Beyond POS lookup, **dictionary membership itself is a signal**. A word's *presence* in Lexitron as a noun indicates it is a lexicalized noun; its *absence* when it matches a nominalization pattern indicates it was constructed on the fly by the writer. This distinction is the primary suppression mechanism for the nominalization rule family (§6.3) and is what makes that rule viable at all.

### 3.4 Coverage gaps to handle explicitly

- Neologisms, domain jargon, and proper nouns will be absent from Lexitron
- Absence must never be treated as an error condition
- Words with no POS entry are marked `UNKNOWN` and excluded from POS-dependent patterns (lexical-literal patterns may still fire)
- User-level personal dictionary (§7.4) is the mitigation path

---

## 4. Tokenization Requirements

Thai has no inter-word spacing, making segmentation the highest-risk stage in the pipeline — segmentation errors propagate silently into every downstream stage.

**R4.1** — The system must use an established Thai tokenizer (PyThaiNLP `newmm`, `attacut`, or equivalent). Expected accuracy is roughly 90–95%, not 100%.

**R4.2** — The system must normalize known multi-token compounds that rules depend on, before pattern matching. Critical examples: `ทำการ`, `มีการ`, `เกิดการ`, `ให้ความ`, `มีความ`. Without normalization, `ทำการตรวจสอบ` may segment as `ทำ|การ|ตรวจสอบ` and the Tier A rule will silently fail to fire.

**R4.3** — Patterns should be written defensively to match both the normalized and the split form where feasible, rather than relying on normalization alone.

**R4.4** — Character offsets must be preserved through tokenization so highlights map back to exact positions in the user's original text, including whitespace and punctuation the tokenizer may discard.

---

## 5. Rule Engine Requirements

### 5.1 Rule definition shape

Every rule is a declarative record containing:

| Field | Purpose |
|---|---|
| `id` | Stable identifier, used in telemetry |
| `principle` | Which Zinsser principle it serves (§6) |
| `pattern` | POS and/or lexical sequence to match |
| `suppression` | Conditions under which a match is discarded |
| `tier` | Confidence tier: A, B, or C (§5.2) |
| `explanation` | Teaching copy shown in tooltip (§7.2) |
| `enabled_in_presets` | Which genre presets include this rule by default |

Rules are **data, not code**. Adding or tuning a rule must not require a code deploy path distinct from a content update.

### 5.2 Confidence tiers

| Tier | Meaning | Visual treatment |
|---|---|---|
| **A** | Near-mechanical. Removing the flagged text does not change meaning. Very low false-positive rate. | Solid underline |
| **B** | Strong signal, requires dictionary suppression to stay accurate. | Standard underline |
| **C** | Heuristic. Genuinely context-dependent; the system cannot resolve it. | Faint / dotted underline |

**R5.2.1** — Tier is a property of the rule, assigned by the rule author, and revisable based on observed dismiss rates (§8).

**R5.2.2** — Per the stakeholder's stated preference (*"น่าสงสัยก็เตือนด้วย"* — flag it even if only suspicious), the **default configuration enables all three tiers**. This is a deliberate recall-favoring default and departs from the conservative precision-first default typical of such tools. The stakeholder explicitly accepts a false-positive rate around 1 in 10.

**R5.2.3** — Tier C must remain visually distinguishable from Tier A so the user can calibrate trust at a glance without reading every tooltip.

### 5.3 Suppression

**R5.3** — Suppression rules must be evaluated *before* a flag is emitted, not as a post-filter, so that suppression reasons can be logged for debugging without surfacing to the user.

---

## 6. Rule Families (v1 Scope)

Priority order below reflects the stakeholder interview, **not** implementation difficulty. Note that the highest-value family is also the most technically difficult.

### 6.1 Filler phrases / throat-clearers — **Priority: High, Difficulty: Low**

Fixed-phrase matching. No POS dependency, therefore immune to tokenization and dictionary gaps.

Examples: `ผมคิดว่า`, `ผมคิดในใจว่า`, `ผมรู้สึกว่า`, `ตามความเห็นของผม`, `ในความคิดของผม`

Rationale surfaced to user: the entire text is already the author's viewpoint; announcing it adds words without adding meaning.

**Implementation note:** This family should ship first. It is the highest precision-per-effort rule set in the project and validates the whole pipeline end-to-end.

### 6.2 Redundant light-verb constructions — **Priority: High, Difficulty: Low**

This is Tier A of the nominalization work and is separable from the harder cases.

```
ทำการ + V   → delete "ทำการ"
มีการ + V   → delete "มีการ"
เกิดการ + V → delete "เกิดการ"
```

Examples:
- `ทำการตรวจสอบข้อมูล` → `ตรวจสอบข้อมูล`
- `ได้มีการดำเนินการแก้ไข` → `แก้ไข` (nested case — must handle stacked constructions)

Suppression: if the `การ`-prefixed token forms a Lexitron noun (`การบ้าน`, `การเกษตร`, `การค้า`), discard the match. A single suppression check covers the entire known exception class.

### 6.3 Nominalization — **Priority: Highest (stakeholder), Difficulty: Highest**

The stakeholder named nominalization among the most frequent problems in the work they edit. This was originally scoped as a stretch item because Thai has no direct analogue to English `-tion`/`-ment` morphology; it must be **reinterpreted for Thai**, not ported.

**Tier B patterns** (dictionary-suppressed):
```
มีความ + ADJ/stative-V  → use the adjective directly
    มีความจำเป็นต้องแก้  → จำเป็นต้องแก้
    SUPPRESS: มีความสุข, มีความรัก  (Lexitron nouns)

ให้ความ + N             → use the verb directly
    ให้ความช่วยเหลือ     → ช่วยเหลือ
```

**Tier C pattern** (flag faintly, do not push):
```
การ/ความ + V/ADJ, absent from Lexitron, in subject or object position
    การปรับปรุงระบบเกิดขึ้นแล้ว  → consider: เราปรับปรุงระบบแล้ว
```

**Known limitation, to be stated in the tooltip:** Tier C cannot be resolved by the system. Whether the nominalized form is the correct choice depends on who the actor is and whether the sentence needs a nominal subject — information that lives outside the sentence. The tool raises the question; the writer answers it.

### 6.4 Excessive qualifiers — **Priority: Medium, Difficulty: Low**

Examples: `ค่อนข้าง`, `มาก`, `จริงๆ`, `เหลือเกิน`, `อย่างยิ่ง`

**R6.4** — Must be frequency-aware rather than absolute. A single qualifier is normal prose; a cluster is the signal. Flag on density within a sentence or paragraph, not on every occurrence.

### 6.5 Passive voice — **Priority: Medium, Difficulty: Medium**

Pattern: `ถูก` / `โดน` + V

**R6.5** — Must be preset-aware. Disabled by default in creative-writing presets where passive constructions are frequently intentional. Enabled in the article preset.

**R6.5.1** — `ถูก` is highly ambiguous in Thai (also functions as an adjective meaning *correct* or *cheap*). POS context is mandatory before flagging.

### 6.6 Redundant verb pairs — **Priority: Low, Difficulty: Medium**

Curated list only, never a general rule. Example: `หางานทำ` → `หางาน`.

**R6.6** — Because these are conventional collocations in ordinary Thai, this family ships as Tier C and must be labeled experimental.

---

## 7. Web Application Requirements

### 7.1 Editor surface

**R7.1.1** — Plain-text editing surface with inline highlight rendering. Highlights must not interfere with normal typing, selection, or copy-paste.

**R7.1.2** — Analysis runs on the client's stable text state (debounced), not on every keystroke.

**R7.1.3** — Original text is never mutated by the system. All changes are applied by the user.

### 7.2 Highlight interaction — teaching-first

**R7.2.1** — Clicking or hovering a highlight opens an explanation panel containing, in order:
1. Which Zinsser principle applies
2. **Why** this passage triggers that principle (the teaching content — stakeholder's primary stated expectation)
3. An illustrative rewrite where one exists
4. Accept / Dismiss controls

**R7.2.2** — For Tier C highlights, the explanation must explicitly state that the decision depends on context the system cannot see. Do not imply certainty the engine does not have.

**R7.2.3** — Explanation copy must be written for a working writer, not a linguist. Internal machinery (POS tags, pattern syntax, tier labels) is never exposed in user-facing copy.

**R7.2.4** — Applying a suggestion is a single user action where a concrete rewrite exists; where none exists (Tier C), the panel offers dismissal and explanation only. **The system never generates replacement prose.** Its output is location + reason, never new text.

### 7.3 Genre presets

**R7.3.1** — Presets bundle rule families, not individual rules. The user-facing axis is *writing principle*, never part-of-speech.

| Preset | Emphasis |
|---|---|
| **Article** (default) | All families enabled. Matches the stakeholder's primary work. |
| Academic / formal | Strict on filler and light-verb constructions; relaxed on nominalization where terminology demands it |
| Creative | Passive voice disabled; redundancy and filler retained |
| Marketing | Strict on qualifiers; nominalization relaxed |
| Custom | Per-family toggles |

**R7.3.2** — Default preset on first use is **Article**.

**R7.3.3** — POS-level configuration is never surfaced to users. It is an implementation detail of pattern matching.

### 7.4 Personal dictionary

**R7.4** — Users can add terms that should never be flagged. This is the primary mitigation for Lexitron's coverage gaps (domain jargon, proper nouns, neologisms) and must be reachable directly from a highlight's dismiss action, not buried in settings.

---

## 8. Feedback Loop

The stakeholder explicitly values per-decision feedback capture (*"ทีละจุดนะ ข้อมูลนี้สำคัญเอาไปพัฒนาต่อได้"*).

**R8.1** — Every accept and dismiss is recorded with: rule id, tier, the matched span, and surrounding sentence context.

**R8.2** — Dismiss rate is tracked per rule and surfaced in an internal review view.

**R8.3** — **Feedback informs human rule curation. It does not automatically modify rules.** Automatic adaptation would make the system non-deterministic and destroy the transparency that is its reason for existing over an LLM. A high dismiss rate is a signal for a maintainer to investigate, retune, or demote a rule's tier — a human decision.

**R8.4** — Rule tier is revisable based on accumulated dismiss data. A Tier B rule with a persistently high dismiss rate should be demoted to Tier C or retired.

---

## 9. Non-Functional Requirements

**R9.1 — Determinism.** Identical input plus identical rule set must produce identical output, always. This is the system's core differentiator from LLM-based tools and must not be compromised for any feature.

**R9.2 — Explainability.** Every highlight must be traceable to a specific rule id. No highlight may be emitted without an attributable rule.

**R9.3 — Performance.** Analysis of a typical article (1,000–3,000 Thai characters) should complete fast enough to feel immediate. Lexitron lookups must be in-memory or indexed, never per-word network calls.

**R9.4 — Offline-capable analysis.** No analysis step may require an external API. The rule engine and lexicon are self-contained.

**R9.5 — Graceful degradation.** Tokenizer failure, unknown words, and missing POS data must degrade the number of rules that can fire — never crash the analysis or block the editor.

---

## 10. Explicitly Out of Scope (v1)

- **Automatic rewriting or text generation.** The system highlights and explains; it does not produce replacement prose. Doing so would require the contextual judgment the project deliberately declines to claim.
- **Sentence-flow repair.** Removing a filler phrase may leave a sentence needing a new connective (as in `ผมคิดในใจว่าต้องหางานทำยากแน่` → `แบบนี้หางานยากแน่`). Supplying that connective is the writer's work, not the system's.
- **Grammar or spelling correction.** This is a style tool, not a proofreader.
- **Cross-sentence or document-level analysis.** All rules operate within sentence scope in v1.
- **Multi-user collaboration, comments, version history.**
- **English-language support**, despite Lexitron's English side being present in the data.
- **Automatic rule learning from feedback** (see R8.3).

---

## 11. User Stories

**Primary flow**
- As a writer, I want passages that violate Zinsser's principles underlined in my draft, so that I can find weak prose without a second reader.
- As a writer, I want each highlight to explain *why* it was raised, so that I learn the principle and eventually stop making the mistake.
- As an editor, I want to hand this tool to my writers, so that they internalize style principles instead of depending on me for line edits.

**Configuration**
- As a writer of articles, I want the default settings to suit article writing, so that I can start without configuring anything.
- As a novelist, I want to disable passive-voice flags, so that intentional passive constructions are not repeatedly questioned.

**Handling system limitations**
- As a writer, I want to mark a domain term as acceptable, so that it stops being flagged in every draft I write.
- As a writer, I want low-confidence suggestions visually distinct from high-confidence ones, so that I can calibrate how much attention each deserves.
- As a writer, I want the system to admit when a decision depends on context it cannot see, so that I trust it on the cases where it *is* confident.

**Maintenance**
- As a rule maintainer, I want per-rule dismiss rates, so that I can identify rules that are too broad and retune them.

---

## 12. Key Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Tokenizer splits rule-critical compounds | Tier A rules silently never fire | Compound normalization (R4.2) + defensive patterns (R4.3) + explicit test cases per rule |
| Lexitron coverage gaps cause false positives | User trust erodes early | Personal dictionary (R7.4); absence never treated as error |
| Nominalization Tier C is too noisy | Highest-value rule family becomes the most annoying | Faint visual treatment; dismiss-rate monitoring; demotion path |
| Scope creep toward rewriting | Project loses its rule-based identity and differentiator | §10 treated as a hard boundary, not a v1 deferral |
| Rule-writing effort underestimated | Schedule slip | Rule authoring is linguistic work, not coding work — budget it separately from engineering time |

**On the last risk:** the true bottleneck of this project is not software architecture. The pipeline is well-understood engineering. The bottleneck is the linguistic labor of writing, testing, and tuning Thai patterns against a real corpus, plus writing the teaching copy for each. Plan accordingly.

---

## 13. Suggested Build Order

1. Pipeline skeleton end-to-end with **one** hardcoded filler-phrase rule — proves tokenization, offset mapping, and highlight rendering
2. Lexitron ingestion and indexed POS lookup
3. Filler-phrase family, complete (§6.1)
4. Light-verb family (§6.2) — first rule requiring dictionary suppression
5. Explanation panel + accept/dismiss + feedback capture
6. Article preset + remaining presets
7. Nominalization Tiers B and C (§6.3) — highest value, highest difficulty, benefits from having feedback infrastructure already live
8. Qualifiers, passive, redundant pairs

---

## 14. Open Questions for Stakeholder

1. Should the teaching explanations reference Zinsser by name and cite the specific principle, or be phrased as general writing advice?
2. Is there an existing corpus of edited drafts (before/after pairs) available for rule testing? This would substantially accelerate §6.3.
3. Should accept/dismiss data be tied to individual writer accounts (enabling per-writer progress tracking) or pooled anonymously?
4. Is a Thai-language UI required for v1, or is a bilingual/English interface acceptable initially?
