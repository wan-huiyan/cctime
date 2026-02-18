# CLI Reference

## Synopsis

```
cctime [options]
```

## Options

| Flag | Type | Description |
|------|------|-------------|
| `--all` | boolean | Show all sessions from today |
| `--week` | boolean | Show sessions from the last 7 days |
| `--live` | boolean | Live-updating dashboard for active session |
| `--session <id>` | string | Analyze a specific session by ID or prefix |
| `--since <date>` | string | Sessions since date (ISO, "today", "yesterday") |
| `--until <date>` | string | Sessions until date |
| `--project <path>` | string | Filter by project path |
| `--model <name>` | string | Filter by model name (opus, sonnet, haiku) |
| `--min-duration <mins>` | number | Minimum active duration in minutes |
| `--min-cost <usd>` | number | Minimum cost in USD |
| `--sort <field>` | string | Sort: cost, duration, tokens, turns, time |
| `--json` | boolean | JSON output |
| `--csv` | boolean | CSV output |
| `--markdown` | boolean | Markdown table output |
| `--compact` | boolean | One-line-per-session output |
| `--no-color` | boolean | Disable ANSI color codes |
| `--color` | boolean | Force ANSI color codes |
| `--version` | boolean | Show version number |
| `--help` | boolean | Show help |

## Default Behavior

With no flags, cctime shows the most recent session in your `~/.claude/projects/` directory.

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | No sessions found, or error |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NO_COLOR` | Disable color output (standard) |
| `FORCE_COLOR` | Force color output |
