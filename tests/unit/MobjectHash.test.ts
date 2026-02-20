import { describe, it, expect } from 'bun:test';
import { Circle } from '../../src/mobjects/geometry/Circle';
import { Rectangle } from '../../src/mobjects/geometry/Rectangle';
import { Color } from '../../src/core/math/color/Color';

describe('Mobject.computeHash', () => {
    it('identical state produces identical hash', () => {
        const a = new Circle(1);
        const b = new Circle(1);
        expect(a.computeHash()).toBe(b.computeHash());
    });

    it('changing position produces different hash', () => {
        const a = new Circle(1);
        const hashBefore = a.computeHash();
        a.pos(5, 3);
        expect(a.computeHash()).not.toBe(hashBefore);
    });

    it('changing opacity produces different hash', () => {
        const a = new Circle(1);
        const hashBefore = a.computeHash();
        a.setOpacity(0.5);
        expect(a.computeHash()).not.toBe(hashBefore);
    });

    it('changing scale produces different hash', () => {
        const a = new Circle(1);
        const hashBefore = a.computeHash();
        a.setScale(2, 2);
        expect(a.computeHash()).not.toBe(hashBefore);
    });

    it('changing rotation produces different hash', () => {
        const a = new Circle(1);
        const hashBefore = a.computeHash();
        a.setRotation(Math.PI / 4);
        expect(a.computeHash()).not.toBe(hashBefore);
    });
});

describe('VMobject.computeHash', () => {
    it('identical VMobjects produce identical hash', () => {
        const a = new Circle(1);
        const b = new Circle(1);
        expect(a.computeHash()).toBe(b.computeHash());
    });

    it('changing stroke color produces different hash', () => {
        const a = new Circle(1);
        const hashBefore = a.computeHash();
        a.stroke(Color.RED, 3);
        expect(a.computeHash()).not.toBe(hashBefore);
    });

    it('changing fill produces different hash', () => {
        const a = new Circle(1);
        const hashBefore = a.computeHash();
        a.fill(Color.BLUE, 0.8);
        expect(a.computeHash()).not.toBe(hashBefore);
    });

    it('different shapes produce different hashes', () => {
        const circle = new Circle(1);
        const rect = new Rectangle(1, 1);
        // Different geometry → different path data → different hash
        expect(circle.computeHash()).not.toBe(rect.computeHash());
    });
});
