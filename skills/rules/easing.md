# Easing Functions

Easing functions control the acceleration curve of animations. **Import them from `'anima'`:**

```ts
import { easeInOutQuad, easeOutBack, smooth, linear, thereAndBack } from 'anima';
```

The **default easing** is `smooth` (Manim-style cubic smoothstep: 3t² − 2t³).

## Usage

```ts
import { easeInOutQuad, smooth } from 'anima';

circle.fadeIn().ease(easeInOutQuad);
new MoveTo(rect, 2, 0).duration(1).ease(smooth);
```

## Standard Easings

Each comes in three variants: `easeIn` (slow start), `easeOut` (slow end), `easeInOut` (slow both ends).

| Family | In | Out | InOut |
|---|---|---|---|
| **Linear** | `linear` | — | — |
| **Quadratic** | `easeInQuad` | `easeOutQuad` | `easeInOutQuad` |
| **Cubic** | `easeInCubic` | `easeOutCubic` | `easeInOutCubic` |
| **Quartic** | `easeInQuart` | `easeOutQuart` | `easeInOutQuart` |
| **Quintic** | `easeInQuint` | `easeOutQuint` | `easeInOutQuint` |
| **Sine** | `easeInSine` | `easeOutSine` | `easeInOutSine` |
| **Exponential** | `easeInExpo` | `easeOutExpo` | `easeInOutExpo` |
| **Circular** | `easeInCirc` | `easeOutCirc` | `easeInOutCirc` |
| **Back** (overshoot) | `easeInBack` | `easeOutBack` | `easeInOutBack` |
| **Elastic** (spring) | `easeInElastic` | `easeOutElastic` | `easeInOutElastic` |

## Bounce Easings

| Name | Description |
|---|---|
| `easeInBounce` | Bounces before settling |
| `easeOutBounce` | Bounces at the end |
| `easeInOutBounce` | Bounces at both ends |

## Manim-Style Rate Functions

These replicate Manim's animation rate functions:

| Name | Description |
|---|---|
| `smooth` | **Default.** Cubic smoothstep (3t² − 2t³). |
| `doubleSmooth` | Applies `smooth` twice for extra-gradual transitions. |
| `rushInto` | Starts fast, decelerates at end. |
| `rushFrom` | Slow start, accelerates. |
| `slowInto` | Normal start, slows into end. |
| `thereAndBack` | Goes 0 → 1 → 0. Great for temporary effects. |
| `thereAndBackWithPause(pauseRatio?)` | 0 → 1 → pause → 0. Factory function, default pauseRatio: 1/3. |
| `runningStart(pullFactor?)` | Overshoots slightly then settles. Factory function, default: 0.2. |
| `wiggle` | Oscillates back and forth (wobble effect). |
| `notQuiteThere(proportion?)` | Approaches but doesn't quite reach 1. Factory function, default: 0.7. |
| `lingering(proportion?)` | Reaches destination early and stays. Factory function, default: 0.75. |
| `exponentialDecay(halfLife?)` | Exponential approach to 1. Factory function, default: 0.1. |

Factory functions return an easing function:

```ts
import { thereAndBackWithPause, exponentialDecay } from 'anima';

circle.moveTo(2, 0).ease(thereAndBackWithPause(0.4));
circle.scaleTo(1.5).ease(exponentialDecay(0.2));
```

## Choosing Easings

- **General motion**: `smooth` (default) or `easeInOutCubic`
- **Entrances**: `easeOutBack` (playful) or `easeOutCubic` (clean)
- **Exits**: `easeInCubic` or `easeInQuad`
- **Impact/attention**: `easeOutElastic`, `easeOutBounce`
- **Temporary flash**: `thereAndBack`
- **Camera moves**: `easeInOutQuad` or `smooth`
