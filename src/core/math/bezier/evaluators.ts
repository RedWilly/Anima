import { Vector2 } from '../Vector2';

/**
 * Evaluates a point on a quadratic Bezier curve at parameter t.
 * @param p0 Start point
 * @param p1 Control point
 * @param p2 End point
 * @param t Parameter (0-1)
 */
export function evaluateQuadratic(p0: Vector2, p1: Vector2, p2: Vector2, t: number): Vector2 {
    const oneMinusT = 1 - t;
    // (1-t)^2 * p0 + 2(1-t)t * p1 + t^2 * p2
    return p0.multiply(oneMinusT * oneMinusT)
        .add(p1.multiply(2 * oneMinusT * t))
        .add(p2.multiply(t * t));
}

/**
 * Evaluates a point on a cubic Bezier curve at parameter t.
 * @param p0 Start point
 * @param p1 First control point
 * @param p2 Second control point
 * @param p3 End point
 * @param t Parameter (0-1)
 */
export function evaluateCubic(
    p0: Vector2,
    p1: Vector2,
    p2: Vector2,
    p3: Vector2,
    t: number
): Vector2 {
    const oneMinusT = 1 - t;
    const oneMinusT2 = oneMinusT * oneMinusT;
    const oneMinusT3 = oneMinusT2 * oneMinusT;
    const t2 = t * t;
    const t3 = t2 * t;

    // (1-t)^3 * p0 + 3(1-t)^2 * t * p1 + 3(1-t) * t^2 * p2 + t^3 * p3
    return p0.multiply(oneMinusT3)
        .add(p1.multiply(3 * oneMinusT2 * t))
        .add(p2.multiply(3 * oneMinusT * t2))
        .add(p3.multiply(t3));
}

/**
 * Evaluates the derivative of a quadratic Bezier curve at parameter t.
 * @param p0 Start point
 * @param p1 Control point
 * @param p2 End point
 * @param t Parameter (0-1)
 */
export function evaluateQuadraticDerivative(
    p0: Vector2,
    p1: Vector2,
    p2: Vector2,
    t: number
): Vector2 {
    // 2(1-t)(p1-p0) + 2t(p2-p1)
    const oneMinusT = 1 - t;
    return p1.subtract(p0).multiply(2 * oneMinusT)
        .add(p2.subtract(p1).multiply(2 * t));
}

/**
 * Evaluates the derivative of a cubic Bezier curve at parameter t.
 * @param p0 Start point
 * @param p1 First control point
 * @param p2 Second control point
 * @param p3 End point
 * @param t Parameter (0-1)
 */
export function evaluateCubicDerivative(
    p0: Vector2,
    p1: Vector2,
    p2: Vector2,
    p3: Vector2,
    t: number
): Vector2 {
    // 3(1-t)^2(p1-p0) + 6(1-t)t(p2-p1) + 3t^2(p3-p2)
    const oneMinusT = 1 - t;
    return p1.subtract(p0).multiply(3 * oneMinusT * oneMinusT)
        .add(p2.subtract(p1).multiply(6 * oneMinusT * t))
        .add(p3.subtract(p2).multiply(3 * t * t));
}
