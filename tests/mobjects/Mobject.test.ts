import { describe, expect, test } from 'bun:test';
import { Mobject } from '../../src/mobjects/Mobject';
import { Vector2 } from '../../src/core/math/Vector2';
import { Matrix3x3 } from '../../src/core/math/matrix/Matrix3x3';

describe('Mobject', () => {
  test('default state', () => {
    const obj = new Mobject();
    expect(obj.position.x).toBe(0);
    expect(obj.position.y).toBe(0);
    expect(obj.rotation).toBe(0);
    expect(obj.scale.x).toBe(1);
    expect(obj.scale.y).toBe(1);
    expect(obj.opacity).toBe(0);
  });

  test('immediate state setters', () => {
    const obj = new Mobject();

    obj.pos(10, 20);
    expect(obj.position.x).toBe(10);
    expect(obj.position.y).toBe(20);

    obj.show();
    expect(obj.opacity).toBe(1);

    obj.hide();
    expect(obj.opacity).toBe(0);
  });

  test('matrix transformation - translation', () => {
    const obj = new Mobject();
    obj.pos(10, 20);

    const translation = Matrix3x3.translation(5, 5);
    obj.applyMatrix(translation);

    // Pre-multiply: T(5,5) * T(10,20) = T(15,25)
    expect(obj.position.x).toBe(15);
    expect(obj.position.y).toBe(25);
  });

  test('matrix transformation - rotation', () => {
    const obj = new Mobject();
    // Rotate by 90 degrees
    const rotation = Matrix3x3.rotation(Math.PI / 2);
    obj.applyMatrix(rotation);

    expect(obj.rotation).toBeCloseTo(Math.PI / 2);
  });

  test('matrix transformation - scale', () => {
    const obj = new Mobject();
    const scale = Matrix3x3.scale(2, 3);
    obj.applyMatrix(scale);

    expect(obj.scale.x).toBe(2);
    expect(obj.scale.y).toBe(3);
  });

  test('matrix transformation - combined', () => {
    const obj = new Mobject();
    obj.pos(10, 0);

    // Rotate 90 degrees around origin (0,0)
    // Since we use pre-multiply, this rotates the position vector
    const rotation = Matrix3x3.rotation(Math.PI / 2);
    obj.applyMatrix(rotation);

    // (10, 0) rotated 90 deg is (0, 10)
    expect(obj.position.x).toBeCloseTo(0);
    expect(obj.position.y).toBeCloseTo(10);
    expect(obj.rotation).toBeCloseTo(Math.PI / 2);
  });
});
