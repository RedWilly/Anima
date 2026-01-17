import { describe, test, expect } from 'bun:test';
import * as fc from 'fast-check';
import { Mobject } from '../../src/mobjects/Mobject';
import { Matrix3x3 } from '../../src/core/math/matrix/Matrix3x3';

/** Arbitrary for position coordinates - limited range for Float32 precision */
const arbCoord = fc.double({ min: -100, max: 100, noNaN: true });

/** Arbitrary for positive scale values */
const arbScale = fc.double({ min: 0.1, max: 10, noNaN: true });

describe('Mobject Property Tests', () => {
    test('applying identity matrix does not change position', () => {
        fc.assert(fc.property(arbCoord, arbCoord, (x, y) => {
            const obj = new Mobject();
            obj.pos(x, y);
            const posBefore = obj.position;
            obj.applyMatrix(Matrix3x3.identity());
            const posAfter = obj.position;
            return Math.abs(posAfter.x - posBefore.x) < 1e-6 &&
                Math.abs(posAfter.y - posBefore.y) < 1e-6;
        }));
    });

    test('pos(x, y) correctly updates position to (x, y)', () => {
        fc.assert(fc.property(arbCoord, arbCoord, (x, y) => {
            const obj = new Mobject();
            obj.pos(x, y);
            return Math.abs(obj.position.x - x) < 1e-3 &&
                Math.abs(obj.position.y - y) < 1e-3;
        }));
    });

    test('show() sets opacity to 1', () => {
        const obj = new Mobject();
        expect(obj.opacity).toBe(0);
        obj.show();
        expect(obj.opacity).toBe(1);
    });

    test('hide() sets opacity to 0', () => {
        const obj = new Mobject();
        obj.show();
        expect(obj.opacity).toBe(1);
        obj.hide();
        expect(obj.opacity).toBe(0);
    });

    test('default state is position (0,0), rotation 0, scale (1,1), opacity 0', () => {
        const obj = new Mobject();
        expect(obj.position.x).toBe(0);
        expect(obj.position.y).toBe(0);
        expect(obj.rotation).toBe(0);
        expect(obj.scale.x).toBeCloseTo(1);
        expect(obj.scale.y).toBeCloseTo(1);
        expect(obj.opacity).toBe(0);
    });

    test('pos returns this for chaining', () => {
        const obj = new Mobject();
        const result = obj.pos(10, 20);
        expect(result).toBe(obj);
    });

    test('show returns this for chaining', () => {
        const obj = new Mobject();
        const result = obj.show();
        expect(result).toBe(obj);
    });

    test('hide returns this for chaining', () => {
        const obj = new Mobject();
        const result = obj.hide();
        expect(result).toBe(obj);
    });

    test('applyMatrix returns this for chaining', () => {
        const obj = new Mobject();
        const result = obj.applyMatrix(Matrix3x3.identity());
        expect(result).toBe(obj);
    });

    test('chained pos calls update correctly', () => {
        fc.assert(fc.property(arbCoord, arbCoord, arbCoord, arbCoord, (x1, y1, x2, y2) => {
            const obj = new Mobject();
            obj.pos(x1, y1).pos(x2, y2);
            // Float32Array has ~7 significant digits precision, use 1e-3 tolerance
            return Math.abs(obj.position.x - x2) < 1e-3 &&
                Math.abs(obj.position.y - y2) < 1e-3;
        }));
    });


    test('scale transformation extracts correctly', () => {
        fc.assert(fc.property(arbScale, arbScale, (sx, sy) => {
            const obj = new Mobject();
            obj.applyMatrix(Matrix3x3.scale(sx, sy));
            return Math.abs(obj.scale.x - sx) < 1e-6 &&
                Math.abs(obj.scale.y - sy) < 1e-6;
        }));
    });

    test('translation via applyMatrix updates position', () => {
        fc.assert(fc.property(arbCoord, arbCoord, (tx, ty) => {
            const obj = new Mobject();
            obj.applyMatrix(Matrix3x3.translation(tx, ty));
            return Math.abs(obj.position.x - tx) < 1e-3 &&
                Math.abs(obj.position.y - ty) < 1e-3;
        }));
    });
});
