import { describe, expect, test } from 'bun:test';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import {
  ALLOWED_ANIMATION_IMPORTS,
  collectArchitectureFiles,
  CROSS_MODULE_EXCEPTIONS,
  FACADE_BOUNDARY_MODULES,
} from './boundaryConfig';

const { mobjectFiles, mathFiles, facadeBoundaryFiles } = collectArchitectureFiles();
const importRegex = /from\s+['"]([^'"]+)['"]/g;
const coreRoot = resolve('src/core');

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
  test('architecture globs should match at least one file', () => {
    expect(mobjectFiles.length).toBeGreaterThan(0);
    expect(mathFiles.length).toBeGreaterThan(0);
    expect(facadeBoundaryFiles.length).toBeGreaterThan(0);
  });

  test('math internals import Vector2 through submodule facade', () => {
    const violations: string[] = [];

    for (const file of mathFiles) {
      const content = readFileSync(file, 'utf-8');
      const imports = Array.from(content.matchAll(importRegex), (match) => match[1]);

      for (const specifier of imports) {
        if (specifier === '../Vector2/Vector2') {
          violations.push(`${file}: use '../Vector2' instead of '${specifier}'`);
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
      if (!FACADE_BOUNDARY_MODULES.includes(sourceModule as (typeof FACADE_BOUNDARY_MODULES)[number])) {
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
