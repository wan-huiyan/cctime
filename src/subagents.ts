import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { estimateCost } from './pricing.js';
import type { SubagentStats, TokenUsage } from './types.js';

const EMPTY: SubagentStats = {
  count: 0, workflowCount: 0,
  inputTokens: 0, outputTokens: 0, cacheRead: 0, cacheCreation: 0, costUsd: 0,
};

/**
 * Recursively collect `agent-*.jsonl` transcripts under a directory. Covers BOTH
 * foreground Agent-tool dispatches at `subagents/agent-*.jsonl` AND Workflow-tool
 * fan-out agents nested one level deeper at `subagents/workflows/wf_<runid>/agent-*.jsonl`.
 * A non-recursive scan misses the latter, silently undercounting subagent spend.
 */
export async function findAgentFiles(dir: string): Promise<string[]> {
  let out: string[] = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out; // dir absent (no subagents) — not an error
  }
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      out = out.concat(await findAgentFiles(p));
    } else if (e.isFile() && e.name.startsWith('agent-') && e.name.endsWith('.jsonl')) {
      out.push(p);
    }
  }
  return out;
}

/**
 * Sum token usage for ONE transcript with a WHOLE-FILE dedup by request key
 * (`requestId` ?? `message.id`), keeping the chunk with the highest `output_tokens`
 * — i.e. each API request counted exactly once.
 *
 * We deliberately do NOT route subagent files through the shared parser's
 * `deduplicateAssistant`. That helper preserves message order by flushing its
 * request-group on every non-assistant row, so it only collapses *consecutive*
 * streaming chunks. Subagent transcripts interleave the same request key across
 * tool-result boundaries far more than the main loop does, so the order-preserving
 * dedup re-counts those requests and inflates subagent input/cache by ~50%
 * (measured: $74.94 vs the correct $58.98 on a 17-transcript session). Token
 * accounting doesn't need order, so a flat whole-file dedup is both correct and
 * simpler here. (The main-loop path keeps using the order-preserving parser because
 * its phase/time analysis needs ordering; its token over-count is ~1-3%.)
 */
function tallyTranscript(text: string, acc: SubagentStats): void {
  const best = new Map<string, { usage: TokenUsage; model: string }>();
  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim();
    if (!line) continue;
    let o: any;
    try { o = JSON.parse(line); } catch { continue; }
    if (o.type !== 'assistant') continue;
    const usage: TokenUsage | undefined = o.message?.usage;
    if (!usage) continue;
    const key: string | undefined = o.requestId ?? o.message?.id;
    if (key == null) continue;
    const prev = best.get(key);
    if (!prev || (usage.output_tokens || 0) > (prev.usage.output_tokens || 0)) {
      best.set(key, { usage, model: o.message?.model || 'opus' });
    }
  }
  for (const { usage, model } of best.values()) {
    acc.inputTokens += usage.input_tokens || 0;
    acc.outputTokens += usage.output_tokens || 0;
    acc.cacheRead += usage.cache_read_input_tokens || 0;
    acc.cacheCreation += usage.cache_creation_input_tokens || 0;
    acc.costUsd += estimateCost(model, usage);
  }
}

/**
 * Token + cost totals for a session's subagent transcripts.
 *
 * `analyzeSession` computes tokens/cost from non-sidechain main-loop assistant
 * messages only — it never reads subagent transcript files, so all subagent spend
 * (foreground Agent dispatches AND Workflow fan-outs) is otherwise absent from the
 * headline. No double-count: the main analysis excludes `isSidechain`, and these
 * records live in their own files, so we count ALL assistant rows in each file.
 *
 * @param mainJsonlPath the main session transcript `<projectDir>/<sessionId>.jsonl`;
 *   subagents live at `<projectDir>/<sessionId>/subagents/`.
 */
export async function aggregateSubagents(mainJsonlPath: string): Promise<SubagentStats> {
  const sessionDir = mainJsonlPath.replace(/\.jsonl$/, '');
  const subDir = join(sessionDir, 'subagents');
  const files = await findAgentFiles(subDir);
  if (files.length === 0) return { ...EMPTY };

  const acc: SubagentStats = { ...EMPTY, count: files.length };
  for (const f of files) {
    if (f.includes('/workflows/')) acc.workflowCount++;
    let text: string;
    try { text = await readFile(f, 'utf-8'); } catch { continue; }
    tallyTranscript(text, acc);
  }
  acc.costUsd = Math.round(acc.costUsd * 100) / 100;
  return acc;
}
