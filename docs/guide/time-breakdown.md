# Time Breakdown

cctime classifies every millisecond of your session into one of 5 phases.

## The 5 Phases

| Phase | Color | What's Happening | Detection |
|-------|-------|-----------------|-----------|
| Claude thinking | Blue | Model generating response | User/ToolResult → Assistant gap |
| Tool execution | Yellow | Running tools (Bash, Read, Edit...) | ToolUse → ToolResult gap |
| Subagents | Magenta | Task agents running | Task ToolUse → ToolResult gap |
| Planning | Cyan | Plan mode active | EnterPlanMode/ExitPlanMode |
| Waiting on you | Gray | Reading or typing | Assistant → User gap (< 2 min) |

## Active vs Away Time

If you step away for more than 2 minutes (no input after Claude's response), that time is classified as **away** and excluded from the active time calculation.

This means percentages are relative to **active time**, not wall-clock time:

```
 12m 34s active of 18m 12s (5m 38s away)
```

## Reading the Chart

```
 Claude thinking ████████████░░░░░░░░  3m 42s  (29%)
 Tool execution  ██████████████░░░░░░  5m 18s  (42%)
```

- The bar shows the fraction of active time
- The percentage is relative to active time (not wall clock)
- Zero-value phases are hidden automatically
