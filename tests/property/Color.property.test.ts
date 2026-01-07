import { describe, test, expect } from 'bun:test';
import * as fc from 'fast-check';
import { Color } from '../../src/core/math/color/Color';

/** Arbitrary for RGB values [0, 255] */
const arbRgb = fc.integer({ min: 0, max: 255 });

/** Arbitrary for alpha values [0, 1] */
const arbAlpha = fc.double({ min: 0, max: 1, noNaN: true });

/** Arbitrary for Color instances */
const arbColor = fc.tuple(arbRgb, arbRgb, arbRgb, arbAlpha)
    .map(([r, g, b, a]) => new Color(r, g, b, a));

/** Arbitrary for t values in [0, 1] */
const arbT = fc.double({ min: 0, max: 1, noNaN: true });

describe('Color Property Tests', () => {
    test('RGB values are always clamped to [0, 255]', () => {
        fc.assert(fc.property(
            fc.double({ min: -1000, max: 1000, noNaN: true }),
            fc.double({ min: -1000, max: 1000, noNaN: true }),
            fc.double({ min: -1000, max: 1000, noNaN: true }),
            (r, g, b) => {
                const c = new Color(r, g, b);
                return c.r >= 0 && c.r <= 255 &&
                    c.g >= 0 && c.g <= 255 &&
                    c.b >= 0 && c.b <= 255;
            }
        ));
    });

    test('alpha values are always clamped to [0, 1]', () => {
        fc.assert(fc.property(
            fc.double({ min: -10, max: 10, noNaN: true }),
            (a) => {
                const c = new Color(128, 128, 128, a);
                return c.a >= 0 && c.a <= 1;
            }
        ));
    });

    test('lerp(c, c, t) == c for any t', () => {
        fc.assert(fc.property(arbColor, arbT, (c, t) => {
            const result = c.lerp(c, t);
            return Math.abs(result.r - c.r) < 1 &&
                Math.abs(result.g - c.g) < 1 &&
                Math.abs(result.b - c.b) < 1 &&
                Math.abs(result.a - c.a) < 0.01;
        }));
    });

    test('lerp boundary: lerp(a, b, 0) == a', () => {
        fc.assert(fc.property(arbColor, arbColor, (a, b) => {
            const result = a.lerp(b, 0);
            return Math.abs(result.r - a.r) < 1 &&
                Math.abs(result.g - a.g) < 1 &&
                Math.abs(result.b - a.b) < 1 &&
                Math.abs(result.a - a.a) < 0.01;
        }));
    });

    test('lerp boundary: lerp(a, b, 1) == b', () => {
        fc.assert(fc.property(arbColor, arbColor, (a, b) => {
            const result = a.lerp(b, 1);
            return Math.abs(result.r - b.r) < 1 &&
                Math.abs(result.g - b.g) < 1 &&
                Math.abs(result.b - b.b) < 1 &&
                Math.abs(result.a - b.a) < 0.01;
        }));
    });

    test('fromHex produces valid color for valid hex strings', () => {
        const hexDigit = fc.constantFrom(
            '0', '1', '2', '3', '4', '5', '6', '7',
            '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'
        );
        const hex6 = fc.array(hexDigit, { minLength: 6, maxLength: 6 })
            .map(arr => '#' + arr.join(''));

        fc.assert(fc.property(hex6, (hex) => {
            const c = Color.fromHex(hex);
            return c.r >= 0 && c.r <= 255 &&
                c.g >= 0 && c.g <= 255 &&
                c.b >= 0 && c.b <= 255 &&
                c.a >= 0 && c.a <= 1;
        }));
    });

    test('toHex produces valid hex format', () => {
        fc.assert(fc.property(arbColor, (c) => {
            const hex = c.toHex();
            return hex.startsWith('#') &&
                (hex.length === 7 || hex.length === 9);
        }));
    });

    test('toRGBA produces valid rgba format', () => {
        fc.assert(fc.property(arbColor, (c) => {
            const rgba = c.toRGBA();
            return rgba.startsWith('rgba(') && rgba.endsWith(')');
        }));
    });
});
