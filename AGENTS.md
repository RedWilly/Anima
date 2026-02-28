# Anima Agent Guidelines

Animation library for mathematical visualizations using Bun, TypeScript, and Canvas.

## Commands
- **Typecheck**: `bun run typecheck`
- **Test Single**: `bun test tests/unit/mobjects/VGroup.test.ts`
- **Test All**: `bun test`

## Resources
- **Structure**: [reference/STRUCTURE.md](reference/STRUCTURE.md)
- **TypeScript conventions**: [reference/TYPESCRIPT.md](reference/TYPESCRIPT.md)

## Architecture Philosophy — Deep Modules

**Every coding decision must respect these principles. No shortcuts. No laziness.**

1. **Single source of truth.** No duplication. Every concept lives in exactly one place. If you need it elsewhere, import it - never copy it.

2. **Deep modules over shallow modules.** Prefer fewer modules with simple interfaces and rich implementation over many small, scattered files. Each module should hide complexity behind a clean public API. This is progressive disclosure of complexity - the interface explains *what*, the internals handle *how*.

3. **Minimize the mental map.** The codebase's file structure must be easily navigable. Before adding a new file or module, ask: does this reduce or increase the number of things someone must hold in their head? Fewer top-level concepts with depth inside each are always better than a flat sea of files.

4. **Design interfaces first.** When building or changing a module, define the public interface before writing implementation. Think about how this module connects to others. Own the boundaries - let the implementation follow.

5. **Enforce module boundaries.** Modules should not reach into each other's internals. Import only through the public interface (barrel exports / index files). If you're tempted to import a deep internal path from another module, that's a design smell - fix the interface.

6. **Clean and maintainable above all.** Less code is better code. Every line must earn its place. Remove dead code, collapse unnecessary abstractions, and resist adding "just in case" flexibility. The right amount of code is the minimum that works correctly.
