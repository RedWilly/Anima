import { describe, it, expect } from 'bun:test';
import { CameraFrame } from '../../../../src/core/camera/CameraFrame';
import { Circle } from '../../../../src/mobjects/geometry/Circle';

describe('CameraFrame', () => {
    describe('Constructor and Dimensions', () => {
        it('should create frame with default dimensions', () => {
            const frame = new CameraFrame();
            expect(frame).toBeInstanceOf(CameraFrame);
        });

        it('should create frame with correct base dimensions for 16:9', () => {
            const frame = new CameraFrame({ pixelWidth: 1920, pixelHeight: 1080 });
            // baseHeight = 8.0, baseWidth = 8.0 * (1920/1080) = ~14.22
            expect(frame.height).toBeCloseTo(8.0, 5);
            expect(frame.width).toBeCloseTo(14.222, 2);
        });

        it('should create frame with correct base dimensions for 1:1', () => {
            const frame = new CameraFrame({ pixelWidth: 1080, pixelHeight: 1080 });
            expect(frame.height).toBe(8.0);
            expect(frame.width).toBe(8.0);
        });

        it('should create frame with correct base dimensions for 9:16 portrait', () => {
            const frame = new CameraFrame({ pixelWidth: 1080, pixelHeight: 1920 });
            // baseWidth = 8.0 * (1080/1920) = 4.5
            expect(frame.height).toBe(8.0);
            expect(frame.width).toBeCloseTo(4.5, 5);
        });
    });

    describe('Width/Height Getters with Scale', () => {
        it('width/height should account for scale', () => {
            const frame = new CameraFrame({ pixelWidth: 1920, pixelHeight: 1080 });
            frame.setScale(2, 2);
            expect(frame.height).toBeCloseTo(16.0, 5);
            expect(frame.width).toBeCloseTo(28.444, 2);
        });

        it('width/height should account for non-uniform scale', () => {
            const frame = new CameraFrame({ pixelWidth: 1080, pixelHeight: 1080 });
            frame.setScale(2, 3);
            expect(frame.width).toBeCloseTo(16.0, 5);
            expect(frame.height).toBeCloseTo(24.0, 5);
        });
    });

    describe('Bounds System', () => {
        it('setBounds should set bounds correctly', () => {
            const frame = new CameraFrame();
            frame.setBounds(0, 0, 100, 100);
            expect(frame.hasBounds()).toBe(true);
            const bounds = frame.getBounds();
            expect(bounds).toBeDefined();
            expect(bounds!.minX).toBe(0);
            expect(bounds!.minY).toBe(0);
            expect(bounds!.maxX).toBe(100);
            expect(bounds!.maxY).toBe(100);
        });

        it('clearBounds should remove bounds', () => {
            const frame = new CameraFrame();
            frame.setBounds(0, 0, 100, 100);
            expect(frame.hasBounds()).toBe(true);
            frame.clearBounds();
            expect(frame.hasBounds()).toBe(false);
            expect(frame.getBounds()).toBeUndefined();
        });

        it('hasBounds should return false when no bounds set', () => {
            const frame = new CameraFrame();
            expect(frame.hasBounds()).toBe(false);
        });
    });

    describe('Position Clamping with Bounds', () => {
        it('should clamp position to stay within bounds', () => {
            const frame = new CameraFrame({ pixelWidth: 1080, pixelHeight: 1080 });
            // Frame is 8x8 at scale 1, so halfWidth=4, halfHeight=4
            frame.setBounds(0, 0, 20, 20);
            // Try to move to (25, 10) - should clamp X to 16 (maxX - halfWidth)
            frame.pos(25, 10);
            expect(frame.position.x).toBeCloseTo(16, 5); // 20 - 4 = 16
            expect(frame.position.y).toBeCloseTo(10, 5);
        });

        it('should clamp position at minimum bounds', () => {
            const frame = new CameraFrame({ pixelWidth: 1080, pixelHeight: 1080 });
            frame.setBounds(0, 0, 20, 20);
            frame.pos(-5, 2);
            expect(frame.position.x).toBeCloseTo(4, 5); // 0 + 4 = 4 (minX + halfWidth)
            expect(frame.position.y).toBeCloseTo(4, 5); // 0 + 4 = 4 (clamped to minY + halfHeight)
        });

        it('should not clamp when no bounds set', () => {
            const frame = new CameraFrame();
            frame.pos(500, 500);
            expect(frame.position.x).toBe(500);
            expect(frame.position.y).toBe(500);
        });

        it('should allow position without clamping after clearBounds', () => {
            const frame = new CameraFrame();
            frame.setBounds(0, 0, 10, 10);
            frame.clearBounds();
            frame.pos(100, 100);
            expect(frame.position.x).toBe(100);
            expect(frame.position.y).toBe(100);
        });
    });

    describe('setScale Validation', () => {
        it('should throw error on zero scale', () => {
            const frame = new CameraFrame();
            expect(() => frame.setScale(0, 0)).toThrow('CameraFrame scale must be positive to prevent division by zero');
        });

        it('should throw error on negative scale', () => {
            const frame = new CameraFrame();
            expect(() => frame.setScale(-1, -1)).toThrow('CameraFrame scale must be positive to prevent division by zero');
        });

        it('should throw error when only x scale is zero', () => {
            const frame = new CameraFrame();
            expect(() => frame.setScale(0, 1)).toThrow('CameraFrame scale must be positive to prevent division by zero');
        });

        it('should throw error when only y scale is zero', () => {
            const frame = new CameraFrame();
            expect(() => frame.setScale(1, 0)).toThrow('CameraFrame scale must be positive to prevent division by zero');
        });

        it('should accept positive scale values', () => {
            const frame = new CameraFrame();
            expect(() => frame.setScale(2, 2)).not.toThrow();
            expect(frame.scale.x).toBeCloseTo(2, 5);
            expect(frame.scale.y).toBeCloseTo(2, 5);
        });
    });

    describe('Save/Restore State', () => {
        it('saveState should store current transform', () => {
            const frame = new CameraFrame();
            frame.pos(5, 10);
            frame.setScale(2, 2);
            frame.saveState();

            const state = frame.getSavedState();
            expect(state).toBeDefined();
            expect(state!.position.x).toBeCloseTo(5, 5);
            expect(state!.position.y).toBeCloseTo(10, 5);
            expect(state!.scale.x).toBeCloseTo(2, 5);
            expect(state!.scale.y).toBeCloseTo(2, 5);
        });

        it('getSavedState should return last saved state without removing it', () => {
            const frame = new CameraFrame();
            frame.saveState();
            const state1 = frame.getSavedState();
            const state2 = frame.getSavedState();
            expect(state1).toBeDefined();
            expect(state2).toBeDefined();
        });

        it('multiple saveState calls should stack', () => {
            const frame = new CameraFrame();
            frame.pos(0, 0);
            frame.saveState();
            frame.pos(5, 5);
            frame.saveState();
            frame.pos(10, 10);
            frame.saveState();

            const state = frame.getSavedState();
            expect(state!.position.x).toBeCloseTo(10, 5);
            expect(state!.position.y).toBeCloseTo(10, 5);
        });

        it('getSavedState should return undefined when no states saved', () => {
            const frame = new CameraFrame();
            expect(frame.getSavedState()).toBeUndefined();
        });

        it('clearSavedStates should empty the stack', () => {
            const frame = new CameraFrame();
            frame.saveState();
            frame.saveState();
            frame.clearSavedStates();
            expect(frame.getSavedState()).toBeUndefined();
        });
    });

    describe('zoomIn', () => {
        it('should return animation that scales to 1/factor', () => {
            const frame = new CameraFrame();
            const result = frame.zoomIn(2);
            expect(result).toBeDefined();
            expect(typeof result.toAnimation).toBe('function');
        });

        it('should use default factor of 2', () => {
            const frame = new CameraFrame();
            const result = frame.zoomIn();
            expect(result).toBeDefined();
        });

        it('should throw error on zero factor', () => {
            const frame = new CameraFrame();
            expect(() => frame.zoomIn(0)).toThrow('zoom factor must be positive');
        });

        it('should throw error on negative factor', () => {
            const frame = new CameraFrame();
            expect(() => frame.zoomIn(-1)).toThrow('zoom factor must be positive');
        });
    });

    describe('zoomOut', () => {
        it('should return animation that scales to factor', () => {
            const frame = new CameraFrame();
            const result = frame.zoomOut(2);
            expect(result).toBeDefined();
            expect(typeof result.toAnimation).toBe('function');
        });

        it('should use default factor of 2', () => {
            const frame = new CameraFrame();
            const result = frame.zoomOut();
            expect(result).toBeDefined();
        });

        it('should throw error on zero factor', () => {
            const frame = new CameraFrame();
            expect(() => frame.zoomOut(0)).toThrow('zoom factor must be positive');
        });

        it('should throw error on negative factor', () => {
            const frame = new CameraFrame();
            expect(() => frame.zoomOut(-1)).toThrow('zoom factor must be positive');
        });
    });

    describe('centerOn', () => {
        it('should read target position correctly', () => {
            const frame = new CameraFrame();
            const circle = new Circle(1);
            circle.pos(5, 10);

            const result = frame.centerOn(circle);
            expect(result).toBeDefined();
            expect(typeof result.toAnimation).toBe('function');
        });

        it('should throw error on null target', () => {
            const frame = new CameraFrame();
            expect(() => frame.centerOn(null as any)).toThrow('centerOn() requires a Mobject target, but received null or undefined');
        });

        it('should throw error on undefined target', () => {
            const frame = new CameraFrame();
            expect(() => frame.centerOn(undefined as any)).toThrow('centerOn() requires a Mobject target, but received null or undefined');
        });
    });

    describe('Error Cases', () => {
        it('restore should throw when no state saved', () => {
            const frame = new CameraFrame();
            expect(() => frame.restore()).toThrow('restore() called but no state was saved. Call saveState() first.');
        });

        it('zoomToPoint should throw on zero factor', () => {
            const frame = new CameraFrame();
            expect(() => frame.zoomToPoint(0, { x: 0, y: 0 })).toThrow('zoom factor must be positive');
        });

        it('zoomToPoint should throw on negative factor', () => {
            const frame = new CameraFrame();
            expect(() => frame.zoomToPoint(-1, { x: 0, y: 0 })).toThrow('zoom factor must be positive');
        });

        it('fitTo should throw on empty array', () => {
            const frame = new CameraFrame();
            expect(() => frame.fitTo([])).toThrow('fitTo() requires at least one target');
        });
    });
});
