import { describe, it, expect } from 'vitest';
import { GitDiffReader } from '../src/core/git/diff.js';

describe('GitDiffReader', () => {
  it('parses raw diff into colored lines', () => {
    const reader = new GitDiffReader();
    const rawDiff = [
      '@@ -1,3 +1,3 @@',
      '- old line content',
      '+ new line content',
    ].join('\n');

    // @ts-ignore - testing private method parseDiffOutput
    const lines = reader.parseDiffOutput(rawDiff);

    expect(lines).toHaveLength(3);
    expect(lines[0].type).toBe('header');
    expect(lines[1].type).toBe('delete');
    expect(lines[1].content).toContain('- old line content');
    expect(lines[2].type).toBe('add');
    expect(lines[2].content).toContain('+ new line content');
  });
});
