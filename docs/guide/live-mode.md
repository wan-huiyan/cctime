# Live Mode

The live dashboard monitors your active Claude Code session in real-time.

## Usage

```bash
cctime --live
```

Open this in a separate terminal while using Claude Code. The dashboard auto-refreshes on every file change and every 5 seconds for wall-clock updates.

## What's Shown

- **LIVE badge** with current active time
- **Time breakdown** updating in real-time
- **Token & cost** counters accumulating live
- **Top 6 tools** with call counts and latencies
- **Model mix** and context sparkline

## How It Works

1. cctime finds the most recently modified session file (within 5 minutes)
2. Uses `fs.watch()` to detect file changes
3. Incremental parsing — only reads new bytes since last refresh
4. 300ms debounce prevents excessive redraws
5. 5-second periodic timer updates wall-clock calculations

## Filtering

```bash
# Watch a specific project
cctime --live --project ~/projects/my-app
```

## Exit

Press `Ctrl+C` to exit. The cursor is automatically restored.
