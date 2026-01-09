import { describe, it, expect, beforeEach } from 'bun:test';
import {
    linear,
    easeInQuad,
    easeOutQuad,
    easeInOutQuad,
    easeInCubic,
    easeOutCubic,
    easeInOutCubic,
    easeInQuart,
    easeOutQuart,
    easeInOutQuart,
    easeInQuint,
    easeOutQuint,
    easeInOutQuint,
    easeInSine,
    easeOutSine,
    easeInOutSine,
    easeInExpo,
    easeOutExpo,
    easeInOutExpo,
    easeInCirc,
    easeOutCirc,
    easeInOutCirc,
    easeInBack,
    easeOutBack,
    easeInOutBack,
    easeInElastic,
    easeOutElastic,
    easeInOutElastic,
    easeInBounce,
    easeOutBounce,
    easeInOutBounce,
    smooth,
    doubleSmooth,
    rushInto,
    rushFrom,
    slowInto,
    thereAndBack,
    thereAndBackWithPause,
    runningStart,
    wiggle,
    notQuiteThere,
    lingering,
    exponentialDecay,
    defaultEasing,
    registerEasing,
    getEasing,
    hasEasing,
    unregisterEasing,
    clearRegistry,
} from '../../../../src/core/animations/easing';
import type { EasingFunction } from '../../../../src/core/animations/easing';

// All standard easing functions to test
const standardEasings: Array<{ name: string; fn: EasingFunction }> = [
    { name: 'linear', fn: linear },
    { name: 'easeInQuad', fn: easeInQuad },
    { name: 'easeOutQuad', fn: easeOutQuad },
    { name: 'easeInOutQuad', fn: easeInOutQuad },
    { name: 'easeInCubic', fn: easeInCubic },
    { name: 'easeOutCubic', fn: easeOutCubic },
    { name: 'easeInOutCubic', fn: easeInOutCubic },
    { name: 'easeInQuart', fn: easeInQuart },
    { name: 'easeOutQuart', fn: easeOutQuart },
    { name: 'easeInOutQuart', fn: easeInOutQuart },
    { name: 'easeInQuint', fn: easeInQuint },
    { name: 'easeOutQuint', fn: easeOutQuint },
    { name: 'easeInOutQuint', fn: easeInOutQuint },
    { name: 'easeInSine', fn: easeInSine },
    { name: 'easeOutSine', fn: easeOutSine },
    { name: 'easeInOutSine', fn: easeInOutSine },
    { name: 'easeInExpo', fn: easeInExpo },
    { name: 'easeOutExpo', fn: easeOutExpo },
    { name: 'easeInOutExpo', fn: easeInOutExpo },
    { name: 'easeInCirc', fn: easeInCirc },
    { name: 'easeOutCirc', fn: easeOutCirc },
    { name: 'easeInOutCirc', fn: easeInOutCirc },
    { name: 'easeInBack', fn: easeInBack },
    { name: 'easeOutBack', fn: easeOutBack },
    { name: 'easeInOutBack', fn: easeInOutBack },
    { name: 'easeInElastic', fn: easeInElastic },
    { name: 'easeOutElastic', fn: easeOutElastic },
    { name: 'easeInOutElastic', fn: easeInOutElastic },
    { name: 'easeInBounce', fn: easeInBounce },
    { name: 'easeOutBounce', fn: easeOutBounce },
    { name: 'easeInOutBounce', fn: easeInOutBounce },
];

// Manim-style rate functions to test (that satisfy f(0)=0 and f(1)=1)
const manimEasings: Array<{ name: string; fn: EasingFunction }> = [
    { name: 'smooth', fn: smooth },
    { name: 'doubleSmooth', fn: doubleSmooth },
    { name: 'rushInto', fn: rushInto },
    { name: 'rushFrom', fn: rushFrom },
    { name: 'slowInto', fn: slowInto },
    { name: 'wiggle', fn: wiggle },
];

describe('Easing Functions', () => {
    describe('Standard Easings - Boundary Conditions', () => {
        for (const { name, fn } of standardEasings) {
            it(`${name}(0) should equal 0`, () => {
                expect(fn(0)).toBeCloseTo(0, 5);
            });

            it(`${name}(1) should equal 1`, () => {
                expect(fn(1)).toBeCloseTo(1, 5);
            });
        }
    });

    describe('Manim Easings - Boundary Conditions', () => {
        for (const { name, fn } of manimEasings) {
            it(`${name}(0) should equal 0`, () => {
                expect(fn(0)).toBeCloseTo(0, 5);
            });

            it(`${name}(1) should equal 1`, () => {
                expect(fn(1)).toBeCloseTo(1, 5);
            });
        }
    });

    describe('Linear Easing', () => {
        it('should be strictly monotonic', () => {
            let prev = 0;
            for (let t = 0.1; t <= 1; t += 0.1) {
                const current = linear(t);
                expect(current).toBeGreaterThan(prev);
                prev = current;
            }
        });

        it('should return exact input value', () => {
            expect(linear(0.25)).toBe(0.25);
            expect(linear(0.5)).toBe(0.5);
            expect(linear(0.75)).toBe(0.75);
        });
    });

    describe('Smooth Easing (Manim Default)', () => {
        it('should be the default easing', () => {
            expect(defaultEasing).toBe(smooth);
        });

        it('should have smooth S-curve behavior', () => {
            // Smooth should be slower at start and end
            expect(smooth(0.1)).toBeLessThan(0.1);
            expect(smooth(0.9)).toBeGreaterThan(0.9);
            // Midpoint should be 0.5
            expect(smooth(0.5)).toBeCloseTo(0.5, 5);
        });

        it('should produce values in valid range', () => {
            for (let t = 0; t <= 1; t += 0.05) {
                const value = smooth(t);
                expect(value).toBeGreaterThanOrEqual(0);
                expect(value).toBeLessThanOrEqual(1);
            }
        });
    });

    describe('EaseIn Functions', () => {
        it('easeInQuad should start slow', () => {
            // At t=0.5, easeIn should be less than 0.5
            expect(easeInQuad(0.5)).toBeLessThan(0.5);
        });

        it('easeInCubic should start slower than quad', () => {
            expect(easeInCubic(0.5)).toBeLessThan(easeInQuad(0.5));
        });
    });

    describe('EaseOut Functions', () => {
        it('easeOutQuad should end slow', () => {
            // At t=0.5, easeOut should be greater than 0.5
            expect(easeOutQuad(0.5)).toBeGreaterThan(0.5);
        });

        it('easeOutCubic should be faster at start than quad', () => {
            expect(easeOutCubic(0.25)).toBeGreaterThan(easeOutQuad(0.25));
        });
    });

    describe('EaseInOut Functions', () => {
        it('easeInOutQuad should be symmetric', () => {
            // Value at 0.25 + value at 0.75 should equal 1
            const sum = easeInOutQuad(0.25) + easeInOutQuad(0.75);
            expect(sum).toBeCloseTo(1, 5);
        });

        it('easeInOutQuad midpoint should be 0.5', () => {
            expect(easeInOutQuad(0.5)).toBeCloseTo(0.5, 5);
        });
    });

    describe('thereAndBack', () => {
        it('should return to 0 at t=1', () => {
            expect(thereAndBack(1)).toBeCloseTo(0, 5);
        });

        it('should peak at t=0.5', () => {
            expect(thereAndBack(0.5)).toBeCloseTo(1, 5);
        });

        it('should be symmetric', () => {
            expect(thereAndBack(0.25)).toBeCloseTo(thereAndBack(0.75), 5);
        });
    });

    describe('Factory Functions', () => {
        it('thereAndBackWithPause should create valid easing', () => {
            const fn = thereAndBackWithPause(0.4);
            expect(fn(0)).toBeCloseTo(0, 5);
            expect(fn(0.5)).toBeCloseTo(1, 5);
            expect(fn(1)).toBeCloseTo(0, 5);
        });

        it('runningStart should create valid easing', () => {
            const fn = runningStart(0.3);
            expect(fn(0)).toBeCloseTo(0, 5);
            expect(fn(1)).toBeCloseTo(1, 5);
        });

        it('notQuiteThere should not reach 1 before t=1', () => {
            const fn = notQuiteThere(0.8);
            expect(fn(0.9)).toBeLessThan(1);
            expect(fn(1)).toBeCloseTo(1, 5);
        });

        it('lingering should reach 1 early', () => {
            const fn = lingering(0.5);
            expect(fn(0.5)).toBeCloseTo(1, 5);
            expect(fn(0.75)).toBeCloseTo(1, 5);
            expect(fn(1)).toBeCloseTo(1, 5);
        });

        it('exponentialDecay should approach 1', () => {
            const fn = exponentialDecay(0.2);
            expect(fn(0)).toBeCloseTo(0, 5);
            expect(fn(1)).toBeCloseTo(1, 5);
            expect(fn(0.5)).toBeGreaterThan(0.5);
        });
    });
});

describe('Easing Registry', () => {
    beforeEach(() => {
        clearRegistry();
    });

    it('should register a custom easing', () => {
        const customFn: EasingFunction = (t) => t * t * t;
        registerEasing('myCubic', customFn);
        expect(hasEasing('myCubic')).toBe(true);
    });

    it('should retrieve a registered easing', () => {
        const customFn: EasingFunction = (t) => t * t;
        registerEasing('myQuad', customFn);
        const retrieved = getEasing('myQuad');
        expect(retrieved).toBe(customFn);
    });

    it('should return undefined for non-existent easing', () => {
        expect(getEasing('nonExistent')).toBeUndefined();
    });

    it('should throw error when registering duplicate name', () => {
        registerEasing('test', (t) => t);
        expect(() => registerEasing('test', (t) => t * t)).toThrow();
    });

    it('should unregister an easing', () => {
        registerEasing('toRemove', (t) => t);
        expect(hasEasing('toRemove')).toBe(true);
        unregisterEasing('toRemove');
        expect(hasEasing('toRemove')).toBe(false);
    });

    it('should clear all registered easings', () => {
        registerEasing('a', (t) => t);
        registerEasing('b', (t) => t);
        clearRegistry();
        expect(hasEasing('a')).toBe(false);
        expect(hasEasing('b')).toBe(false);
    });
});
