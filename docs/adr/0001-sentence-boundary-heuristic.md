# Sentence boundaries are whitespace/punctuation heuristics, not a linguistic sentence splitter

Rule density (R6.4) and cross-sentence exclusion (§10) both need a "sentence" boundary, but Thai has no reliable sentence-final punctuation the way English does. We considered using a statistical/linguistic Thai sentence tokenizer, but rejected it: its accuracy is no better than word tokenization (already only 90-95%, R4.1), and an unpredictable splitter would make rule firing non-deterministic in a way no one auditing a highlight could explain — directly undermining R9.1 (determinism) and R9.2 (explainability), the system's core differentiator from an LLM tool.

Decided instead: a sentence boundary is whichever comes first scanning the raw input — a newline, a double space, or one of `. ! ? ฯ`. Cruder linguistically, but 100% reproducible and traceable to the exact rule.
