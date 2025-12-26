# API Usage Guidelines

## 1. Default Style (Recommended)

Use **named imports** for all core primitives:

```ts
import { scene, circle, rectangle, text } from '@anima/core';

const s = scene();
const c = circle({ radius: 50 });
```

**Why:**
- Easy to read at a glance
- Strong editor autocomplete
- Scales well as files grow

---

## 2. Namespace API (Alternative)

For convenience in small examples:

```ts
import { anima } from '@anima/core';

const s = anima.scene();
const c = anima.circle({ radius: 50 });
```

**OK for:** Demos, tutorials, REPL usage  
**Avoid in:** Production code, engine internals

---

## 3. Don't Mix Styles

❌ Bad:
```ts
import { scene } from '@anima/core';
import { anima } from '@anima/core';

scene();
anima.circle();
```

✅ Pick one per file.

---

## 4. Engine Internals

Inside core/renderer code:
- Only named imports allowed
- No `anima.*` usage
