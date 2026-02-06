# Camera

The camera controls what portion of the world is visible. It uses a `CameraFrame` (which is a `Mobject`) so all camera movements can be animated with the fluent API.

## Accessing the Camera

```ts
this.camera       // Camera object (instant methods)
this.frame        // CameraFrame (animated methods) — shortcut for this.camera.frame
```

## CameraFrame Fluent Animations

The `CameraFrame` supports all standard Mobject fluent methods (`moveTo`, `rotate`, `scaleTo`, etc.) plus camera-specific ones:

### zoomIn / zoomOut

```ts
this.play(this.frame.zoomIn(2).duration(1));   // zoom in 2×: objects appear 2× larger, over 1s
this.play(this.frame.zoomOut(3).duration(1));   // zoom out 3×: objects appear 3× smaller, over 1s
```

Factor must be positive. Internally, `zoomIn(f)` calls `scaleTo(1/f)` and `zoomOut(f)` calls `scaleTo(f)`.

### centerOn

Move the camera to center on a specific Mobject:

```ts
this.play(this.frame.centerOn(circle).duration(0.5));
```

### fitTo

Automatically frame one or more objects with optional margin:

```ts
// Single object
this.play(this.frame.fitTo(circle, 0.5).duration(1));

// Multiple objects
this.play(this.frame.fitTo([obj1, obj2, obj3], 1.0).duration(1.5));
```

Calculates bounding box of all targets and zooms/pans to show them all. Margin is in world units (default: 0.5). Will not zoom in beyond 1× scale.

### zoomToPoint

Pinch-to-zoom: zoom while keeping a specific world point fixed on screen:

```ts
// Zoom in 2× keeping point (2, 1) fixed
this.play(this.frame.zoomToPoint(0.5, { x: 2, y: 1 }).duration(1));

// Zoom out 2× keeping circle's position fixed
this.play(this.frame.zoomToPoint(2, circle.position).duration(1));
```

Returns a `Parallel` animation (move + scale combined). Factor < 1 zooms in, > 1 zooms out.

### Pan (moveTo)

```ts
this.play(this.frame.moveTo(5, 3, 1));  // Pan to world position (5, 3)
```

### Rotate

```ts
this.play(this.frame.rotate(Math.PI / 8).duration(0.6).ease(easeInOutQuad));
```

### Chaining Camera Animations

```ts
this.frame
  .zoomIn(2).duration(1).ease(easeInOutQuad)
  .centerOn(circle).duration(0.5);

this.play(this.frame);
// Runs as: zoomIn → centerOn (sequential)
```

## Camera Effects (Pro API)

### Shake

Screen shake effect for impacts, explosions, earthquakes. **Must import:**

```ts
import { Shake } from 'anima';

// Basic shake for 0.5 seconds
this.play(new Shake(this.frame).duration(0.5));

// Configured shake
this.play(new Shake(this.frame, {
  intensity: 0.5,    // max displacement in world units (default: 0.2)
  frequency: 20,     // oscillations per second (default: 10)
  decay: 2           // how fast shake fades (default: 1, 0 = constant shake)
}).duration(0.3));    // shake lasts 0.3 seconds
```

The shake automatically returns to the original position when complete.

### Follow

Camera follows a moving target over time. **Must import:**

```ts
import { Follow } from 'anima';

// Basic follow — camera snaps to target each frame for 5 seconds
this.play(new Follow(this.frame, movingCircle).duration(5));

// Smooth follow with damping (0 = instant snap, 0.9 = very laggy)
this.play(new Follow(this.frame, player, { damping: 0.8 }).duration(10));

// Follow with offset (camera stays 2 units ahead of target)
this.play(new Follow(this.frame, car, {
  offset: new Vector2(2, 0),  // offset in world units
  damping: 0.5
}).duration(10));
```

Unlike `centerOn` which captures position once, `Follow` reads the target position **every frame**.

## Camera Bounds

Limit how far the camera can pan (useful for large worlds):

```ts
this.frame.setBounds(minX, minY, maxX, maxY);  // Set pan limits
this.frame.clearBounds();                        // Remove limits
this.frame.hasBounds();                          // Check if bounds set
```

When bounds are set, `pos()` clamps the camera position so edges don't go outside bounds, accounting for frame size.

## Instant Camera Methods

For non-animated camera changes (useful during setup):

```ts
this.camera.zoomTo(2);                      // Instant zoom
this.camera.panTo(new Vector2(5, 3));       // Instant pan
this.camera.pan(new Vector2(1, 0));         // Instant relative pan
this.camera.rotateTo(Math.PI / 4);          // Instant rotation
this.camera.reset();                        // Reset to origin, zoom 1×, no rotation
```

## Coordinate Conversion

```ts
this.camera.worldToScreen(worldPos)   // Vector2 → pixel coordinates
this.camera.screenToWorld(screenPos)  // pixel coordinates → Vector2
this.camera.isInView(worldPos)        // true if position is visible
```

## Frame Dimensions

```ts
this.camera.frameWidth     // ~14.2 world units at 16:9
this.camera.frameHeight    // 8 world units (always)
this.camera.pixelWidth     // 1920 (or configured)
this.camera.pixelHeight    // 1080 (or configured)
```
