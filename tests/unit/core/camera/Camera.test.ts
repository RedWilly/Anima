import { describe, it, expect } from 'bun:test';
import * as fc from 'fast-check';
import { Camera } from '../../../../src/core/camera';
import { CameraFrame } from '../../../../src/core/camera/CameraFrame';
import { Vector2 } from '../../../../src/core/math/Vector2/Vector2';

describe('Camera', () => {
    describe('Constructor and Defaults', () => {
        it('should create camera with default config', () => {
            const camera = new Camera();
            expect(camera.pixelWidth).toBe(1920);
            expect(camera.pixelHeight).toBe(1080);
        });

        it('should create camera with custom pixel dimensions', () => {
            const camera = new Camera({ pixelWidth: 1280, pixelHeight: 720 });
            expect(camera.pixelWidth).toBe(1280);
            expect(camera.pixelHeight).toBe(720);
        });

        it('should have default position at origin', () => {
            const camera = new Camera();
            expect(camera.position.x).toBe(0);
            expect(camera.position.y).toBe(0);
        });

        it('should have default zoom of 1', () => {
            const camera = new Camera();
            expect(camera.zoom).toBe(1);
        });

        it('should have default rotation of 0', () => {
            const camera = new Camera();
            expect(camera.rotation).toBe(0);
        });
    });

    describe('Frame Dimensions (Manim-compatible)', () => {
        it('should have fixed frameHeight of 8.0', () => {
            const camera = new Camera();
            expect(camera.frameHeight).toBe(8.0);
        });

        it('should calculate frameWidth for 16:9 (1920x1080)', () => {
            const camera = new Camera({ pixelWidth: 1920, pixelHeight: 1080 });
            // 8.0 * (1920 / 1080) = 8.0 * 1.777... = ~14.22
            expect(camera.frameWidth).toBeCloseTo(14.222, 2);
        });

        it('should calculate frameWidth for 9:16 portrait (1080x1920)', () => {
            const camera = new Camera({ pixelWidth: 1080, pixelHeight: 1920 });
            // 8.0 * (1080 / 1920) = 8.0 * 0.5625 = 4.5
            expect(camera.frameWidth).toBeCloseTo(4.5, 5);
        });

        it('should calculate frameWidth for 1:1 square (1080x1080)', () => {
            const camera = new Camera({ pixelWidth: 1080, pixelHeight: 1080 });
            // 8.0 * (1080 / 1080) = 8.0
            expect(camera.frameWidth).toBe(8.0);
        });

        it('should calculate frameXRadius as half of frameWidth', () => {
            const camera = new Camera({ pixelWidth: 1920, pixelHeight: 1080 });
            expect(camera.frameXRadius).toBeCloseTo(camera.frameWidth / 2, 5);
        });

        it('should calculate frameYRadius as half of frameHeight', () => {
            const camera = new Camera();
            expect(camera.frameYRadius).toBe(4.0);
        });
    });

    describe('Pan Operations', () => {
        it('pan() should move camera by delta', () => {
            const camera = new Camera();
            camera.pan(new Vector2(5, 3));
            expect(camera.position.x).toBe(5);
            expect(camera.position.y).toBe(3);
        });

        it('pan() should be cumulative', () => {
            const camera = new Camera();
            camera.pan(new Vector2(2, 1));
            camera.pan(new Vector2(3, 4));
            expect(camera.position.x).toBe(5);
            expect(camera.position.y).toBe(5);
        });

        it('panTo() should set absolute position', () => {
            const camera = new Camera();
            camera.pan(new Vector2(10, 10));
            camera.panTo(new Vector2(3, 2));
            expect(camera.position.x).toBe(3);
            expect(camera.position.y).toBe(2);
        });

        it('pan() should return this for chaining', () => {
            const camera = new Camera();
            const result = camera.pan(new Vector2(1, 1));
            expect(result).toBe(camera);
        });
    });

    describe('Zoom Operations', () => {
        it('zoomTo() should set zoom level', () => {
            const camera = new Camera();
            camera.zoomTo(2);
            expect(camera.zoom).toBe(2);
        });

        it('zoomTo() should throw for non-positive zoom', () => {
            const camera = new Camera();
            expect(() => camera.zoomTo(0)).toThrow();
            expect(() => camera.zoomTo(-1)).toThrow();
        });

        it('zoomTo() should return this for chaining', () => {
            const camera = new Camera();
            const result = camera.zoomTo(1.5);
            expect(result).toBe(camera);
        });
    });

    describe('Rotation Operations', () => {
        it('rotateTo() should set rotation angle', () => {
            const camera = new Camera();
            camera.rotateTo(Math.PI / 4);
            expect(camera.rotation).toBe(Math.PI / 4);
        });

        it('rotateTo() should return this for chaining', () => {
            const camera = new Camera();
            const result = camera.rotateTo(0.5);
            expect(result).toBe(camera);
        });
    });

    describe('View Matrix', () => {
        it('should return identity-like matrix for default camera', () => {
            const camera = new Camera();
            const matrix = camera.getViewMatrix();
            // Default camera: no pan, zoom 1, no rotation
            // Transforming origin should give origin
            const origin = matrix.transformPoint(new Vector2(0, 0));
            expect(origin.x).toBeCloseTo(0, 5);
            expect(origin.y).toBeCloseTo(0, 5);
        });

        it('should apply pan to view matrix', () => {
            const camera = new Camera();
            camera.panTo(new Vector2(10, 5));
            const matrix = camera.getViewMatrix();
            // Point at (10, 5) should transform to origin
            const point = matrix.transformPoint(new Vector2(10, 5));
            expect(point.x).toBeCloseTo(0, 5);
            expect(point.y).toBeCloseTo(0, 5);
        });

        it('should apply zoom to view matrix', () => {
            const camera = new Camera();
            camera.zoomTo(2);
            const matrix = camera.getViewMatrix();
            // Point at (1, 1) should transform to (2, 2) with 2x zoom
            const point = matrix.transformPoint(new Vector2(1, 1));
            expect(point.x).toBeCloseTo(2, 5);
            expect(point.y).toBeCloseTo(2, 5);
        });
    });

    describe('Reset', () => {
        it('should reset camera to default state', () => {
            const camera = new Camera();
            camera.panTo(new Vector2(10, 10));
            camera.zoomTo(3);
            camera.rotateTo(Math.PI);

            camera.reset();

            expect(camera.position.x).toBe(0);
            expect(camera.position.y).toBe(0);
            expect(camera.zoom).toBe(1);
            expect(camera.rotation).toBe(0);
        });
    });

    describe('Property-based Tests', () => {
        it('frameWidth scales linearly with aspect ratio', () => {
            fc.assert(
                fc.property(
                    fc.integer({ min: 100, max: 4000 }),
                    fc.integer({ min: 100, max: 4000 }),
                    (width, height) => {
                        const camera = new Camera({ pixelWidth: width, pixelHeight: height });
                        const expectedWidth = 8.0 * (width / height);
                        return Math.abs(camera.frameWidth - expectedWidth) < 0.0001;
                    }
                )
            );
        });

        it('frameXRadius is always half of frameWidth', () => {
            fc.assert(
                fc.property(
                    fc.integer({ min: 100, max: 4000 }),
                    fc.integer({ min: 100, max: 4000 }),
                    (width, height) => {
                        const camera = new Camera({ pixelWidth: width, pixelHeight: height });
                        return Math.abs(camera.frameXRadius - camera.frameWidth / 2) < 0.0001;
                    }
                )
            );
        });

        it('pan is commutative', () => {
            fc.assert(
                fc.property(
                    fc.double({ min: -100, max: 100, noNaN: true, noDefaultInfinity: true }),
                    fc.double({ min: -100, max: 100, noNaN: true, noDefaultInfinity: true }),
                    fc.double({ min: -100, max: 100, noNaN: true, noDefaultInfinity: true }),
                    fc.double({ min: -100, max: 100, noNaN: true, noDefaultInfinity: true }),
                    (x1, y1, x2, y2) => {
                        const camera1 = new Camera();
                        camera1.pan(new Vector2(x1, y1)).pan(new Vector2(x2, y2));

                        const camera2 = new Camera();
                        camera2.pan(new Vector2(x2, y2)).pan(new Vector2(x1, y1));

                        return (
                            Math.abs(camera1.position.x - camera2.position.x) < 0.0001 &&
                            Math.abs(camera1.position.y - camera2.position.y) < 0.0001
                        );
                    }
                )
            );
        });
    });

    describe('CameraFrame Integration', () => {
        it('camera.frame is accessible and is CameraFrame instance', () => {
            const camera = new Camera();
            expect(camera.frame).toBeDefined();
            expect(camera.frame).toBeInstanceOf(CameraFrame);
        });

        it('getViewMatrix reflects frame transform', () => {
            const camera = new Camera();
            camera.frame.pos(5, 3);
            camera.frame.setScale(0.5, 0.5);
            camera.frame.setRotation(Math.PI / 4);

            const matrix = camera.getViewMatrix();
            const point = matrix.transformPoint(new Vector2(5, 3));
            expect(point.x).toBeCloseTo(0, 5);
            expect(point.y).toBeCloseTo(0, 5);
        });

        it('zoomTo proxies to frame correctly', () => {
            const camera = new Camera();
            camera.zoomTo(2);
            expect(camera.frame.scale.x).toBeCloseTo(0.5, 5);
            expect(camera.frame.scale.y).toBeCloseTo(0.5, 5);
        });

        it('panTo proxies to frame correctly', () => {
            const camera = new Camera();
            camera.panTo(new Vector2(10, -5));
            expect(camera.frame.position.x).toBe(10);
            expect(camera.frame.position.y).toBe(-5);
        });

        it('rotateTo proxies to frame correctly', () => {
            const camera = new Camera();
            camera.rotateTo(Math.PI / 2);
            expect(camera.frame.rotation).toBe(Math.PI / 2);
        });
    });

    describe('Coordinate Transforms', () => {
        it('worldToScreen transforms correctly', () => {
            const camera = new Camera({ pixelWidth: 1920, pixelHeight: 1080 });
            const screenPos = camera.worldToScreen(new Vector2(0, 0));
            expect(screenPos.x).toBeCloseTo(960, 1);
            expect(screenPos.y).toBeCloseTo(540, 1);
        });

        it('worldToScreen transforms off-center point correctly', () => {
            const camera = new Camera({ pixelWidth: 1920, pixelHeight: 1080 });
            const worldPos = new Vector2(2, 0);
            const screenPos = camera.worldToScreen(worldPos);
            expect(screenPos.x).toBeGreaterThan(960);
            expect(screenPos.y).toBeCloseTo(540, 1);
        });

        it('screenToWorld is inverse of worldToScreen', () => {
            const camera = new Camera({ pixelWidth: 1920, pixelHeight: 1080 });
            const originalWorld = new Vector2(3, -2);
            const screen = camera.worldToScreen(originalWorld);
            const backToWorld = camera.screenToWorld(screen);
            expect(backToWorld.x).toBeCloseTo(originalWorld.x, 4);
            expect(backToWorld.y).toBeCloseTo(originalWorld.y, 4);
        });

        it('screenToWorld and worldToScreen are inverses with pan and zoom', () => {
            const camera = new Camera({ pixelWidth: 1920, pixelHeight: 1080 });
            camera.panTo(new Vector2(5, 5));
            camera.zoomTo(2);

            const originalWorld = new Vector2(7, 3);
            const screen = camera.worldToScreen(originalWorld);
            const backToWorld = camera.screenToWorld(screen);
            expect(backToWorld.x).toBeCloseTo(originalWorld.x, 4);
            expect(backToWorld.y).toBeCloseTo(originalWorld.y, 4);
        });
    });

    describe('isInView', () => {
        it('returns true for points within frame', () => {
            const camera = new Camera();
            expect(camera.isInView(new Vector2(0, 0))).toBe(true);
            expect(camera.isInView(new Vector2(1, 1))).toBe(true);
            expect(camera.isInView(new Vector2(-1, -1))).toBe(true);
        });

        it('returns false for points outside frame', () => {
            const camera = new Camera();
            expect(camera.isInView(new Vector2(100, 0))).toBe(false);
            expect(camera.isInView(new Vector2(0, 100))).toBe(false);
            expect(camera.isInView(new Vector2(-100, -100))).toBe(false);
        });

        it('respects camera pan position', () => {
            const camera = new Camera();
            camera.panTo(new Vector2(50, 50));
            expect(camera.isInView(new Vector2(0, 0))).toBe(false);
            expect(camera.isInView(new Vector2(50, 50))).toBe(true);
        });

        it('respects camera zoom level', () => {
            const camera = new Camera();
            camera.zoomTo(4);
            expect(camera.isInView(new Vector2(1, 1))).toBe(true);
            expect(camera.isInView(new Vector2(3, 3))).toBe(false);
        });
    });
});
