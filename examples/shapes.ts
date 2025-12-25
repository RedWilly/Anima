/**
 * Shapes Animation Example
 * 
 * Demonstrates basic shape animations: circles, rectangles,
 * lines, arrows, and polygons with various transformations.
 */

import { scene, circle, rectangle, line, arrow, polygon } from '@anima/core';

// Create the scene
const myScene = scene({ width: 800, height: 600, background: '#1a1a2e' });

// Create shapes with styling
const myCircle = myScene.add(circle({ radius: 40 }))
    .fill('#e94560')
    .stroke('#ffffff')
    .strokeWidth(2);

const myRect = myScene.add(rectangle({ width: 80, height: 50, cornerRadius: 8 }))
    .fill('#0f3460')
    .stroke('#16213e');

const myLine = myScene.add(line({ x1: 0, y1: 0, x2: 100, y2: 0 }))
    .stroke('#00fff5')
    .strokeWidth(3);

const myArrow = myScene.add(arrow({ x1: 0, y1: 0, x2: 80, y2: 0 }))
    .stroke('#ff6b6b')
    .strokeWidth(2);

const myPolygon = myScene.add(polygon({
    points: [
        { x: 0, y: -30 },
        { x: 26, y: 15 },
        { x: -26, y: 15 },
    ]
}))
    .fill('#ffd93d')
    .stroke('#ff6b35');

// === Animate circle ===
myCircle
    .moveTo(150, 300, { duration: 1 })
    .scaleTo(1.5, 1.5, { duration: 0.5 })
    .scaleTo(1, 1, { duration: 0.5 })
    .moveTo(150, 150, { duration: 0.8, ease: 'easeOut' });

// === Animate rectangle ===
myRect
    .moveTo(350, 300, { duration: 1.2 })
    .rotateTo(Math.PI / 4, { duration: 0.6 })
    .rotateTo(0, { duration: 0.6 })
    .fadeOut({ duration: 0.5 })
    .fadeIn({ duration: 0.5 });

// === Animate line ===
myLine
    .moveTo(500, 200, { duration: 1 })
    .rotateTo(Math.PI / 2, { duration: 0.8 })
    .moveTo(500, 400, { duration: 0.6 });

// === Animate arrow ===
myArrow
    .moveTo(650, 300, { duration: 1.5 })
    .rotateTo(Math.PI, { duration: 0.5 })
    .rotateTo(Math.PI * 2, { duration: 0.5 });

// === Animate polygon (triangle) ===
myPolygon
    .moveTo(400, 500, { duration: 1 })
    .scaleTo(2, 2, { duration: 0.5, ease: 'elastic' })
    .rotateTo(Math.PI * 2, { duration: 1 })
    .fadeOut({ duration: 0.5 });

export default myScene;
