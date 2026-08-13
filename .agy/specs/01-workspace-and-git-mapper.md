# Technical Specification #1: Workspace & Git Mapper

## 1. Overview
`changui` is a TypeScript/Node.js CLI tool designed to render Git changes (`git status`) structured by project architecture (monorepos, layers, packages, apps) rather than a flat list of modified paths.

Phase 1 focuses on:
1. Detecting workspace configurations (`pnpm-workspace.yaml`, `turbo.json`, `package.json` `workspaces`, `tsconfig.json` path references).
2. Interrogating Git status to retrieve pending file changes (`git status`).
3. Mapping changed file paths to the detected architectural workspace tree.
4. Rendering the architectural tree in the terminal using Ink / Chalk.

---

## 2. Core Domain Interfaces (`src/core/types.ts`)

```typescript
export type ChangeType = 'added' | 'modified' | 'deleted' | 'renamed' | 'untracked';
export type ChangeStage = 'staged' | 'unstaged' | 'untracked';

export interface GitFileChange {
  path: string;
  stage: ChangeStage;
  type: ChangeType;
  oldPath?: string;
}

export type WorkspaceNodeType = 'root' | 'package' | 'app' | 'layer' | 'directory';

export interface WorkspaceNode {
  id: string;
  name: string;
  path: string; // Relative path from repository root
  type: WorkspaceNodeType;
  children: WorkspaceNode[];
  changes: GitFileChange[];
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
```

---

## 3. Functional Requirements

### 3.1 Config & Workspace Parser (`src/core/config/`)
- Detect monorepos and workspaces:
  - Read `pnpm-workspace.yaml` (extract `packages` globs).
  - Read `package.json` (`workspaces` array or object).
  - Read `turbo.json` (optional pipeline info).
  - Read root `tsconfig.json` (project references).
- Fallback: If no monorepo config is found, inspect top-level directories (`src`, `packages`, `apps`, `libs`, `services`) to build standard architectural layers.

### 3.2 Git Status Reader (`src/core/git/`)
- Utilize `simple-git` or native `git status --porcelain=v2 -z` execution.
- Classify files into `staged`, `unstaged`, and `untracked`.
- Standardize relative paths using POSIX forward slashes.

### 3.3 Mapper Engine (`src/core/mapper/`)
- Assign each `GitFileChange` to the deepest matching `WorkspaceNode`.
- Roll up change counts to parent nodes.
- Filter out empty nodes unless explicitly requested.

### 3.4 Terminal UI & Interactive Sci-Fi Dashboard (`src/ui/`)
- Fullscreen Interactive Application layout taking advantage of terminal grid zones.
- **Left Panel (Architecture Navigation)**: Interactive tree displaying packages (`📦`), apps (`🌐`), layers (`⚡`), root (`🛠️`), and file changes with expand/collapse support.
- **Right Panel (Impact Detail & Risk HUD)**: Real-time risk analysis, calculating risk scores (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), breaking change alerts (`⚠️`), change breakdown, and downstream affected targets.
- **Bottom Panel (Status Bar & Keyboard Controls)**: Summary metrics (Staged, Unstaged, Untracked) and keyboard navigation guide (`[↑/↓] Navigate`, `[Space/Enter] Expand`, `[q] Quit`).


---

## 4. Test Cases

1. **Workspace Detection**:
   - Given a `pnpm-workspace.yaml` with `packages: ['packages/*', 'apps/*']`, detect all matching package directories containing a `package.json`.
   - Given a standalone project without monorepo manifests, organize by root folders (`src/`, `test/`, root files).

2. **Git Status Mapping**:
   - Map `packages/ui/src/Button.tsx` (modified) into `packages/ui` workspace node.
   - Map root `.gitignore` to root unmapped/root section.

3. **Tree Aggregation**:
   - Correctly compute summary counts per node and root stats.
