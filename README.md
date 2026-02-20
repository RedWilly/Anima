# Anima

**Anima** is a TypeScript animation library for creating mathematical visualizations. Built on Bun and Canvas, it provides a fluent API for programmatically generating animations of geometric shapes, text, graphs, and more.

[![npm version](https://img.shields.io/npm/v/@redwilly/anima.svg)](https://www.npmjs.com/package/@redwilly/anima)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Installation

```bash
bun add @redwilly/anima
```

## Quick Start

Create a scene by extending the `Scene` class:

```typescript
import { Scene, Circle, Rectangle, Color } from '@redwilly/anima';

export class MyScene extends Scene {
  constructor() {
    super({ 
      width: 1920, 
      height: 1080, 
      frameRate: 60, 
      backgroundColor: Color.BLACK 
    });

    const circle = new Circle(1)
      .stroke(Color.WHITE, 2)
      .pos(-2, 0);

    const rect = new Rectangle(2, 1)
      .fill(Color.BLUE, 0.6)
      .pos(2, 0);

    // Animations in the same play() call run in parallel
    this.play(
      circle.fadeIn(1).moveTo(0, 0, 1),
      rect.fadeIn(1)
    );

    this.wait(0.5);
    this.play(circle.fadeOut(0.5));
  }
}
```

Render your scene:

```bash
anima render myfile.ts -s MyScene -o output.mp4
```

## Features

- **Fluent API**: Chain animations naturally with method chaining
- **Rich Geometry**: Circles, rectangles, lines, arrows, arcs, polygons, and more
- **Text Rendering**: Custom font support with glyph-level control
- **Graph Layouts**: Tree, circular, and force-directed graph visualizations
- **Camera System**: Zoom, pan, shake, and follow animations
- **Easing Functions**: 30+ easing functions including standard and Manim-style
- **Keyframe Animation**: Fine-grained control over complex motion paths
- **Multiple Output Formats**: MP4, WebP, GIF, sprite sheets, and PNG sequences
- **Segment Caching**: Intelligent caching for faster re-renders

## Documentation

For detailed usage and examples, explore the [skills directory](skills/) which contains comprehensive guides on:

- [Scene Management](skills/rules/scene.md) - Setup, configuration, and lifecycle
- [Mobjects](skills/rules/mobjects.md) - Mathematical objects and their properties
- [Animations](skills/rules/animations.md) - Fluent and Pro APIs for animation
- [Geometry](skills/rules/geometry.md) - Shapes and geometric primitives
- [Styling](skills/rules/styling.md) - Colors, strokes, and fills
- [Camera](skills/rules/camera.md) - Camera movements and effects
- [Text](skills/rules/text.md) - Text rendering and animation
- [Graph](skills/rules/graph.md) - Graph structures and layouts
- [VGroup](skills/rules/vgroup.md) - Grouping and arranging objects
- [Easing](skills/rules/easing.md) - Easing function reference
- [Keyframes](skills/rules/keyframes.md) - Keyframe-based animation
- [Rendering](skills/rules/rendering.md) - Output formats and CLI commands

See [SKILL.md](skills/SKILL.md) for a complete overview of the animation engine.

## CLI Commands

```bash
# Render a scene to video
anima render scene.ts -s MyScene -o output.mp4

# Preview with lower quality for faster iteration
anima preview scene.ts -s MyScene

# Export a single frame
anima export-frame scene.ts -s MyScene -t 5.0 -o frame.png

# List all scenes in a file
anima list-scenes scene.ts
```

## Examples

Check out the [examples directory](examples/) for sample scenes demonstrating:

- Camera movements and effects
- Complex animation sequences
- Graph visualizations
- Fluent and Pro API patterns
- Scaling and transformations

## Inspiration

Anima is inspired by [Manim](https://github.com/ManimCommunity/manim/), the mathematical animation engine created by Grant Sanderson (3Blue1Brown). While Manim uses Python and OpenGL, Anima brings similar concepts to TypeScript with a focus on web-friendly Canvas rendering.

## Development

```bash
# Type checking
bun run typecheck

# Run tests
bun test

# Build
bun run build
```

See [AGENTS.md](AGENTS.md) for development guidelines and [reference/STRUCTURE.md](reference/STRUCTURE.md) for codebase architecture.

## License

MIT © [RedWilly](https://github.com/RedWilly)

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.
