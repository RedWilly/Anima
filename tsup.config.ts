import { defineConfig } from 'tsup';

const sharedExternal = [
  '@napi-rs/canvas',
  'fontkit',
  'commander',
];

export default defineConfig([
  // ── Library bundle ──────────────────────────────────────────────
  {
    entry: { index: 'src/index.ts' },
    format: 'esm',
    outDir: 'dist',
    clean: true,
    dts: true,
    splitting: false,
    sourcemap: false,
    minify: false,
    target: 'es2022',
    platform: 'node',
    bundle: true,
    tsconfig: 'tsconfig.build.json',
    external: sharedExternal,
  },

  // ── CLI bundle ──────────────────────────────────────────────────
  {
    entry: { 'cli/index': 'src/cli/index.ts' },
    format: 'esm',
    outDir: 'dist',
    // Don't clean — library output already written above
    clean: false,
    dts: false,
    splitting: false,
    sourcemap: false,
    minify: false,
    target: 'es2022',
    platform: 'node',
    bundle: true,
    tsconfig: 'tsconfig.build.json',

    // Externalize the library itself so CLI imports from the built dist/index.js
    external: [...sharedExternal, '@redwilly/anima'],

    // shebang for CLI binary
    banner: {
      js: '#!/usr/bin/env node',
    },
  },
]);
