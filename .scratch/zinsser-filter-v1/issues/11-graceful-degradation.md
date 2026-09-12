# 11 — Graceful degradation on tokenizer/unrecognized-word failure

**What to build:** `analyzeText` never crashes on a bad edge case — an unrecognized word or a tokenizer failure results in fewer Rules firing, not a blocked Writer.

**Blocked by:** 02

**Status:** ready-for-agent

- [ ] An unrecognized word does not raise an unhandled error out of `analyzeText`
- [ ] A tokenizer failure on a chunk of input results in that chunk contributing no Highlights, rather than failing the whole request
- [ ] Test simulating an unrecognized word/tokenizer failure and asserting `analyzeText` still returns a (partial) Highlight list instead of throwing
