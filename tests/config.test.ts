import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { UserConfigManager } from '../src/core/config/userConfig.js';
import fs from 'fs';
import path from 'path';

describe('UserConfigManager', () => {
  it('loads default config and detects installed system editors', () => {
    const manager = new UserConfigManager();
    const config = manager.loadConfig();
    expect(config.editor).toBeDefined();

    const editors = manager.detectInstalledEditors();
    expect(editors.length).toBeGreaterThan(0);
    const defaultEditor = editors.find((e) => e.id === 'default');
    expect(defaultEditor).toBeDefined();
    expect(defaultEditor?.installed).toBe(true);
  });
});
