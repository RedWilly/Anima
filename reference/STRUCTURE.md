# Source Code Structure

```
src/
├── index.ts                          # Main export
├── cli/                              # Command-line interface
│   ├── index.ts                      # CLI entry point
│   ├── SceneLoader.ts                # Scene loading utilities
│   └── commands/                     # CLI commands
│       ├── export-frame.ts           # Export single frame
│       ├── list-scenes.ts            # List available scenes
│       ├── preview.ts                # Preview animations
│       └── render.ts                 # Render animations to output
│
├── core/                             # Core animation engine
│   ├── animations/                   # Animation system
│   │   ├── Animation.ts              # Base animation class
│   │   ├── types.ts                  # Animation types
│   │   ├── categories/               # Animation categories
│   │   ├── composition/              # Compose multiple animations (Sequence, Parallel)
│   │   ├── draw/                     # Drawing animations (Write, Unwrite, Draw)
│   │   ├── easing/                   # Easing functions
│   │   ├── fade/                     # Fade animations (FadeIn, FadeOut)
│   │   ├── keyframes/                # Keyframe-based animations
│   │   ├── morph/                    # Morphing animations (MorphTo)
│   │   └── transform/                # Transformation animations (Move, Rotate, Scale)
│   │
│   ├── camera/                       # Camera system
│   │   ├── Camera.ts                 # Camera implementation
│   │   └── types.ts                  # Camera types
│   │
│   ├── errors/                       # Error types
│   │   └── AnimationErrors.ts        # Custom animation errors
│   │
│   ├── math/                         # Mathematical utilities
│   │   ├── Vector2/                  # 2D vectors
│   │   ├── Matrix/                   # 3x3 matrix operations
│   │   ├── color/                    # Color definitions and conversions
│   │   └── bezier/                   # Bezier curve algorithms
│   │
│   ├── renderer/                     # Rendering engine
│   │   ├── Renderer.ts               # Main renderer
│   │   ├── FrameRenderer.ts          # Per-frame rendering
│   │   ├── drawMobject.ts            # Draw mobject to canvas
│   │   ├── ProgressReporter.ts       # Rendering progress reporting
│   │   └── formats/                  # Output formats (PNG, sprite, video)
│   │
│   ├── scene/                        # Scene management
│   │   ├── Scene.ts                  # Scene class
│   │   └── types.ts                  # Scene types
│   │
│   ├── serialization/                # Serialization/deserialization
│   │   ├── animation.ts              # Animation serialization
│   │   ├── mobject.ts                # Mobject serialization
│   │   ├── scene.ts                  # Scene serialization
│   │   └── registry.ts               # Type registry for deserialization
│   │
│   └── timeline/                     # Timeline management
│       └── Timeline.ts               # Timeline for coordinating animations
│
├── fluent/                           # Animation builder API
│   ├── FluentTypes.ts                # Fluent API types
│   ├── AnimationQueue.ts             # Queue for building animations
│   └── factories/                    # Factory functions for mobjects
│       ├── mobject.ts                # Mobject factories
│       └── vmobject.ts               # VMobject factories
│
├── fonts/                            # Fonts
│   └── Inter.ttf.ts                  # inter font
│
└── mobjects/                         # Mathematical objects
    ├── Mobject.ts                    # Base mathematical object
    ├── VMobject.ts                   # Vector mathematical object
    ├── geometry/                     # Geometric shapes
    │   ├── Point.ts                  # Point
    │   ├── Line.ts                   # Line
    │   ├── Circle.ts                 # Circle
    │   ├── Arc.ts                    # Arc
    │   ├── Rectangle.ts              # Rectangle
    │   ├── Polygon.ts                # Polygon
    │   └── Arrow.ts                  # Arrow
    │
    ├── text/                         # Text objects
    │   ├── Text.ts                   # Text rendering
    │   ├── Glyph.ts                  # Individual glyphs
    │   └── types.ts                  # Text configuration types
    │
    ├── graph/                        # Graph structures
    │   ├── Graph.ts                  # Graph container
    │   ├── GraphNode.ts              # Graph node
    │   ├── GraphEdge.ts              # Graph edge
    │   └── layouts/                  # Graph layout algorithms
    │       ├── tree.ts               # Tree layout
    │       ├── circular.ts           # Circular layout
    │       └── forceDirected.ts      # Force-directed layout
    │
    └── VGroup/                       # Vector object grouping
        ├── VGroup.ts                 # Group container
        └── layout.ts                 # Layout algorithms for groups
```

## Key Concepts

- **Mobjects**: Mathematical objects (shapes, text, graphs) that can be animated
- **Animations**: Define how mobjects change over time
- **Scene**: Container for mobjects and the canvas they're rendered to
- **Renderer**: Converts scenes to output (PNG, video, sprite sheets)
- **Fluent API**: Builder pattern for constructing animations programmatically
