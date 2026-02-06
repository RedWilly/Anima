# Styling: Colors, Stroke, and Fill

## Color

`Color` is an immutable RGBA color class. RGB values are 0–255, alpha is 0–1.

### Creating Colors

```ts
import { Color } from 'anima';

// From RGBA values
new Color(255, 100, 50)        // RGB, alpha defaults to 1
new Color(255, 100, 50, 0.5)   // RGBA

// From hex string (#RGB, #RRGGBB, #RRGGBBAA)
Color.fromHex('#FF6B6B')
Color.fromHex('#4ECDC4')

// From HSL (hue 0–360, saturation 0–1, lightness 0–1)
Color.fromHSL(210, 0.8, 0.5)
Color.fromHSL(210, 0.8, 0.5, 0.7)  // with alpha
```

### Color Presets

```ts
Color.WHITE        // (255, 255, 255)
Color.BLACK        // (0, 0, 0)
Color.RED          // (255, 0, 0)
Color.GREEN        // (0, 255, 0)
Color.BLUE         // (0, 0, 255)
Color.YELLOW       // (255, 255, 0)
Color.TRANSPARENT  // (0, 0, 0, 0)
```

### Color Methods

```ts
color.toHex()              // → '#rrggbb' or '#rrggbbaa'
color.toRGBA()             // → 'rgba(r, g, b, a)'
color.lerp(otherColor, t)  // Interpolate between two colors (t: 0–1)
```

## Stroke

```ts
vmobject.stroke(color, width?)  // default width: 2
```

- Default VMobject appearance: white stroke, width 2.
- Call `.stroke()` explicitly to keep stroke when `.fill()` is also used.

## Fill

```ts
vmobject.fill(color, opacity?)  // opacity defaults to the color's alpha value
```

- By default, VMobjects have **no fill** (fillOpacity = 0).
- When `.fill()` is called **without** a prior `.stroke()` call, the default stroke is **disabled** (strokeWidth set to 0).
- When `.fill()` is called **after** `.stroke()`, both stroke and fill render.

### Typical Patterns

```ts
// Stroke only (default)
new Circle(1)                                // white stroke, width 2, no fill

// Fill only
new Circle(1).fill(Color.BLUE)               // blue fill, no stroke

// Both stroke and fill
new Circle(1).stroke(Color.WHITE, 2).fill(Color.BLUE, 0.6)

// Semi-transparent fill
new Circle(1).fill(Color.RED, 0.3)
```

## VGroup Styling

When `.stroke()` or `.fill()` is called on a `VGroup`, it cascades to all children:

```ts
group.stroke(Color.WHITE, 2);  // all children get white stroke
group.fill(Color.RED, 0.8);   // all children get red fill
```
