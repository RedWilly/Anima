/**
 * Tests for serialization primitives.
 */

import { describe, test, expect } from 'bun:test';
import { Vector2 } from '../../../../src/core/math/Vector2/Vector2';
import { Matrix3x3 } from '../../../../src/core/math/matrix/Matrix3x3';
import { Color } from '../../../../src/core/math/color/Color';
import { BezierPath } from '../../../../src/core/math/bezier/BezierPath';
import {
    serializeVector2,
    deserializeVector2,
    serializeMatrix3x3,
    deserializeMatrix3x3,
    serializeColor,
    deserializeColor,
    serializeBezierPath,
    deserializeBezierPath,
} from '../../../../src/core/serialization/primitives';

describe('Primitive Serialization', () => {
    describe('Vector2', () => {
        test('serializes Vector2 correctly', () => {
            const v = new Vector2(10, 20);
            const serialized = serializeVector2(v);
            expect(serialized).toEqual({ x: 10, y: 20 });
        });

        test('deserializes Vector2 correctly', () => {
            const data = { x: 15, y: 25 };
            const v = deserializeVector2(data);
            expect(v.x).toBe(15);
            expect(v.y).toBe(25);
        });

        test('round-trip preserves values', () => {
            const original = new Vector2(3.14159, -2.71828);
            const serialized = serializeVector2(original);
            const restored = deserializeVector2(serialized);
            expect(restored.x).toBeCloseTo(original.x, 5);
            expect(restored.y).toBeCloseTo(original.y, 5);
        });
    });

    describe('Matrix3x3', () => {
        test('serializes identity matrix correctly', () => {
            const m = Matrix3x3.identity();
            const serialized = serializeMatrix3x3(m);
            expect(serialized.values).toHaveLength(9);
            expect(serialized.values[0]).toBe(1);
            expect(serialized.values[4]).toBe(1);
            expect(serialized.values[8]).toBe(1);
        });

        test('deserializes matrix correctly', () => {
            const data = { values: [1, 0, 5, 0, 1, 10, 0, 0, 1] };
            const m = deserializeMatrix3x3(data);
            const v = m.values;
            expect(v[2]).toBe(5);
            expect(v[5]).toBe(10);
        });

        test('round-trip preserves transformation', () => {
            const original = Matrix3x3.translation(100, 50);
            const serialized = serializeMatrix3x3(original);
            const restored = deserializeMatrix3x3(serialized);
            const point = new Vector2(0, 0);
            const transformedOriginal = original.transformPoint(point);
            const transformedRestored = restored.transformPoint(point);
            expect(transformedRestored.x).toBeCloseTo(transformedOriginal.x, 5);
            expect(transformedRestored.y).toBeCloseTo(transformedOriginal.y, 5);
        });
    });

    describe('Color', () => {
        test('serializes Color correctly', () => {
            const c = new Color(255, 128, 64, 0.5);
            const serialized = serializeColor(c);
            expect(serialized).toEqual({ r: 255, g: 128, b: 64, a: 0.5 });
        });

        test('deserializes Color correctly', () => {
            const data = { r: 100, g: 150, b: 200, a: 0.8 };
            const c = deserializeColor(data);
            expect(c.r).toBe(100);
            expect(c.g).toBe(150);
            expect(c.b).toBe(200);
            expect(c.a).toBe(0.8);
        });

        test('round-trip preserves predefined colors', () => {
            const colors = [Color.WHITE, Color.BLACK, Color.RED, Color.GREEN, Color.BLUE];
            for (const original of colors) {
                const serialized = serializeColor(original);
                const restored = deserializeColor(serialized);
                expect(restored.r).toBe(original.r);
                expect(restored.g).toBe(original.g);
                expect(restored.b).toBe(original.b);
                expect(restored.a).toBe(original.a);
            }
        });
    });

    describe('BezierPath', () => {
        test('serializes simple line path', () => {
            const path = new BezierPath();
            path.moveTo(new Vector2(0, 0));
            path.lineTo(new Vector2(100, 100));

            const serialized = serializeBezierPath(path);
            expect(serialized.commands).toHaveLength(2);
            expect(serialized.commands[0]!.type).toBe('Move');
            expect(serialized.commands[1]!.type).toBe('Line');
        });

        test('deserializes line path correctly', () => {
            const data = {
                commands: [
                    { type: 'Move' as const, end: { x: 0, y: 0 } },
                    { type: 'Line' as const, end: { x: 50, y: 75 } },
                ],
            };
            const path = deserializeBezierPath(data);
            const commands = path.getCommands();
            expect(commands).toHaveLength(2);
            expect(commands[0]!.end.x).toBe(0);
            expect(commands[1]!.end.x).toBe(50);
        });

        test('round-trip preserves cubic curves', () => {
            const original = new BezierPath();
            original.moveTo(new Vector2(0, 0));
            original.cubicTo(
                new Vector2(25, 50),
                new Vector2(75, 50),
                new Vector2(100, 0)
            );

            const serialized = serializeBezierPath(original);
            const restored = deserializeBezierPath(serialized);
            const restoredCommands = restored.getCommands();

            expect(restoredCommands).toHaveLength(2);
            expect(restoredCommands[1]!.type).toBe('Cubic');
            expect(restoredCommands[1]!.control1!.x).toBe(25);
            expect(restoredCommands[1]!.control2!.x).toBe(75);
        });
    });
});
