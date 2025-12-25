/**
 * Composition Animation Example
 * 
 * Demonstrates using groups to combine shapes
 * and animate them as a single unit.
 */

import { scene, circle, rectangle, group } from '@anima/core';

// Create the scene
const myScene = scene({ width: 800, height: 600, background: '#16213e' });

// === Build a "car" using a group ===
const car = group()
    // Car body
    .addChild(rectangle({ width: 120, height: 40, cornerRadius: 8 })
        .fill('#e94560')
        .stroke('#c73e54'))
    // Front wheel
    .addChild(circle({ radius: 15 })
        .fill('#333')
        .stroke('#222')
        .strokeWidth(3))
    // Back wheel
    .addChild(circle({ radius: 15 })
        .fill('#333')
        .stroke('#222')
        .strokeWidth(3));

// Position the wheels relative to body
// (Note: in a real group, children would be positioned relative to group origin)

// Add car to scene
myScene.add(car);

// === Build a "robot face" using a group ===
const robot = group()
    // Head
    .addChild(rectangle({ width: 80, height: 80, cornerRadius: 4 })
        .fill('#0f3460')
        .stroke('#1a1a2e'))
    // Left eye
    .addChild(circle({ radius: 10 })
        .fill('#00fff5'))
    // Right eye
    .addChild(circle({ radius: 10 })
        .fill('#00fff5'))
    // Mouth
    .addChild(rectangle({ width: 40, height: 8 })
        .fill('#e94560'));

myScene.add(robot);

// === Build a simple "star" pattern using a group ===
const star = group();

// Add 5 circles in a star pattern
for (let i = 0; i < 5; i++) {
    const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
    const c = circle({ radius: 8 })
        .fill('#ffd93d');
    star.addChild(c);
}

myScene.add(star);

// === Animate the car ===
car
    .moveTo(100, 450, { duration: 0.5 })
    .moveTo(700, 450, { duration: 2, ease: 'easeInOut' })
    .moveTo(400, 450, { duration: 1.5, ease: 'easeOut' });

// === Animate the robot ===
robot
    .moveTo(400, 200, { duration: 1 })
    .parallel([
        g => g.scaleTo(1.5, 1.5, { duration: 0.5 }),
        g => g.rotateTo(0.1, { duration: 0.2 })
    ])
    .rotateTo(-0.1, { duration: 0.2 })
    .rotateTo(0, { duration: 0.2 })
    .scaleTo(1, 1, { duration: 0.3 });

// === Animate the star ===
star
    .moveTo(600, 150, { duration: 0.8 })
    .rotateTo(Math.PI * 4, { duration: 2, ease: 'linear' })
    .fadeOut({ duration: 0.5 });

export default myScene;
