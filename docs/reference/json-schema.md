# JSON Schema

## Single Session (`cctime --json`)

```json
{
  "sessionId": "abc123-def456",
  "summary": "Implementing authentication system",
  "startTime": 1708000000000,
  "endTime": 1708001000000,
  "durationMs": 1000000,
  "segments": [...],
  "stats": { "planning": 0, "coding": 500000, "subagent": 300000, "idle": 200000 },
  "tokens": { "input": 5000, "output": 2000, "cacheRead": 50000, "cacheCreation": 10000 },
  "cacheHitRate": 0.77,
  "models": { "Opus": 10, "Sonnet": 2 },
  "tools": { "Bash": 15, "Read": 8 },
  "enhancedStats": {
    "humanWait": 30000,
    "humanAway": 120000,
    "claudeThink": 180000,
    "toolExec": 450000,
    "subagent": 120000,
    "planning": 0
  },
  "toolLatencies": [
    { "name": "Bash", "count": 15, "totalMs": 75000, "avgMs": 5000, "p50Ms": 3000, "p95Ms": 15000 }
  ],
  "turnMetrics": [
    { "turnIndex": 0, "userTimestamp": 1708000000000, "assistantTimestamp": 1708000005000, "responseMs": 5000, "inputTokens": 100, "outputTokens": 50, "cacheRead": 1000, "cacheCreation": 0 }
  ],
  "turnCount": 6,
  "avgResponseMs": 5000,
  "estimatedCostUsd": 1.25,
  "costPerMinuteUsd": 0.08,
  "contextTrend": [10000, 15000, 20000, 25000]
}
```

## Aggregate (`cctime --week --json`)

```json
{
  "summary": {
    "sessionCount": 12,
    "totalCostUsd": 8.50,
    "totalActiveMs": 3600000,
    "totalDurationMs": 7200000,
    "totalTokensIn": 500000,
    "totalTokensOut": 120000,
    "totalTurns": 45
  },
  "sessions": [
    { ... single session objects ... }
  ]
}
```
