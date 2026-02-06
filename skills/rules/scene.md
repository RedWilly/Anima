# Scene

The `Scene` is the top-level container. It owns the camera, timeline, and all Mobjects.

## Coordinate System

Anima uses a **Manim-compatible world coordinate system**:

- Origin `(0, 0)` is at the **center** of the screen.
- **Y-axis points up** (positive y = upward on screen).
- The visible frame is approximately **14.2 × 8 world units** at 1920×1080 (frame height is always 8 units; width scales with aspect ratio).
- One world unit ≈ 135 pixels at 1080p.

This means `pos(3, 2)` places an object 3 units right and 2 units above center.

## Creating a Scene

Always extend `Scene` and build in the constructor:

```ts
import { Scene, Circle, Color } from 'anima';

export class MyScene extends Scene {
  constructor() {
    super({
      width: 1920,       // pixels (default 1920)
      height: 1080,      // pixels (default 1080)
      frameRate: 60,      // fps (default 60)
      backgroundColor: Color.BLACK // default BLACK
    });

    // Build your scene here
  }
}
```

All config fields are optional and have sensible defaults.

## Adding and Removing Mobjects

```ts
this.add(circle, rect);    // Immediately visible (sets opacity to 1)
this.remove(circle);       // Removes from scene
this.has(circle);          // Returns boolean
this.getMobjects();        // Returns all mobjects in the scene
```

- `add()` makes objects **immediately visible** without animation.
- Use intro animations (`fadeIn`, `write`, `draw`) when you want animated entry.
- Objects added via intro animations are **auto-registered** — you do not need to call `add()` first.

## Playing Animations

`this.play(...)` schedules animations at the current playhead time, then advances the playhead past them.

```ts
// All items passed to a single play() call run in PARALLEL
this.play(
  circle.fadeIn(1),   // fade in circle over 1s
  rect.fadeIn(1)      // fade in rect over 1s (runs at the same time)
);

// Successive play() calls run SEQUENTIALLY
this.play(circle.moveTo(2, 0, 1));  // move to (x=2, y=0) over 1s — starts after the fadeIns finish
```

You can pass Mobjects with queued fluent chains, explicit Animation objects, or mix both:

```ts
import { FadeIn, Rotate, MoveTo, Parallel } from 'anima'; // Pro API must be imported

circle.fadeIn(0.5).moveTo(1, 0, 1);  // queue: fadeIn 0.5s, then move to (1, 0) over 1s

this.play(
  circle,                              // fluent chain → runs as Sequence
  new FadeIn(rect).duration(0.5),      // Pro API → fade in rect over 0.5s
  new Parallel([                       // explicit composition → both run at once:
    new Rotate(rect, Math.PI).duration(1),   // rotate 180° over 1s
    new MoveTo(rect, -1, 0).duration(1)      // move to (-1, 0) over 1s
  ])
);
```

## Waiting

```ts
this.wait(0.5);  // Insert a 0.5-second gap before the next play()
```

## Scene Management Rules

| Animation type | Examples | Scene requirement |
|---|---|---|
| **Introductory** | `FadeIn`, `Write`, `Draw`, `fadeIn()`, `write()`, `draw()` | Auto-registers target. No need to `add()` first. |
| **Transformative** | `MoveTo`, `Rotate`, `Scale`, `MorphTo`, `moveTo()`, `rotate()`, `scaleTo()` | Target **must** already be in the scene (via `add()` or a prior intro animation). |
| **Exit** | `FadeOut`, `Unwrite`, `fadeOut()`, `unwrite()` | Target **must** already be in the scene. |

If a transformative or exit animation targets an object not in the scene, `play()` throws `AnimationTargetNotInSceneError`.

## Accessing Internals

```ts
this.camera        // Camera object
this.frame         // CameraFrame (shortcut for this.camera.frame)
this.getTimeline() // Timeline for advanced scheduling
this.getCurrentTime()   // Current playhead position (seconds)
this.getTotalDuration() // Total duration of all scheduled animations
```
