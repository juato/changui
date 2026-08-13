import { describe, it, expect } from 'vitest';
import { ArchitectureMapper } from '../src/core/mapper/tree.js';
import { WorkspaceNode, GitFileChange } from '../src/core/types.js';

describe('ArchitectureMapper', () => {
  it('maps file changes to correct architectural nodes', () => {
    const rootNode: WorkspaceNode = {
      id: '.',
      name: 'root',
      path: '.',
      type: 'root',
      children: [
        {
          id: 'src/core',
          name: 'core',
          path: 'src/core',
          type: 'layer',
          children: [],
          changes: [],
        },
        {
          id: 'src/ui',
          name: 'ui',
          path: 'src/ui',
          type: 'layer',
          children: [],
          changes: [],
        },
      ],
      changes: [],
    };

    const changes: GitFileChange[] = [
      { path: 'src/core/types.ts', stage: 'staged', type: 'added' },
      { path: 'src/ui/App.tsx', stage: 'unstaged', type: 'modified' },
      { path: 'README.md', stage: 'untracked', type: 'untracked' },
    ];

    const mapper = new ArchitectureMapper();
    const tree = mapper.mapChanges(rootNode, changes, { pruneEmpty: false });

    expect(tree.stats.totalChanges).toBe(3);
    expect(tree.stats.stagedCount).toBe(1);
    expect(tree.stats.unstagedCount).toBe(1);
    expect(tree.stats.untrackedCount).toBe(1);

    const coreNode = tree.rootNode.children.find((c) => c.id === 'src/core');
    expect(coreNode?.changes).toHaveLength(1);
    expect(coreNode?.changes[0].path).toBe('src/core/types.ts');

    const uiNode = tree.rootNode.children.find((c) => c.id === 'src/ui');
    expect(uiNode?.changes).toHaveLength(1);
    expect(uiNode?.changes[0].path).toBe('src/ui/App.tsx');

    // Root node direct changes
    expect(tree.rootNode.changes).toHaveLength(1);
    expect(tree.rootNode.changes[0].path).toBe('README.md');
  });
});
