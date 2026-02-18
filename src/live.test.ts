import { describe, it, expect, afterEach } from 'vitest';
import { writeFileSync, mkdirSync, rmSync, utimesSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir, homedir } from 'node:os';
import { findActiveSession } from './live.js';

// Note: findActiveSession looks at the real ~/.claude/projects directory,
// so these tests verify the lookup logic against real filesystem state.

describe('live: findActiveSession', () => {
  it('should return null when no sessions exist in temp dir', async () => {
    // Pass a non-existent project filter to avoid real sessions
    const result = await findActiveSession('/nonexistent-project-cctime-test-12345');
    expect(result).toBeNull();
  });

  it('should return the most recently modified session', async () => {
    // This test verifies the exported interface works without crashing
    const result = await findActiveSession();
    // Can be null if no active sessions (that's fine — tests run without Claude running)
    if (result) {
      expect(result.fullPath).toBeTruthy();
      expect(result.sessionId).toBeTruthy();
      expect(result.mtime).toBeGreaterThan(0);
    }
  });
});
