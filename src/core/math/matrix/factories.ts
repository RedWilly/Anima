/**
 * Creates an identity matrix.
 */
export function createIdentity(): Float32Array {
    return new Float32Array([
        1, 0, 0,
        0, 1, 0,
        0, 0, 1
    ]);
}

/** Creates a translation matrix. */
export function createTranslation(tx: number, ty: number): Float32Array {
    return new Float32Array([
        1, 0, tx,
        0, 1, ty,
        0, 0, 1
    ]);
}

/** Creates a rotation matrix (angle in radians). */
export function createRotation(angle: number): Float32Array {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return new Float32Array([
        c, -s, 0,
        s, c, 0,
        0, 0, 1
    ]);
}

/** Creates a scaling matrix. */
export function createScale(sx: number, sy: number): Float32Array {
    return new Float32Array([
        sx, 0, 0,
        0, sy, 0,
        0, 0, 1
    ]);
}

/** Creates a shear matrix. */
export function createShear(shx: number, shy: number): Float32Array {
    return new Float32Array([
        1, shx, 0,
        shy, 1, 0,
        0, 0, 1
    ]);
}
