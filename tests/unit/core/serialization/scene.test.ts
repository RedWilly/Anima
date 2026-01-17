/**
 * Tests for Scene serialization.
 */

import { describe, test, expect, beforeEach } from 'bun:test';
import { Scene } from '../../../../src/core/scene';
import { Circle, Rectangle } from '../../../../src/mobjects/geometry';
import { Color } from '../../../../src/core/math/color/Color';
import { FadeIn, MoveTo } from '../../../../src/core/animations';
import {
    serialize,
    deserialize,
    serializeScene,
    deserializeScene,
    prettyPrint,
} from '../../../../src/core/serialization';
import { resetIdCounter } from '../../../../src/core/serialization/mobject';

describe('Scene Serialization', () => {
    beforeEach(() => {
        resetIdCounter();
    });

    describe('serializeScene', () => {
        test('serializes empty scene', () => {
            const scene = new Scene();
            const serialized = serializeScene(scene);

            expect(serialized.version).toBe('1.0.0');
            expect(serialized.config.width).toBe(1920);
            expect(serialized.config.height).toBe(1080);
            expect(serialized.mobjects).toHaveLength(0);
            expect(serialized.timeline.scheduled).toHaveLength(0);
        });

        test('serializes scene config', () => {
            const scene = new Scene({
                width: 1280,
                height: 720,
                backgroundColor: Color.WHITE,
                frameRate: 30,
            });
            const serialized = serializeScene(scene);

            expect(serialized.config.width).toBe(1280);
            expect(serialized.config.height).toBe(720);
            expect(serialized.config.frameRate).toBe(30);
            expect(serialized.config.backgroundColor.r).toBe(255);
        });

        test('serializes mobjects', () => {
            const scene = new Scene();
            scene.add(new Circle(1), new Rectangle(2, 1));
            const serialized = serializeScene(scene);

            expect(serialized.mobjects).toHaveLength(2);
            expect(serialized.mobjects[0]!.type).toBe('Circle');
            expect(serialized.mobjects[1]!.type).toBe('Rectangle');
        });
    });

    describe('serialize/deserialize round-trip', () => {
        test('round-trip preserves scene config', () => {
            const original = new Scene({
                width: 800,
                height: 600,
                frameRate: 24,
            });

            const json = serialize(original);
            const restored = deserialize(json);

            expect(restored.getWidth()).toBe(800);
            expect(restored.getHeight()).toBe(600);
            expect(restored.getFrameRate()).toBe(24);
        });

        test('round-trip preserves mobjects', () => {
            const original = new Scene();
            const circle = new Circle(2);
            circle.pos(100, 50);
            original.add(circle);

            const json = serialize(original);
            const restored = deserialize(json);

            expect(restored.getMobjects()).toHaveLength(1);
            const restoredCircle = restored.getMobjects()[0] as Circle;
            expect(restoredCircle).toBeInstanceOf(Circle);
        });

        test('produces valid JSON', () => {
            const scene = new Scene();
            scene.add(new Circle(1));

            const json = serialize(scene);

            expect(() => JSON.parse(json)).not.toThrow();
        });
    });

    describe('prettyPrint', () => {
        test('produces formatted output', () => {
            const scene = new Scene();
            const serialized = serializeScene(scene);
            const pretty = prettyPrint(serialized);

            expect(pretty).toContain('\n');
            expect(pretty).toContain('  ');
        });
    });
});
