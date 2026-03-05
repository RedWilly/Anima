# Source Code Structure

This file is a physical map of the current src layout.
Regenerate when files are added, moved, or removed.

## src files

```text
src
├─ app
│  └─ cli
│     ├─ commands
│     │  ├─ export-frame.ts
│     │  ├─ index.ts
│     │  ├─ list-scenes.ts
│     │  └─ render.ts
│     ├─ index.ts
│     └─ scene-loader.ts
│
├─ core
│  ├─ animations
│  │  ├─ camera
│  │  │  ├─ Follow.ts
│  │  │  ├─ index.ts
│  │  │  └─ Shake.ts
│  │  ├─ composition
│  │  │  ├─ index.ts
│  │  │  ├─ Parallel.ts
│  │  │  └─ Sequence.ts
│  │  ├─ draw
│  │  │  ├─ Draw.ts
│  │  │  ├─ index.ts
│  │  │  ├─ partialPath.ts
│  │  │  ├─ Unwrite.ts
│  │  │  └─ Write.ts
│  │  ├─ easing
│  │  │  ├─ bounce.ts
│  │  │  ├─ index.ts
│  │  │  ├─ manim.ts
│  │  │  ├─ registry.ts
│  │  │  ├─ standard.ts
│  │  │  └─ types.ts
│  │  ├─ fade
│  │  │  ├─ FadeIn.ts
│  │  │  ├─ FadeOut.ts
│  │  │  └─ index.ts
│  │  ├─ keyframes
│  │  │  ├─ index.ts
│  │  │  ├─ KeyframeAnimation.ts
│  │  │  ├─ KeyframeTrack.ts
│  │  │  └─ types.ts
│  │  ├─ morph
│  │  │  ├─ index.ts
│  │  │  └─ MorphTo.ts
│  │  ├─ transform
│  │  │  ├─ index.ts
│  │  │  ├─ MoveTo.ts
│  │  │  ├─ Rotate.ts
│  │  │  └─ Scale.ts
│  │  ├─ Animation.ts
│  │  ├─ fluent.ts
│  │  ├─ index.ts
│  │  ├─ introspection.ts
│  │  ├─ LifecycleAnimations.ts
│  │  ├─ mobjectApi.ts
│  │  └─ types.ts
│  │
│  ├─ cache
│  │  ├─ Hashable.ts
│  │  ├─ index.ts
│  │  ├─ Segment.ts
│  │  └─ SegmentCache.ts
│  │
│  ├─ camera
│  │  ├─ Camera.ts
│  │  ├─ CameraFrame.ts
│  │  ├─ index.ts
│  │  └─ types.ts
│  │
│  ├─ errors
│  │  ├─ AnimationErrors.ts
│  │  └─ index.ts
│  │
│  ├─ font
│  │  └─ ComicSansMS3.ttf
│  │
│  ├─ math
│  │  ├─ bezier
│  │  │  ├─ BezierPath.ts
│  │  │  ├─ evaluators.ts
│  │  │  ├─ index.ts
│  │  │  ├─ length.ts
│  │  │  ├─ morphing.ts
│  │  │  ├─ sampling.ts
│  │  │  ├─ split.ts
│  │  │  └─ types.ts
│  │  ├─ color
│  │  │  ├─ Color.ts
│  │  │  ├─ conversions.ts
│  │  │  └─ index.ts
│  │  ├─ matrix
│  │  │  ├─ index.ts
│  │  │  └─ Matrix4x4.ts
│  │  ├─ Vector2
│  │  │  ├─ index.ts
│  │  │  └─ Vector2.ts
│  │  ├─ Vector3
│  │  │  ├─ index.ts
│  │  │  └─ Vector3.ts
│  │  └─ index.ts
│  │
│  ├─ mobjects
│  │  ├─ geometry
│  │  │  ├─ Arc.ts
│  │  │  ├─ Arrow.ts
│  │  │  ├─ Circle.ts
│  │  │  ├─ index.ts
│  │  │  ├─ Line.ts
│  │  │  ├─ Polygon.ts
│  │  │  └─ Rectangle.ts
│  │  ├─ graph
│  │  │  ├─ layouts
│  │  │  │  ├─ circular.ts
│  │  │  │  ├─ forceDirected.ts
│  │  │  │  ├─ index.ts
│  │  │  │  └─ tree.ts
│  │  │  ├─ Graph.ts
│  │  │  ├─ GraphEdge.ts
│  │  │  ├─ GraphNode.ts
│  │  │  ├─ index.ts
│  │  │  └─ types.ts
│  │  ├─ text
│  │  │  ├─ Glyph.ts
│  │  │  ├─ index.ts
│  │  │  └─ Text.ts
│  │  ├─ VGroup
│  │  │  ├─ index.ts
│  │  │  ├─ layout.ts
│  │  │  └─ VGroup.ts
│  │  ├─ index.ts
│  │  ├─ Mobject.ts
│  │  └─ VMobject.ts
│  │
│  ├─ renderer
│  │  ├─ formats
│  │  │  ├─ concat.ts
│  │  │  ├─ index.ts
│  │  │  ├─ png.ts
│  │  │  ├─ sprite.ts
│  │  │  └─ video.ts
│  │  ├─ drawMobject.ts
│  │  ├─ FrameRenderer.ts
│  │  ├─ index.ts
│  │  ├─ ProgressReporter.ts
│  │  ├─ Renderer.ts
│  │  └─ types.ts
│  │
│  ├─ scene
│  │  ├─ index.ts
│  │  ├─ Scene.ts
│  │  └─ types.ts
│  │
│  └─ timeline
│     ├─ index.ts
│     ├─ Timeline.ts
│     └─ types.ts
│
└─ index.ts
```
