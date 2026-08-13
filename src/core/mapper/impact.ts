import { FlatTreeItem, ImpactAnalysis, WorkspaceNode } from '../types.js';

export class ImpactAnalyzer {
  public analyze(item: FlatTreeItem | null, rootNode: WorkspaceNode): ImpactAnalysis {
    if (!item) {
      return {
        riskLevel: 'LOW',
        score: 0,
        affectedApps: [],
        summary: 'No item selected in the tree.',
        breakingChangeRisk: false,
        staged: 0,
        unstaged: 0,
        untracked: 0,
      };
    }

    if (item.kind === 'node' && item.node) {
      return this.analyzeNode(item.node, rootNode);
    }

    if (item.kind === 'file' && item.file) {
      return this.analyzeFile(item.file, rootNode);
    }

    return {
      riskLevel: 'LOW',
      score: 0,
      affectedApps: [],
      summary: 'Unknown selection.',
      breakingChangeRisk: false,
      staged: 0,
      unstaged: 0,
      untracked: 0,
    };
  }

  private analyzeNode(node: WorkspaceNode, rootNode: WorkspaceNode): ImpactAnalysis {
    const allChanges = this.collectNodeChanges(node);

    let staged = 0;
    let unstaged = 0;
    let untracked = 0;
    let deletedCount = 0;
    let breaking = false;

    for (const c of allChanges) {
      if (c.stage === 'staged') staged++;
      else if (c.stage === 'unstaged') unstaged++;
      else if (c.stage === 'untracked') untracked++;

      if (c.type === 'deleted') deletedCount++;
      if (c.path.endsWith('package.json') || c.path.endsWith('tsconfig.json') || c.path.includes('pnpm-lock')) {
        breaking = true;
      }
    }

    // Find affected apps if this node is a shared package or layer
    const affectedApps: string[] = [];
    if (node.type === 'package' || node.type === 'layer' || node.type === 'root') {
      const appNodes = this.findNodesByType(rootNode, 'app');
      for (const app of appNodes) {
        if (app.id !== node.id) {
          affectedApps.push(app.name);
        }
      }
    }

    let score = allChanges.length * 2 + deletedCount * 5;
    if (breaking) score += 15;
    if (node.type === 'package' && affectedApps.length > 0) score += affectedApps.length * 5;

    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    if (score >= 35) riskLevel = 'CRITICAL';
    else if (score >= 20) riskLevel = 'HIGH';
    else if (score >= 8) riskLevel = 'MEDIUM';

    return {
      riskLevel,
      score,
      affectedApps: affectedApps.length > 0 ? affectedApps : ['Self-contained / None'],
      summary: `${node.name} (${node.type}) containing ${allChanges.length} total file changes.`,
      breakingChangeRisk: breaking,
      staged,
      unstaged,
      untracked,
      techStack: node.techStack && node.techStack.length > 0 ? node.techStack : rootNode.techStack,
    };
  }

  private analyzeFile(file: { path: string; stage: string; type: string }, rootNode: WorkspaceNode): ImpactAnalysis {
    let score = 3;
    let breaking = false;

    if (file.type === 'deleted') score += 7;
    if (file.path.endsWith('package.json') || file.path.endsWith('tsconfig.json')) {
      score += 15;
      breaking = true;
    }

    const isCore = file.path.startsWith('src/core') || file.path.startsWith('packages/');
    if (isCore) score += 5;

    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    if (score >= 20) riskLevel = 'CRITICAL';
    else if (score >= 12) riskLevel = 'HIGH';
    else if (score >= 5) riskLevel = 'MEDIUM';

    return {
      riskLevel,
      score,
      affectedApps: isCore ? ['All consuming packages & apps'] : ['Local module'],
      summary: `File: ${file.path} [${file.type.toUpperCase()}] (${file.stage})`,
      breakingChangeRisk: breaking,
      staged: file.stage === 'staged' ? 1 : 0,
      unstaged: file.stage === 'unstaged' ? 1 : 0,
      untracked: file.stage === 'untracked' ? 1 : 0,
    };
  }

  private collectNodeChanges(node: WorkspaceNode): any[] {
    let list = [...node.changes];
    for (const child of node.children) {
      list = list.concat(this.collectNodeChanges(child));
    }
    return list;
  }

  private findNodesByType(node: WorkspaceNode, type: string): WorkspaceNode[] {
    let result: WorkspaceNode[] = [];
    if (node.type === type) result.push(node);
    for (const child of node.children) {
      result = result.concat(this.findNodesByType(child, type));
    }
    return result;
  }
}
