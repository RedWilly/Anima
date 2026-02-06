# Keyframe Animations

`KeyframeAnimation` and `KeyframeTrack` provide fine-grained control over property animation using keyframes. Use them when fluent or basic Pro API animations are not precise enough.

## KeyframeTrack

A `KeyframeTrack` manages a sequence of keyframes for a single property. Keyframe times are **normalized** (0–1 range, where 0 = animation start, 1 = animation end).

**Import from `'anima'`:**

```ts
import { KeyframeAnimation, KeyframeTrack } from 'anima';
```

```ts
const track = new KeyframeTrack();  // defaults to number interpolation

track
  .addKeyframe(0, 0)                  // at progress 0% (start): value = 0
  .addKeyframe(0.3, 5)                // at progress 30%: value = 5
  .addKeyframe(0.7, 2, easeOutBack)   // at progress 70%: value = 2, with easing into this keyframe
  .addKeyframe(1, 10);                // at progress 100% (end): value = 10
```

### KeyframeTrack Methods

```ts
track.addKeyframe(time, value, easing?)  // time in [0, 1]
track.removeKeyframe(time)                // returns boolean
track.getKeyframe(time)                   // Keyframe | undefined
track.getKeyframes()                      // all keyframes sorted by time
track.getValueAt(time)                    // interpolated value at normalized time
track.getKeyframeCount()                  // number of keyframes
```

Between keyframes, values are linearly interpolated (unless a custom interpolator is provided to the constructor). Each keyframe can have its own easing that applies to the segment **leading to** that keyframe.

### Custom Interpolator

For non-numeric values, pass an interpolator function:

```ts
const colorTrack = new KeyframeTrack<Color>((a, b, t) => a.lerp(b, t));
```

## KeyframeAnimation

Combines multiple `KeyframeTrack`s to animate different properties of a target Mobject simultaneously.

```ts
const kfAnim = new KeyframeAnimation(circle); // target must already be in scene

// Track for X position: starts at 0, goes to 3 at halfway, ends at -1
const xTrack = new KeyframeTrack()
  .addKeyframe(0, 0)       // x = 0 at start
  .addKeyframe(0.5, 3)     // x = 3 at 50%
  .addKeyframe(1, -1);     // x = -1 at end

// Track for Y position: starts at 0, peaks at 2, returns to 0
const yTrack = new KeyframeTrack()
  .addKeyframe(0, 0)       // y = 0 at start
  .addKeyframe(0.5, 2)     // y = 2 at 50%
  .addKeyframe(1, 0);      // y = 0 at end

kfAnim
  .addTrack('x', xTrack, (target, value) => {
    target.pos(value, target.position.y);   // setter: update x, keep current y
  })
  .addTrack('y', yTrack, (target, value) => {
    target.pos(target.position.x, value);   // setter: keep current x, update y
  })
  .duration(3);  // entire keyframe animation plays over 3 seconds

this.play(kfAnim);
```

### addTrack

```ts
kfAnim.addTrack(name, track, setter)
```

- `name` — string identifier for the track
- `track` — a `KeyframeTrack` instance
- `setter` — function `(target, value) => void` called each frame to apply the interpolated value

### Querying Tracks

```ts
kfAnim.getTrack('x')       // KeyframeTrack | undefined
kfAnim.getTrackNames()     // string[]
```

### Lifecycle

`KeyframeAnimation` is a **transformative** animation — the target must already be in the scene.

## Use Cases for Long Videos

- **Complex motion paths**: Define waypoints with keyframes instead of chaining many `moveTo` calls.
- **Coordinated multi-property animation**: Animate position, scale, and rotation on independent curves.
- **Precise timing control**: Place keyframes at exact normalized times for frame-accurate choreography.
