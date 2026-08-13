import { describe, it, expect } from 'vitest';
import { WorkspaceDetector } from '../src/core/config/workspace.js';
import path from 'path';

describe('WorkspaceDetector', () => {
  it('detects standalone directory structure when no monorepo file exists', async () => {
    const detector = new WorkspaceDetector(process.cwd());
    const tree = await detector.buildTree();

    expect(tree).toBeDefined();
    expect(tree.type).toBe('root');
    expect(Array.isArray(tree.children)).toBe(true);
    // Should discover src folder
    const srcChild = tree.children.find((c) => c.name === 'src');
    expect(srcChild).toBeDefined();
    expect(srcChild?.type).toBe('layer');
  });
});
