import { describe, expect, test } from 'bun:test';
import { Mobject } from '../../../src/core/mobjects/Mobject';
import { Matrix4x4 } from '../../../src/core/math/matrix/Matrix4x4';

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

  test('position exposes xyz translation for matrix-backed mobjects', () => {
    const obj = new Mobject();
    obj.pos(1, 2, 3);

    expect(obj.position.x).toBe(1);
    expect(obj.position.y).toBe(2);
    expect(obj.position.z).toBe(3);
  });

  test('matrix transformation - translation', () => {
    const obj = new Mobject();
    obj.pos(10, 20);

    const translation = Matrix4x4.translation(5, 5, 0);
    obj.applyMatrix(translation);

    // Pre-multiply: T(5,5) * T(10,20) = T(15,25)
    expect(obj.position.x).toBe(15);
    expect(obj.position.y).toBe(25);
  });

  test('matrix transformation - rotation', () => {
    const obj = new Mobject();
    // Rotate by 90 degrees
    const rotation = Matrix4x4.rotationZ(Math.PI / 2);
    obj.applyMatrix(rotation);

    expect(obj.rotation).toBeCloseTo(Math.PI / 2);
  });

  test('matrix transformation - scale', () => {
    const obj = new Mobject();
    const scale = Matrix4x4.scale(2, 3, 1);
    obj.applyMatrix(scale);

    expect(obj.scale.x).toBe(2);
    expect(obj.scale.y).toBe(3);
  });

  test('matrix transformation - combined', () => {
    const obj = new Mobject();
    obj.pos(10, 0);

    // Rotate 90 degrees around origin (0,0)
    // Since we use pre-multiply, this rotates the position vector
    const rotation = Matrix4x4.rotationZ(Math.PI / 2);
    obj.applyMatrix(rotation);

    // (10, 0) rotated 90 deg is (0, 10)
    expect(obj.position.x).toBeCloseTo(0);
    expect(obj.position.y).toBeCloseTo(10);
    expect(obj.rotation).toBeCloseTo(Math.PI / 2);
  });

  test('3D translation matrix updates z position', () => {
    const obj = new Mobject();
    obj.pos(0, 0, 1);

    const translation = Matrix4x4.translation(0, 0, 4);
    obj.applyMatrix(translation);

    expect(obj.position.x).toBe(0);
    expect(obj.position.y).toBe(0);
    expect(obj.position.z).toBe(5);
  });
});
