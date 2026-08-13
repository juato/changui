import { simpleGit, SimpleGit, StatusResult } from 'simple-git';
import { GitFileChange, ChangeStage, ChangeType } from '../types.js';

export class GitStatusReader {
  private git: SimpleGit;

  constructor(repoPath: string = process.cwd()) {
    this.git = simpleGit({ baseDir: repoPath });
  }

  public async getChanges(): Promise<GitFileChange[]> {
    const isRepo = await this.git.checkIsRepo();
    if (!isRepo) {
      throw new Error('Current directory is not a valid Git repository.');
    }

    const status: StatusResult = await this.git.status();
    const changes: GitFileChange[] = [];

    for (const file of status.files) {
      const normalizedPath = file.path.replace(/\\/g, '/');

      // Staged change
      if (file.index && file.index !== ' ' && file.index !== '?') {
        changes.push({
          path: normalizedPath,
          stage: 'staged',
          type: this.mapChangeType(file.index),
        });
      }

      // Unstaged change
      if (file.working_dir && file.working_dir !== ' ' && file.working_dir !== '?') {
        changes.push({
          path: normalizedPath,
          stage: 'unstaged',
          type: this.mapChangeType(file.working_dir),
        });
      }

      // Untracked change
      if (file.working_dir === '?' || file.index === '?') {
        changes.push({
          path: normalizedPath,
          stage: 'untracked',
          type: 'untracked',
        });
      }
    }

    return changes;
  }

  private mapChangeType(code: string): ChangeType {
    switch (code.toUpperCase()) {
      case 'A':
        return 'added';
      case 'M':
        return 'modified';
      case 'D':
        return 'deleted';
      case 'R':
        return 'renamed';
      case '?':
        return 'untracked';
      default:
        return 'modified';
    }
  }
}
