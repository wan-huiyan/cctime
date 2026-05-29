# cctime

**Real-time Claude Code session analytics** — live dashboard, time breakdown, cost tracking.

[![npm version](https://img.shields.io/npm/v/@dioptx/cctime)](https://www.npmjs.com/package/@dioptx/cctime)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/node/v/@dioptx/cctime)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org)

Know where your time (and money) goes. See if Claude is thinking, executing tools, or waiting on you.

```
 cctime · 2:05pm · 12m 34s active of 18m 12s (5m 38s away)

 ── Time Breakdown ──────────────────────────────────────
 Claude thinking ████████████░░░░░░░░  3m 42s  (29%)
 Tool execution  ██████████████░░░░░░  5m 18s  (42%)
 Subagents       █████░░░░░░░░░░░░░░░  2m  5s  (17%)
 Waiting on you  ███░░░░░░░░░░░░░░░░░  1m 29s  (12%)

 ── Tokens & Cost ───────────────────────────────────────
 Tokens  ████████████████████  142.5K in 28.3K out
 Cache   ▃▄▅▆▇█████  67% hit
 Cost    ~$1.25  ($0.10/min)   Avg response: 3.2s   Turns: 8

 ── Tools ───────────────────────────────────────────────
 Read         ████████████████████   34 calls  avg 95ms
 Bash         ███████████████░░░░░   28 calls  avg 4.2s
 Edit         ███████░░░░░░░░░░░░░   12 calls  avg 120ms
 Grep         ████░░░░░░░░░░░░░░░░    8 calls  avg 85ms
```

## Quick Start

```bash
npx @dioptx/cctime
```

No config needed. Reads your local Claude Code session files automatically.

## Features

| Feature | Description |
|---------|-------------|
| **Live Dashboard** | `--live` — real-time session monitoring with auto-refresh |
| **Time Breakdown** | 5-phase model: thinking, tools, subagents, planning, waiting |
| **Cost Tracking** | Per-session and per-minute cost for Opus, Sonnet, Haiku |
| **Tool Latencies** | Per-tool avg/p50/p95 response times |
| **Weekly Rollup** | Hourly heatmap, daily breakdown, aggregate stats |
| **Export Formats** | CSV, Markdown, JSON, compact one-liner view |

## Install

```bash
# Run directly (no install needed)
npx @dioptx/cctime

# Or install globally
npm install -g @dioptx/cctime
```

## Usage

```bash
# Last session (default)
cctime

# All sessions today
cctime --all

# Weekly rollup with daily breakdown
cctime --week

# Live-updating dashboard
cctime --live

# Custom date range
cctime --since 2026-02-15
cctime --since yesterday --until today

# Filter by project
cctime --week --project ~/projects/my-app

# Filter by model
cctime --week --model opus

# Sort and filter
cctime --week --sort cost
cctime --week --min-duration 5 --min-cost 0.50

# Export formats
cctime --week --csv > sessions.csv
cctime --week --markdown
cctime --week --compact
cctime --week --json

# Specific session
cctime --session abc123

# Disable color (for piping)
cctime --all --no-color
```

### All Options

| Flag | Description |
|------|-------------|
| `--all` | All sessions today |
| `--week` | Sessions from the last 7 days |
| `--live` | Live-updating dashboard for active session |
| `--session <id>` | Analyze a specific session by ID (or prefix) |
| `--since <date>` | Sessions since date (ISO, "today", "yesterday") |
| `--until <date>` | Sessions until date |
| `--project <path>` | Filter by project path |
| `--model <name>` | Filter by model (opus, sonnet, haiku) |
| `--min-duration <min>` | Minimum active duration in minutes |
| `--min-cost <usd>` | Minimum cost in USD |
| `--sort <field>` | Sort by: cost, duration, tokens, turns, time |
| `--json` | JSON output (with aggregate envelope for multi-session) |
| `--csv` | CSV export |
| `--markdown` | Markdown table export |
| `--compact` | One-line-per-session view |
| `--no-color` | Disable color output |
| `--color` | Force color output |

<details>
<summary><strong>How It Works</strong></summary>

cctime parses Claude Code JSONL session transcripts from `~/.claude/projects/` and classifies every millisecond into one of 5 phases:

| Phase | What's Happening | Detection |
|-------|-----------------|-----------|
| **Claude thinking** | Model is generating a response | User/ToolResult → Assistant gap |
| **Tool execution** | Running Bash, Read, Edit, etc. | ToolUse → ToolResult gap |
| **Subagents** | Task agents running in parallel | Task ToolUse → ToolResult gap |
| **Planning** | Plan mode active | EnterPlanMode/ExitPlanMode |
| **Waiting on you** | You're reading or typing | Assistant → User gap (< 2min) |

Time away (> 2 min gap) is tracked separately and excluded from active time.

**Token deduplication**: Claude Code streams responses as multiple JSONL chunks sharing a `requestId`. cctime merges these to avoid 3x token inflation.

**Cost estimation** uses published Anthropic pricing:

| Model | Input | Output | Cache Read | Cache Create |
|-------|-------|--------|------------|--------------|
| Opus | $15/M | $75/M | $1.50/M | $18.75/M |
| Sonnet | $3/M | $15/M | $0.30/M | $3.75/M |
| Haiku | $0.25/M | $1.25/M | $0.025/M | $0.3125/M |

</details>

<details>
<summary><strong>Development</strong></summary>

```bash
git clone https://github.com/dioptx/cctime.git
cd cctime
npm install
npm run build
npm test
```

```bash
npm run dev        # Watch mode (rebuilds on save)
npm run test:watch # Test watch mode
```

</details>

## Contributing upstream (this fork's workflow)

This is a fork of [`dioptx/cctime`](https://github.com/dioptx/cctime). To send a fix upstream:

1. **One dedicated branch per fix**, cut from `main` — e.g. `fix/<thing>`. Keep it focused so the upstream diff is self-contained.
2. Verify before opening: `npx tsc --noEmit` clean **and** `npm test` green (tests are co-located `*.test.ts`); no new runtime deps beyond `chalk`/`commander`.
3. Open the PR **from this fork's branch → `dioptx:main`** (`gh pr create --repo dioptx/cctime --base main --head <you>:<branch>`).
4. Add a `CHANGELOG.md` entry under `## [Unreleased]`. Parallel PRs will each touch this section, so expect a trivial CHANGELOG rebase once one of them merges.

### ⚠️ Don't `--delete-branch` a head that an upstream PR points at

Deleting a branch **closes every PR that uses it as head — across forks**. If branch `fix/foo` is the head of an upstream PR *and* you merge a fork-internal PR on the same branch with `--delete-branch`, the upstream PR is closed too (it reads as "closed", not merged).

- Give upstream-contribution branches a **dedicated name** and don't reuse them for fork-internal merges.
- When merging a fork-internal copy, merge **without** `--delete-branch` (or use a separate branch), until the upstream PR is merged/closed.
- Recovery if it happens: the commit usually survives in a local clone's stale `refs/remotes/origin/<branch>` ref — `git push origin <sha>:refs/heads/<branch>` to restore it, then reopen the PR.

## License

[MIT](LICENSE)
