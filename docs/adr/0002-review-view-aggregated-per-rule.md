# Internal review view never breaks dismiss data out per Writer

R8.2 requires dismiss rate be "surfaced in an internal review view," and once the deployment model became multi-user with per-Writer accounts, it became possible to slice that data per individual Writer instead of just per rule. We decided against ever doing so, and made the view readable by every Writer (not Editor-only).

This is a deliberate trade-off, not an oversight: per-Writer dismiss breakdowns would turn a teaching instrument (§1.1 — the tool exists so writers internalize Zinsser's principles) into a covert performance-monitoring tool, which would poison the trust the tool depends on for writers to actually engage with its suggestions. The view stays aggregated per rule id only, forever, regardless of what the underlying telemetry schema (R8.1) technically allows.
