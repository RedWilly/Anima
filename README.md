# 🎬 Project Anima

A next-generation animation engine that brings the narrative power and mathematical precision of tools like Python's Manim into the JavaScript/TypeScript ecosystem.

## ✨ Features

- **Fluent API** — Animation scripts read like English sentences
- **Video Export** — Render animations to MP4, WebM, or GIF
- **Full Easing Library** — Linear, Ease-In/Out, Elastic, Bounce
- **Shape Primitives** — Circle, Rectangle, Line, Arrow, Polygon, Text
- **Composition** — Group shapes to transform as a unit
- **Timeline Orchestration** — Sequential and parallel animations

> Anima uses named imports as the primary API. The `anima` namespace exists for convenience and quick demos, but core and production code should use named imports.

## 📦 Packages

| Package | Description |
|---------|-------------|
| `@anima/core` | Animation engine, entities, timeline |
| `@anima/server-renderer` | Canvas + FFmpeg video export + CLI |

## 🚀 Quick Start

```typescript
// animation.ts
import { scene, circle, rectangle } from '@anima/core';

const myScene = scene({ width: 800, height: 600 });

myScene.add(circle({ radius: 50 }))
  .moveTo(200, 300)
  .wait(0.5)
  .moveTo(600, 300, { ease: 'elastic' })
  .fadeOut();

export default myScene;
```

```bash
# Preview animation
bun packages/cli/src/index.ts preview animation.ts

# Render to video
bun packages/cli/src/index.ts render animation.ts -o output.mp4
```


## 🛠️ Development

```bash
# Install dependencies
bun install

# Run tests
bun test

# Type check
bun run typecheck
```

## 📂 Project Structure

```
anima/
├── packages/
│   ├── core/              # Animation engine
│   ├── browser-renderer/  # Browser playback
│   └── server-renderer/   # Video export
├── examples/
│   └── basic-animation/   # Demo
└── conductor/             # Project specs
```

## 📄 License

MIT
