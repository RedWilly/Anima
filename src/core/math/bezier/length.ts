import { Vector2 } from '../Vector2/Vector2';
import { evaluateQuadratic, evaluateCubic } from './evaluators';

/** Calculates approximate length of a quadratic Bezier curve via subdivision (10 steps). */
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

/** Calculates approximate length of a cubic Bezier curve via subdivision (20 steps). */
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
