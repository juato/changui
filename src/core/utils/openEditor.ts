import { exec } from 'child_process';
import path from 'path';

export function openFileInEditor(
  filePath: string,
  rootPath: string = process.cwd(),
  editorCommand: string = 'code'
): boolean {
  const fullPath = path.resolve(rootPath, filePath);

  if (editorCommand === 'default') {
    const defaultCmd =
      process.platform === 'darwin'
        ? `open "${fullPath}"`
        : process.platform === 'win32'
        ? `start "" "${fullPath}"`
        : `xdg-open "${fullPath}"`;
    exec(defaultCmd);
    return true;
  }

  exec(`${editorCommand} "${fullPath}"`, (err) => {
    if (err) {
      // Fallback to system open
      const fallbackCmd =
        process.platform === 'darwin'
          ? `open "${fullPath}"`
          : process.platform === 'win32'
          ? `start "" "${fullPath}"`
          : `xdg-open "${fullPath}"`;
      exec(fallbackCmd);
    }
  });

  return true;
}
