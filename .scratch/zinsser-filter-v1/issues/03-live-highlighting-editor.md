# 03 — Live highlighting text editor

**What to build:** A Writer pastes or types Thai prose into the web app. Analysis runs on settled text (debounced, not per keystroke) and renders filler-phrase highlights as underlines directly in the editor, visually distinguished by Confidence Tier (A/B/C), with all three tiers shown by default.

**Blocked by:** 01, 02

**Status:** ready-for-agent

- [ ] Writer can paste or type Thai text into an editor in the authenticated app
- [ ] Analysis is debounced to settled text, not run on every keystroke
- [ ] Highlights render as underlines over the exact matched span, without mutating the Writer's original text
- [ ] Highlighting never interferes with normal typing, text selection, or copy-paste
- [ ] Tier A/B/C highlights are visually distinct from one another
- [ ] All three tiers are flagged and shown by default
