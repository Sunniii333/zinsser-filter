# Zinsser Filter

A deterministic, rule-based Thai writing assistant that highlights prose worth reconsidering against Zinsser-derived style principles, without an LLM.

## Language

**Sentence** (operational, not linguistic):
The unit rule density (e.g. excessive qualifiers) and cross-sentence exclusion are scoped to. A sentence boundary is whichever comes first, scanning the writer's raw input: a newline, a double space, or one of `. ! ? ฯ`. Never inferred from a statistical/linguistic sentence splitter, so the boundary stays deterministic and traceable (R9.1).
_Avoid_: relying on punctuation alone, or on a library sentence-tokenizer, as the boundary signal.

**Rule**:
A declarative record (id, principle, pattern, suppression, tier, explanation, enabled_in_presets — see §5.1 of `intentt.md`) authored as a YAML file, never as code. There is no in-app rule editor in v1; a Rule Maintainer edits the YAML directly.
_Avoid_: "pattern config", "rule script".

**Rule Maintainer**:
The activity of authoring and tuning Rule YAML files based on accumulated dismiss-rate data (§8) — not a separate role from Editor in v1, see [[0002-review-view-aggregated-per-rule]] and the decisions log below.

**Writer**:
A person drafting Thai prose in the tool. Each Writer has their own account (multi-user, per-account model); their Personal Dictionary and accept/dismiss history are scoped per account.
_Avoid_: "user" (too generic — use Writer for the drafting role, Editor for the oversight role).

**Editor**:
The single combined oversight role for v1 — covers both rule authoring/tuning (what §5.1's "Rule Maintainer" does) and team administration (managing accounts, the Team Dictionary). Not split into separate roles unless real usage shows the two need different people.
_Avoid_: "Rule Maintainer", "admin" as a separate role from Editor in v1.

**Personal Dictionary**:
Terms one Writer has marked never-flag, scoped to that Writer's own account only (§7.4).

**Team Dictionary**:
Terms an Editor has marked never-flag for every Writer's account — the mitigation for shared jargon/brand names so every Writer doesn't have to add the same term individually.

**Suppression exception list**:
A hand-curated, literal list of terms in a Rule's `suppression` field (e.g. `มีความสุข`, `มีความรัก`) that stop a pattern match from firing. Not a live Lexitron dictionary lookup — see [[0003-nominalization-suppression-curated-list]] for why that mechanism, as originally specified in `intentt.md` §3.3, doesn't hold against the real data.
_Avoid_: treating "present in Lexitron as a noun" as a general-purpose suppression signal — it does not discriminate a lexicalized noun from a writer-coined nominalization (see below).

## Lexitron data (corrected against the actual files)

Two files are on hand: `telex-utf8.csv` (Thai-search, 40,855 rows / 32,366 unique Thai headwords, with POS in `t-cat`) and `etlex-utf8.csv` (English-search, 83,233 rows, keyed by English headword). Only `telex-utf8.csv` is used — `etlex-utf8.csv` is indexed the wrong direction for this system (Thai token → POS lookup) and English isn't in scope (§10), so it's dead weight and safe to delete from the repo. This supersedes `intentt.md` §3.1's ~53,000-entry estimate for the Thai side; use 40,855/32,366 instead.

Checking real entries also disproved §3.3's core claim (Lexitron-noun-membership as a suppression signal): `ความจำเป็น` and `ความช่วยเหลือ` — both worked examples the spec says should **fire** — are Lexitron nouns exactly like `ความสุข`/`ความรัก`, which the spec says should be **suppressed**. `การปรับปรุง` is also present, contradicting the Tier C "absent from Lexitron" firing example. See [[0003-nominalization-suppression-curated-list]].

## Decisions log

- **Deployment model**: multi-user with simple per-Writer accounts (not a single shared local instance), auth via plain email + password (no SSO), invite-only (Editor creates/invites Writer accounts, no self-service signup). Chosen so Personal Dictionaries and accept/dismiss telemetry attach to a person, matching the per-writer progress-tracking user story in §11.
- **No existing before/after draft corpus exists.** Nominalization (§6.3) test cases are authored synthetically and reviewed periodically by the Editor, rather than mined from real edits.
- **Two roles only, v1**: Writer and Editor. Editor's internal review view (R8.2) shows dismiss rate aggregated per rule — never broken out per Writer — so the tool cannot be used to evaluate an individual Writer's output, which would undercut its identity as a teaching instrument (§1.1). This aggregated review view is visible to every Writer, not Editor-only, for the same teaching-instrument reason. See [[0002-review-view-aggregated-per-rule]].
- **Preset (§7.3) is a per-Writer setting, always Writer-overridable.** Editor can set the team's default preset, never lock it.
- **Qualifier density (R6.4) defaults**, tunable later via the dismiss-rate feedback loop (R8.4), not hardcoded into the engine: a paragraph is text between blank lines; flag at ≥2 qualifiers in one Sentence or ≥3 in one paragraph; tier C.
- **Sentence boundary heuristic** and **nominalization suppression mechanism**: see ADRs [[0001-sentence-boundary-heuristic]] and [[0003-nominalization-suppression-curated-list]].
- **Deploy target**: Next.js on Vercel, analysis pipeline as Vercel Python Functions (`newmm` tokenizer — deterministic, fits comfortably in Vercel's function size/time limits), data in Neon Postgres (Vercel's native Postgres offering) via its free tier, auth via Auth.js credentials provider. Vercel's free Hobby plan is viable because usage is non-commercial (see ADR [[0004-vercel-hobby-deploy-target]]).
