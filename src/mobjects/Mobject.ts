import { Matrix3x3 } from '../core/math/matrix/Matrix3x3';
import { Vector2 } from '../core/math/Vector2';

/**
 * Base class for all mathematical objects.
 * Manages position, rotation, scale, and opacity via a transformation matrix.
 */
export class Mobject {
  protected _matrix: Matrix3x3;
  protected _opacity: number;

  constructor() {
    this._matrix = Matrix3x3.identity();
    this._opacity = 0; // Invisible by default
  }

  get matrix(): Matrix3x3 {
    return this._matrix;
  }

  /**
   * Returns the position of the Mobject (translation component).
   */
  get position(): Vector2 {
    const m = this._matrix.values;
    return new Vector2(m[2]!, m[5]!);
  }

  /**
   * Returns the rotation of the Mobject in radians.
   */
  get rotation(): number {
    const m = this._matrix.values;
    return Math.atan2(m[3]!, m[0]!);
  }

  /**
   * Returns the scale of the Mobject.
   */
  get scale(): Vector2 {
    const m = this._matrix.values;
    const sx = Math.sqrt(m[0]! * m[0]! + m[3]! * m[3]!);
    const sy = Math.sqrt(m[1]! * m[1]! + m[4]! * m[4]!);
    return new Vector2(sx, sy);
  }

  get opacity(): number {
    return this._opacity;
  }

  /**
   * Sets the position of the Mobject directly.
   */
  pos(x: number, y: number): this {
    const newValues = new Float32Array(this._matrix.values);
    newValues[2] = x;
    newValues[5] = y;
    this._matrix = new Matrix3x3(newValues);
    return this;
  }

  show(): this {
    this._opacity = 1;
    return this;
  }

  hide(): this {
    this._opacity = 0;
    return this;
  }

  /**
   * Applies a transformation matrix to the Mobject.
   * Pre-multiplies the current matrix: New = Transform * Old.
   * @param m The matrix to apply.
   */
  applyMatrix(m: Matrix3x3): this {
    this._matrix = m.multiply(this._matrix);
    return this;
  }
}
