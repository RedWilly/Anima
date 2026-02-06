# Geometry Primitives

All geometry classes extend `VMobject`. They support `.stroke()`, `.fill()`, `.pos()`, and all fluent animation methods.

**Import** any shape directly from `'anima'`:

```ts
import { Circle, Rectangle, Line, Arrow, Arc, Polygon, Point } from 'anima';
```

## Circle

```ts
import { Circle } from 'anima';

new Circle(radius?)   // default radius: 1
```

A full closed circle centered at its local origin.

```ts
const c = new Circle(0.5).fill(Color.BLUE).pos(2, 0);
```

## Rectangle

```ts
import { Rectangle } from 'anima';

new Rectangle(width?, height?)   // defaults: 2 × 1
```

Centered at its local origin.

```ts
const r = new Rectangle(3, 2).stroke(Color.RED, 3).fill(Color.BLUE, 0.5);
```

## Line

```ts
import { Line } from 'anima';

new Line(x1?, y1?, x2?, y2?)   // defaults: (0,0) → (1,0)
```

A straight line between two points.

```ts
const l = new Line(-2, 0, 2, 0).stroke(Color.WHITE, 2);
```

## Arrow

```ts
import { Arrow } from 'anima';

new Arrow(x1?, y1?, x2?, y2?, tipLength?, tipAngle?)
// defaults: (0,0) → (1,0), tip 0.25 units, 30° angle
```

A `Line` with a filled arrowhead at the end point. The tip is automatically filled.

```ts
const a = new Arrow(0, 0, 3, 0).stroke(Color.YELLOW, 2);
```

## Arc

```ts
import { Arc } from 'anima';

new Arc(radius?, startAngle?, endAngle?)
// defaults: radius 1, 0 → π/2 (quarter circle)
```

An arc segment. Angles are in **radians**.

```ts
const arc = new Arc(2, 0, Math.PI).stroke(Color.GREEN, 3);
```

## Polygon

```ts
import { Polygon, Vector2 } from 'anima';

new Polygon(vertices: Vector2[])
```

A closed polygon from an array of `Vector2` points.

```ts
const triangle = new Polygon([
  new Vector2(0, 1),
  new Vector2(-1, -0.5),
  new Vector2(1, -0.5)
]).fill(Color.RED);
```

## Point

```ts
import { Point, Vector2 } from 'anima';

new Point(location?: Vector2)   // default: origin (0,0)
```

A tiny filled white circle (radius 0.05). Useful as a marker.

```ts
const p = new Point(new Vector2(1, 1));
```

## Common Patterns

Setup with chaining:

```ts
const circle = new Circle(1)
  .stroke(Color.WHITE, 2)
  .fill(Color.BLUE, 0.6)
  .pos(-3, 0);
```

All shapes start with **opacity 0** until added to the scene via `this.add()` or an intro animation.
