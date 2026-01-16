import { describe, expect, it } from 'bun:test';
import { KeyframeAnimation, KeyframeTrack } from '../../../../../src/core/animations/keyframes';
import { Mobject } from '../../../../../src/mobjects/Mobject';
import { smooth } from '../../../../../src/core/animations/easing';

describe('KeyframeAnimation', () => {
    describe('construction', () => {
        it('creates animation with target', () => {
            const target = new Mobject();
            const anim = new KeyframeAnimation(target);
            expect(anim.getTarget()).toBe(target);
        });

        it('has default duration of 1 second', () => {
            const target = new Mobject();
            const anim = new KeyframeAnimation(target);
            expect(anim.getDuration()).toBe(1);
        });

        it('has default easing of smooth', () => {
            const target = new Mobject();
            const anim = new KeyframeAnimation(target);
            expect(anim.getEasing()).toBe(smooth);
        });

        it('starts with no tracks', () => {
            const target = new Mobject();
            const anim = new KeyframeAnimation(target);
            expect(anim.getTrackNames()).toEqual([]);
        });
    });

    describe('addTrack', () => {
        it('adds a named track', () => {
            const target = new Mobject();
            const anim = new KeyframeAnimation(target);
            const track = new KeyframeTrack();
            track.addKeyframe(0, 0).addKeyframe(1, 100);

            anim.addTrack('opacity', track, (t, v) => t.setOpacity(v));

            expect(anim.getTrackNames()).toEqual(['opacity']);
        });

        it('returns this for chaining', () => {
            const target = new Mobject();
            const anim = new KeyframeAnimation(target);
            const track = new KeyframeTrack();

            const result = anim.addTrack('test', track, () => { });
            expect(result).toBe(anim);
        });
    });

    describe('getTrack', () => {
        it('returns track by name', () => {
            const target = new Mobject();
            const anim = new KeyframeAnimation(target);
            const track = new KeyframeTrack();
            track.addKeyframe(0, 0).addKeyframe(1, 100);

            anim.addTrack('opacity', track, () => { });

            expect(anim.getTrack('opacity')).toBe(track);
        });

        it('returns undefined for unknown track', () => {
            const target = new Mobject();
            const anim = new KeyframeAnimation(target);

            expect(anim.getTrack('unknown')).toBeUndefined();
        });
    });

    describe('interpolate', () => {
        it('applies opacity track values', () => {
            const target = new Mobject();
            target.setOpacity(0);
            const anim = new KeyframeAnimation(target);

            const opacityTrack = new KeyframeTrack();
            opacityTrack.addKeyframe(0, 0).addKeyframe(1, 1);
            anim.addTrack('opacity', opacityTrack, (t, v) => t.setOpacity(v));

            anim.interpolate(0);
            expect(target.opacity).toBe(0);

            anim.interpolate(0.5);
            expect(target.opacity).toBe(0.5);

            anim.interpolate(1);
            expect(target.opacity).toBe(1);
        });

        it('updates multiple tracks simultaneously', () => {
            const target = new Mobject();
            target.setOpacity(0);
            const anim = new KeyframeAnimation(target);

            const opacityTrack = new KeyframeTrack();
            opacityTrack.addKeyframe(0, 0).addKeyframe(1, 1);

            const rotationTrack = new KeyframeTrack();
            rotationTrack.addKeyframe(0, 0).addKeyframe(1, Math.PI);

            anim.addTrack('opacity', opacityTrack, (t, v) => t.setOpacity(v));
            anim.addTrack('rotation', rotationTrack, (t, v) => t.setRotation(v));

            anim.interpolate(0.5);

            expect(target.opacity).toBe(0.5);
            expect(target.rotation).toBeCloseTo(Math.PI / 2, 5);
        });

        it('works with update() which applies easing', () => {
            const target = new Mobject();
            target.setOpacity(0);
            const anim = new KeyframeAnimation(target);

            const opacityTrack = new KeyframeTrack();
            opacityTrack.addKeyframe(0, 0).addKeyframe(1, 1);
            anim.addTrack('opacity', opacityTrack, (t, v) => t.setOpacity(v));

            // update(1) should apply easing and call interpolate
            anim.update(1);
            expect(target.opacity).toBe(1);
        });
    });

    describe('inherits Animation behavior', () => {
        it('duration() modifies duration', () => {
            const target = new Mobject();
            const anim = new KeyframeAnimation(target);
            anim.duration(2);
            expect(anim.getDuration()).toBe(2);
        });

        it('delay() modifies delay', () => {
            const target = new Mobject();
            const anim = new KeyframeAnimation(target);
            anim.delay(0.5);
            expect(anim.getDelay()).toBe(0.5);
        });

        it('fluent chaining works', () => {
            const target = new Mobject();
            const track = new KeyframeTrack();

            const anim = new KeyframeAnimation(target)
                .duration(2)
                .delay(0.5)
                .addTrack('test', track, () => { });

            expect(anim.getDuration()).toBe(2);
            expect(anim.getDelay()).toBe(0.5);
            expect(anim.getTrackNames()).toEqual(['test']);
        });
    });
});
