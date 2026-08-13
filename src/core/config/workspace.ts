import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import parseYaml from 'yaml';
import { WorkspaceNode, WorkspaceNodeType } from '../types.js';
import { TechDetector } from './techDetector.js';

export interface WorkspaceConfig {
  workspaceGlobs: string[];
  type: 'pnpm' | 'npm-yarn' | 'turbo' | 'tsconfig' | 'standalone';
}

export class WorkspaceDetector {
  private rootPath: string;
  private techDetector: TechDetector;

  constructor(rootPath: string = process.cwd()) {
    this.rootPath = rootPath;
    this.techDetector = new TechDetector();
  }

  public detectConfig(): WorkspaceConfig {
    // 1. Check pnpm-workspace.yaml
    const pnpmPath = path.join(this.rootPath, 'pnpm-workspace.yaml');
    if (fs.existsSync(pnpmPath)) {
      try {
        const content = fs.readFileSync(pnpmPath, 'utf8');
        const parsed = parseYaml.parse(content);
        if (parsed && Array.isArray(parsed.packages)) {
          return { workspaceGlobs: parsed.packages, type: 'pnpm' };
        }
      } catch {
        // Fallback on parse failure
      }
    }

    // 2. Check package.json workspaces
    const pkgPath = path.join(this.rootPath, 'package.json');
    if (fs.existsSync(pkgPath)) {
      try {
        const content = fs.readFileSync(pkgPath, 'utf8');
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed.workspaces)) {
          return { workspaceGlobs: parsed.workspaces, type: 'npm-yarn' };
        }
        if (parsed.workspaces && Array.isArray(parsed.workspaces.packages)) {
          return { workspaceGlobs: parsed.workspaces.packages, type: 'npm-yarn' };
        }
      } catch {
        // Fallback on parse failure
      }
    }

    // 3. Check tsconfig.json references
    const tsconfigPath = path.join(this.rootPath, 'tsconfig.json');
    if (fs.existsSync(tsconfigPath)) {
      try {
        const content = fs.readFileSync(tsconfigPath, 'utf8');
        // Simple regex parse to avoid invalid JSON comments in tsconfig
        const matches = content.match(/"path"\s*:\s*"([^"]+)"/g);
        if (matches && matches.length > 0) {
          const paths = matches.map((m) => {
            const p = m.split(':')[1].replace(/"/g, '').trim();
            return p.startsWith('./') ? p.substring(2) : p;
          });
          return { workspaceGlobs: paths, type: 'tsconfig' };
        }
      } catch {
        // Fallback
      }
    }

    return { workspaceGlobs: [], type: 'standalone' };
  }

  public async buildTree(): Promise<WorkspaceNode> {
    const config = this.detectConfig();
    const rootName = path.basename(this.rootPath) || 'root';

    const rootTech = this.techDetector.detectInDirectory(this.rootPath);

    const rootNode: WorkspaceNode = {
      id: '.',
      name: rootName,
      path: '.',
      type: 'root',
      children: [],
      changes: [],
      techStack: rootTech,
    };

    if (config.workspaceGlobs.length > 0) {
      const packageDirs = new Set<string>();

      for (const pattern of config.workspaceGlobs) {
        // Normalize pattern for glob
        const cleanPattern = pattern.replace(/\/$/, '');
        const matched = await glob(cleanPattern, {
          cwd: this.rootPath,
          ignore: ['**/node_modules/**', '**/dist/**'],
        });

        for (const relativePath of matched) {
          const fullPath = path.join(this.rootPath, relativePath);
          if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
            packageDirs.add(relativePath.replace(/\\/g, '/'));
          }
        }
      }

      for (const dir of packageDirs) {
        const nodeType: WorkspaceNodeType = dir.startsWith('apps/')
          ? 'app'
          : dir.startsWith('packages/')
          ? 'package'
          : 'layer';

        const pkgName = this.getPackageName(dir) || path.basename(dir);
        const nodeTech = this.techDetector.detectInDirectory(path.join(this.rootPath, dir));

        rootNode.children.push({
          id: dir,
          name: pkgName,
          path: dir,
          type: nodeType,
          children: [],
          changes: [],
          techStack: nodeTech.length > 0 ? nodeTech : undefined,
        });
      }
    } else {
      // Standalone folder layout heuristic (e.g., src, lib, test, components)
      const topDirs = fs
        .readdirSync(this.rootPath, { withFileTypes: true })
        .filter((d) => d.isDirectory() && !d.name.startsWith('.') && d.name !== 'node_modules' && d.name !== 'dist');

      for (const dirEntry of topDirs) {
        const dir = dirEntry.name;
        const nodeTech = this.techDetector.detectInDirectory(path.join(this.rootPath, dir));

        rootNode.children.push({
          id: dir,
          name: dir,
          path: dir,
          type: 'layer',
          children: [],
          changes: [],
          techStack: nodeTech.length > 0 ? nodeTech : undefined,
        });
      }
    }

    return rootNode;
  }

  private getPackageName(dirRelativePath: string): string | null {
    const pkgPath = path.join(this.rootPath, dirRelativePath, 'package.json');
    if (fs.existsSync(pkgPath)) {
      try {
        const content = fs.readFileSync(pkgPath, 'utf8');
        const parsed = JSON.parse(content);
        return parsed.name || null;
      } catch {
        return null;
      }
    }
    return null;
  }
}
