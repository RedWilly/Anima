# Animations

Anima provides two APIs for animations: **Fluent** (chaining on mobjects) and **Pro** (explicit Animation objects). They can be mixed freely.

## Fluent API (Chaining)

Fluent calls queue animations on a mobject. When passed to `this.play()`, the queue becomes a `Sequence`.

```ts
circle
  .fadeIn(0.8)                    // fade in over 0.8s
  .moveTo(2, 0, 1)               // move to (x=2, y=0) over 1s
  .rotate(Math.PI / 2, 0.6)      // rotate 90° over 0.6s
  .fadeOut(0.5);                  // fade out over 0.5s

this.play(circle);  // Runs as: fadeIn → moveTo → rotate → fadeOut (sequential)
```

### Fluent Methods

All duration arguments are in **seconds** and optional (default: 1s).

**Argument order matters:** For `moveTo(x, y, duration?)`, the first two args are the target position, and the third is the duration. For example, `moveTo(2, 0, 1)` means "move to position (x=2, y=0) over 1 second." For single-parameter methods like `fadeIn(duration?)`, the only argument is the duration.

| Method | Signature | Lifecycle | Description |
|---|---|---|---|
| `fadeIn` | `fadeIn(duration?)` | introductory | Animate opacity 0 → 1. `fadeIn(0.5)` = fade in over 0.5s. |
| `fadeOut` | `fadeOut(duration?)` | exit | Animate opacity → 0. `fadeOut(1)` = fade out over 1s. |
| `moveTo` | `moveTo(x, y, duration?)` | transformative | Move to world position. `moveTo(3, -1, 2)` = move to (3, -1) over 2s. |
| `rotate` | `rotate(angle, duration?)` | transformative | Rotate by angle in radians. `rotate(Math.PI, 1)` = rotate 180° over 1s. |
| `scaleTo` | `scaleTo(factor, duration?)` | transformative | Uniform scale. `scaleTo(2, 0.5)` = scale to 2× over 0.5s. |
| `scaleToXY` | `scaleToXY(fx, fy, duration?)` | transformative | Non-uniform scale. `scaleToXY(2, 0.5, 1)` = stretch x by 2, shrink y by 0.5, over 1s. |
| `write` | `write(duration?)` | introductory | Draw stroke progressively (VMobject only). |
| `draw` | `draw(duration?)` | introductory | Draw stroke then fade in fill (VMobject only). |
| `unwrite` | `unwrite(duration?)` | exit | Erase stroke progressively (VMobject only). |
| `restore` | `restore(duration?)` | transformative | Animate back to last `saveState()`. |

### Modifiers

Apply to the **last** queued animation:

```ts
circle
  .fadeIn().duration(1.5).ease(easeInOutQuad)  // fadeIn with overridden duration 1.5s and easing
  .moveTo(1, 0).duration(0.5);                 // move to (x=1, y=0) with overridden duration 0.5s
this.play(circle);
```

| Modifier | Description |
|---|---|
| `.duration(seconds)` | Override duration of last queued animation |
| `.ease(easingFn)` | Override easing of last queued animation |

### Parallel Within a Chain

Use `.parallel(...)` to run multiple animations simultaneously within a fluent chain:

```ts
circle
  .fadeIn(1)                         // 1. fade in over 1s
  .parallel(
    circle.moveTo(2, 0, 1),          // move to (x=2, y=0) over 1s
    circle.rotate(Math.PI, 1)        // rotate 180° over 1s
  )                                  // 2. moveTo + rotate run simultaneously
  .fadeOut(0.5);                     // 3. fade out over 0.5s

this.play(circle);
// Runs as: fadeIn → (moveTo + rotate in parallel) → fadeOut
```

`parallel(...)` accepts mobjects (pops their last queued animation) or explicit Animation objects.

## Pro API (Explicit Animation Objects)

Use explicit constructors for full control, reusability, or complex composition.

**You must import Pro API classes explicitly:**

```ts
import { FadeIn, FadeOut, MoveTo, Rotate, Scale, MorphTo, Write, Unwrite, Draw, Sequence, Parallel } from 'anima';
```

### Constructors

| Class | Constructor | Lifecycle |
|---|---|---|
| `FadeIn` | `new FadeIn(target)` | introductory |
| `FadeOut` | `new FadeOut(target)` | exit |
| `MoveTo` | `new MoveTo(target, x, y)` | transformative |
| `Rotate` | `new Rotate(target, angleRadians)` | transformative |
| `Scale` | `new Scale(target, factor)` or `new Scale(target, fx, fy)` | transformative |
| `MorphTo` | `new MorphTo(source, targetShape)` | transformative |
| `Write` | `new Write(vmobject)` | introductory |
| `Unwrite` | `new Unwrite(vmobject)` | exit |
| `Draw` | `new Draw(vmobject)` | introductory |

### Configuration Methods

All Animation objects support these chainable methods:

```ts
new FadeIn(circle).duration(1.5)     // Set duration to 1.5 seconds (must be > 0)
new FadeIn(circle).ease(easeOutBack) // Set easing function (import from 'anima')
new FadeIn(circle).delay(0.5)        // Wait 0.5s before this animation starts
```

Chain them together:

```ts
new MoveTo(circle, 2, 0)  // move to (x=2, y=0)
  .duration(1)             // over 1 second
  .ease(easeInOutQuad)     // with quadratic easing
  .delay(0.2)              // after a 0.2s delay
```

### MorphTo

Morphs a VMobject's shape into another VMobject's shape. The target is used as a **shape template only** and is NOT added to the scene.

```ts
const circle = new Circle(1);
const square = new Rectangle(2, 2);

this.add(circle);
this.play(new MorphTo(circle, square).duration(2));
// circle's paths now look like a square
```

## Composition: Sequence and Parallel

### Sequence

Runs animations one after another:

```ts
import { Sequence } from 'anima';

const seq = new Sequence([
  new MoveTo(rect, 0, -3).duration(1),    // 1. move to (0, -3) over 1s
  new Rotate(rect, Math.PI).duration(0.5), // 2. then rotate 180° over 0.5s
  new MoveTo(rect, 0, 0).duration(1)       // 3. then move back to (0, 0) over 1s
]);

this.play(seq);
```

### Parallel

Runs animations simultaneously:

```ts
import { Parallel } from 'anima';

const par = new Parallel([
  new Rotate(circle, Math.PI).duration(1),   // rotate 180° over 1s
  new MoveTo(circle, 2, 0).duration(1)       // move to (2, 0) over 1s
]);
// Both run at the same time

this.play(par);
```

### Nested Composition

Combine `Sequence` and `Parallel` for complex choreography:

```ts
const complex = new Sequence([
  new FadeIn(rect).duration(0.5),              // 1. fade in over 0.5s
  new Parallel([                               // 2. then simultaneously:
    new Rotate(rect, Math.PI).duration(1),     //    - rotate 180° over 1s
    new Scale(rect, 0.5).duration(1)           //    - shrink to half size over 1s
  ]),
  new MoveTo(rect, 0, 0).duration(0.5),        // 3. then move to origin over 0.5s
  new Scale(rect, 1).duration(0.3).ease(easeOutBack) // 4. then scale back to full size
]);

this.play(complex);
```

## Hybrid: Fluent + Pro in the Same play()

```ts
import { FadeIn, Rotate, MoveTo, Parallel } from 'anima';

circle.fadeIn(0.5).moveTo(0, 1, 1);  // queue: fadeIn 0.5s, then move to (0, 1) over 1s

this.play(
  circle,                                  // fluent chain → runs as Sequence
  new FadeIn(rect).duration(0.5),          // Pro API → fade in rect over 0.5s
  new Parallel([                           // explicit composition → both run at once:
    new Rotate(rect, Math.PI / 2).duration(1),  // rotate 90° over 1s
    new MoveTo(rect, -1, 0).duration(1)         // move to (-1, 0) over 1s
  ])
);
// All three items in play() start at the same time (parallel)
```
