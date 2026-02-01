import { describe, it, expect } from 'bun:test';
import { Shake } from '../../../../src/core/animations/camera/Shake';
import { CameraFrame } from '../../../../src/core/camera/CameraFrame';

describe('Shake Animation', () => {
    describe('Basic Behavior', () => {
        it('should displace frame during animation', () => {
            const frame = new CameraFrame();
            frame.pos(0, 0);
            const shake = new Shake(frame, { intensity: 0.5 });

            shake.interpolate(0.5);

            const displaced = frame.position.x !== 0 || frame.position.y !== 0;
            expect(displaced).toBe(true);
        });

        it('should return to original position at end', () => {
            const frame = new CameraFrame();
            const originalX = 5;
            const originalY = 3;
            frame.pos(originalX, originalY);
            const shake = new Shake(frame, { intensity: 0.5 });

            shake.interpolate(0);
            shake.interpolate(0.5);
            shake.interpolate(1);

            expect(frame.position.x).toBeCloseTo(originalX, 5);
            expect(frame.position.y).toBeCloseTo(originalY, 5);
        });
    });

    describe('Intensity Parameter', () => {
        it('should have larger displacement with higher intensity', () => {
            const frame = new CameraFrame();
            frame.pos(0, 0);

            let lowMaxDisplacement = 0;
            let highMaxDisplacement = 0;

            for (let trial = 0; trial < 10; trial++) {
                frame.pos(0, 0);
                const lowIntensity = new Shake(frame, { intensity: 0.1, decay: 100 });
                lowIntensity.duration(1);
                lowIntensity.interpolate(0.3);
                const disp = Math.sqrt(frame.position.x ** 2 + frame.position.y ** 2);
                if (disp > lowMaxDisplacement) lowMaxDisplacement = disp;
            }

            for (let trial = 0; trial < 10; trial++) {
                frame.pos(0, 0);
                const highIntensity = new Shake(frame, { intensity: 1.0, decay: 100 });
                highIntensity.duration(1);
                highIntensity.interpolate(0.3);
                const disp = Math.sqrt(frame.position.x ** 2 + frame.position.y ** 2);
                if (disp > highMaxDisplacement) highMaxDisplacement = disp;
            }

            expect(highMaxDisplacement).toBeGreaterThan(lowMaxDisplacement);
        });

        it('should have zero displacement with zero intensity', () => {
            const frame = new CameraFrame();
            frame.pos(0, 0);
            const shake = new Shake(frame, { intensity: 0, decay: 100 });
            shake.duration(1);

            shake.interpolate(0.5);

            expect(frame.position.x).toBeCloseTo(0, 5);
            expect(frame.position.y).toBeCloseTo(0, 5);
        });
    });

    describe('Frequency Parameter', () => {
        it('should oscillate faster with higher frequency', () => {
            const frame1 = new CameraFrame();
            const frame2 = new CameraFrame();
            frame1.pos(0, 0);
            frame2.pos(0, 0);

            const lowFreq = new Shake(frame1, { intensity: 0.5, frequency: 2, decay: 0 });
            const highFreq = new Shake(frame2, { intensity: 0.5, frequency: 20, decay: 0 });

            lowFreq.duration(1);
            highFreq.duration(1);

            let lowChanges = 0;
            let highChanges = 0;
            let prevLowX = 0;
            let prevHighX = 0;

            for (let i = 0; i <= 20; i++) {
                const progress = i / 20;
                lowFreq.interpolate(progress);
                highFreq.interpolate(progress);

                if (i > 0) {
                    if (Math.sign(frame1.position.x) !== Math.sign(prevLowX) && prevLowX !== 0) {
                        lowChanges++;
                    }
                    if (Math.sign(frame2.position.x) !== Math.sign(prevHighX) && prevHighX !== 0) {
                        highChanges++;
                    }
                }
                prevLowX = frame1.position.x;
                prevHighX = frame2.position.x;
            }

            expect(highChanges).toBeGreaterThanOrEqual(lowChanges);
        });
    });

    describe('Decay Parameter', () => {
        it('should reduce intensity over time with decay', () => {
            const frame = new CameraFrame();
            frame.pos(0, 0);
            const shake = new Shake(frame, { intensity: 1.0, decay: 1 });

            shake.interpolate(0.1);
            const earlyDisplacement = Math.sqrt(
                frame.position.x ** 2 + frame.position.y ** 2
            );

            frame.pos(0, 0);
            shake.interpolate(0.9);
            const lateDisplacement = Math.sqrt(
                frame.position.x ** 2 + frame.position.y ** 2
            );

            expect(earlyDisplacement).toBeGreaterThan(lateDisplacement);
        });

        it('should maintain intensity with high decay value (no decay)', () => {
            const frame = new CameraFrame();
            frame.pos(0, 0);
            const shake = new Shake(frame, { intensity: 0.5, frequency: 10, decay: 100 });
            shake.duration(1);

            const displacements: number[] = [];
            for (let i = 1; i <= 9; i++) {
                shake.interpolate(i / 10);
                displacements.push(Math.sqrt(
                    frame.position.x ** 2 + frame.position.y ** 2
                ));
            }

            const avgFirst = (displacements[0]! + displacements[1]! + displacements[2]!) / 3;
            const avgLast = (displacements[6]! + displacements[7]! + displacements[8]!) / 3;

            expect(avgLast).toBeGreaterThan(avgFirst * 0.1);
        });
    });

    describe('Edge Cases', () => {
        it('should work with default config', () => {
            const frame = new CameraFrame();
            frame.pos(0, 0);
            const shake = new Shake(frame);

            expect(() => shake.interpolate(0.5)).not.toThrow();
        });

        it('should preserve original position reference', () => {
            const frame = new CameraFrame();
            frame.pos(10, 20);
            const shake = new Shake(frame);

            shake.interpolate(0.5);
            shake.interpolate(1);

            expect(frame.position.x).toBeCloseTo(10, 5);
            expect(frame.position.y).toBeCloseTo(20, 5);
        });
    });
});
