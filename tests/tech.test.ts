import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TechDetector } from '../src/core/config/techDetector.js';
import fs from 'fs';
import path from 'path';

describe('TechDetector', () => {
  const testDir = path.join(process.cwd(), 'tests', 'temp-tech-test');

  beforeEach(() => {
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
  });

  afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('detects frameworks and versions from package.json', () => {
    const pkgJson = {
      dependencies: {
        next: '^14.2.5',
        react: '18.3.1',
      },
      devDependencies: {
        typescript: '~5.5.4',
        tailwindcss: '^3.4.1',
      },
    };

    fs.writeFileSync(path.join(testDir, 'package.json'), JSON.stringify(pkgJson, null, 2));

    const detector = new TechDetector();
    const result = detector.detectInDirectory(testDir);

    expect(result).toHaveLength(4);

    const nextTech = result.find((t) => t.name === 'Next.js');
    expect(nextTech).toBeDefined();
    expect(nextTech?.version).toBe('14.2.5');
    expect(nextTech?.category).toBe('framework');

    const reactTech = result.find((t) => t.name === 'React');
    expect(reactTech).toBeDefined();
    expect(reactTech?.version).toBe('18.3.1');

    const tsTech = result.find((t) => t.name === 'TypeScript');
    expect(tsTech).toBeDefined();
    expect(tsTech?.version).toBe('5.5.4');
  });
});
