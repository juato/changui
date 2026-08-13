import { describe, it, expect } from 'vitest';
import { ImpactAnalyzer } from '../src/core/mapper/impact.js';
import { FlatTreeItem, WorkspaceNode } from '../src/core/types.js';

describe('ImpactAnalyzer', () => {
  it('calculates risk score and breaking change warning for root config modifications', () => {
    const rootNode: WorkspaceNode = {
      id: '.',
      name: 'root',
      path: '.',
      type: 'root',
      children: [],
      changes: [{ path: 'package.json', stage: 'staged', type: 'modified' }],
    };

    const item: FlatTreeItem = {
      id: '.',
      kind: 'node',
      node: rootNode,
      depth: 0,
    };

    const analyzer = new ImpactAnalyzer();
    const result = analyzer.analyze(item, rootNode);

    expect(result.breakingChangeRisk).toBe(true);
    expect(result.staged).toBe(1);
    expect(result.score).toBeGreaterThanOrEqual(15);
  });
});
