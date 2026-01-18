import { describe, it, expect } from 'bun:test';
import { ProAPIScene } from '../../../examples/ProAPIScene';
import { FluentAPIScene } from '../../../examples/FluentAPIScene';
import { MixedAPIScene } from '../../../examples/MixedAPIScene';
import { SimpleScene } from '../../../examples/SimpleScene';

describe('Example Scenes', () => {
    describe('SimpleScene', () => {
        it('should instantiate without errors', () => {
            expect(() => new SimpleScene()).not.toThrow();
        });

        it('should have mobjects registered', () => {
            const scene = new SimpleScene();
            expect(scene.getMobjects().length).toBeGreaterThan(0);
        });

        it('should have animations scheduled', () => {
            const scene = new SimpleScene();
            expect(scene.getTotalDuration()).toBeGreaterThan(0);
        });

        it('should have visible mobjects after seeking to end', () => {
            const scene = new SimpleScene();
            const timeline = scene.getTimeline();
            timeline.seek(scene.getTotalDuration());

            const mobjects = scene.getMobjects();
            // At least one mobject should have opacity > 0
            const hasVisible = mobjects.some(m => m.opacity > 0);
            expect(hasVisible).toBe(true);
        });
    });

    describe('ProAPIScene', () => {
        it('should instantiate without errors', () => {
            expect(() => new ProAPIScene()).not.toThrow();
        });

        it('should have mobjects registered', () => {
            const scene = new ProAPIScene();
            expect(scene.getMobjects().length).toBeGreaterThan(0);
        });

        it('should have animations scheduled', () => {
            const scene = new ProAPIScene();
            expect(scene.getTotalDuration()).toBeGreaterThan(0);
        });

        it('should have visible mobjects after intro animation (t=1.0s)', () => {
            const scene = new ProAPIScene();
            const timeline = scene.getTimeline();
            const mobjects = scene.getMobjects();

            // At t=1.0s, FadeIn (0-0.5s) is complete, so opacity should be 1
            timeline.seek(1.0);

            // All mobjects should be visible after intro
            const visibleMobjects = mobjects.filter(m => m.opacity > 0);
            expect(visibleMobjects.length).toBeGreaterThan(0);
        });

        it('FadeOut should gradually decrease opacity', () => {
            const scene = new ProAPIScene();
            const timeline = scene.getTimeline();

            // FadeOut starts at 2.5s and ends at 3.0s
            // First, check that opacity is 1 before FadeOut
            timeline.seek(2.4);
            const mobjects = scene.getMobjects();
            const opacitiesBefore = mobjects.map(m => m.opacity);

            // At midpoint of FadeOut (t=2.75), opacity should be around 0.5
            timeline.seek(2.75);
            const opacitiesMid = mobjects.map(m => m.opacity);

            // At end (t=3.0), opacity should be 0
            timeline.seek(3.0);
            const opacitiesEnd = mobjects.map(m => m.opacity);

            // Verify FadeOut starts from 1 and ends at 0
            expect(opacitiesBefore[0]).toBe(1);
            expect(opacitiesMid[0]).toBeCloseTo(0.5, 1);
            expect(opacitiesEnd[0]).toBe(0);
        });

        it('mobjects should move during animation', () => {
            const scene = new ProAPIScene();
            const timeline = scene.getTimeline();
            const mobjects = scene.getMobjects();

            // Get initial positions
            timeline.seek(0);
            const initialPositions = mobjects.map(m => ({ x: m.position.x, y: m.position.y }));

            // Seek to midpoint
            timeline.seek(1.5);
            const midPositions = mobjects.map(m => ({ x: m.position.x, y: m.position.y }));

            // At least one position should have changed
            const hasMovement = initialPositions.some((pos, i) => {
                const mid = midPositions[i];
                return mid && (pos.x !== mid.x || pos.y !== mid.y);
            });
            expect(hasMovement).toBe(true);
        });
    });

    describe('FluentAPIScene', () => {
        it('should instantiate without errors', () => {
            expect(() => new FluentAPIScene()).not.toThrow();
        });

        it('should have mobjects registered', () => {
            const scene = new FluentAPIScene();
            expect(scene.getMobjects().length).toBeGreaterThan(0);
        });

        it('should have animations scheduled', () => {
            const scene = new FluentAPIScene();
            expect(scene.getTotalDuration()).toBeGreaterThan(0);
        });
    });

    describe('MixedAPIScene', () => {
        it('should instantiate without errors', () => {
            expect(() => new MixedAPIScene()).not.toThrow();
        });

        it('should have mobjects registered', () => {
            const scene = new MixedAPIScene();
            expect(scene.getMobjects().length).toBeGreaterThan(0);
        });

        it('should have animations scheduled', () => {
            const scene = new MixedAPIScene();
            expect(scene.getTotalDuration()).toBeGreaterThan(0);
        });
    });
});
