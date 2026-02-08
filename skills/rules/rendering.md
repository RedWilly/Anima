# Rendering and CLI

## Programmatic Rendering

```ts
import { Renderer } from 'anima';

const renderer = new Renderer();
await renderer.render(scene, 'output.mp4', {
  format: 'mp4',
  quality: 'production'
});
```

### RenderConfig Options

```ts
interface RenderConfig {
  width?: number;         // pixels (default: scene width)
  height?: number;        // pixels (default: scene height)
  frameRate?: number;     // fps (default: scene frame rate)
  format?: RenderFormat;  // output format (default: 'sprite')
  quality?: RenderQuality;
  onProgress?: (progress) => void;
}
```

### Formats

| Format | Output | Description |
|---|---|---|
| `'mp4'` | Single .mp4 file | H.264 video (requires FFmpeg) |
| `'webp'` | Single .webp file | Animated WebP (requires FFmpeg) |
| `'gif'` | Single .gif file | Animated GIF (requires FFmpeg) |
| `'sprite'` | Directory of PNGs | Frame sequence: `frame_0000.png`, `frame_0001.png`, ... |
| `'png'` | Single .png file | Last frame only |

### Quality Presets

| Quality | Description |
|---|---|
| `'production'` | Full resolution (default) |
| `'preview'` | Half resolution for faster iteration |

### Resolution Presets

```ts
import { Resolution } from 'anima';

Resolution.p480   // { width: 854, height: 480 }
Resolution.p720   // { width: 1280, height: 720 }
Resolution.p1080  // { width: 1920, height: 1080 }
Resolution.p4K    // { width: 3840, height: 2160 }
```

Use with scene config:

```ts
super({ ...Resolution.p720, frameRate: 30 });
```

### Render Last Frame Only

```ts
await renderer.renderLastFrame(scene, 'thumbnail.png');
```

### Progress Callback

```ts
await renderer.render(scene, 'output.mp4', {
  format: 'mp4',
  onProgress: (p) => {
    console.log(`${p.percentage.toFixed(1)}% — frame ${p.currentFrame}/${p.totalFrames}`);
  }
});
```

Progress object:

```ts
interface RenderProgress {
  currentFrame: number;
  totalFrames: number;
  percentage: number;       // 0–100
  elapsedMs: number;
  estimatedRemainingMs: number;
}
```

## CLI

The CLI uses `bun` and the `commander` package.

### Render

```bash
anima render <file> [options]

# Examples
anima render examples/basic.ts --scene MyScene --format mp4
anima render examples/pol.ts -s Pol1 -o test-output/Pol1.mp4
anima render examples/GraphShowcase.ts -s SocialNetworkScene -f webp -q preview
```

Options:

| Flag | Description | Default |
|---|---|---|
| `-s, --scene <name>` | Scene class to render | (first found) |
| `-f, --format <type>` | Output format: mp4, webp, gif, sprite, png | `mp4` |
| `-r, --resolution <preset>` | Resolution: 480, 720, 1080, 4K | scene default |
| `--fps <number>` | Frames per second | scene default |
| `-q, --quality <level>` | production or preview | `production` |
| `-o, --output <path>` | Output file path | auto-generated |

### Preview (Quick Low-Quality Render)

```bash
anima preview <file> -s MyScene
anima preview examples/basic.ts -s MyScene -f mp4
```

Renders at half resolution for faster iteration.

### Export Single Frame

```bash
anima export-frame <file> -s MyScene --frame last
anima export-frame <file> -s MyScene --frame 42 -o frame.png
```

### List Scenes

```bash
anima list-scenes <file>
```

Lists all exported Scene subclasses in a file.


