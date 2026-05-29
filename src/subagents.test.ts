import { describe, it, expect } from 'vitest';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { aggregateSubagents } from './subagents.js';

function assistantLine(requestId: string, usage: Record<string, number>): string {
  return JSON.stringify({
    type: 'assistant',
    uuid: requestId,
    requestId,
    timestamp: '2026-05-29T00:00:00.000Z',
    isSidechain: true, // subagent records ARE sidechain w.r.t. the root — must still be counted
    message: { id: `m-${requestId}`, model: 'claude-opus-4', usage },
  });
}

describe('aggregateSubagents', () => {
  it('counts BOTH foreground (subagents/agent-*) and nested workflow (subagents/workflows/wf_*/agent-*) transcripts', async () => {
    const tmp = await mkdtemp(join(tmpdir(), 'cctime-sub-'));
    try {
      const sessionId = 'sess1';
      const mainPath = join(tmp, `${sessionId}.jsonl`);
      await writeFile(mainPath, assistantLine('main1', { input_tokens: 10, output_tokens: 10 }) + '\n');

      const subDir = join(tmp, sessionId, 'subagents');
      await mkdir(subDir, { recursive: true });
      // foreground Agent dispatch: 1M input + 1M output @ opus = $15 + $75 = $90
      await writeFile(join(subDir, 'agent-A.jsonl'),
        assistantLine('a1', { input_tokens: 1_000_000, output_tokens: 1_000_000 }) + '\n');

      // nested Workflow agent: 1M output @ opus = $75
      const wfDir = join(subDir, 'workflows', 'wf_run1');
      await mkdir(wfDir, { recursive: true });
      await writeFile(join(wfDir, 'agent-B.jsonl'),
        assistantLine('b1', { output_tokens: 1_000_000 }) + '\n');

      const s = await aggregateSubagents(mainPath);
      expect(s.count).toBe(2);              // ← regression guard: a non-recursive glob would return 1
      expect(s.workflowCount).toBe(1);
      expect(s.inputTokens).toBe(1_000_000);
      expect(s.outputTokens).toBe(2_000_000);
      expect(s.costUsd).toBeCloseTo(165, 2); // $90 + $75
    } finally {
      await rm(tmp, { recursive: true, force: true });
    }
  });

  it('counts each request ONCE even when its key recurs across a non-assistant boundary (no local-flush re-count)', async () => {
    const tmp = await mkdtemp(join(tmpdir(), 'cctime-sub-'));
    try {
      const sessionId = 'sess2';
      const mainPath = join(tmp, `${sessionId}.jsonl`);
      await writeFile(mainPath, assistantLine('main1', { output_tokens: 1 }) + '\n');
      const subDir = join(tmp, sessionId, 'subagents');
      await mkdir(subDir, { recursive: true });
      // Same requestId 'r1' appears in two assistant rows separated by a tool_result
      // (non-assistant) row. An order-preserving local-flush dedup would re-count it
      // (→ 2,000,000 output); a whole-file dedup counts it once (→ 1,000,000).
      const lines = [
        assistantLine('r1', { output_tokens: 1_000_000 }),
        JSON.stringify({ type: 'user', uuid: 'u1', timestamp: '2026-05-29T00:00:01.000Z',
          message: { role: 'user', content: [{ type: 'tool_result', tool_use_id: 't1', content: 'ok' }] } }),
        assistantLine('r1', { output_tokens: 1_000_000 }), // duplicate of r1, re-logged
      ];
      await writeFile(join(subDir, 'agent-A.jsonl'), lines.join('\n') + '\n');

      const s = await aggregateSubagents(mainPath);
      expect(s.count).toBe(1);
      expect(s.outputTokens).toBe(1_000_000); // ← counted once, not 2,000,000
      expect(s.costUsd).toBeCloseTo(75, 2);
    } finally {
      await rm(tmp, { recursive: true, force: true });
    }
  });

  it('returns zeros when there is no subagents dir', async () => {
    const tmp = await mkdtemp(join(tmpdir(), 'cctime-sub-'));
    try {
      const mainPath = join(tmp, 'lonely.jsonl');
      await writeFile(mainPath, assistantLine('main1', { output_tokens: 5 }) + '\n');
      const s = await aggregateSubagents(mainPath);
      expect(s.count).toBe(0);
      expect(s.costUsd).toBe(0);
    } finally {
      await rm(tmp, { recursive: true, force: true });
    }
  });
});
