import fs from 'fs';
import path from 'path';
import { TechStackItem } from '../types.js';

const KNOWN_TECHNOLOGIES: Array<{
  pkg: string;
  name: string;
  category: TechStackItem['category'];
}> = [
  // Frameworks
  { pkg: 'next', name: 'Next.js', category: 'framework' },
  { pkg: 'astro', name: 'Astro', category: 'framework' },
  { pkg: '@remix-run/react', name: 'Remix', category: 'framework' },
  { pkg: '@remix-run/node', name: 'Remix', category: 'framework' },
  { pkg: 'nuxt', name: 'Nuxt', category: 'framework' },
  { pkg: '@sveltejs/kit', name: 'SvelteKit', category: 'framework' },
  { pkg: '@angular/core', name: 'Angular', category: 'framework' },
  { pkg: 'vue', name: 'Vue', category: 'framework' },
  { pkg: 'react', name: 'React', category: 'framework' },
  { pkg: 'svelte', name: 'Svelte', category: 'framework' },
  { pkg: 'gatsby', name: 'Gatsby', category: 'framework' },
  { pkg: 'solid-js', name: 'SolidJS', category: 'framework' },

  // Backend
  { pkg: '@nestjs/core', name: 'NestJS', category: 'backend' },
  { pkg: 'express', name: 'Express', category: 'backend' },
  { pkg: 'fastify', name: 'Fastify', category: 'backend' },
  { pkg: 'hono', name: 'Hono', category: 'backend' },
  { pkg: 'koa', name: 'Koa', category: 'backend' },
  { pkg: '@trpc/server', name: 'tRPC', category: 'backend' },

  // Tools & DB
  { pkg: 'vite', name: 'Vite', category: 'tool' },
  { pkg: 'typescript', name: 'TypeScript', category: 'tool' },
  { pkg: 'tailwindcss', name: 'TailwindCSS', category: 'ui' },
  { pkg: 'prisma', name: 'Prisma', category: 'backend' },
  { pkg: '@prisma/client', name: 'Prisma', category: 'backend' },
  { pkg: 'drizzle-orm', name: 'Drizzle', category: 'backend' },
  { pkg: 'tsup', name: 'tsup', category: 'tool' },
  { pkg: 'vitest', name: 'Vitest', category: 'tool' },
  { pkg: 'jest', name: 'Jest', category: 'tool' },
  { pkg: '@biomejs/biome', name: 'Biome', category: 'tool' },
  { pkg: 'eslint', name: 'ESLint', category: 'tool' },
  { pkg: 'ink', name: 'Ink', category: 'ui' },
];

export class TechDetector {
  public detectInDirectory(dirPath: string): TechStackItem[] {
    const pkgPath = path.join(dirPath, 'package.json');
    if (!fs.existsSync(pkgPath)) return [];

    try {
      const content = fs.readFileSync(pkgPath, 'utf8');
      const parsed = JSON.parse(content);
      const allDeps: Record<string, string> = {
        ...(parsed.dependencies || {}),
        ...(parsed.devDependencies || {}),
        ...(parsed.peerDependencies || {}),
      };

      const detectedMap = new Map<string, TechStackItem>();

      for (const entry of KNOWN_TECHNOLOGIES) {
        if (allDeps[entry.pkg] && !detectedMap.has(entry.name)) {
          const rawVersion = allDeps[entry.pkg];
          const cleanVersion = rawVersion.replace(/[\^~>=<]/g, '').trim();

          detectedMap.set(entry.name, {
            name: entry.name,
            version: cleanVersion || undefined,
            category: entry.category,
          });
        }
      }

      return Array.from(detectedMap.values());
    } catch {
      return [];
    }
  }
}
