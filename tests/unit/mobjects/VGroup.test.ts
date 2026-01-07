import { describe, test, expect } from 'bun:test';
import { VGroup } from '../../../src/mobjects/VGroup';
import { Circle } from '../../../src/mobjects/geometry/Circle';
import { Rectangle } from '../../../src/mobjects/geometry/Rectangle';
import { FRAME_X_RADIUS, FRAME_Y_RADIUS } from '../../../src/core/constants';

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

    test('propagates transformations to children', () => {
        const c1 = new Circle(1);
        const group = new VGroup(c1);

        group.pos(10, 10);
        
        expect(group.position.x).toBeCloseTo(10);
        expect(group.position.y).toBeCloseTo(10);
        expect(c1.position.x).toBeCloseTo(10);
        expect(c1.position.y).toBeCloseTo(10);
    });

    test('supports nested VGroups', () => {
        const c1 = new Circle();
        const innerGroup = new VGroup(c1);
        const outerGroup = new VGroup(innerGroup);

        outerGroup.pos(20, 0);

        expect(outerGroup.position.x).toBeCloseTo(20);
        expect(innerGroup.position.x).toBeCloseTo(20);
        expect(c1.position.x).toBeCloseTo(20);
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

    test('center centers the group', () => {
        const c1 = new Circle();
        c1.pos(10, 10);
        const group = new VGroup(c1);
        
        group.center();
        
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

    test('alignTo aligns to target edge', () => {
        const r1 = new Rectangle(2, 2);
        r1.pos(-5, 0); // Left edge at -6
        
        const r2 = new Rectangle(2, 2);
        // r2 initially at 0,0. Left edge at -1.
        
        const group = new VGroup(r2);
        group.alignTo(r1, 'LEFT');
        
        // r2 left edge should now be -6.
        // r2 center should be -6 + 1 = -5.
        expect(r2.position.x).toBeCloseTo(-5);
    });
});
