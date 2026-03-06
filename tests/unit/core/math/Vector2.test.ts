import { describe, it, expect } from 'bun:test';
import { Vector } from '../../../../src/core/math/vector/Vector';

describe('Vector', () => {
  it('should create a vector with x and y values', () => {
    const v = new Vector(1, 2);
    expect(v.x).toBe(1);
    expect(v.y).toBe(2);
  });

  it('should add two vectors', () => {
    const v1 = new Vector(1, 2);
    const v2 = new Vector(3, 4);
    const result = v1.add(v2);
    expect(result.x).toBe(4);
    expect(result.y).toBe(6);
  });

  it('should subtract two vectors', () => {
    const v1 = new Vector(3, 5);
    const v2 = new Vector(1, 2);
    const result = v1.subtract(v2);
    expect(result.x).toBe(2);
    expect(result.y).toBe(3);
  });

  it('should multiply by a scalar', () => {
    const v = new Vector(2, 3);
    const result = v.multiply(2);
    expect(result.x).toBe(4);
    expect(result.y).toBe(6);
  });

  it('should calculate dot product', () => {
    const v1 = new Vector(1, 2);
    const v2 = new Vector(3, 4);
    // 1*3 + 2*4 = 3 + 8 = 11
    expect(v1.dot(v2)).toBe(11);
  });

  it('should calculate length', () => {
    const v = new Vector(3, 4);
    expect(v.length()).toBe(5);
  });

  it('should normalize vector', () => {
    const v = new Vector(3, 0);
    const result = v.normalize();
    expect(result.x).toBe(1);
    expect(result.y).toBe(0);

    const vZero = new Vector(0, 0);
    expect(vZero.normalize()).toEqual(Vector.ZERO);
  });

  it('should lerp between vectors', () => {
    const v1 = new Vector(0, 0);
    const v2 = new Vector(10, 10);
    const result = v1.lerp(v2, 0.5);
    expect(result.x).toBe(5);
    expect(result.y).toBe(5);
  });

  it('should have correct static constants', () => {
    expect(Vector.ZERO).toEqual(new Vector(0, 0));
    expect(Vector.UP).toEqual(new Vector(0, -1));
    expect(Vector.DOWN).toEqual(new Vector(0, 1));
    expect(Vector.LEFT).toEqual(new Vector(-1, 0));
    expect(Vector.RIGHT).toEqual(new Vector(1, 0));
  });
});

