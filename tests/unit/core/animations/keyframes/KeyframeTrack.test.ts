import { describe, expect, it } from 'bun:test';
import * as fc from 'fast-check';
import { KeyframeTrack } from '../../../../../src/core/animations/keyframes';
import { easeInQuad, easeOutQuad } from '../../../../../src/core/animations/easing';

describe('KeyframeTrack', () => {
    describe('construction', () => {
        it('creates empty track', () => {
            const track = new KeyframeTrack();
            expect(track.getKeyframeCount()).toBe(0);
            expect(track.getKeyframes()).toEqual([]);
        });
    });

    describe('addKeyframe', () => {
        it('adds keyframe at time 0', () => {
            const track = new KeyframeTrack();
            track.addKeyframe(0, 100);
            expect(track.getKeyframeCount()).toBe(1);
            expect(track.getKeyframes()[0]?.value).toBe(100);
        });

        it('adds keyframe at time 1', () => {
            const track = new KeyframeTrack();
            track.addKeyframe(1, 200);
            expect(track.getKeyframeCount()).toBe(1);
            expect(track.getKeyframes()[0]?.value).toBe(200);
        });

        it('adds keyframe with easing', () => {
            const track = new KeyframeTrack();
            track.addKeyframe(0.5, 150, easeInQuad);
            expect(track.getKeyframes()[0]?.easing).toBe(easeInQuad);
        });

        it('throws for time < 0', () => {
            const track = new KeyframeTrack();
            expect(() => track.addKeyframe(-0.1, 100)).toThrow('Keyframe time must be in [0, 1]');
        });

        it('throws for time > 1', () => {
            const track = new KeyframeTrack();
            expect(() => track.addKeyframe(1.1, 100)).toThrow('Keyframe time must be in [0, 1]');
        });

        it('replaces keyframe at same time', () => {
            const track = new KeyframeTrack();
            track.addKeyframe(0.5, 100);
            track.addKeyframe(0.5, 200);
            expect(track.getKeyframeCount()).toBe(1);
            expect(track.getKeyframes()[0]?.value).toBe(200);
        });

        it('sorts keyframes by time', () => {
            const track = new KeyframeTrack();
            track.addKeyframe(1, 300);
            track.addKeyframe(0, 100);
            track.addKeyframe(0.5, 200);
            const times = track.getKeyframes().map((kf) => kf.time);
            expect(times).toEqual([0, 0.5, 1]);
        });

        it('returns this for chaining', () => {
            const track = new KeyframeTrack();
            const result = track.addKeyframe(0, 100);
            expect(result).toBe(track);
        });
    });

    describe('removeKeyframe', () => {
        it('removes existing keyframe', () => {
            const track = new KeyframeTrack();
            track.addKeyframe(0.5, 100);
            const removed = track.removeKeyframe(0.5);
            expect(removed).toBe(true);
            expect(track.getKeyframeCount()).toBe(0);
        });

        it('returns false for non-existent keyframe', () => {
            const track = new KeyframeTrack();
            track.addKeyframe(0.5, 100);
            const removed = track.removeKeyframe(0.7);
            expect(removed).toBe(false);
            expect(track.getKeyframeCount()).toBe(1);
        });
    });

    describe('getKeyframe', () => {
        it('returns keyframe at specified time', () => {
            const track = new KeyframeTrack();
            track.addKeyframe(0.5, 100, easeInQuad);
            const keyframe = track.getKeyframe(0.5);
            expect(keyframe).toBeDefined();
            expect(keyframe?.value).toBe(100);
            expect(keyframe?.easing).toBe(easeInQuad);
        });

        it('returns undefined for non-existent time', () => {
            const track = new KeyframeTrack();
            track.addKeyframe(0.5, 100);
            expect(track.getKeyframe(0.7)).toBeUndefined();
        });

        it('returns undefined for empty track', () => {
            const track = new KeyframeTrack();
            expect(track.getKeyframe(0.5)).toBeUndefined();
        });
    });

    describe('setKeyframe', () => {
        it('modifies existing keyframe value', () => {
            const track = new KeyframeTrack();
            track.addKeyframe(0.5, 100);
            const modified = track.setKeyframe(0.5, 200);
            expect(modified).toBe(true);
            expect(track.getKeyframe(0.5)?.value).toBe(200);
        });

        it('modifies existing keyframe easing', () => {
            const track = new KeyframeTrack();
            track.addKeyframe(0.5, 100);
            track.setKeyframe(0.5, 100, easeOutQuad);
            expect(track.getKeyframe(0.5)?.easing).toBe(easeOutQuad);
        });

        it('preserves existing easing if not provided', () => {
            const track = new KeyframeTrack();
            track.addKeyframe(0.5, 100, easeInQuad);
            track.setKeyframe(0.5, 200);
            expect(track.getKeyframe(0.5)?.easing).toBe(easeInQuad);
        });

        it('returns false for non-existent keyframe', () => {
            const track = new KeyframeTrack();
            track.addKeyframe(0.5, 100);
            const modified = track.setKeyframe(0.7, 200);
            expect(modified).toBe(false);
            expect(track.getKeyframeCount()).toBe(1);
        });

        it('does not create new keyframe', () => {
            const track = new KeyframeTrack();
            track.setKeyframe(0.5, 100);
            expect(track.getKeyframeCount()).toBe(0);
        });
    });

    describe('keyframe modification affects animation', () => {
        it('modifying keyframe value changes getValueAt output', () => {
            const track = new KeyframeTrack();
            track.addKeyframe(0, 0).addKeyframe(1, 100);

            expect(track.getValueAt(0.5)).toBe(50);

            track.setKeyframe(1, 200);
            expect(track.getValueAt(0.5)).toBe(100);
        });

        it('modifying keyframe easing changes interpolation', () => {
            const track = new KeyframeTrack();
            track.addKeyframe(0, 0).addKeyframe(1, 100);

            const linearValue = track.getValueAt(0.5);

            track.setKeyframe(1, 100, easeOutQuad);
            const easedValue = track.getValueAt(0.5);

            expect(easedValue).not.toBe(linearValue);
            expect(easedValue).toBeGreaterThan(linearValue);
        });
    });

    describe('getValueAt', () => {
        it('throws for empty track', () => {
            const track = new KeyframeTrack();
            expect(() => track.getValueAt(0.5)).toThrow('KeyframeTrack has no keyframes');
        });

        it('returns value at time 0', () => {
            const track = new KeyframeTrack();
            track.addKeyframe(0, 100).addKeyframe(1, 200);
            expect(track.getValueAt(0)).toBe(100);
        });

        it('returns value at time 1', () => {
            const track = new KeyframeTrack();
            track.addKeyframe(0, 100).addKeyframe(1, 200);
            expect(track.getValueAt(1)).toBe(200);
        });

        it('returns interpolated value at time 0.5', () => {
            const track = new KeyframeTrack();
            track.addKeyframe(0, 0).addKeyframe(1, 100);
            expect(track.getValueAt(0.5)).toBe(50);
        });

        it('interpolates between non-boundary keyframes', () => {
            const track = new KeyframeTrack();
            track.addKeyframe(0.2, 0).addKeyframe(0.8, 60);
            // At 0.5: (0.5 - 0.2) / (0.8 - 0.2) = 0.3 / 0.6 = 0.5
            expect(track.getValueAt(0.5)).toBeCloseTo(30);
        });

        it('applies easing to interpolation', () => {
            const track = new KeyframeTrack();
            track.addKeyframe(0, 0).addKeyframe(1, 100, easeOutQuad);
            // easeOut at 0.5 should be > 0.5 (faster start)
            const value = track.getValueAt(0.5);
            expect(value).toBeGreaterThan(50);
        });

        it('clamps time below 0', () => {
            const track = new KeyframeTrack();
            track.addKeyframe(0, 100).addKeyframe(1, 200);
            expect(track.getValueAt(-0.5)).toBe(100);
        });

        it('clamps time above 1', () => {
            const track = new KeyframeTrack();
            track.addKeyframe(0, 100).addKeyframe(1, 200);
            expect(track.getValueAt(1.5)).toBe(200);
        });

        it('returns first keyframe value before first keyframe time', () => {
            const track = new KeyframeTrack();
            track.addKeyframe(0.3, 100).addKeyframe(0.7, 200);
            expect(track.getValueAt(0)).toBe(100);
        });

        it('returns last keyframe value after last keyframe time', () => {
            const track = new KeyframeTrack();
            track.addKeyframe(0.3, 100).addKeyframe(0.7, 200);
            expect(track.getValueAt(1)).toBe(200);
        });
    });

    describe('property-based tests', () => {
        it('interpolated values are bounded by keyframe values', () => {
            fc.assert(
                fc.property(
                    fc.float({ min: 0, max: 100, noNaN: true }),
                    fc.float({ min: 100, max: 200, noNaN: true }),
                    fc.float({ min: 0, max: 1, noNaN: true }),
                    (v1, v2, t) => {
                        const track = new KeyframeTrack();
                        track.addKeyframe(0, v1).addKeyframe(1, v2);
                        const value = track.getValueAt(t);
                        const min = Math.min(v1, v2);
                        const max = Math.max(v1, v2);
                        return value >= min - 0.001 && value <= max + 0.001;
                    }
                )
            );
        });

        it('getValueAt(0) equals first keyframe value', () => {
            fc.assert(
                fc.property(fc.float({ min: -1000, max: 1000, noNaN: true }), (v) => {
                    const track = new KeyframeTrack();
                    track.addKeyframe(0, v).addKeyframe(1, v + 100);
                    return track.getValueAt(0) === v;
                })
            );
        });

        it('getValueAt(1) equals last keyframe value', () => {
            fc.assert(
                fc.property(fc.float({ min: -1000, max: 1000, noNaN: true }), (v) => {
                    const track = new KeyframeTrack();
                    track.addKeyframe(0, v).addKeyframe(1, v + 100);
                    return track.getValueAt(1) === v + 100;
                })
            );
        });
    });
});
