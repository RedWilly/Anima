# Text

`Text` creates a `VGroup` of vectorized glyphs from a string using a font file. Each character becomes a `Glyph` VMobject that can be individually animated.

## Creating Text

```ts
import { Text } from 'anima';

// Uses the built-in default font (ComicSansMS3.ttf)
const title = new Text('Hello World');

// With style options (still using default font)
const styled = new Text('Hello World', undefined, {
  fontSize: 1.5,
  color: Color.WHITE
});

// With a custom font
const custom = new Text('Hello World', 'assets/fonts/MyFont.ttf', {
  fontSize: 1.5,
  color: Color.WHITE
});
```

**Arguments:**

1. `text` — the string to render
2. `fontPath` — optional path to a `.ttf` font file (defaults to the built-in `ComicSansMS3.ttf`)
3. `options` — optional `Partial<TextStyle>`

## TextStyle

```ts
interface TextStyle {
  fontSize: number;  // default: 1
  color: Color;      // default: Color.WHITE
}
```

## Updating Style

```ts
title.setStyle({ color: Color.RED, fontSize: 2 });
title.getStyle();  // returns current TextStyle
```

## Accessing Individual Glyphs

```ts
title.getGlyph(0)   // first character as a Glyph VMobject
title.get(2)         // third child (VMobject)
title.length         // number of glyphs
```

## Animating Text

Since `Text` extends `VGroup`, it supports all fluent animations:

```ts
// Write text progressively (draws each glyph's stroke)
this.play(title.write(1.5));

// Fade in
this.play(title.fadeIn(1));

// Move, scale, rotate
this.play(title.moveTo(0, 2, 1));
this.play(title.scaleTo(0.5, 0.5));

// Fade out
this.play(title.fadeOut(1));
```

## Text is Auto-Centered

Text is automatically centered at the origin after construction. Use `.pos(x, y)` to reposition:

```ts
const subtitle = new Text('Subtitle', { fontSize: 0.8 })
  .pos(0, -2);  // below center
```
