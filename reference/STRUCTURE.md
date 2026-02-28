# Source Code Structure

This file is a physical map of the repository layout.
It includes directories and files.

## src tree

```text
C:ANIMA\SRC
|   index.ts
|   
+---app
|   \---cli
|       |   index.ts
|       |   scene-loader.ts
|       |   
|       \---commands
|               export-frame.ts
|               list-scenes.ts
|               preview.ts
|               render.ts
|               
+---browser
+---core
|   +---animations
|   |   |   Animation.ts
|   |   |   fluent.ts
|   |   |   index.ts
|   |   |   introspection.ts
|   |   |   mobjectApi.ts
|   |   |   types.ts
|   |   |   
|   |   +---camera
|   |   |       Follow.ts
|   |   |       index.ts
|   |   |       Shake.ts
|   |   |       
|   |   +---categories
|   |   |       ExitAnimation.ts
|   |   |       index.ts
|   |   |       IntroductoryAnimation.ts
|   |   |       TransformativeAnimation.ts
|   |   |       
|   |   +---composition
|   |   |       index.ts
|   |   |       Parallel.ts
|   |   |       Sequence.ts
|   |   |       
|   |   +---draw
|   |   |       Draw.ts
|   |   |       index.ts
|   |   |       partialPath.ts
|   |   |       Unwrite.ts
|   |   |       Write.ts
|   |   |       
|   |   +---easing
|   |   |       bounce.ts
|   |   |       index.ts
|   |   |       manim.ts
|   |   |       registry.ts
|   |   |       standard.ts
|   |   |       types.ts
|   |   |       
|   |   +---fade
|   |   |       FadeIn.ts
|   |   |       FadeOut.ts
|   |   |       index.ts
|   |   |       
|   |   +---keyframes
|   |   |       index.ts
|   |   |       KeyframeAnimation.ts
|   |   |       KeyframeTrack.ts
|   |   |       types.ts
|   |   |       
|   |   +---morph
|   |   |       index.ts
|   |   |       MorphTo.ts
|   |   |       
|   |   \---transform
|   |           index.ts
|   |           MoveTo.ts
|   |           Rotate.ts
|   |           Scale.ts
|   |           
|   +---cache
|   |       Hashable.ts
|   |       index.ts
|   |       Segment.ts
|   |       SegmentCache.ts
|   |       
|   +---camera
|   |       Camera.ts
|   |       CameraFrame.ts
|   |       index.ts
|   |       types.ts
|   |       
|   +---errors
|   |       AnimationErrors.ts
|   |       index.ts
|   |       
|   +---font
|   |       ComicSansMS3.ttf
|   |       
|   +---math
|   |   |   index.ts
|   |   |   
|   |   +---bezier
|   |   |       BezierPath.ts
|   |   |       evaluators.ts
|   |   |       index.ts
|   |   |       length.ts
|   |   |       morphing.ts
|   |   |       sampling.ts
|   |   |       split.ts
|   |   |       types.ts
|   |   |       
|   |   +---color
|   |   |       Color.ts
|   |   |       conversions.ts
|   |   |       index.ts
|   |   |       
|   |   +---matrix
|   |   |       factories.ts
|   |   |       index.ts
|   |   |       Matrix3x3.ts
|   |   |       
|   |   \---Vector2
|   |           index.ts
|   |           Vector2.ts
|   |           
|   +---mobjects
|   |   |   index.ts
|   |   |   Mobject.ts
|   |   |   VMobject.ts
|   |   |   
|   |   +---geometry
|   |   |       Arc.ts
|   |   |       Arrow.ts
|   |   |       Circle.ts
|   |   |       index.ts
|   |   |       Line.ts
|   |   |       Polygon.ts
|   |   |       Rectangle.ts
|   |   |       
|   |   +---graph
|   |   |   |   Graph.ts
|   |   |   |   GraphEdge.ts
|   |   |   |   GraphNode.ts
|   |   |   |   index.ts
|   |   |   |   types.ts
|   |   |   |   
|   |   |   \---layouts
|   |   |           circular.ts
|   |   |           forceDirected.ts
|   |   |           index.ts
|   |   |           tree.ts
|   |   |           
|   |   +---text
|   |   |       Glyph.ts
|   |   |       index.ts
|   |   |       Text.ts
|   |   |       
|   |   \---VGroup
|   |           index.ts
|   |           layout.ts
|   |           VGroup.ts
|   |           
|   +---renderer
|   |   |   drawMobject.ts
|   |   |   FrameRenderer.ts
|   |   |   index.ts
|   |   |   ProgressReporter.ts
|   |   |   Renderer.ts
|   |   |   types.ts
|   |   |   
|   |   \---formats
|   |           concat.ts
|   |           index.ts
|   |           png.ts
|   |           sprite.ts
|   |           video.ts
|   |           
|   +---scene
|   |       index.ts
|   |       Scene.ts
|   |       types.ts
|   |       
|   \---timeline
|           index.ts
|           Timeline.ts
|           types.ts
|           
+---fonts
\---server
```