import React from 'react';
import { render } from 'ink';
import { Command } from 'commander';
import { WorkspaceDetector } from './core/config/workspace.js';
import { GitStatusReader } from './core/git/status.js';
import { ArchitectureMapper } from './core/mapper/tree.js';
import { App } from './ui/App.js';
import { ArchitecturalTree } from './core/types.js';

const program = new Command();

const restoreScreen = () => {
  try {
    process.stdout.write('\x1b[?1049l\x1b[?25h');
  } catch {
    // Ignore cleanup errors on forced kill
  }
};

process.on('SIGINT', () => {
  restoreScreen();
  process.exit(0);
});

process.on('SIGTERM', () => {
  restoreScreen();
  process.exit(0);
});

process.on('exit', () => {
  restoreScreen();
});

program
  .name('changui')
  .description('Git status visualizer organized by project architecture')
  .version('0.1.0')
  .option('-a, --all', 'Show all workspace nodes even if clean', false)
  .option('-j, --json', 'Output architectural tree as JSON', false)
  .action(async (options) => {
    try {
      const rootPath = process.cwd();
      const detector = new WorkspaceDetector(rootPath);
      const rootNode = await detector.buildTree();

      const gitReader = new GitStatusReader(rootPath);
      const changes = await gitReader.getChanges();

      const mapper = new ArchitectureMapper();
      const tree: ArchitecturalTree = mapper.mapChanges(rootNode, changes, {
        pruneEmpty: !options.all,
      });

      if (options.json) {
        console.log(JSON.stringify(tree, null, 2));
        return;
      }

      // Enter Alternate Screen Buffer, move cursor to (1,1) & hide cursor
      process.stdout.write('\x1b[?1049h\x1b[2J\x1b[3J\x1b[H\x1b[?25l');

      const instance = render(React.createElement(App, { tree, error: null }), {
        patchConsole: true,
      });

      await instance.waitUntilExit();
      restoreScreen();
    } catch (err: any) {
      restoreScreen();
      render(React.createElement(App, { tree: null, error: err.message || String(err) }), {
        patchConsole: true,
      });
    }
  });

program.parse(process.argv);
