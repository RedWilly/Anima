import { Matrix3x3 } from '../core/math/matrix/Matrix3x3';
import { Vector2 } from '../core/math/Vector2/Vector2';

/**
 * Base class for all mathematical objects.
 * Manages position, rotation, scale, and opacity via a transformation matrix.
 */
export class Mobject {
  protected transformMatrix: Matrix3x3;
  protected opacityValue: number;

  constructor() {
    this.transformMatrix = Matrix3x3.identity();
    this.opacityValue = 0; // Invisible by default
  }

  get matrix(): Matrix3x3 {
    return this.transformMatrix;
  }

  /**
   * Returns the position of the Mobject (translation component).
   */
  get position(): Vector2 {
    const m = this.transformMatrix.values;
    return new Vector2(m[2]!, m[5]!);
  }

  /**
   * Returns the rotation of the Mobject in radians.
   */
  get rotation(): number {
    const m = this.transformMatrix.values;
    return Math.atan2(m[3]!, m[0]!);
  }

  /**
   * Returns the scale of the Mobject.
   */
  get scale(): Vector2 {
    const m = this.transformMatrix.values;
    const sx = Math.sqrt(m[0]! * m[0]! + m[3]! * m[3]!);
    const sy = Math.sqrt(m[1]! * m[1]! + m[4]! * m[4]!);
    return new Vector2(sx, sy);
  }

  get opacity(): number {
    return this.opacityValue;
  }

  /**
   * Sets the position of the Mobject directly.
   */
  pos(x: number, y: number): this {
    const newValues = new Float32Array(this.transformMatrix.values);
    newValues[2] = x;
    newValues[5] = y;
    this.transformMatrix = new Matrix3x3(newValues);
    return this;
  }

  show(): this {
    this.opacityValue = 1;
    return this;
  }

  hide(): this {
    this.opacityValue = 0;
    return this;
  }

  /**
   * Sets the opacity of the Mobject directly.
   * @param value Opacity value in [0, 1].
   */
  setOpacity(value: number): this {
    this.opacityValue = Math.max(0, Math.min(1, value));
    return this;
  }

  /**
   * Sets the rotation of the Mobject directly in radians.
   * Reconstructs the transform matrix preserving position and scale.
   */
  setRotation(angle: number): this {
    const m = this.transformMatrix.values;
    const posX = m[2]!;
    const posY = m[5]!;
    const currentScale = this.scale;

    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    const newValues = new Float32Array(9);
    newValues[0] = cos * currentScale.x;
    newValues[1] = -sin * currentScale.y;
    newValues[2] = posX;
    newValues[3] = sin * currentScale.x;
    newValues[4] = cos * currentScale.y;
    newValues[5] = posY;
    newValues[6] = 0;
    newValues[7] = 0;
    newValues[8] = 1;

    this.transformMatrix = new Matrix3x3(newValues);
    return this;
  }

  /**
   * Sets the scale of the Mobject directly.
   * Reconstructs the transform matrix preserving position and rotation.
   */
  setScale(sx: number, sy: number): this {
    const m = this.transformMatrix.values;
    const posX = m[2]!;
    const posY = m[5]!;
    const currentRotation = this.rotation;

    const cos = Math.cos(currentRotation);
    const sin = Math.sin(currentRotation);

    const newValues = new Float32Array(9);
    newValues[0] = cos * sx;
    newValues[1] = -sin * sy;
    newValues[2] = posX;
    newValues[3] = sin * sx;
    newValues[4] = cos * sy;
    newValues[5] = posY;
    newValues[6] = 0;
    newValues[7] = 0;
    newValues[8] = 1;

    this.transformMatrix = new Matrix3x3(newValues);
    return this;
  }

  /**
   * Applies a transformation matrix to the Mobject.
   * Pre-multiplies the current matrix: New = Transform * Old.
   * @param m The matrix to apply.
   */
  applyMatrix(m: Matrix3x3): this {
    this.transformMatrix = m.multiply(this.transformMatrix);
    return this;
  }
}
