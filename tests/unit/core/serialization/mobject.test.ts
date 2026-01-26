/**
 * Tests for Mobject serialization.
 */

import { describe, test, expect, beforeEach } from 'bun:test';
import { Mobject } from '../../../../src/mobjects/Mobject';
import { VMobject } from '../../../../src/mobjects/VMobject';
import { VGroup } from '../../../../src/mobjects/VGroup/VGroup';
import { Circle, Rectangle, Line, Arc, Polygon } from '../../../../src/mobjects/geometry';
import { Vector2 } from '../../../../src/core/math/Vector2/Vector2';
import { Color } from '../../../../src/core/math/color/Color';
import {
    serializeMobject,
    deserializeMobject,
    resetIdCounter,
} from '../../../../src/core/serialization/mobject';
import type {
    SerializedCircle,
    SerializedRectangle,
    SerializedArc,
    SerializedVGroup,
} from '../../../../src/core/serialization/types';

describe('Mobject Serialization', () => {
    beforeEach(() => {
        resetIdCounter();
    });

    describe('Circle', () => {
        test('serializes Circle with radius', () => {
            const circle = new Circle(2.5);
            const serialized = serializeMobject(circle);
            expect(serialized.type).toBe('Circle');
            expect((serialized as SerializedCircle).radius).toBe(2.5);
        });

        test('round-trip preserves Circle properties', () => {
            const original = new Circle(3);
            original.pos(100, 50);
            original.show();
            original.stroke(Color.RED, 3);
            original.fill(Color.GREEN, 0.5);

            const serialized = serializeMobject(original);
            const restored = deserializeMobject(serialized) as Circle;

            expect(restored).toBeInstanceOf(Circle);
            expect((restored as VMobject).getStrokeWidth()).toBe(3);
            expect((restored as VMobject).getFillOpacity()).toBe(0.5);
        });
    });

    describe('Rectangle', () => {
        test('serializes Rectangle with dimensions', () => {
            const rect = new Rectangle(4, 2);
            const serialized = serializeMobject(rect);
            expect(serialized.type).toBe('Rectangle');
            expect((serialized as SerializedRectangle).width).toBe(4);
            expect((serialized as SerializedRectangle).height).toBe(2);
        });

        test('round-trip preserves Rectangle', () => {
            const original = new Rectangle(5, 3);
            const serialized = serializeMobject(original);
            const restored = deserializeMobject(serialized) as Rectangle;

            expect(restored).toBeInstanceOf(Rectangle);
            expect(restored.width).toBe(5);
            expect(restored.height).toBe(3);
        });
    });

    describe('Line', () => {
        test('serializes Line with start and end', () => {
            const line = new Line(0, 0, 100, 50);
            const serialized = serializeMobject(line);
            expect(serialized.type).toBe('Line');
        });

        test('round-trip preserves Line endpoints', () => {
            const original = new Line(10, 20, 30, 40);
            const serialized = serializeMobject(original);
            const restored = deserializeMobject(serialized) as Line;

            expect(restored).toBeInstanceOf(Line);
            expect(restored.start.x).toBe(10);
            expect(restored.start.y).toBe(20);
            expect(restored.end.x).toBe(30);
            expect(restored.end.y).toBe(40);
        });
    });

    describe('Arc', () => {
        test('serializes Arc with angles', () => {
            const arc = new Arc(2, 0, Math.PI);
            const serialized = serializeMobject(arc);
            expect(serialized.type).toBe('Arc');
            expect((serialized as SerializedArc).radius).toBe(2);
        });
    });

    describe('Polygon', () => {
        test('serializes Polygon with vertices', () => {
            const vertices = [
                new Vector2(0, 0),
                new Vector2(100, 0),
                new Vector2(50, 86.6),
            ];
            const polygon = new Polygon(vertices);
            const serialized = serializeMobject(polygon);
            expect(serialized.type).toBe('Polygon');
        });

        test('round-trip preserves Polygon vertices', () => {
            const vertices = [
                new Vector2(0, 0),
                new Vector2(50, 0),
                new Vector2(25, 43.3),
            ];
            const original = new Polygon(vertices);
            const serialized = serializeMobject(original);
            const restored = deserializeMobject(serialized) as Polygon;

            expect(restored).toBeInstanceOf(Polygon);
            expect(restored.vertices).toHaveLength(3);
            expect(restored.vertices[0]!.x).toBe(0);
            expect(restored.vertices[1]!.x).toBe(50);
        });
    });

    describe('VMobject', () => {
        test('serializes VMobject with style', () => {
            const vmob = new VMobject();
            vmob.stroke(Color.BLUE, 4);
            vmob.fill(Color.YELLOW, 0.7);

            const serialized = serializeMobject(vmob);
            expect(serialized.type).toBe('VMobject');
        });
    });

    describe('VGroup', () => {
        test('serializes VGroup with children', () => {
            const circle = new Circle(1);
            const rect = new Rectangle(2, 1);
            const group = new VGroup(circle, rect);

            const serialized = serializeMobject(group);
            expect(serialized.type).toBe('VGroup');
            expect((serialized as SerializedVGroup).children).toHaveLength(2);
        });

        test('round-trip preserves VGroup children', () => {
            const original = new VGroup(
                new Circle(1),
                new Rectangle(2, 1)
            );

            const serialized = serializeMobject(original);
            const restored = deserializeMobject(serialized) as VGroup;

            expect(restored).toBeInstanceOf(VGroup);
            expect(restored.getChildren()).toHaveLength(2);
            expect(restored.get(0)).toBeInstanceOf(Circle);
            expect(restored.get(1)).toBeInstanceOf(Rectangle);
        });

        test('round-trip preserves nested VGroups', () => {
            const inner = new VGroup(new Circle(1));
            const outer = new VGroup(inner, new Rectangle(2, 1));

            const serialized = serializeMobject(outer);
            const restored = deserializeMobject(serialized) as VGroup;

            expect(restored.getChildren()).toHaveLength(2);
            expect(restored.get(0)).toBeInstanceOf(VGroup);
            expect((restored.get(0) as VGroup).get(0)).toBeInstanceOf(Circle);
        });
    });
});
