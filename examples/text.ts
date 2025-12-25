/**
 * Text Animation Example
 * 
 * Demonstrates text rendering with various fonts,
 * sizes, and animation effects.
 */

import { scene, text } from '@anima/core';

// Create the scene
const myScene = scene({ width: 800, height: 600, background: '#0d1117' });

// Create text elements
const title = myScene.add(text({
    content: 'Hello, Anima!',
    fontSize: 48,
    fontFamily: 'Arial',
    fontWeight: 'bold',
}))
    .fill('#58a6ff');

const subtitle = myScene.add(text({
    content: 'Animation made simple',
    fontSize: 24,
    fontFamily: 'Arial',
}))
    .fill('#8b949e');

const emoji = myScene.add(text({
    content: '🎬',
    fontSize: 64,
}));

// === Animate title ===
title
    .moveTo(400, 200, { duration: 1, ease: 'easeOut' })
    .scaleTo(1.2, 1.2, { duration: 0.3 })
    .scaleTo(1, 1, { duration: 0.3 });

// === Animate subtitle (appears after title) ===
subtitle
    .wait(1)
    .moveTo(400, 280, { duration: 0.8, ease: 'easeOut' })
    .fadeIn({ duration: 0.5 });

// === Animate emoji ===
emoji
    .wait(1.5)
    .moveTo(400, 400, { duration: 0.6 })
    .rotateTo(Math.PI * 4, { duration: 1.5, ease: 'easeOut' })
    .scaleTo(2, 2, { duration: 0.5, ease: 'elastic' });

// Fade everything out at the end
title.wait(3).fadeOut({ duration: 0.5 });
subtitle.wait(3).fadeOut({ duration: 0.5 });
emoji.wait(3).fadeOut({ duration: 0.5 });

export default myScene;
