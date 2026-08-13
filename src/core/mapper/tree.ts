import { ArchitecturalTree, GitFileChange, WorkspaceNode } from '../types.js';

export interface MapOptions {
  pruneEmpty?: boolean;
}

export class ArchitectureMapper {
  public mapChanges(
    rootNode: WorkspaceNode,
    changes: GitFileChange[],
    options: MapOptions = { pruneEmpty: true }
  ): ArchitecturalTree {
    const clonedRoot = JSON.parse(JSON.stringify(rootNode)) as WorkspaceNode;
    const unmappedChanges: GitFileChange[] = [];

    // Flat list of all workspace nodes
    const allNodes: WorkspaceNode[] = [];
    const collectNodes = (node: WorkspaceNode) => {
      allNodes.push(node);
      for (const child of node.children) {
        collectNodes(child);
      }
    };
    collectNodes(clonedRoot);

    // Sort nodes by path depth descending so deepest match wins
    allNodes.sort((a, b) => {
      if (a.id === '.') return 1;
      if (b.id === '.') return -1;
      return b.path.length - a.path.length;
    });

    let stagedCount = 0;
    let unstagedCount = 0;
    let untrackedCount = 0;

    for (const change of changes) {
      if (change.stage === 'staged') stagedCount++;
      else if (change.stage === 'unstaged') unstagedCount++;
      else if (change.stage === 'untracked') untrackedCount++;

      let matchedNode: WorkspaceNode | null = null;

      for (const node of allNodes) {
        if (node.path === '.') continue;

        if (change.path.startsWith(node.path + '/') || change.path === node.path) {
          matchedNode = node;
          break;
        }
      }

      if (matchedNode) {
        matchedNode.changes.push(change);
      } else {
        clonedRoot.changes.push(change);
      }
    }

    // Group root config files into a dedicated [configs] node
    const isConfigFile = (filePath: string) => {
      const name = filePath.split('/').pop() || filePath;
      return (
        name.endsWith('-lock.json') ||
        name.endsWith('.lock') ||
        name.endsWith('.yaml') ||
        name.startsWith('.') ||
        name.startsWith('tsconfig') ||
        name.startsWith('tsup.config') ||
        name.startsWith('vitest.config') ||
        name.startsWith('jest.config')
      );
    };

    const configChanges: GitFileChange[] = [];
    const otherRootChanges: GitFileChange[] = [];

    for (const c of clonedRoot.changes) {
      if (isConfigFile(c.path)) {
        configChanges.push(c);
      } else {
        otherRootChanges.push(c);
      }
    }

    if (configChanges.length > 0) {
      clonedRoot.changes = otherRootChanges;
      clonedRoot.children.push({
        id: '__configs__',
        name: '[configs]',
        path: 'configs',
        type: 'directory',
        children: [],
        changes: configChanges,
      });
    }

    if (options.pruneEmpty) {
      this.pruneEmptyNodes(clonedRoot);
    }

    return {
      rootPath: process.cwd(),
      rootNode: clonedRoot,
      unmappedChanges,
      stats: {
        totalChanges: changes.length,
        stagedCount,
        unstagedCount,
        untrackedCount,
      },
    };
  }

  private pruneEmptyNodes(node: WorkspaceNode): boolean {
    if (node.children.length > 0) {
      node.children = node.children.filter((child) => this.pruneEmptyNodes(child));
    }

    // Keep node if it has direct changes or remaining children
    const hasChanges = node.changes.length > 0;
    const hasChildren = node.children.length > 0;

    return hasChanges || hasChildren || node.type === 'root';
  }
}
