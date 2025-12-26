/**
 * Morphing Example
 * 
 * Tests morphing between different shape types to verify all work correctly.
 */

import { scene, polygon, circle, rectangle, Polygon } from '@anima/core';
import type { Point } from '@anima/core';

/**
 * Generate regular polygon vertices.
 */
function regularPolygon(sides: number, radius: number, rotation = -Math.PI / 2): Point[] {
    const points: Point[] = [];
    const angleStep = (Math.PI * 2) / sides;
    for (let i = 0; i < sides; i++) {
        const angle = rotation + i * angleStep;
        points.push({
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius,
        });
    }
    return points;
}

/**
 * Approximate a circle with polygon vertices for morphing.
 */
function circleToPoints(radius: number, segments = 32): Point[] {
    return regularPolygon(segments, radius, 0);
}

/**
 * Convert rectangle dimensions to polygon vertices.
 */
function rectangleToPoints(width: number, height: number): Point[] {
    const hw = width / 2;
    const hh = height / 2;
    return [
        { x: -hw, y: -hh },
        { x: hw, y: -hh },
        { x: hw, y: hh },
        { x: -hw, y: hh },
    ];
}

/**
 * Generate star shape vertices.
 */
function starShape(points: number, outerRadius: number, innerRadius: number): Point[] {
    const vertices: Point[] = [];
    const angleStep = Math.PI / points;
    for (let i = 0; i < points * 2; i++) {
        const angle = -Math.PI / 2 + i * angleStep;
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        vertices.push({
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius,
        });
    }
    return vertices;
}

// Create the scene
const myScene = scene({ width: 800, height: 600, background: '#16213e' });

// === Shape vertex arrays for morphing ===

// Basic shapes
const trianglePoints = regularPolygon(3, 60);
const squarePoints = regularPolygon(4, 55);
const pentagonPoints = regularPolygon(5, 55);
const hexagonPoints = regularPolygon(6, 50);

// Approximate circle with many segments
const circlePoints = circleToPoints(50, 32);

// Rectangle (non-square)
const rectPoints = rectangleToPoints(120, 60);

// Star
const starPoints = starShape(5, 60, 25);

// === Also add actual shapes to verify they render correctly ===

// Reference circle (static, for visual comparison)
const refCircle = myScene.add(circle({ radius: 30, style: { fill: '#2d4a6a', stroke: '#3498db' } }));
refCircle.moveTo(150, 100, { duration: 0 });

// Reference rectangle
const refRect = myScene.add(rectangle({ width: 60, height: 30, style: { fill: '#2d4a6a', stroke: '#3498db' } }));
refRect.moveTo(250, 100, { duration: 0 });

// === Main morphing polygon ===

const shape = myScene.add(polygon({
    points: circlePoints,
    style: { fill: '#e94560', stroke: '#ff6b6b', strokeWidth: 3 },
})) as Polygon;

shape.moveTo(400, 300, { duration: 0 });

// === Morph sequence: Circle → Rectangle → Triangle → Square → Pentagon → Hexagon → Star → Circle ===

shape
    .wait(0.5)
    // Circle to rectangle
    .morphTo(rectPoints, { duration: 1.2, ease: 'easeInOut' })
    .wait(0.3)
    // Rectangle to triangle
    .morphTo(trianglePoints, { duration: 1, ease: 'easeInOut' })
    .wait(0.3)
    // Triangle to square
    .morphTo(squarePoints, { duration: 0.8, ease: 'easeOut' })
    .wait(0.3)
    // Square to pentagon
    .morphTo(pentagonPoints, { duration: 0.8, ease: 'easeInOut' })
    .wait(0.3)
    // Pentagon to hexagon
    .morphTo(hexagonPoints, { duration: 0.8, ease: 'easeInOut' })
    .wait(0.3)
    // Hexagon to star
    .morphTo(starPoints, { duration: 1.2, ease: 'easeOut' })
    .wait(0.5)
    // Star back to circle
    .morphTo(circlePoints, { duration: 1.5, ease: 'easeInOut' });

// Rotation while morphing
shape
    .wait(0.5)
    .rotateTo(Math.PI * 2, { duration: 8 });

// Scale pulsing
shape
    .wait(3)
    .scaleTo(1.3, 1.3, { duration: 0.8 })
    .wait(0.5)
    .scaleTo(1, 1, { duration: 0.8 });

// Fade out at end
shape.wait(9).fadeOut({ duration: 0.5 });
refCircle.wait(9).fadeOut({ duration: 0.5 });
refRect.wait(9).fadeOut({ duration: 0.5 });

export default myScene;
