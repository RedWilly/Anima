/**
 * Unit tests for followPath, morphTo, and stagger animations.
 */

import { describe, expect, it } from 'bun:test';
import { Scene, circle, polygon, group, bezier } from '../src';

describe('followPath', () => {
    it('should move entity along path', () => {
        const s = new Scene();
        const curve = bezier({
            start: { x: 0, y: 0 },
            control1: { x: 50, y: 0 },
            end: { x: 100, y: 0 },
        });
        const c = s.add(circle({ radius: 10 }));

        c.followPath(curve, { duration: 1, ease: 'linear' });

        s.timeline.seek(0.5);
        expect(c.position.x).toBeCloseTo(50);
    });

    it('should orient entity along path when orientToPath is true', () => {
        const s = new Scene();
        // Asymmetric curve: goes up then to the right
        const curve = bezier({
            start: { x: 0, y: 0 },
            control1: { x: 0, y: -100 },
            end: { x: 100, y: -100 },
        });
        const c = s.add(circle({ radius: 10 }));

        c.followPath(curve, { duration: 1, orientToPath: true });

        // At start of curve, tangent points upward (negative y direction)
        s.timeline.seek(0.1);
        // Rotation should be around -PI/2 (pointing up) at the start
        expect(Math.abs(c.rotation)).toBeGreaterThan(0.5);
    });
});

describe('morphTo', () => {
    it('should interpolate polygon vertices', () => {
        const s = new Scene();
        const start = [
            { x: 0, y: -50 },
            { x: 50, y: 50 },
            { x: -50, y: 50 },
        ];
        const end = [
            { x: 0, y: -100 },
            { x: 100, y: 100 },
            { x: -100, y: 100 },
        ];

        const p = s.add(polygon({ points: start }));
        p.morphTo(end, { duration: 1, ease: 'linear' });

        s.timeline.seek(0.5);
        const points = p.getPoints();
        expect(points[0].y).toBeCloseTo(-75); // Halfway between -50 and -100
    });

    it('should handle different point counts', () => {
        const s = new Scene();
        const triangle = [
            { x: 0, y: -50 },
            { x: 50, y: 50 },
            { x: -50, y: 50 },
        ];
        const square = [
            { x: -50, y: -50 },
            { x: 50, y: -50 },
            { x: 50, y: 50 },
            { x: -50, y: 50 },
        ];

        const p = s.add(polygon({ points: triangle }));
        p.morphTo(square, { duration: 1, ease: 'linear' });

        s.timeline.seek(1);
        const points = p.getPoints();
        expect(points.length).toBe(4);
    });
});

describe('Group.stagger', () => {
    it('should apply animation to all children', () => {
        const s = new Scene();
        const g = s.add(group());

        const c1 = circle({ radius: 10 });
        const c2 = circle({ radius: 10 });
        const c3 = circle({ radius: 10 });

        g.addChild(c1).addChild(c2).addChild(c3);

        g.stagger(child => {
            // Use type assertion since we know these are circles
            (child as typeof c1).scaleTo(2, 2, { duration: 1 });
        }, { delay: 0.5 });

        // After full duration + stagger, all should be scaled
        s.timeline.seek(3);
        expect(c1.scale.x).toBeCloseTo(2);
        expect(c2.scale.x).toBeCloseTo(2);
        expect(c3.scale.x).toBeCloseTo(2);
    });

    it('should support reverse direction', () => {
        const s = new Scene();
        const g = s.add(group());

        const circles = [
            circle({ radius: 10 }),
            circle({ radius: 10 }),
            circle({ radius: 10 }),
        ];
        circles.forEach(c => g.addChild(c));

        g.stagger(c => (c as typeof circles[0]).fadeOut({ duration: 0.5 }), {
            delay: 0.5,
            direction: 'reverse',
        });

        // First circle fades last in reverse
        s.timeline.seek(0.25);
        expect(circles[2].opacity).toBeLessThan(1); // Last child fades first
    });
});
