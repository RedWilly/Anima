import { describe, expect, test } from 'bun:test';
import { existsSync, readFileSync } from 'node:fs';
import { globSync } from 'glob';
import { dirname, join, relative, resolve, sep } from 'node:path';

const mobjectFiles = globSync('src/core/mobjects/**/*.ts', { posix: true });
const mathFiles = globSync('src/core/math/**/*.ts', { posix: true });
const facadeBoundaryModules = ['scene', 'timeline', 'renderer', 'cache', 'animations', 'errors', 'camera'];
const facadeBoundaryFiles = [
  ...globSync('src/core/scene/**/*.ts', { posix: true }),
  ...globSync('src/core/timeline/**/*.ts', { posix: true }),
  ...globSync('src/core/renderer/**/*.ts', { posix: true }),
  ...globSync('src/core/cache/**/*.ts', { posix: true }),
  ...globSync('src/core/animations/**/*.ts', { posix: true }),
  ...globSync('src/core/errors/**/*.ts', { posix: true }),
  ...globSync('src/core/camera/**/*.ts', { posix: true }),
];
const importRegex = /from\s+['"]([^'"]+)['"]/g;
const coreRoot = resolve('src/core');

const ALLOWED_ANIMATION_IMPORTS: RegExp[] = [
  /^(\.\.\/)+animations\/mobjectApi$/,
];
const CROSS_MODULE_EXCEPTIONS: Record<string, string[]> = {
  'src/core/animations/composition/Parallel.ts': ['../../mobjects/Mobject'],
  'src/core/animations/composition/Sequence.ts': ['../../mobjects/Mobject'],
  'src/core/camera/CameraFrame.ts': [
    '../animations/Animation',
    '../animations/fluent',
    '../mobjects/Mobject',
  ],
};

function isAnimationImport(specifier: string): boolean {
  return specifier.includes('/animations') || specifier.endsWith('/animations');
}

function isAllowedAnimationImport(specifier: string): boolean {
  return ALLOWED_ANIMATION_IMPORTS.some((rule) => rule.test(specifier));
}

function resolveCoreImport(sourceFile: string, specifier: string): string | null {
  if (!specifier.startsWith('.')) {
    return null;
  }

  const resolvedBase = resolve(dirname(sourceFile), specifier);
  const candidates = [
    `${resolvedBase}.ts`,
    join(resolvedBase, 'index.ts'),
    resolvedBase,
  ];

  const found = candidates.find((candidate) => existsSync(candidate));
  if (!found) {
    return null;
  }

  if (!found.startsWith(coreRoot)) {
    return null;
  }

  return found;
}

function getModuleName(absPath: string): string {
  return relative(coreRoot, absPath).split(sep)[0] ?? '';
}

function isFacadeImportTarget(absTargetPath: string, targetModule: string): boolean {
  const rel = relative(coreRoot, absTargetPath).replace(/\\/g, '/');
  return rel === `${targetModule}/index.ts`;
}

describe('Architecture boundaries', () => {
  test('math internals import Vector through submodule facade', () => {
    const violations: string[] = [];

    for (const file of mathFiles) {
      const content = readFileSync(file, 'utf-8');
      const imports = Array.from(content.matchAll(importRegex), (match) => match[1]);

      for (const specifier of imports) {
        if (specifier === '../Vector/Vector' || specifier === '../Vector' || specifier === '../vector/Vector') {
          violations.push(`${file}: use '../vector' instead of '${specifier}'`);
        }
      }
    }

    expect(violations).toEqual([]);
  });

  test('mobjects only consume animation facades, not deep animation internals', () => {
    const violations: string[] = [];

    for (const file of mobjectFiles) {
      const content = readFileSync(file, 'utf-8');
      const imports = Array.from(content.matchAll(importRegex), (match) => match[1]);

      for (const specifier of imports) {
        if (!specifier || !specifier.startsWith('.')) {
          continue;
        }

        if (!isAnimationImport(specifier)) {
          continue;
        }

        if (!isAllowedAnimationImport(specifier)) {
          violations.push(`${file}: disallowed animation import '${specifier}'`);
        }
      }
    }

    expect(violations).toEqual([]);
  });

  test('mobjects import non-animation modules through facades', () => {
    const violations: string[] = [];

    for (const file of mobjectFiles) {
      const absSource = resolve(file);
      const sourceModule = getModuleName(absSource);
      if (sourceModule !== 'mobjects') {
        continue;
      }

      const content = readFileSync(file, 'utf-8');
      const imports = Array.from(content.matchAll(importRegex), (match) => match[1]);

      for (const specifier of imports) {
        if (!specifier || !specifier.startsWith('.')) {
          continue;
        }

        if (isAnimationImport(specifier)) {
          continue;
        }

        const absTarget = resolveCoreImport(absSource, specifier);
        if (!absTarget) {
          continue;
        }

        const targetModule = getModuleName(absTarget);
        if (targetModule === sourceModule) {
          continue;
        }

        if (!isFacadeImportTarget(absTarget, targetModule)) {
          violations.push(`${file}: disallowed non-animation cross-module import '${specifier}'`);
        }
      }
    }

    expect(violations).toEqual([]);
  });

  test('selected core modules import other modules through facades', () => {
    const violations: string[] = [];

    for (const file of facadeBoundaryFiles) {
      const absSource = resolve(file);
      const sourceModule = getModuleName(absSource);
      if (!facadeBoundaryModules.includes(sourceModule)) {
        continue;
      }

      const content = readFileSync(file, 'utf-8');
      const imports = Array.from(content.matchAll(importRegex), (match) => match[1]);

      for (const specifier of imports) {
        if (!specifier) {
          continue;
        }

        const absTarget = resolveCoreImport(absSource, specifier);
        if (!absTarget) {
          continue;
        }

        const targetModule = getModuleName(absTarget);
        if (targetModule === sourceModule) {
          continue;
        }

        if (!isFacadeImportTarget(absTarget, targetModule)) {
          const posixFile = file.replace(/\\/g, '/');
          const allowedSpecifiers = CROSS_MODULE_EXCEPTIONS[posixFile] ?? [];
          if (allowedSpecifiers.includes(specifier)) {
            continue;
          }
          violations.push(`${file}: disallowed cross-module import '${specifier}'`);
        }
      }
    }

    expect(violations).toEqual([]);
  });
});

