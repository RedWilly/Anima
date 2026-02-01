import { describe, it, expect } from 'bun:test';
import { Follow } from '../../../../src/core/animations/camera/Follow';
import { CameraFrame } from '../../../../src/core/camera/CameraFrame';
import { Mobject } from '../../../../src/mobjects/Mobject';
import { Vector2 } from '../../../../src/core/math/Vector2/Vector2';

describe('Follow Animation', () => {
    describe('Track Stationary Target', () => {
        it('should move frame to stationary target position', () => {
            const frame = new CameraFrame({ pixelWidth: 1920, pixelHeight: 1080 });
            const target = new Mobject();
            target.pos(5, 3);

            const follow = new Follow(frame, target);
            follow.interpolate(0.5);

            expect(frame.position.x).toBe(5);
            expect(frame.position.y).toBe(3);
        });

        it('should stay at target position at full progress', () => {
            const frame = new CameraFrame({ pixelWidth: 1920, pixelHeight: 1080 });
            const target = new Mobject();
            target.pos(10, -5);

            const follow = new Follow(frame, target);
            follow.interpolate(1);

            expect(frame.position.x).toBe(10);
            expect(frame.position.y).toBe(-5);
        });
    });

    describe('Track Moving Target', () => {
        it('should track target as it moves between interpolate calls', () => {
            const frame = new CameraFrame({ pixelWidth: 1920, pixelHeight: 1080 });
            const target = new Mobject();
            target.pos(0, 0);

            const follow = new Follow(frame, target);

            follow.interpolate(0.25);
            expect(frame.position.x).toBe(0);
            expect(frame.position.y).toBe(0);

            target.pos(10, 10);
            follow.interpolate(0.5);
            expect(frame.position.x).toBe(10);
            expect(frame.position.y).toBe(10);

            target.pos(-5, 20);
            follow.interpolate(0.75);
            expect(frame.position.x).toBe(-5);
            expect(frame.position.y).toBe(20);
        });
    });

    describe('Follow with Offset', () => {
        it('should maintain offset distance from target', () => {
            const frame = new CameraFrame({ pixelWidth: 1920, pixelHeight: 1080 });
            const target = new Mobject();
            target.pos(5, 5);

            const offset = new Vector2(2, 3);
            const follow = new Follow(frame, target, { offset });
            follow.interpolate(0.5);

            expect(frame.position.x).toBe(7);
            expect(frame.position.y).toBe(8);
        });

        it('should maintain offset as target moves', () => {
            const frame = new CameraFrame({ pixelWidth: 1920, pixelHeight: 1080 });
            const target = new Mobject();
            target.pos(0, 0);

            const offset = new Vector2(-1, 2);
            const follow = new Follow(frame, target, { offset });

            follow.interpolate(0.25);
            expect(frame.position.x).toBe(-1);
            expect(frame.position.y).toBe(2);

            target.pos(10, 5);
            follow.interpolate(0.5);
            expect(frame.position.x).toBe(9);
            expect(frame.position.y).toBe(7);
        });
    });

    describe('Follow with Damping', () => {
        it('should create smooth movement with damping > 0', () => {
            const frame = new CameraFrame({ pixelWidth: 1920, pixelHeight: 1080 });
            frame.pos(0, 0);
            const target = new Mobject();
            target.pos(10, 10);

            const follow = new Follow(frame, target, { damping: 0.5 });
            follow.interpolate(0.5);

            expect(frame.position.x).toBe(5);
            expect(frame.position.y).toBe(5);
        });

        it('should approach target gradually with high damping', () => {
            const frame = new CameraFrame({ pixelWidth: 1920, pixelHeight: 1080 });
            frame.pos(0, 0);
            const target = new Mobject();
            target.pos(10, 0);

            const follow = new Follow(frame, target, { damping: 0.8 });
            follow.interpolate(0.25);

            expect(frame.position.x).toBe(2);
            expect(frame.position.y).toBe(0);
        });
    });

    describe('Follow with Damping = 0', () => {
        it('should snap instantly to target position', () => {
            const frame = new CameraFrame({ pixelWidth: 1920, pixelHeight: 1080 });
            frame.pos(0, 0);
            const target = new Mobject();
            target.pos(100, 50);

            const follow = new Follow(frame, target, { damping: 0 });
            follow.interpolate(0.1);

            expect(frame.position.x).toBe(100);
            expect(frame.position.y).toBe(50);
        });

        it('should snap to target with offset when damping is 0', () => {
            const frame = new CameraFrame({ pixelWidth: 1920, pixelHeight: 1080 });
            frame.pos(0, 0);
            const target = new Mobject();
            target.pos(20, 30);

            const offset = new Vector2(5, -5);
            const follow = new Follow(frame, target, { damping: 0, offset });
            follow.interpolate(0.1);

            expect(frame.position.x).toBe(25);
            expect(frame.position.y).toBe(25);
        });
    });

    describe('Error Handling', () => {
        it('should throw on null target', () => {
            const frame = new CameraFrame({ pixelWidth: 1920, pixelHeight: 1080 });

            expect(() => new Follow(frame, null as unknown as Mobject)).toThrow(
                'Follow animation requires a target Mobject'
            );
        });

        it('should throw on undefined target', () => {
            const frame = new CameraFrame({ pixelWidth: 1920, pixelHeight: 1080 });

            expect(() => new Follow(frame, undefined as unknown as Mobject)).toThrow(
                'Follow animation requires a target Mobject'
            );
        });

        it('should throw on null frame', () => {
            const target = new Mobject();

            expect(() => new Follow(null as unknown as CameraFrame, target)).toThrow(
                'Follow animation requires a CameraFrame'
            );
        });
    });
});
