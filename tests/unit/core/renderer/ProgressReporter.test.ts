import { describe, test, expect } from 'bun:test';
import { ProgressReporter } from '../../../../src/core/renderer/ProgressReporter';
import type { RenderProgress } from '../../../../src/core/renderer/types';

describe('ProgressReporter', () => {
    describe('constructor', () => {
        test('initializes with totalFrames', () => {
            const reporter = new ProgressReporter(100);
            // No callback, so nothing happens
            reporter.reportFrame(0);
        });

        test('accepts optional callback', () => {
            const updates: RenderProgress[] = [];
            const reporter = new ProgressReporter(10, (p) => updates.push(p));
            reporter.reportFrame(0);
            expect(updates.length).toBe(1);
        });
    });

    describe('reportFrame', () => {
        test('calculates percentage correctly', () => {
            const updates: RenderProgress[] = [];
            const reporter = new ProgressReporter(10, (p) => updates.push(p));

            reporter.reportFrame(0); // 1/10 = 10%
            reporter.reportFrame(4); // 5/10 = 50%
            reporter.reportFrame(9); // 10/10 = 100%

            expect(updates[0]?.percentage).toBeCloseTo(10, 0);
            expect(updates[1]?.percentage).toBeCloseTo(50, 0);
            expect(updates[2]?.percentage).toBeCloseTo(100, 0);
        });

        test('includes correct frame information', () => {
            const updates: RenderProgress[] = [];
            const reporter = new ProgressReporter(100, (p) => updates.push(p));

            reporter.reportFrame(42);

            const progress = updates[0];
            expect(progress?.currentFrame).toBe(42);
            expect(progress?.totalFrames).toBe(100);
        });

        test('tracks elapsed time', () => {
            const updates: RenderProgress[] = [];
            const reporter = new ProgressReporter(10, (p) => updates.push(p));

            reporter.reportFrame(0);

            expect(updates[0]?.elapsedMs).toBeGreaterThanOrEqual(0);
        });

        test('estimates remaining time', () => {
            const updates: RenderProgress[] = [];
            const reporter = new ProgressReporter(10, (p) => updates.push(p));

            reporter.reportFrame(4); // 5 frames complete, 5 remaining

            // Remaining estimate should be non-negative
            expect(updates[0]?.estimatedRemainingMs).toBeGreaterThanOrEqual(0);
        });

        test('clamps percentage to [0, 100]', () => {
            const updates: RenderProgress[] = [];
            const reporter = new ProgressReporter(5, (p) => updates.push(p));

            reporter.reportFrame(10); // Beyond total frames

            expect(updates[0]?.percentage).toBeLessThanOrEqual(100);
            expect(updates[0]?.percentage).toBeGreaterThanOrEqual(0);
        });
    });

    describe('complete', () => {
        test('reports 100% progress', () => {
            const updates: RenderProgress[] = [];
            const reporter = new ProgressReporter(10, (p) => updates.push(p));

            reporter.complete();

            expect(updates[0]?.percentage).toBe(100);
            expect(updates[0]?.estimatedRemainingMs).toBe(0);
        });

        test('reports last frame index', () => {
            const updates: RenderProgress[] = [];
            const reporter = new ProgressReporter(10, (p) => updates.push(p));

            reporter.complete();

            expect(updates[0]?.currentFrame).toBe(9); // 0-indexed last frame
        });

        test('does nothing without callback', () => {
            const reporter = new ProgressReporter(10);
            // Should not throw
            reporter.complete();
        });
    });

    describe('edge cases', () => {
        test('handles zero total frames', () => {
            const updates: RenderProgress[] = [];
            const reporter = new ProgressReporter(0, (p) => updates.push(p));

            reporter.reportFrame(0);

            expect(updates[0]?.percentage).toBe(100);
        });

        test('handles single frame', () => {
            const updates: RenderProgress[] = [];
            const reporter = new ProgressReporter(1, (p) => updates.push(p));

            reporter.reportFrame(0);

            expect(updates[0]?.percentage).toBe(100);
            expect(updates[0]?.estimatedRemainingMs).toBe(0);
        });
    });
});
