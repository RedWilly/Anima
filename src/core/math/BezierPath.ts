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

  /**
   * Calculates the total length of the path.
   * @returns The total length.
   */
  getLength(): number {
    let length = 0;
    let current = this.startPoint; // Initialize with start of path (usually 0,0 or first Move)

    // We need to track current point as we iterate
    // But commands might not start at 0,0 if we just iterate.
    // Actually, the commands store 'end', but we need 'start' for each command.
    // The 'start' of command i is the 'end' of command i-1.
    
    // Let's re-simulate the path state
    // Reset state for calculation
    let cursor = new Vector2(0, 0); 
    let subpathStart = new Vector2(0, 0);

    for (const cmd of this.commands) {
      switch (cmd.type) {
        case 'Move':
          cursor = cmd.end;
          subpathStart = cmd.end;
          break;
        case 'Line':
          length += cursor.subtract(cmd.end).length();
          cursor = cmd.end;
          break;
        case 'Quadratic':
          if (cmd.control1) {
            length += this.getQuadraticLength(cursor, cmd.control1, cmd.end);
          }
          cursor = cmd.end;
          break;
        case 'Cubic':
          if (cmd.control1 && cmd.control2) {
            length += this.getCubicLength(cursor, cmd.control1, cmd.control2, cmd.end);
          }
          cursor = cmd.end;
          break;
        case 'Close':
          length += cursor.subtract(subpathStart).length();
          cursor = subpathStart;
          break;
      }
    }
    return length;
  }

  /**
   * Returns the point on the path at the normalized position t (0-1).
   * @param t The normalized position (0-1).
   * @returns The point at t.
   */
  getPointAt(t: number): Vector2 {
    const totalLength = this.getLength();
    if (totalLength === 0) return this.commands.length > 0 ? this.commands[this.commands.length - 1]!.end : Vector2.ZERO;
    
    // Clamp t
    t = Math.max(0, Math.min(1, t));
    let targetDistance = t * totalLength;
    
    let currentDistance = 0;
    let cursor = new Vector2(0, 0);
    let subpathStart = new Vector2(0, 0);

    for (const cmd of this.commands) {
      let segmentLength = 0;
      switch (cmd.type) {
        case 'Move':
          cursor = cmd.end;
          subpathStart = cmd.end;
          // Move has 0 length
          break;
        case 'Line':
          segmentLength = cursor.subtract(cmd.end).length();
          if (currentDistance + segmentLength >= targetDistance) {
            const localT = (targetDistance - currentDistance) / segmentLength;
            return cursor.lerp(cmd.end, localT);
          }
          cursor = cmd.end;
          break;
        case 'Quadratic':
          if (cmd.control1) {
            segmentLength = this.getQuadraticLength(cursor, cmd.control1, cmd.end);
            if (currentDistance + segmentLength >= targetDistance) {
              const localT = (targetDistance - currentDistance) / segmentLength;
              return this.evaluateQuadratic(cursor, cmd.control1, cmd.end, localT);
            }
          }
          cursor = cmd.end;
          break;
        case 'Cubic':
          if (cmd.control1 && cmd.control2) {
            segmentLength = this.getCubicLength(cursor, cmd.control1, cmd.control2, cmd.end);
            if (currentDistance + segmentLength >= targetDistance) {
              const localT = (targetDistance - currentDistance) / segmentLength;
              return this.evaluateCubic(cursor, cmd.control1, cmd.control2, cmd.end, localT);
            }
          }
          cursor = cmd.end;
          break;
        case 'Close':
          segmentLength = cursor.subtract(subpathStart).length();
           if (currentDistance + segmentLength >= targetDistance) {
            const localT = (targetDistance - currentDistance) / segmentLength;
            return cursor.lerp(subpathStart, localT);
          }
          cursor = subpathStart;
          break;
      }
      currentDistance += segmentLength;
    }
    
    // Fallback to end point
    return cursor;
  }

  /**
   * Returns the tangent vector on the path at the normalized position t (0-1).
   * @param t The normalized position (0-1).
   * @returns The normalized tangent vector.
   */
  getTangentAt(t: number): Vector2 {
    const totalLength = this.getLength();
    if (totalLength === 0) return Vector2.RIGHT; // Default
    
    t = Math.max(0, Math.min(1, t));
    let targetDistance = t * totalLength;
    
    let currentDistance = 0;
    let cursor = new Vector2(0, 0);
    let subpathStart = new Vector2(0, 0);

    for (const cmd of this.commands) {
      let segmentLength = 0;
      switch (cmd.type) {
        case 'Move':
          cursor = cmd.end;
          subpathStart = cmd.end;
          break;
        case 'Line':
          segmentLength = cursor.subtract(cmd.end).length();
          if (currentDistance + segmentLength >= targetDistance || (t === 1 && currentDistance + segmentLength >= targetDistance - 0.0001)) {
            return cmd.end.subtract(cursor).normalize();
          }
          cursor = cmd.end;
          break;
        case 'Quadratic':
          if (cmd.control1) {
            segmentLength = this.getQuadraticLength(cursor, cmd.control1, cmd.end);
             if (currentDistance + segmentLength >= targetDistance || (t === 1 && currentDistance + segmentLength >= targetDistance - 0.0001)) {
              const localT = (targetDistance - currentDistance) / segmentLength;
              return this.evaluateQuadraticDerivative(cursor, cmd.control1, cmd.end, localT).normalize();
            }
          }
          cursor = cmd.end;
          break;
        case 'Cubic':
          if (cmd.control1 && cmd.control2) {
            segmentLength = this.getCubicLength(cursor, cmd.control1, cmd.control2, cmd.end);
             if (currentDistance + segmentLength >= targetDistance || (t === 1 && currentDistance + segmentLength >= targetDistance - 0.0001)) {
              const localT = (targetDistance - currentDistance) / segmentLength;
              return this.evaluateCubicDerivative(cursor, cmd.control1, cmd.control2, cmd.end, localT).normalize();
            }
          }
          cursor = cmd.end;
          break;
        case 'Close':
          segmentLength = cursor.subtract(subpathStart).length();
          if (currentDistance + segmentLength >= targetDistance || (t === 1 && currentDistance + segmentLength >= targetDistance - 0.0001)) {
            return subpathStart.subtract(cursor).normalize();
          }
          cursor = subpathStart;
          break;
      }
      currentDistance += segmentLength;
    }

    return Vector2.RIGHT;
  }

  // --- Helpers ---

  private getQuadraticLength(p0: Vector2, p1: Vector2, p2: Vector2): number {
    // Simple subdivision for approximation
    const steps = 10;
    let length = 0;
    let prev = p0;
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const current = this.evaluateQuadratic(p0, p1, p2, t);
      length += prev.subtract(current).length();
      prev = current;
    }
    return length;
  }

  private getCubicLength(p0: Vector2, p1: Vector2, p2: Vector2, p3: Vector2): number {
    const steps = 20;
    let length = 0;
    let prev = p0;
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const current = this.evaluateCubic(p0, p1, p2, p3, t);
      length += prev.subtract(current).length();
      prev = current;
    }
    return length;
  }

  private evaluateQuadratic(p0: Vector2, p1: Vector2, p2: Vector2, t: number): Vector2 {
    const oneMinusT = 1 - t;
    // (1-t)^2 * p0 + 2(1-t)t * p1 + t^2 * p2
    return p0.multiply(oneMinusT * oneMinusT)
      .add(p1.multiply(2 * oneMinusT * t))
      .add(p2.multiply(t * t));
  }

  private evaluateCubic(p0: Vector2, p1: Vector2, p2: Vector2, p3: Vector2, t: number): Vector2 {
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

  private evaluateQuadraticDerivative(p0: Vector2, p1: Vector2, p2: Vector2, t: number): Vector2 {
    // 2(1-t)(p1-p0) + 2t(p2-p1)
    const oneMinusT = 1 - t;
    return p1.subtract(p0).multiply(2 * oneMinusT)
      .add(p2.subtract(p1).multiply(2 * t));
  }

  private evaluateCubicDerivative(p0: Vector2, p1: Vector2, p2: Vector2, p3: Vector2, t: number): Vector2 {
    // 3(1-t)^2(p1-p0) + 6(1-t)t(p2-p1) + 3t^2(p3-p2)
    const oneMinusT = 1 - t;
    return p1.subtract(p0).multiply(3 * oneMinusT * oneMinusT)
      .add(p2.subtract(p1).multiply(6 * oneMinusT * t))
      .add(p3.subtract(p2).multiply(3 * t * t));
  }
}