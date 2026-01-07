import { describe, expect, test } from 'bun:test';
import { Matrix3x3 } from '../../../src/core/math/matrix/Matrix3x3';
import { Vector2 } from '../../../src/core/math/Vector2/Vector2';

describe('Matrix3x3', () => {
  test('should create a matrix with 9 values', () => {
    const values = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const matrix = new Matrix3x3(values);
    expect(matrix.values).toHaveLength(9);
    expect(Array.from(matrix.values)).toEqual(values);
  });

  test('should throw error if values length is not 9', () => {
    expect(() => new Matrix3x3([1, 2])).toThrow();
  });

  test('identity() should return identity matrix', () => {
    const id = Matrix3x3.identity();
    expect(Array.from(id.values)).toEqual([
      1, 0, 0,
      0, 1, 0,
      0, 0, 1
    ]);
  });

  test('multiply() should compose matrices correctly', () => {
    // Identity * Identity = Identity
    const id = Matrix3x3.identity();
    const m1 = id.multiply(id);
    expect(Array.from(m1.values)).toEqual(Array.from(id.values));

    // Custom multiplication
    // [ 1 2 3 ]   [ 2 0 0 ]   [ 2 2 3 ]
    // [ 4 5 6 ] * [ 0 1 0 ] = [ 8 5 6 ]  <-- Wait, checking math manually
    // [ 7 8 9 ]   [ 0 0 1 ]   [ 14 8 9 ]

    // Manual check:
    // Row 0: 1*2+2*0+3*0=2, 1*0+2*1+3*0=2, 1*0+2*0+3*1=3 -> [2, 2, 3]
    // Row 1: 4*2+5*0+6*0=8, 4*0+5*1+6*0=5, 4*0+5*0+6*1=6 -> [8, 5, 6]
    // Row 2: 7*2+8*0+9*0=14, 7*0+8*1+9*0=8, 7*0+8*0+9*1=9 -> [14, 8, 9]

    const a = new Matrix3x3([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    const b = new Matrix3x3([2, 0, 0, 0, 1, 0, 0, 0, 1]); // Scale X by 2
    const c = a.multiply(b);

    expect(Array.from(c.values)).toEqual([2, 2, 3, 8, 5, 6, 14, 8, 9]);
  });

  test('transformPoint() should apply transformation to Vector2', () => {
    // Translation
    const t = Matrix3x3.translation(10, 20);
    const p = new Vector2(5, 5);
    const p2 = t.transformPoint(p);
    expect(p2.x).toBe(15);
    expect(p2.y).toBe(25);

    // Scaling
    const s = Matrix3x3.scale(2, 3);
    const p3 = s.transformPoint(p);
    expect(p3.x).toBe(10);
    expect(p3.y).toBe(15);

    // Rotation (90 degrees around origin)
    // cos(90) = 0, sin(90) = 1
    // [ 0 -1 0 ]
    // [ 1  0 0 ]
    // [ 0  0 1 ]
    // x' = 0*x - 1*y = -y
    // y' = 1*x + 0*y = x
    const r = Matrix3x3.rotation(Math.PI / 2);
    const p4 = new Vector2(1, 0);
    const p4t = r.transformPoint(p4);

    expect(p4t.x).toBeCloseTo(0); // -0
    expect(p4t.y).toBeCloseTo(1);
  });

  test('inverse() should return correct inverse matrix', () => {
    // Inverse of identity is identity
    const id = Matrix3x3.identity();
    expect(Array.from(id.inverse().values)).toEqual(Array.from(id.values));

    // Inverse of scaling (2, 4) should be (0.5, 0.25)
    const s = Matrix3x3.scale(2, 4);
    const invS = s.inverse();
    expect(invS.values[0]).toBe(0.5);
    expect(invS.values[4]).toBe(0.25);

    // Check property M * M^-1 = I
    const m = new Matrix3x3([
      2, 1, 0,
      1, 2, 0,
      0, 0, 1
    ]);
    const invM = m.inverse();
    const prod = m.multiply(invM);

    // Floating point precision check
    expect(prod.values[0]).toBeCloseTo(1);
    expect(prod.values[1]).toBeCloseTo(0);
    expect(prod.values[2]).toBeCloseTo(0);
    expect(prod.values[4]).toBeCloseTo(1);
  });

  test('should throw error for non-invertible matrix', () => {
    const zero = new Matrix3x3([0, 0, 0, 0, 0, 0, 0, 0, 0]);
    expect(() => zero.inverse()).toThrow();
  });

  test('translation() should create translation matrix', () => {
    const t = Matrix3x3.translation(10, -5);
    expect(Array.from(t.values)).toEqual([
      1, 0, 10,
      0, 1, -5,
      0, 0, 1
    ]);
  });

  test('rotation() should create rotation matrix', () => {
    const r = Matrix3x3.rotation(Math.PI); // 180 degrees
    // cos(180) = -1, sin(180) = 0
    expect(r.values[0]).toBeCloseTo(-1);
    expect(r.values[1]).toBeCloseTo(0);
    expect(r.values[3]).toBeCloseTo(0);
    expect(r.values[4]).toBeCloseTo(-1);
  });

  test('scale() should create scale matrix', () => {
    const s = Matrix3x3.scale(0.5, 2);
    expect(Array.from(s.values)).toEqual([
      0.5, 0, 0,
      0, 2, 0,
      0, 0, 1
    ]);
  });

  test('shear() should create shear matrix', () => {
    const s = Matrix3x3.shear(1, 0.5);
    expect(Array.from(s.values)).toEqual([
      1, 1, 0,
      0.5, 1, 0,
      0, 0, 1
    ]);
  });
});
