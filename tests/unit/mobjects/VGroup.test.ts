import { describe, test, expect } from 'bun:test';
import { VGroup } from '../../../src/mobjects/VGroup';
import { Circle } from '../../../src/mobjects/geometry/Circle';
import { Rectangle } from '../../../src/mobjects/geometry/Rectangle';
import { FRAME_X_RADIUS, FRAME_Y_RADIUS } from '../../../src/core/constants';
import type { Mobject } from '../../../src/mobjects/Mobject';

// Helper to get world position from a Mobject
function getWorldPosition(mob: Mobject): { x: number; y: number } {
    const worldMatrix = mob.getWorldMatrix();
    return { x: worldMatrix.values[2]!, y: worldMatrix.values[5]! };
}

describe('VGroup', () => {
    test('collects and manages children', () => {
        const c1 = new Circle(1);
        const c2 = new Circle(1);
        const group = new VGroup(c1, c2);

        expect(group.getChildren()).toHaveLength(2);
        expect(group.get(0)).toBe(c1);
        expect(group.get(1)).toBe(c2);

        const c3 = new Circle();
        group.add(c3);
        expect(group.getChildren()).toHaveLength(3);

        group.remove(c1);
        expect(group.getChildren()).toHaveLength(2);
        expect(group.getChildren().includes(c1)).toBe(false);
    });

    test('Scene Graph: child local position unchanged, world position inherits parent', () => {
        const c1 = new Circle(1);
        const group = new VGroup(c1);

        group.pos(10, 10);

        // Group's local position changed
        expect(group.position.x).toBeCloseTo(10);
        expect(group.position.y).toBeCloseTo(10);

        // Child's LOCAL position should be unchanged (Scene Graph)
        expect(c1.position.x).toBeCloseTo(0);
        expect(c1.position.y).toBeCloseTo(0);

        // Child's WORLD position should reflect parent's transform
        const worldPos = getWorldPosition(c1);
        expect(worldPos.x).toBeCloseTo(10);
        expect(worldPos.y).toBeCloseTo(10);
    });

    test('Scene Graph: nested VGroups inherit transforms hierarchically', () => {
        const c1 = new Circle();
        const innerGroup = new VGroup(c1);
        const outerGroup = new VGroup(innerGroup);

        outerGroup.pos(20, 0);

        // Outer group's local position changed
        expect(outerGroup.position.x).toBeCloseTo(20);

        // Inner group's LOCAL position unchanged
        expect(innerGroup.position.x).toBeCloseTo(0);

        // Inner group's WORLD position inherits outer
        const innerWorldPos = getWorldPosition(innerGroup);
        expect(innerWorldPos.x).toBeCloseTo(20);

        // Circle's LOCAL position unchanged
        expect(c1.position.x).toBeCloseTo(0);

        // Circle's WORLD position inherits full chain
        const circleWorldPos = getWorldPosition(c1);
        expect(circleWorldPos.x).toBeCloseTo(20);
    });

    test('arrange positions children correctly', () => {
        const r1 = new Rectangle(2, 2);
        const r2 = new Rectangle(2, 2);
        const group = new VGroup(r1, r2);

        group.arrange('RIGHT', 0.5);

        const p1 = r1.position;
        const p2 = r2.position;

        // Distance between centers: 1 (half width) + 0.5 (buff) + 1 (half width) = 2.5
        expect(p2.x - p1.x).toBeCloseTo(2.5);
        expect(p1.y).toBeCloseTo(p2.y);
    });

    test('center centers the group (moves children locally)', () => {
        const c1 = new Circle();
        c1.pos(10, 10);
        const group = new VGroup(c1);

        group.center();

        // center() uses layout functions that move children directly
        // so child local position IS changed
        expect(c1.position.x).toBeCloseTo(0);
        expect(c1.position.y).toBeCloseTo(0);
    });

    test('toCorner positions group at corner', () => {
        const r = new Rectangle(2, 2);
        const group = new VGroup(r);

        group.toCorner('TOP_LEFT', 0);

        const bounds = group.getBoundingBox();
        expect(bounds.minX).toBeCloseTo(-FRAME_X_RADIUS);
        expect(bounds.minY).toBeCloseTo(-FRAME_Y_RADIUS);
    });

    test('alignTo aligns to target edge (moves children locally)', () => {
        const r1 = new Rectangle(2, 2);
        r1.pos(-5, 0); // Left edge at -6

        const r2 = new Rectangle(2, 2);
        // r2 initially at 0,0. Left edge at -1.

        const group = new VGroup(r2);
        group.alignTo(r1, 'LEFT');

        // alignTo uses layout functions that move children directly
        // r2 left edge should now be -6.
        // r2 center should be -6 + 1 = -5.
        expect(r2.position.x).toBeCloseTo(-5);
    });

    // Additional arrange direction tests
    test('arrange LEFT positions children correctly', () => {
        const r1 = new Rectangle(2, 2);
        const r2 = new Rectangle(2, 2);
        const group = new VGroup(r1, r2);

        group.arrange('LEFT', 0.5);

        const p1 = r1.position;
        const p2 = r2.position;

        // r2 should be to the LEFT of r1
        expect(p1.x - p2.x).toBeCloseTo(2.5);
        expect(p1.y).toBeCloseTo(p2.y);
    });

    test('arrange DOWN positions children correctly', () => {
        const r1 = new Rectangle(2, 2);
        const r2 = new Rectangle(2, 2);
        const group = new VGroup(r1, r2);

        group.arrange('DOWN', 0.5);

        const p1 = r1.position;
        const p2 = r2.position;

        // r2 should be BELOW r1 (larger Y)
        expect(p2.y - p1.y).toBeCloseTo(2.5);
        expect(p1.x).toBeCloseTo(p2.x);
    });

    test('arrange UP positions children correctly', () => {
        const r1 = new Rectangle(2, 2);
        const r2 = new Rectangle(2, 2);
        const group = new VGroup(r1, r2);

        group.arrange('UP', 0.5);

        const p1 = r1.position;
        const p2 = r2.position;

        // r2 should be ABOVE r1 (smaller Y)
        expect(p1.y - p2.y).toBeCloseTo(2.5);
        expect(p1.x).toBeCloseTo(p2.x);
    });

    // New properties: length and clear
    test('length returns number of children', () => {
        const group = new VGroup();
        expect(group.length).toBe(0);

        group.add(new Circle(), new Circle(), new Circle());
        expect(group.length).toBe(3);

        group.remove(group.get(0)!);
        expect(group.length).toBe(2);
    });

    test('clear removes all children', () => {
        const c1 = new Circle();
        const c2 = new Circle();
        const group = new VGroup(c1, c2);

        expect(group.length).toBe(2);
        group.clear();
        expect(group.length).toBe(0);
        expect(group.getChildren()).toEqual([]);
    });

    // Empty VGroup edge cases
    test('empty VGroup operations do not throw', () => {
        const group = new VGroup();

        // These should not throw
        expect(() => group.pos(10, 10)).not.toThrow();
        expect(() => group.show()).not.toThrow();
        expect(() => group.hide()).not.toThrow();
        expect(() => group.center()).not.toThrow();
        expect(() => group.arrange('RIGHT')).not.toThrow();
    });

    test('empty VGroup getBoundingBox returns position-based bounds', () => {
        const group = new VGroup();
        group.pos(5, 10);

        const bounds = group.getBoundingBox();
        // Empty group should return bounds based on its own position
        expect(bounds.minX).toBe(bounds.maxX);
        expect(bounds.minY).toBe(bounds.maxY);
    });

    test('empty VGroup toCorner is a no-op (no children to move)', () => {
        const group = new VGroup();
        group.toCorner('BOTTOM_RIGHT', 0);

        // With Scene Graph: toCorner moves children, not the group itself.
        // An empty group has no children, so nothing changes.
        expect(group.position.x).toBe(0);
        expect(group.position.y).toBe(0);
    });

    test('add does not duplicate children', () => {
        const c1 = new Circle();
        const group = new VGroup(c1);

        group.add(c1);
        group.add(c1);

        expect(group.length).toBe(1);
    });

    test('remove non-existent child does not throw', () => {
        const c1 = new Circle();
        const c2 = new Circle();
        const group = new VGroup(c1);

        expect(() => group.remove(c2)).not.toThrow();
        expect(group.length).toBe(1);
    });
});
