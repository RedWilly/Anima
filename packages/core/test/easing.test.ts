/**
 * Unit tests for easing functions.
 */

import { describe, expect, it } from 'bun:test';
import {
    linear,
    easeIn,
    easeOut,
    easeInOut,
    elastic,
    bounce,
    getEasing,
} from '../src/easing';

describe('Easing Functions', () => {
    describe('linear', () => {
        it('should return t unchanged', () => {
            expect(linear(0)).toBe(0);
            expect(linear(0.5)).toBe(0.5);
            expect(linear(1)).toBe(1);
        });
    });

    describe('easeIn', () => {
        it('should start slow and accelerate', () => {
            expect(easeIn(0)).toBe(0);
            expect(easeIn(1)).toBe(1);
            // At t=0.5, easeIn should be less than 0.5 (slower start)
            expect(easeIn(0.5)).toBeLessThan(0.5);
        });
    });

    describe('easeOut', () => {
        it('should start fast and decelerate', () => {
            expect(easeOut(0)).toBe(0);
            expect(easeOut(1)).toBe(1);
            // At t=0.5, easeOut should be greater than 0.5 (faster start)
            expect(easeOut(0.5)).toBeGreaterThan(0.5);
        });
    });

    describe('easeInOut', () => {
        it('should accelerate then decelerate', () => {
            expect(easeInOut(0)).toBe(0);
            expect(easeInOut(1)).toBe(1);
            // Symmetric: at t=0.5, should be 0.5
            expect(easeInOut(0.5)).toBe(0.5);
        });
    });

    describe('elastic', () => {
        it('should return boundary values correctly', () => {
            expect(elastic(0)).toBe(0);
            expect(elastic(1)).toBe(1);
        });

        it('should overshoot (spring effect)', () => {
            // Elastic typically overshoots past 1.0 during the animation
            const midValue = elastic(0.8);
            expect(midValue).toBeGreaterThan(0.9);
        });
    });

    describe('bounce', () => {
        it('should return boundary values correctly', () => {
            expect(bounce(0)).toBe(0);
            expect(bounce(1)).toBe(1);
        });

        it('should produce bounce pattern', () => {
            // At t < 1/2.75 (~0.36), bounce uses formula: 7.5625 * t * t
            const t = 0.3;
            const expected = 7.5625 * t * t;
            expect(bounce(t)).toBeCloseTo(expected, 5);
        });
    });

    describe('getEasing', () => {
        it('should return correct easing function by name', () => {
            expect(getEasing('linear')).toBe(linear);
            expect(getEasing('easeIn')).toBe(easeIn);
            expect(getEasing('elastic')).toBe(elastic);
        });
    });
});
