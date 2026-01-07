import { Vector2 } from '../Vector2/Vector2';
import { evaluateQuadratic, evaluateCubic } from './evaluators';

/**
 * Calculates the approximate length of a quadratic Bezier curve.
 * Uses subdivision with 10 steps for approximation.
 */
export function getQuadraticLength(p0: Vector2, p1: Vector2, p2: Vector2): number {
    const steps = 10;
    let length = 0;
    let prev = p0;
    for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const current = evaluateQuadratic(p0, p1, p2, t);
        length += prev.subtract(current).length();
        prev = current;
    }
    return length;
}

/**
 * Calculates the approximate length of a cubic Bezier curve.
 * Uses subdivision with 20 steps for approximation.
 */
export function getCubicLength(
    p0: Vector2,
    p1: Vector2,
    p2: Vector2,
    p3: Vector2
): number {
    const steps = 20;
    let length = 0;
    let prev = p0;
    for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const current = evaluateCubic(p0, p1, p2, p3, t);
        length += prev.subtract(current).length();
        prev = current;
    }
    return length;
}
