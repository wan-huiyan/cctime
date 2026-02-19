import { watch, type FSWatcher } from 'node:fs';
import { readdir, stat } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { parseSessionFrom } from './parser.js';
import { analyzeSession } from './analyzer.js';
import { formatSessionLive } from './formatter.js';
import type { SessionMessage } from './types.js';

const ACTIVE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes
const DEBOUNCE_MS = 300;

interface ActiveSession {
  sessionId: string;
  fullPath: string;
  mtime: number;
}

export async function findActiveSession(projectFilter?: string): Promise<ActiveSession | null> {
  const projectsDir = join(homedir(), '.claude', 'projects');
  const now = Date.now();
  let best: ActiveSession | null = null;

  let dirs: string[];
  try {
    const entries = await readdir(projectsDir, { withFileTypes: true });
    dirs = entries.filter(e => e.isDirectory()).map(e => join(projectsDir, e.name));
  } catch {
    return null;
  }

  if (projectFilter) {
    const encoded = projectFilter.replace(/\//g, '-');
    dirs = dirs.filter(d => d.endsWith(encoded));
  }

  for (const dir of dirs) {
    let files: string[];
    try {
      files = (await readdir(dir)).filter(f => f.endsWith('.jsonl'));
    } catch {
      continue;
    }

    for (const file of files) {
      const fullPath = join(dir, file);
      try {
        const s = await stat(fullPath);
        const mtime = s.mtime.getTime();
        if (now - mtime > ACTIVE_THRESHOLD_MS) continue;
        if (!best || mtime > best.mtime) {
          best = {
            sessionId: file.replace('.jsonl', ''),
            fullPath,
            mtime,
          };
        }
      } catch {
        continue;
      }
    }
  }

  return best;
}

export async function startLiveMode(projectFilter?: string): Promise<void> {
  const found = await findActiveSession(projectFilter);
  if (!found) {
    console.error('No active session found (modified within last 5 minutes).');
    console.error('Start a Claude Code session, then run cctime --live in another terminal.');
    process.exit(1);
  }
  let session = found;

  console.log(`Watching: ${session.fullPath}`);

  let allMessages: SessionMessage[] = [];
  let byteOffset = 0;
  let watcher: FSWatcher | null = null;
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let isRefreshing = false;

  async function refresh() {
    if (isRefreshing) return;
    isRefreshing = true;
    try {
      const { messages: newMessages, bytesRead } = await parseSessionFrom(session.fullPath, byteOffset);
      if (newMessages.length > 0) {
        allMessages.push(...newMessages);
      }
      byteOffset = bytesRead;

      const analysis = analyzeSession(session.sessionId, allMessages);

      // Clear screen and redraw
      process.stdout.write('\x1b[2J\x1b[H');
      process.stdout.write(formatSessionLive(analysis));
    } catch (err: any) {
      // File might be mid-write; just skip this refresh
    } finally {
      isRefreshing = false;
    }
  }

  // Hide cursor
  process.stdout.write('\x1b[?25l');

  // Initial render
  await refresh();

  // Watch for changes
  function attachWatcher() {
    watcher = watch(session.fullPath, () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(refresh, DEBOUNCE_MS);
    });
    watcher.on('error', async () => {
      // File may have been deleted — try to find new active session
      if (watcher) { watcher.close(); watcher = null; }
      const newSession = await findActiveSession(projectFilter);
      if (newSession) {
        session.fullPath = newSession.fullPath;
        session.sessionId = newSession.sessionId;
        allMessages = [];
        byteOffset = 0;
        attachWatcher();
        await refresh();
      }
    });
  }
  attachWatcher();

  // Periodic refresh for wall-clock staleness (e.g., humanWait timer)
  const periodicTimer = setInterval(refresh, 5000);

  // Graceful shutdown
  function cleanup() {
    if (watcher) {
      watcher.close();
      watcher = null;
    }
    if (debounceTimer) clearTimeout(debounceTimer);
    clearInterval(periodicTimer);
    // Restore cursor
    process.stdout.write('\x1b[?25h');
    process.exit(0);
  }

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}
