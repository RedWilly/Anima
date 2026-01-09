import { describe, test, expect } from 'bun:test';
import * as fc from 'fast-check';
import {
    linear,
    easeInQuad,
    easeOutQuad,
    easeInOutQuad,
    easeInCubic,
    easeOutCubic,
    easeInOutCubic,
    easeInSine,
    easeOutSine,
    easeInOutSine,
    easeInExpo,
    easeOutExpo,
    easeInOutExpo,
    easeInBounce,
    easeOutBounce,
    easeInOutBounce,
    smooth,
    doubleSmooth,
    rushInto,
    rushFrom,
    slowInto,
    wiggle,
    registerEasing,
    getEasing,
    clearRegistry,
} from '../../src/core/animations/easing';
import type { EasingFunction } from '../../src/core/animations/easing';

/** Arbitrary for t values in [0, 1] */
const arbT = fc.double({ min: 0, max: 1, noNaN: true });

/** Arbitrary for t values strictly between 0 and 1 */
const arbTInner = fc.double({ min: 0.001, max: 0.999, noNaN: true });

/** All standard easings that satisfy f(0)=0 and f(1)=1 */
const standardEasings: Array<{ name: string; fn: EasingFunction }> = [
    { name: 'linear', fn: linear },
    { name: 'easeInQuad', fn: easeInQuad },
    { name: 'easeOutQuad', fn: easeOutQuad },
    { name: 'easeInOutQuad', fn: easeInOutQuad },
    { name: 'easeInCubic', fn: easeInCubic },
    { name: 'easeOutCubic', fn: easeOutCubic },
    { name: 'easeInOutCubic', fn: easeInOutCubic },
    { name: 'easeInSine', fn: easeInSine },
    { name: 'easeOutSine', fn: easeOutSine },
    { name: 'easeInOutSine', fn: easeInOutSine },
    { name: 'easeInExpo', fn: easeInExpo },
    { name: 'easeOutExpo', fn: easeOutExpo },
    { name: 'easeInOutExpo', fn: easeInOutExpo },
    { name: 'easeInBounce', fn: easeInBounce },
    { name: 'easeOutBounce', fn: easeOutBounce },
    { name: 'easeInOutBounce', fn: easeInOutBounce },
    { name: 'smooth', fn: smooth },
    { name: 'doubleSmooth', fn: doubleSmooth },
    { name: 'rushInto', fn: rushInto },
    { name: 'rushFrom', fn: rushFrom },
    { name: 'slowInto', fn: slowInto },
    { name: 'wiggle', fn: wiggle },
];

describe('Easing Property Tests', () => {
    describe('Boundary Conditions', () => {
        for (const { name, fn } of standardEasings) {
            test(`${name}(0) equals 0`, () => {
                expect(fn(0)).toBeCloseTo(0, 5);
            });

            test(`${name}(1) equals 1`, () => {
                expect(fn(1)).toBeCloseTo(1, 5);
            });
        }
    });

    describe('Value Range Properties', () => {
        test('linear produces values in [0, 1] for t in [0, 1]', () => {
            fc.assert(fc.property(arbT, (t) => {
                const result = linear(t);
                return result >= 0 && result <= 1;
            }));
        });

        test('smooth produces values in [0, 1] for t in [0, 1]', () => {
            fc.assert(fc.property(arbT, (t) => {
                const result = smooth(t);
                return result >= 0 && result <= 1;
            }));
        });

        test('doubleSmooth produces values in [0, 1] for t in [0, 1]', () => {
            fc.assert(fc.property(arbT, (t) => {
                const result = doubleSmooth(t);
                return result >= 0 && result <= 1;
            }));
        });

        test('easeInOutQuad produces values in [0, 1] for t in [0, 1]', () => {
            fc.assert(fc.property(arbT, (t) => {
                const result = easeInOutQuad(t);
                return result >= 0 && result <= 1;
            }));
        });

        test('bounce easings produce values in [0, 1] for t in [0, 1]', () => {
            fc.assert(fc.property(arbT, (t) => {
                const inResult = easeInBounce(t);
                const outResult = easeOutBounce(t);
                const inOutResult = easeInOutBounce(t);
                return inResult >= 0 && inResult <= 1 &&
                    outResult >= 0 && outResult <= 1 &&
                    inOutResult >= 0 && inOutResult <= 1;
            }));
        });
    });

    describe('Monotonicity Properties', () => {
        test('linear is strictly monotonic', () => {
            fc.assert(fc.property(arbTInner, arbTInner, (t1, t2) => {
                if (t1 < t2) {
                    return linear(t1) < linear(t2);
                } else if (t1 > t2) {
                    return linear(t1) > linear(t2);
                }
                return true;
            }));
        });

        test('smooth is monotonically increasing', () => {
            fc.assert(fc.property(arbTInner, arbTInner, (t1, t2) => {
                if (t1 < t2) {
                    return smooth(t1) <= smooth(t2);
                } else if (t1 > t2) {
                    return smooth(t1) >= smooth(t2);
                }
                return true;
            }));
        });

        test('easeInQuad is monotonically increasing', () => {
            fc.assert(fc.property(arbTInner, arbTInner, (t1, t2) => {
                if (t1 < t2) {
                    return easeInQuad(t1) <= easeInQuad(t2);
                } else if (t1 > t2) {
                    return easeInQuad(t1) >= easeInQuad(t2);
                }
                return true;
            }));
        });

        test('easeOutQuad is monotonically increasing', () => {
            fc.assert(fc.property(arbTInner, arbTInner, (t1, t2) => {
                if (t1 < t2) {
                    return easeOutQuad(t1) <= easeOutQuad(t2);
                } else if (t1 > t2) {
                    return easeOutQuad(t1) >= easeOutQuad(t2);
                }
                return true;
            }));
        });
    });

    describe('Symmetry Properties', () => {
        test('easeInOutQuad is symmetric around 0.5', () => {
            fc.assert(fc.property(
                fc.double({ min: 0, max: 0.5, noNaN: true }),
                (t) => {
                    const left = easeInOutQuad(t);
                    const right = easeInOutQuad(1 - t);
                    return Math.abs(left + right - 1) < 0.0001;
                }
            ));
        });

        test('easeInOutCubic is symmetric around 0.5', () => {
            fc.assert(fc.property(
                fc.double({ min: 0, max: 0.5, noNaN: true }),
                (t) => {
                    const left = easeInOutCubic(t);
                    const right = easeInOutCubic(1 - t);
                    return Math.abs(left + right - 1) < 0.0001;
                }
            ));
        });

        test('smooth is symmetric around 0.5', () => {
            fc.assert(fc.property(
                fc.double({ min: 0, max: 0.5, noNaN: true }),
                (t) => {
                    const left = smooth(t);
                    const right = smooth(1 - t);
                    return Math.abs(left + right - 1) < 0.0001;
                }
            ));
        });
    });

    describe('EaseIn vs EaseOut Relationship', () => {
        test('easeOutQuad(t) == 1 - easeInQuad(1-t)', () => {
            fc.assert(fc.property(arbT, (t) => {
                const easeOut = easeOutQuad(t);
                const easeInFlipped = 1 - easeInQuad(1 - t);
                return Math.abs(easeOut - easeInFlipped) < 0.0001;
            }));
        });

        test('easeOutCubic(t) == 1 - easeInCubic(1-t)', () => {
            fc.assert(fc.property(arbT, (t) => {
                const easeOut = easeOutCubic(t);
                const easeInFlipped = 1 - easeInCubic(1 - t);
                return Math.abs(easeOut - easeInFlipped) < 0.0001;
            }));
        });
    });

    describe('Registry Properties', () => {
        test('registered easing can be retrieved', () => {
            fc.assert(fc.property(
                fc.string({ minLength: 1, maxLength: 20 }),
                (name) => {
                    clearRegistry();
                    const fn: EasingFunction = (t) => t * t;
                    try {
                        registerEasing(name, fn);
                        const retrieved = getEasing(name);
                        return retrieved === fn;
                    } finally {
                        clearRegistry();
                    }
                }
            ));
        });

        test('non-registered easing returns undefined', () => {
            fc.assert(fc.property(
                fc.string({ minLength: 1, maxLength: 20 }),
                (name) => {
                    clearRegistry();
                    return getEasing(name) === undefined;
                }
            ));
        });
    });
});
