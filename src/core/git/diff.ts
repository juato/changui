import fs from 'fs';
import path from 'path';
import { simpleGit, SimpleGit } from 'simple-git';
import { ChangeStage, DiffLine, FileDiffResult } from '../types.js';

export class GitDiffReader {
  private git: SimpleGit;
  private repoPath: string;

  constructor(repoPath: string = process.cwd()) {
    this.repoPath = repoPath;
    this.git = simpleGit({ baseDir: repoPath });
  }

  public async getDiff(filePath: string, stage: ChangeStage): Promise<FileDiffResult> {
    try {
      if (stage === 'untracked') {
        return this.getUntrackedDiff(filePath);
      }

      const options = stage === 'staged' ? ['--staged', '--', filePath] : ['--', filePath];
      const rawDiff = await this.git.diff(options);

      if (!rawDiff || rawDiff.trim() === '') {
        // Fallback if staged diff is empty or renamed
        return this.getUntrackedDiff(filePath);
      }

      return {
        filePath,
        lines: this.parseDiffOutput(rawDiff),
      };
    } catch {
      return {
        filePath,
        lines: [{ type: 'normal', content: 'Unable to load git diff.' }],
      };
    }
  }

  private getUntrackedDiff(filePath: string): FileDiffResult {
    const fullPath = path.join(this.repoPath, filePath);
    if (!fs.existsSync(fullPath)) {
      return {
        filePath,
        lines: [{ type: 'delete', content: `- File deleted: ${filePath}` }],
      };
    }

    try {
      const stats = fs.statSync(fullPath);
      if (stats.isDirectory()) {
        return {
          filePath,
          lines: [{ type: 'header', content: `[Directory: ${filePath}]` }],
        };
      }

      const content = fs.readFileSync(fullPath, 'utf8');
      const rawLines = content.split('\n');//.slice(0, 40);

      const lines: DiffLine[] = rawLines.map((line) => ({
        type: 'add',
        content: `+ ${line}`,
      }));

      // if (rawLines.length === 40) {
      //   lines.push({ type: 'header', content: '... (truncated)' });
      // }

      return { filePath, lines };
    } catch {
      return {
        filePath,
        lines: [{ type: 'header', content: '[Binary or unreadable file]' }],
      };
    }
  }

  private parseDiffOutput(raw: string): DiffLine[] {
    const rawLines = raw.split('\n').filter((l) => l.trim().length > 0);
    const result: DiffLine[] = [];

    for (const line of rawLines) {
      if (line.startsWith('diff --git') || line.startsWith('index ') || line.startsWith('--- ') || line.startsWith('+++ ')) {
        continue; // Skip git header noise
      }

      if (line.startsWith('@@')) {
        result.push({ type: 'header', content: line });
      } else if (line.startsWith('+')) {
        result.push({ type: 'add', content: line });
      } else if (line.startsWith('-')) {
        result.push({ type: 'delete', content: line });
      } else {
        result.push({ type: 'normal', content: line });
      }
    }

    return result;
  }
}
