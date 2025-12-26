/**
 * Morphing Example
 *
 * Demonstrates morphing between shapes using the fluent API.
 * Just pass any shape to morphTo() - it extracts points automatically.
 */

import { scene, polygon, circle, rectangle, bezier, arc, line, arrow } from '@anima/core';

// Create the scene
const myScene = scene({ width: 800, height: 600, background: '#16213e' });

// === Reference shapes displayed at top ===

const refCircle = myScene.add(circle({ radius: 30, style: { fill: '#2d4a6a', stroke: '#3498db' } }));
refCircle.moveTo(100, 80, { duration: 0 });

const refRect = myScene.add(rectangle({ width: 60, height: 40, style: { fill: '#2d4a6a', stroke: '#3498db' } }));
refRect.moveTo(200, 80, { duration: 0 });

const refBezier = myScene.add(bezier({ style: { stroke: '#3498db', strokeWidth: 2 } }));
refBezier.moveTo(300, 80, { duration: 0 });

const refArc = myScene.add(arc({ radius: 30, style: { stroke: '#3498db', strokeWidth: 2 } }));
refArc.moveTo(400, 80, { duration: 0 });

const refLine = myScene.add(line({ from: { x: -25, y: 0 }, to: { x: 25, y: 0 }, style: { stroke: '#3498db', strokeWidth: 3 } }));
refLine.moveTo(500, 80, { duration: 0 });

const refArrow = myScene.add(arrow({ from: { x: -25, y: 0 }, to: { x: 25, y: 0 }, style: { stroke: '#3498db', strokeWidth: 2 } }));
refArrow.moveTo(600, 80, { duration: 0 });

// === Main morphing polygon ===

const shape = myScene.add(polygon({
    points: circle({ radius: 50 }).getMorphPoints(32),
    style: { fill: '#e94560', stroke: '#ff6b6b', strokeWidth: 3 },
}));
shape.moveTo(400, 350, { duration: 0 });

// === Morph sequence - just pass shapes directly! ===

shape
    .wait(0.5)
    // Morph from circle to rectangle - simple fluent API
    .morphTo(rectangle({ width: 100, height: 60 }), { duration: 1, ease: 'easeInOut' })
    .wait(0.3)
    // Rectangle to triangle
    .morphTo(polygon({ points: [{ x: 0, y: -50 }, { x: 43, y: 25 }, { x: -43, y: 25 }] }), { duration: 1, ease: 'easeInOut' })
    .wait(0.3)
    // Triangle to arc
    .morphTo(arc({ radius: 50, startAngle: 0, endAngle: Math.PI * 1.5 }), { duration: 1, ease: 'easeInOut' })
    .wait(0.3)
    // Arc to bezier curve
    .morphTo(bezier({ start: { x: -50, y: 0 }, control1: { x: -25, y: -50 }, control2: { x: 25, y: 50 }, end: { x: 50, y: 0 } }), { duration: 1, ease: 'easeInOut' })
    .wait(0.3)
    // Bezier back to circle
    .morphTo(circle({ radius: 50 }), { duration: 1.2, ease: 'easeInOut' });

// Rotation during morph
shape.wait(0.5).rotateTo(Math.PI * 2, { duration: 7 });

// Scale pulse
shape.wait(3).scaleTo(1.2, 1.2, { duration: 0.6 }).scaleTo(1, 1, { duration: 0.6 });

// Fade out
shape.wait(8).fadeOut({ duration: 0.5 });
refCircle.wait(8).fadeOut({ duration: 0.5 });
refRect.wait(8).fadeOut({ duration: 0.5 });
refBezier.wait(8).fadeOut({ duration: 0.5 });
refArc.wait(8).fadeOut({ duration: 0.5 });
refLine.wait(8).fadeOut({ duration: 0.5 });
refArrow.wait(8).fadeOut({ duration: 0.5 });

export default myScene;
