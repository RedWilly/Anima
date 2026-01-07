import { Vector2 } from './Vector2';

export type PathCommandType = 'Move' | 'Line' | 'Quadratic' | 'Cubic' | 'Close';

export interface PathCommand {
  type: PathCommandType;
  end: Vector2;
  control1?: Vector2;
  control2?: Vector2;
}

/**
 * A class representing a Bezier path, capable of storing standard path commands
 * (move, line, quadratic curve, cubic curve, close).
 */
export class BezierPath {
  private commands: PathCommand[] = [];
  private currentPoint: Vector2 = Vector2.ZERO;
  private startPoint: Vector2 = Vector2.ZERO; // Track start of current subpath for closePath

  /**
   * Moves the current point to the specified location.
   * Starts a new subpath.
   * @param point The destination point.
   */
  moveTo(point: Vector2): void {
    this.commands.push({
      type: 'Move',
      end: point,
    });
    this.currentPoint = point;
    this.startPoint = point;
  }

  /**
   * Adds a line segment from the current point to the specified point.
   * @param point The end point of the line.
   */
  lineTo(point: Vector2): void {
    this.commands.push({
      type: 'Line',
      end: point,
    });
    this.currentPoint = point;
  }

  /**
   * Adds a quadratic Bezier curve from the current point to the specified end point.
   * @param control The control point.
   * @param end The end point of the curve.
   */
  quadraticTo(control: Vector2, end: Vector2): void {
    this.commands.push({
      type: 'Quadratic',
      control1: control,
      end: end,
    });
    this.currentPoint = end;
  }

  /**
   * Adds a cubic Bezier curve from the current point to the specified end point.
   * @param control1 The first control point.
   * @param control2 The second control point.
   * @param end The end point of the curve.
   */
  cubicTo(control1: Vector2, control2: Vector2, end: Vector2): void {
    this.commands.push({
      type: 'Cubic',
      control1: control1,
      control2: control2,
      end: end,
    });
    this.currentPoint = end;
  }

  /**
   * Closes the current subpath by drawing a line to the start point of the subpath.
   */
  closePath(): void {
    // If already closed or at start, we might still record the command explicitly
    // but typically it implies a line to startPoint.
    this.commands.push({
      type: 'Close',
      end: this.startPoint,
    });
    this.currentPoint = this.startPoint;
  }

  /**
   * Returns the list of commands in this path.
   * @returns Array of PathCommand.
   */
  getCommands(): PathCommand[] {
    return [...this.commands];
  }
}
