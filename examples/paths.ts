/**
 * Paths Example
 * 
 * Demonstrates Bezier curves, Arcs, Paths, and path following animations.
 */

import { scene, circle, bezier, arc, path, arrow } from '@anima/core';

// Create the scene
const myScene = scene();

// === Create path shapes ===

// A cubic bezier curve
const myCurve = bezier({
    start: { x: 100, y: 400 },
    control1: { x: 200, y: 100 },
    control2: { x: 600, y: 500 },
    end: { x: 700, y: 200 },
    style: { stroke: '#4a4a6a', strokeWidth: 2 },
});
myScene.add(myCurve);

// An arc (half circle)
const myArc = arc({
    center: { x: 400, y: 300 },
    radius: 100,
    startAngle: Math.PI,
    endAngle: 0,
    style: { stroke: '#4a4a6a', strokeWidth: 2 },
});
myScene.add(myArc);

// A custom path
const myPath = path({ style: { stroke: '#4a4a6a', strokeWidth: 2 } })
    .moveTo(50, 550)
    .lineTo(150, 500)
    .quadraticTo(250, 400, 350, 500)
    .cubicTo(400, 600, 500, 400, 550, 500)
    .lineTo(750, 550);
myScene.add(myPath);

// === Create entities to follow paths ===

// A circle following the bezier curve
const follower1 = myScene.add(circle({ radius: 12, style: { fill: '#e94560' } }));
follower1.moveTo(100, 400, { duration: 0 }); // Start position

// An arrow following the arc (with orientation)
const follower2 = myScene.add(arrow({
    from: { x: -15, y: 0 },
    to: { x: 15, y: 0 },
    style: { stroke: '#0f3460', strokeWidth: 3 },
}));
follower2.moveTo(300, 300, { duration: 0 }); // Start position

// A circle following the custom path
const follower3 = myScene.add(circle({ radius: 8, style: { fill: '#16c79a' } }));
follower3.moveTo(50, 550, { duration: 0 }); // Start position

// === Animations ===

// Wait a bit then follow paths
follower1
    .wait(0.5)
    .followPath(myCurve, { duration: 3, ease: 'easeInOut' });

follower2
    .wait(1)
    .followPath(myArc, { duration: 2, ease: 'easeInOut', orientToPath: true });

follower3
    .wait(1.5)
    .followPath(myPath, { duration: 4, ease: 'linear' });

// Fade out the path guides at the end
myCurve.wait(5).fadeOut({ duration: 0.5 });
myArc.wait(5).fadeOut({ duration: 0.5 });
myPath.wait(5).fadeOut({ duration: 0.5 });

export default myScene;
