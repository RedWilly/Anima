/**
 * Unit tests for Group entity.
 */

import { describe, expect, it } from 'bun:test';
import { Group, group } from '../src/entities/group';
import { Circle, circle } from '../src/entities/circle';
import { Rectangle, rectangle } from '../src/entities/rectangle';
import { Scene } from '../src/scene/scene';

describe('Group', () => {
    describe('Creation', () => {
        it('should create with default values', () => {
            const g = new Group();
            expect(g.position.x).toBe(0);
            expect(g.position.y).toBe(0);
            expect(g.length).toBe(0);
            expect(g.opacity).toBe(1);
        });

        it('should create with custom position', () => {
            const g = new Group({ x: 100, y: 200 });
            expect(g.position.x).toBe(100);
            expect(g.position.y).toBe(200);
        });

        it('should have unique IDs', () => {
            const g1 = new Group();
            const g2 = new Group();
            expect(g1.id).not.toBe(g2.id);
        });

        it('should create via factory function', () => {
            const g = group({ x: 50, y: 50 });
            expect(g).toBeInstanceOf(Group);
            expect(g.position.x).toBe(50);
        });
    });

    describe('Child management', () => {
        it('should add a single child', () => {
            const g = group();
            const c = circle();
            g.addChild(c);
            expect(g.length).toBe(1);
            expect(g.childAt(0)).toBe(c);
        });

        it('should add multiple children', () => {
            const g = group();
            const c1 = circle();
            const c2 = rectangle();
            g.addChildren([c1, c2]);
            expect(g.length).toBe(2);
            expect(g.childAt(0)).toBe(c1);
            expect(g.childAt(1)).toBe(c2);
        });

        it('should remove a child', () => {
            const g = group();
            const c = circle();
            g.addChild(c);
            expect(g.length).toBe(1);
            g.removeChild(c);
            expect(g.length).toBe(0);
        });

        it('should throw on invalid childAt index', () => {
            const g = group();
            g.addChild(circle());
            expect(() => g.childAt(-1)).toThrow();
            expect(() => g.childAt(1)).toThrow();
        });

        it('should return children via getChildren()', () => {
            const g = group();
            const c1 = circle();
            const c2 = rectangle();
            g.addChildren([c1, c2]);
            const children = g.getChildren();
            expect(children.length).toBe(2);
            expect(children[0]).toBe(c1);
        });

        it('should iterate via forEach()', () => {
            const g = group();
            g.addChildren([circle(), circle(), circle()]);
            let count = 0;
            g.forEach(() => count++);
            expect(count).toBe(3);
        });

        it('should support fluent API for child methods', () => {
            const g = group();
            const result = g.addChild(circle()).addChild(rectangle());
            expect(result).toBe(g);
            expect(g.length).toBe(2);
        });
    });

    describe('Timeline binding', () => {
        it('should bind children when group is added to scene', () => {
            const s = new Scene();
            const g = group();
            const c = circle();
            g.addChild(c);

            // Before adding to scene, child has no timeline
            s.add(g);

            // Now group and child should be bound
            // We can verify by checking that animations work
            expect(() => c.moveTo(100, 100)).not.toThrow();
        });

        it('should bind new children if group already has timeline', () => {
            const s = new Scene();
            const g = s.add(group());

            // Add child after group is already in scene
            const c = circle();
            g.addChild(c);

            // Child should be able to animate
            expect(() => c.moveTo(100, 100)).not.toThrow();
        });
    });

    describe('Group animations', () => {
        it('should animate group position', () => {
            const s = new Scene();
            const g = s.add(group());
            g.addChild(circle());

            g.moveTo(100, 200, { duration: 1, ease: 'linear' });

            s.timeline.seek(0.5);
            expect(g.position.x).toBeCloseTo(50);
            expect(g.position.y).toBeCloseTo(100);

            s.timeline.seek(1);
            expect(g.position.x).toBeCloseTo(100);
            expect(g.position.y).toBeCloseTo(200);
        });

        it('should animate group scale', () => {
            const s = new Scene();
            const g = s.add(group());

            g.scaleTo(2, 3, { duration: 1, ease: 'linear' });

            s.timeline.seek(0.5);
            expect(g.scale.x).toBeCloseTo(1.5);
            expect(g.scale.y).toBeCloseTo(2);

            s.timeline.seek(1);
            expect(g.scale.x).toBeCloseTo(2);
            expect(g.scale.y).toBeCloseTo(3);
        });

        it('should animate group rotation', () => {
            const s = new Scene();
            const g = s.add(group());

            g.rotateTo(Math.PI, { duration: 1, ease: 'linear' });

            s.timeline.seek(0.5);
            expect(g.rotation).toBeCloseTo(Math.PI / 2);

            s.timeline.seek(1);
            expect(g.rotation).toBeCloseTo(Math.PI);
        });

        it('should animate group opacity', () => {
            const s = new Scene();
            const g = s.add(group());

            g.fadeOut({ duration: 1, ease: 'linear' });

            s.timeline.seek(0.5);
            expect(g.opacity).toBeCloseTo(0.5);

            s.timeline.seek(1);
            expect(g.opacity).toBeCloseTo(0);
        });

        it('should wait correctly', () => {
            const s = new Scene();
            const g = s.add(group());

            g.wait(1).moveTo(100, 0, { duration: 0.5 });

            expect(s.duration).toBe(1.5);
        });

        it('should throw if animating without timeline', () => {
            const g = group();
            expect(() => g.moveTo(100, 100)).toThrow();
        });
    });

    describe('Child independent animations', () => {
        it('should allow children to animate independently', () => {
            const s = new Scene();
            const g = s.add(group());
            const c = circle();
            g.addChild(c);

            // Use parallel so both animate at the same time
            s.parallel([
                () => g.moveTo(100, 0, { duration: 1, ease: 'linear' }),
                () => c.moveTo(50, 0, { duration: 1, ease: 'linear' })
            ]);

            s.timeline.seek(0.5);
            expect(g.position.x).toBeCloseTo(50);
            expect(c.position.x).toBeCloseTo(25);

            s.timeline.seek(1);
            expect(g.position.x).toBeCloseTo(100);
            expect(c.position.x).toBeCloseTo(50);
        });
    });


    describe('Parallel animations', () => {
        it('should support parallel on group', () => {
            const s = new Scene();
            const g = s.add(group());

            g.parallel([
                gr => gr.moveTo(100, 0, { duration: 1 }),
                gr => gr.scaleTo(2, 2, { duration: 1 })
            ]);

            expect(s.duration).toBe(1);
        });

        it('should throw parallel if not bound', () => {
            const g = group();
            expect(() => g.parallel([gr => gr.moveTo(100, 100)])).toThrow();
        });
    });

    describe('Nested groups', () => {
        it('should support nested groups', () => {
            const s = new Scene();
            const outer = s.add(group());
            const inner = group();
            const c = circle();

            inner.addChild(c);
            outer.addChild(inner);

            // Animate outer group
            outer.moveTo(100, 0, { duration: 1, ease: 'linear' });

            s.timeline.seek(1);
            expect(outer.position.x).toBeCloseTo(100);
        });

        it('should bind nested group children to timeline', () => {
            const s = new Scene();
            const outer = s.add(group());
            const inner = group();
            const c = circle();

            inner.addChild(c);
            outer.addChild(inner);

            // Inner and circle should be bound and able to animate
            expect(() => inner.moveTo(50, 0)).not.toThrow();
            expect(() => c.fadeOut()).not.toThrow();
        });
    });
});
