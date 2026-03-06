import { Vector } from '../vector';

/**
 * Result of splitting a cubic Bezier curve at parameter t.
 */
export interface CubicSegment {
    start: Vector;
    control1: Vector;
    control2: Vector;
    end: Vector;
}

/** Splits a cubic Bezier curve at t using de Casteljau's algorithm into two segments. */
export function splitCubicAt(
    p0: Vector,
    p1: Vector,
    p2: Vector,
    p3: Vector,
    t: number
): [CubicSegment, CubicSegment] {
    // de Casteljau's algorithm - first level
    const p01 = p0.lerp(p1, t);
    const p12 = p1.lerp(p2, t);
    const p23 = p2.lerp(p3, t);

    // Second level
    const p012 = p01.lerp(p12, t);
    const p123 = p12.lerp(p23, t);

    // Third level - the split point
    const p0123 = p012.lerp(p123, t);

    // First segment: [0, t]
    const first: CubicSegment = {
        start: p0,
        control1: p01,
        control2: p012,
        end: p0123,
    };

    // Second segment: [t, 1]
    const second: CubicSegment = {
        start: p0123,
        control1: p123,
        control2: p23,
        end: p3,
    };

    return [first, second];
}

/** Splits a quadratic Bezier curve at t into two segments. */
export interface QuadraticSegment {
    start: Vector;
    control: Vector;
    end: Vector;
}

export function splitQuadraticAt(
    p0: Vector,
    p1: Vector,
    p2: Vector,
    t: number
): [QuadraticSegment, QuadraticSegment] {
    // de Casteljau for quadratic
    const p01 = p0.lerp(p1, t);
    const p12 = p1.lerp(p2, t);
    const p012 = p01.lerp(p12, t);

    const first: QuadraticSegment = {
        start: p0,
        control: p01,
        end: p012,
    };

    const second: QuadraticSegment = {
        start: p012,
        control: p12,
        end: p2,
    };

    return [first, second];
}

