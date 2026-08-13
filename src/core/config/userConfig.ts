import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';
import { Language } from '../i18n/translations.js';

export interface UserConfig {
  editor: string; // 'code' | 'cursor' | 'subl' | 'nvim' | 'webstorm' | 'default'
  language: Language; // 'en' | 'es-AR'
}

export interface EditorInfo {
  id: string;
  name: string;
  command: string;
  installed: boolean;
}

const DEFAULT_CONFIG: UserConfig = {
  editor: 'code',
  language: 'en',
};

export class UserConfigManager {
  private configDir: string;
  private configFile: string;

  constructor() {
    this.configDir = path.join(os.homedir(), '.config', 'changui');
    this.configFile = path.join(this.configDir, 'config.json');
  }

  public loadConfig(): UserConfig {
    if (!fs.existsSync(this.configFile)) {
      return DEFAULT_CONFIG;
    }

    try {
      const content = fs.readFileSync(this.configFile, 'utf8');
      const parsed = JSON.parse(content);
      return { ...DEFAULT_CONFIG, ...parsed };
    } catch {
      return DEFAULT_CONFIG;
    }
  }

  public saveConfig(config: UserConfig): void {
    try {
      if (!fs.existsSync(this.configDir)) {
        fs.mkdirSync(this.configDir, { recursive: true });
      }
      fs.writeFileSync(this.configFile, JSON.stringify(config, null, 2), 'utf8');
    } catch {
      // Ignore write errors
    }
  }

  public detectInstalledEditors(): EditorInfo[] {
    const candidateEditors = [
      { id: 'code', name: 'VS Code', command: 'code' },
      { id: 'cursor', name: 'Cursor', command: 'cursor' },
      { id: 'code-insiders', name: 'VS Code Insiders', command: 'code-insiders' },
      { id: 'subl', name: 'Sublime Text', command: 'subl' },
      { id: 'webstorm', name: 'WebStorm', command: 'webstorm' },
      { id: 'nvim', name: 'Neovim', command: 'nvim' },
      { id: 'default', name: 'System Default Editor', command: 'open' },
    ];

    return candidateEditors.map((editor) => {
      let installed = false;
      if (editor.id === 'default') {
        installed = true;
      } else {
        try {
          execSync(`which ${editor.command}`, { stdio: 'ignore' });
          installed = true;
        } catch {
          // Check macOS /Applications fallback
          const macAppPath = `/Applications/${editor.name}.app`;
          installed = fs.existsSync(macAppPath);
        }
      }
      return { ...editor, installed };
    });
  }
}
