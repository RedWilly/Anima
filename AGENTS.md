# Anima Agent Guidelines

Animation library for mathematical visualizations using Bun, TypeScript, and Canvas.

## Commands
- **Typecheck**: `bun run typecheck`
- **Test Single**: `bun test tests/unit/mobjects/VGroup.test.ts`
- **Test All**: `bun test`

## Architecture
- `/src/core/` - Math, animations, rendering, scene, timeline, camera
- `/src/mobjects/` - Mathematical objects (shapes, text, groups)
- `/src/fluent/` - Animation construction API
- `/src/cli/` - CLI tool
- `/src/fonts/` - Typography utilities

For TypeScript conventions, see [code_styleguides/TYPESCRIPT.md](code_styleguides/TYPESCRIPT.md).
