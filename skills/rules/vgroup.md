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

## Animating Individual Children

When a VGroup is introduced via an introductory animation (Draw, FadeIn, etc.), **all children are automatically registered with the scene**. This allows you to animate children independently after the group animation.

### Way 1: Keep Reference (Recommended)

Store each child in a variable before adding to the group:

```ts
const circle = new Circle(0.4).fill(Color.RED);
const rect = new Rectangle(2, 1).fill(Color.BLUE);
const text = new Text("Hi", 'font.ttf').fill(Color.WHITE);

const group = new VGroup(circle, rect, text).draw(2);
this.play(group);           // Draws all shapes together

// Animate each child independently:
circle.moveTo(0, 2, 1);     // Move only the circle
this.play(circle);

rect.rotate(Math.PI, 1);    // Rotate only the rectangle
this.play(rect);

text.fadeOut(0.5);          // Fade out only the text
this.play(text);
```

### Way 2: Access by Index

Use `get(index)` when you don't have references:

```ts
const group = new VGroup(
  new Circle(0.4).fill(Color.RED),    // index 0
  new Rectangle(2, 1).fill(Color.BLUE), // index 1
  new Text("Hi", 'font.ttf')           // index 2
).draw(2);

this.play(group);

group.get(0)!.moveTo(0, 2, 1);   // Animate circle (index 0)
this.play(group.get(0)!);

group.get(2)!.fadeOut(1);        // Fade out text (index 2)
this.play(group.get(2)!);
```

### Way 3: Remove and Animate

Remove a child from the group and animate it separately:

```ts
const circle = new Circle(0.4).fill(Color.RED);
const group = new VGroup(circle, rect).draw(2);
this.play(group);

group.remove(circle);          // Remove from group
circle.moveTo(0, 2, 1);        // Still works - circle is registered with scene
this.play(circle);
```

### Way 4: Iterate Over Children

Animate all children with a loop:

```ts
const group = new VGroup(
  new Circle(0.3).fill(Color.RED),
  new Circle(0.3).fill(Color.GREEN),
  new Circle(0.3).fill(Color.BLUE)
).draw(2);

this.play(group);

// Move each child to a different position
const positions = [[-2, 0], [0, 0], [2, 0]];
group.getChildren().forEach((child, i) => {
  child.moveTo(positions[i]![0], positions[i]![1], 1);
});
this.play(...group.getChildren());  // Play all in parallel
```

### Way 5: Nested VGroups

VGroups can contain other VGroups. All nested children are registered:

```ts
const innerGroup = new VGroup(
  new Circle(0.3).fill(Color.RED),
  new Circle(0.3).fill(Color.BLUE)
);

const outerGroup = new VGroup(
  innerGroup,
  new Rectangle(2, 1).fill(Color.GREEN)
).draw(2);

this.play(outerGroup);

// Access nested children:
innerGroup.get(0)!.moveTo(0, 2, 1);  // Animate circle inside inner group
this.play(innerGroup.get(0)!);
```

### Way 6: Mixed Pro API and Fluent API

Combine both styles:

```ts
const circle = new Circle(0.4).fill(Color.RED);
const group = new VGroup(circle, rect).draw(2);
this.play(group);

// Fluent API
circle.moveTo(0, 2, 1);
this.play(circle);

// Pro API
this.play(new Rotate(circle, Math.PI).duration(1));
this.play(new FadeOut(circle).duration(0.5));
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
