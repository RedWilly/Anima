# 🎬 Project Anima

A next-generation animation engine that brings the narrative power and mathematical precision of tools like Python's Manim into the JavaScript/TypeScript ecosystem.

## ✨ Features

- **Fluent API** — Animation scripts read like English sentences
- **Universal Rendering** — Same code runs in browser and exports to video
- **Full Easing Library** — Linear, Ease-In/Out, Elastic, Bounce
- **Shape Primitives** — Circle, Rectangle with transformation methods
- **Timeline Orchestration** — Sequential action execution with wait support
- **Playback Controls** — Pause, resume, seek, speed control

## 📦 Packages

| Package | Description |
|---------|-------------|
| `@anima/core` | Animation engine, entities, timeline |
| `@anima/browser-renderer` | Canvas 2D adapter, playback controller |
| `@anima/server-renderer` | @napi-rs/canvas + FFmpeg video export |

## 🚀 Quick Start

```typescript
import { scene, circle } from '@anima/core';
import { createPlayback } from '@anima/browser-renderer';

// Create a scene
const myScene = scene({ width: 800, height: 600 });

// Add a shape with fluent animations
myScene.add(circle({ radius: 50 }))
  .moveTo(200, 300)
  .wait(0.5)
  .moveTo(600, 300, { ease: 'elastic' })
  .fadeOut();

// Play in browser
const playback = createPlayback(myScene, canvas);
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
