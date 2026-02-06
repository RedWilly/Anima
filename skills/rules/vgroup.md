# VGroup

`VGroup` collects multiple VMobjects and applies transforms as a group. Useful for laying out related shapes, text elements, or building composite objects.

## Creating a VGroup

```ts
import { VGroup, Circle, Rectangle, Color } from 'anima';

const group = new VGroup(
  new Circle(0.5).fill(Color.RED, 1),
  new Rectangle(1, 0.5).stroke(Color.WHITE, 2)
);
```

## Adding / Removing Children

```ts
group.add(circle, rect);    // Add children (sets parent reference)
group.remove(circle);       // Remove a child
group.clear();               // Remove all children
group.get(0);                // Get child by index
group.getChildren();         // Get all children (copy)
group.length;                // Number of children
```

## Layout Methods

### arrange

Arrange children in a line along a direction:

```ts
group.arrange('RIGHT', 0.3);   // Horizontal, 0.3 units gap
group.arrange('LEFT', 0.5);
group.arrange('DOWN', 0.4);    // Vertical downward
group.arrange('UP', 0.2);
```

Signature: `arrange(direction?, buff?, shouldCenter?)`

- `direction`: `'RIGHT'` | `'LEFT'` | `'UP'` | `'DOWN'` (default: `'RIGHT'`)
- `buff`: gap between children in world units (default: `0.25`)
- `shouldCenter`: center the group after arranging (default: `true`)

### center

Center the group's bounding box at the origin:

```ts
group.center();
```

### toCorner

Position the group at a corner of the frame:

```ts
group.toCorner('TOP_LEFT', 0.5);     // 0.5 units margin from corner
group.toCorner('BOTTOM_RIGHT', 0.3);
```

Corners: `'TOP_LEFT'` | `'TOP_RIGHT'` | `'BOTTOM_LEFT'` | `'BOTTOM_RIGHT'`

`buff` (second argument) is the margin from the corner in world units (default: 0).

### alignTo

Align the group to a target VMobject's edge:

```ts
group.alignTo(otherShape, 'TOP');     // Align top edges
group.alignTo(otherShape, 'LEFT');    // Align left edges
```

Edges: `'TOP'` | `'BOTTOM'` | `'LEFT'` | `'RIGHT'`

## Cascading Styling

When called on a VGroup, these apply to all children:

```ts
group.stroke(Color.WHITE, 2);   // All children get this stroke
group.fill(Color.BLUE, 0.8);    // All children get this fill
group.show();                     // Show all children
group.hide();                     // Hide all children
group.setOpacity(0.5);           // Set opacity on all children
```

## Transforms

VGroup transforms (position, rotation, scale) apply to the group as a whole. Children inherit parent transforms via the scene graph — child matrices are NOT mutated.

```ts
group.pos(2, 0);           // Move entire group
group.setRotation(0.5);    // Rotate entire group
group.setScale(1.5, 1.5);  // Scale entire group
```

## Animating VGroups

VGroups support all fluent and Pro API animations:

```ts
group.fadeIn(1);
this.play(group);

this.play(new Rotate(group, Math.PI).duration(2));
this.play(group.moveTo(0, 2, 1));
```

## Common Pattern: Build, Arrange, Animate

```ts
const items = new VGroup(
  new Circle(0.3).fill(Color.RED),
  new Circle(0.3).fill(Color.GREEN),
  new Circle(0.3).fill(Color.BLUE)
).arrange('RIGHT', 0.5).center();

this.play(items.fadeIn(1));
this.play(items.moveTo(0, 2, 1));
```
