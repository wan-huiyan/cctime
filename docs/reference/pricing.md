# Pricing Reference

cctime uses the following Anthropic API pricing for cost estimates.

## Per-Million Tokens

| Model | Input | Output | Cache Read | Cache Create |
|-------|------:|-------:|-----------:|-------------:|
| **Opus** | $15.00 | $75.00 | $1.50 | $18.75 |
| **Sonnet** | $3.00 | $15.00 | $0.30 | $3.75 |
| **Haiku** | $0.25 | $1.25 | $0.025 | $0.3125 |

## Cache Multipliers

- **Cache Read**: 10% of input price (reading from cached context)
- **Cache Creation**: 125% of input price (writing to cache)

## Model Resolution

cctime determines the model from the `model` field in each API response:

- Contains "opus" → Opus pricing
- Contains "haiku" → Haiku pricing
- All other models → Sonnet pricing (default)

## Accuracy Notes

- Estimates use published Anthropic API pricing
- Actual costs may vary due to rounding, system tokens, or pricing changes
- Cost per minute excludes "away" time (> 2 min gaps)
- When pricing changes, update `src/pricing.ts` and submit a PR
