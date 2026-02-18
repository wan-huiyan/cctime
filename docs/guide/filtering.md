# Filtering & Export

cctime provides extensive filtering, sorting, and export options for aggregate views.

## Date Ranges

```bash
cctime --since 2026-02-15                    # Since a specific date
cctime --since yesterday                     # Since yesterday
cctime --since 2026-02-10 --until 2026-02-15 # Date range
```

## Filters

```bash
# By project
cctime --week --project ~/projects/my-app

# By model
cctime --week --model opus

# By minimum duration (in minutes)
cctime --week --min-duration 5

# By minimum cost (in USD)
cctime --week --min-cost 1.00

# Combine filters
cctime --since yesterday --model opus --min-cost 0.50
```

## Sorting

```bash
cctime --week --sort cost       # Most expensive first
cctime --week --sort duration   # Longest first
cctime --week --sort tokens     # Most tokens first
cctime --week --sort turns      # Most turns first
cctime --week --sort time       # Most recent first (default)
```

## Export Formats

### CSV

```bash
cctime --week --csv > sessions.csv
```

Columns: `timestamp, duration_min, active_min, cost_usd, tokens_in, tokens_out, turns, model, summary`

### Markdown

```bash
cctime --week --markdown
```

Produces a markdown table suitable for pasting into GitHub issues or docs.

### Compact

```bash
cctime --week --compact
```

One-line-per-session view for quick scanning.

### JSON

```bash
cctime --week --json
```

For multi-session views, wraps output in an envelope:

```json
{
  "summary": {
    "sessionCount": 12,
    "totalCostUsd": 8.50,
    "totalActiveMs": 3600000,
    "totalTokensIn": 500000,
    "totalTokensOut": 120000,
    "totalTurns": 45
  },
  "sessions": [...]
}
```
