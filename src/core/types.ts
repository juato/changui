export type ChangeType = 'added' | 'modified' | 'deleted' | 'renamed' | 'untracked';
export type ChangeStage = 'staged' | 'unstaged' | 'untracked';

export interface GitFileChange {
  path: string; // Relative POSIX path from repository root
  stage: ChangeStage;
  type: ChangeType;
  oldPath?: string;
}

export type WorkspaceNodeType = 'root' | 'package' | 'app' | 'layer' | 'directory';

export interface TechStackItem {
  name: string;
  version?: string;
  category: 'framework' | 'backend' | 'tool' | 'ui';
}

export interface WorkspaceNode {
  id: string;
  name: string;
  path: string; // Relative path from repo root
  type: WorkspaceNodeType;
  children: WorkspaceNode[];
  changes: GitFileChange[];
  techStack?: TechStackItem[];
}

export interface ImpactAnalysis {
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  score: number;
  affectedApps: string[];
  summary: string;
  breakingChangeRisk: boolean;
  staged: number;
  unstaged: number;
  untracked: number;
  techStack?: TechStackItem[];
}

export interface FlatTreeItem {
  id: string;
  kind: 'node' | 'file';
  node?: WorkspaceNode;
  file?: GitFileChange;
  depth: number;
  parentId?: string;
  isExpanded?: boolean;
  hasChildren?: boolean;
}

export interface DiffLine {
  type: 'add' | 'delete' | 'header' | 'normal';
  content: string;
}

export interface FileDiffResult {
  filePath: string;
  lines: DiffLine[];
}

export interface ArchitecturalTree {
  rootPath: string;
  rootNode: WorkspaceNode;
  unmappedChanges: GitFileChange[];
  stats: {
    totalChanges: number;
    stagedCount: number;
    unstagedCount: number;
    untrackedCount: number;
  };
}
