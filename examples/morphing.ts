/**
 * Morphing Example
 *
 * Demonstrates morphing between shapes using the fluent API.
 * Just pass any shape to morphTo() - it extracts points automatically.
 * Works with circles, rectangles, arcs, beziers, and even text characters!
 */

import { scene, polygon, circle, rectangle, bezier, arc, text } from '@anima/core';

// Create the scene
const myScene = scene({ width: 800, height: 600, background: '#16213e' });

// === Main morphing polygon ===

const shape = myScene.add(polygon({
    points: circle({ radius: 50 }).getMorphPoints(32),
    style: { stroke: '#ff6b6b', strokeWidth: 3 },
}));
shape.moveTo(400, 300, { duration: 0 });

// === Morph sequence - just pass shapes directly! ===

shape
    .wait(0.5)
    // Circle to rectangle
    .morphTo(rectangle({ width: 100, height: 60 }), { duration: 1, ease: 'easeInOut' })
    .wait(0.3)
    // Rectangle to triangle
    .morphTo(polygon({ points: [{ x: 0, y: -50 }, { x: 43, y: 25 }, { x: -43, y: 25 }] }), { duration: 1, ease: 'easeInOut' })
    .wait(0.3)
    // Triangle to arc
    .morphTo(arc({ radius: 50, startAngle: 0, endAngle: Math.PI * 1.5 }), { duration: 1, ease: 'easeInOut' })
    .wait(0.3)
    // Arc to the letter "A" - morphing into text!
    .morphTo(text({ content: 'Anima', fontSize: 80 }), { duration: 1.2, ease: 'easeInOut' })
    .wait(0.3)
    // Letter "A" to bezier curve
    .morphTo(bezier({ start: { x: -50, y: 0 }, control1: { x: -25, y: -50 }, control2: { x: 25, y: 50 }, end: { x: 50, y: 0 } }), { duration: 1, ease: 'easeInOut' })
    .wait(0.3)
    // Bezier back to circle
    .morphTo(circle({ radius: 50 }), { duration: 1.2, ease: 'easeInOut' });

// Rotation during morph
shape.wait(0.5).rotateTo(Math.PI * 2, { duration: 3 });

// Scale pulse
shape.wait(1.4).scaleTo(1.2, 1.2, { duration: 0.6 }).scaleTo(1, 1, { duration: 0.6 });

// Fade out
shape.wait(1.9).fadeOut({ duration: 0.5 });

export default myScene;
