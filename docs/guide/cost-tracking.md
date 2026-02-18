# Cost Tracking

cctime estimates API costs based on token usage and model pricing.

## Per-Session Cost

Each session shows:

```
 Cost    ~$1.25  ($0.10/min)   Avg response: 3.2s   Turns: 8
```

- **Total cost**: Estimated API cost for the session
- **Cost per minute**: Total cost / active minutes (excludes away time)
- **Avg response**: Mean time from your input to Claude's first response
- **Turns**: Number of user→assistant exchanges

## Token Counting

cctime accurately counts tokens by:

1. **Deduplicating streaming chunks** — Claude Code writes multiple JSONL lines per response with the same `requestId`. cctime merges these to avoid 3x inflation.
2. **Separating cache tokens** — distinguishes between regular input, cache reads, and cache creation.

```
 Tokens  ████████████████████  142.5K in 28.3K out
 Cache   ▃▄▅▆▇█████  67% hit
```

"In" tokens include input + cache_read + cache_creation.

## Pricing

See [Pricing Reference](/reference/pricing) for the full pricing table.

## Accuracy

Cost estimates use published Anthropic API pricing and are approximations. Actual billed amounts may differ slightly due to:

- Rounding differences
- System prompt tokens
- Pricing changes not yet reflected in cctime
