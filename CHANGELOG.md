# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- **Time breakdown: cap "Claude thinking" gaps so mid-turn suspensions aren't counted as thinking.**
  Previously only the assistant-end→user gap was capped by `IDLE_THRESHOLD_MS`; the
  user→assistant and tool_result→assistant gaps (both attributed to `claudeThink`) were
  uncapped. So any long pause that landed *mid-turn* — an overnight gap after a tool result,
  a credit stall, a remote-control handoff — was reported as hours of "Claude thinking."
  These gaps are now capped at `THINK_CAP_MS` (10 min); the remainder is booked as `humanAway`.
  On a real 16 h session with overnight gaps this moved ~9 h out of "thinking"
  (11 h 34 m → 2 h 35 m) into away time, where it belongs.

## [1.0.0] - 2026-02-18

### Added

- **Live dashboard** (`--live`): Real-time session monitoring with auto-refresh
- **5-phase time breakdown**: Claude thinking, tool execution, subagents, planning, waiting on you
- **Cost tracking**: Per-session and per-minute cost estimates for Opus, Sonnet, and Haiku
- **Tool latencies**: Per-tool avg/p50/p95 response times
- **Token deduplication**: Accurate token counts by merging streaming chunks
- **Cache hit rate**: Visual bar showing prompt cache efficiency
- **Context trend**: Sparkline showing input context growth over session
- **Hourly activity heatmap**: 24-hour sparkline in aggregate views
- **Daily breakdown**: Per-day stats with bars for multi-day views
- **Session filtering**: `--since`, `--until`, `--model`, `--min-duration`, `--min-cost`
- **Session lookup**: `--session <id>` to target a specific session
- **Sort options**: `--sort cost|duration|tokens|turns|time`
- **Export formats**: `--csv`, `--markdown`, `--compact`, `--json` (with aggregate envelope)
- **Project filtering**: `--project <path>` to scope to a specific project
- **Color control**: `--no-color` and `--color` flags
- **Better error messages**: Actionable hints for empty results and filter mismatches
