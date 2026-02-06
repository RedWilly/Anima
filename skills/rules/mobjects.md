# Mobjects

`Mobject` is the base class for all visual objects. `VMobject` extends it with vector paths and styling.

## Hierarchy

```
Mobject          — base: position, rotation, scale, opacity, fluent animation API
 └─ VMobject     — adds BezierPaths, stroke/fill styling, write/draw/unwrite
     ├─ VGroup   — collection of VMobjects with layout methods
     ├─ Arc      — arc segment
     ├─ Circle   — full circle (extends Arc)
     ├─ Polygon  — closed polygon
     ├─ Rectangle — rectangle (extends Polygon)
     ├─ Line     — straight line
     ├─ Arrow    — line with arrowhead tip
     ├─ Point    — tiny filled circle
     ├─ Text     — vectorized text (extends VGroup)
     ├─ Graph    — node/edge graph (extends VGroup)
     ├─ Glyph    — single text character
     ├─ GraphNode — single graph node (extends Circle)
     └─ GraphEdge — single graph edge
```

## Immediate State Setters

These apply **instantly** (no animation). Use them during scene setup.

```ts
mobject.pos(x, y)           // Set position in world coordinates
mobject.show()              // Set opacity to 1
mobject.hide()              // Set opacity to 0
mobject.setOpacity(0.5)     // Set opacity to any value (0–1)
mobject.setRotation(angle)  // Set rotation in radians
mobject.setScale(sx, sy)    // Set scale factors
mobject.applyMatrix(m)      // Apply a Matrix3x3 transformation
```

These all return `this` for chaining:

```ts
const circle = new Circle(1).pos(-2, 1).show();
```

## VMobject Styling

See [Styling](styling.md) for Color, stroke, and fill details.

```ts
vmobject.stroke(color, width?)   // Set stroke (default width: 2)
vmobject.fill(color, opacity?)   // Set fill (disables default stroke unless stroke() was called)
```

Default VMobject appearance: white stroke (width 2), no fill.

## State Save / Restore

Save a mobject's current position, scale, and rotation, then animate back to it later. Useful for "zoom in, explain, zoom back out" patterns in long videos.

```ts
circle.saveState();

// ... animate the circle elsewhere ...
this.play(circle.moveTo(5, 3, 1));
this.play(circle.scaleTo(2, 0.5));

// Animate back to saved state
this.play(circle.restore(1));  // duration in seconds
```

- `saveState()` pushes onto a stack (can save multiple states).
- `restore(duration?)` pops the last saved state and animates back.
- Restore creates a `Parallel` of `MoveTo`, `Scale`, and `Rotate` animations.

## Properties (read-only)

```ts
mobject.position   // Vector2 { x, y }
mobject.rotation   // number (radians)
mobject.scale      // Vector2 { x, y }
mobject.opacity    // number (0–1)
mobject.matrix     // local Matrix3x3
```
