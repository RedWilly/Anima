import { describe, it, expect } from 'bun:test';
import * as fc from 'fast-check';
import { Animation, defaultEasing, easeInQuad, smooth, linear } from '../../../../src/core/animations';
import { Mobject } from '../../../../src/mobjects/Mobject';
import type { EasingFunction } from '../../../../src/core/animations/easing';

/**
 * Concrete Animation subclass for testing the base class.
 * Simply tracks interpolate calls.
 */
class TestAnimation extends Animation<Mobject> {
    interpolateCalls: number[] = [];

    interpolate(progress: number): void {
        this.interpolateCalls.push(progress);
    }
}

describe('Animation Base Class', () => {
    describe('Constructor', () => {
        it('should store the target Mobject', () => {
            const target = new Mobject();
            const anim = new TestAnimation(target);
            expect(anim.getTarget()).toBe(target);
        });

        it('should set default duration to 1 second', () => {
            const anim = new TestAnimation(new Mobject());
            expect(anim.getDuration()).toBe(1);
        });

        it('should set default easing to smooth', () => {
            const anim = new TestAnimation(new Mobject());
            expect(anim.getEasing()).toBe(defaultEasing);
            expect(anim.getEasing()).toBe(smooth);
        });

        it('should set default delay to 0', () => {
            const anim = new TestAnimation(new Mobject());
            expect(anim.getDelay()).toBe(0);
        });
    });

    describe('duration() method', () => {
        it('should change the duration', () => {
            const anim = new TestAnimation(new Mobject());
            anim.duration(2);
            expect(anim.getDuration()).toBe(2);
        });

        it('should return this for chaining', () => {
            const anim = new TestAnimation(new Mobject());
            const result = anim.duration(2);
            expect(result).toBe(anim);
        });

        it('should throw for non-positive duration', () => {
            const anim = new TestAnimation(new Mobject());
            expect(() => anim.duration(0)).toThrow('Duration must be positive');
            expect(() => anim.duration(-1)).toThrow('Duration must be positive');
        });
    });

    describe('ease() method', () => {
        it('should change the easing function', () => {
            const anim = new TestAnimation(new Mobject());
            anim.ease(easeInQuad);
            expect(anim.getEasing()).toBe(easeInQuad);
        });

        it('should return this for chaining', () => {
            const anim = new TestAnimation(new Mobject());
            const result = anim.ease(linear);
            expect(result).toBe(anim);
        });
    });

    describe('delay() method', () => {
        it('should change the delay', () => {
            const anim = new TestAnimation(new Mobject());
            anim.delay(0.5);
            expect(anim.getDelay()).toBe(0.5);
        });

        it('should return this for chaining', () => {
            const anim = new TestAnimation(new Mobject());
            const result = anim.delay(0.5);
            expect(result).toBe(anim);
        });

        it('should throw for negative delay', () => {
            const anim = new TestAnimation(new Mobject());
            expect(() => anim.delay(-1)).toThrow('Delay must be non-negative');
        });

        it('should allow zero delay', () => {
            const anim = new TestAnimation(new Mobject());
            anim.delay(0);
            expect(anim.getDelay()).toBe(0);
        });
    });

    describe('Fluent chaining', () => {
        it('should support full chain', () => {
            const anim = new TestAnimation(new Mobject());
            const result = anim.duration(2).ease(easeInQuad).delay(0.5);

            expect(result).toBe(anim);
            expect(anim.getDuration()).toBe(2);
            expect(anim.getEasing()).toBe(easeInQuad);
            expect(anim.getDelay()).toBe(0.5);
        });
    });

    describe('getConfig()', () => {
        it('should return full configuration', () => {
            const anim = new TestAnimation(new Mobject());
            anim.duration(3).ease(linear).delay(1);

            const config = anim.getConfig();
            expect(config.durationSeconds).toBe(3);
            expect(config.easing).toBe(linear);
            expect(config.delaySeconds).toBe(1);
        });
    });

    describe('update() method', () => {
        it('should apply easing and call interpolate', () => {
            const anim = new TestAnimation(new Mobject());
            anim.ease(linear);
            anim.update(0.5);
            expect(anim.interpolateCalls).toEqual([0.5]);
        });

        it('should clamp progress below 0', () => {
            const anim = new TestAnimation(new Mobject());
            anim.ease(linear);
            anim.update(-0.5);
            expect(anim.interpolateCalls).toEqual([0]);
        });

        it('should clamp progress above 1', () => {
            const anim = new TestAnimation(new Mobject());
            anim.ease(linear);
            anim.update(1.5);
            expect(anim.interpolateCalls).toEqual([1]);
        });

        it('should apply easing function', () => {
            const anim = new TestAnimation(new Mobject());
            // easeInQuad: t => t * t
            anim.ease(easeInQuad);
            anim.update(0.5);
            // 0.5 * 0.5 = 0.25
            expect(anim.interpolateCalls[0]).toBeCloseTo(0.25, 5);
        });
    });

    describe('Property-based tests', () => {
        it('should accept any positive duration', () => {
            fc.assert(
                fc.property(
                    fc.double({ min: 0.001, max: 1000, noNaN: true, noDefaultInfinity: true }),
                    (dur) => {
                        const anim = new TestAnimation(new Mobject());
                        anim.duration(dur);
                        return anim.getDuration() === dur;
                    }
                )
            );
        });

        it('should accept any non-negative delay', () => {
            fc.assert(
                fc.property(
                    fc.double({ min: 0, max: 1000, noNaN: true, noDefaultInfinity: true }),
                    (del) => {
                        const anim = new TestAnimation(new Mobject());
                        anim.delay(del);
                        return anim.getDelay() === del;
                    }
                )
            );
        });

        it('should clamp progress to [0, 1] before easing', () => {
            fc.assert(
                fc.property(
                    fc.double({ min: -10, max: 10, noNaN: true, noDefaultInfinity: true }),
                    (progress) => {
                        const anim = new TestAnimation(new Mobject());
                        anim.ease(linear);
                        anim.update(progress);
                        const result = anim.interpolateCalls[0];
                        return result !== undefined && result >= 0 && result <= 1;
                    }
                )
            );
        });
    });
});
