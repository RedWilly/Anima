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

  /**
   * Returns a list of evenly spaced points along the path.
   * @param count The number of points to sample.
   * @returns Array of Vector2 points.
   */
  getPoints(count: number): Vector2[] {
    const points: Vector2[] = [];
    if (count <= 0) return points;
    if (count === 1) return [this.getPointAt(0)];

    for (let i = 0; i < count; i++) {
      const t = i / (count - 1);
      points.push(this.getPointAt(t));
    }
    return points;
  }

  /**
   * Returns the number of commands (segments) in the path.
   * @returns The number of commands.
   */
  getPointCount(): number {
    return this.commands.length;
  }

  /**
   * Creates a deep copy of the path.
   * @returns A new BezierPath instance.
   */
  clone(): BezierPath {
    const newPath = new BezierPath();
    newPath.commands = this.commands.map(cmd => ({ ...cmd })); // Shallow copy of command objects is enough as Vector2 is immutable-ish but let's be safe
    // Vector2 is technically mutable if we cheat, but here we treat as value.
    // However, the command object structure {type, end, ...} needs to be copied.
    // The properties are references to Vector2.
    newPath.currentPoint = this.currentPoint;
    newPath.startPoint = this.startPoint;
    return newPath;
  }

  /**
   * Returns a new BezierPath where all segments are converted to Cubic Bezier curves.
   * This facilitates morphing and other operations.
   * @returns A new BezierPath with only Move and Cubic commands.
   */
  toCubic(): BezierPath {
    const newPath = new BezierPath();
    let cursor = new Vector2(0, 0);
    let subpathStart = new Vector2(0, 0);

    for (const cmd of this.commands) {
      switch (cmd.type) {
        case 'Move':
          newPath.moveTo(cmd.end);
          cursor = cmd.end;
          subpathStart = cmd.end;
          break;
        case 'Line':
          // Convert Line to Cubic
          // P0, P1 -> P0, P0 + (P1-P0)/3, P1 - (P1-P0)/3, P1
          const c1 = cursor.add(cmd.end.subtract(cursor).multiply(1 / 3));
          const c2 = cmd.end.subtract(cmd.end.subtract(cursor).multiply(1 / 3));
          newPath.cubicTo(c1, c2, cmd.end);
          cursor = cmd.end;
          break;
        case 'Quadratic':
          if (cmd.control1) {
            // Convert Quadratic to Cubic
            // CP1 = P0 + 2/3 * (QP1 - P0)
            // CP2 = P1 + 2/3 * (QP1 - P1)
            const qp1 = cmd.control1;
            const cubicC1 = cursor.add(qp1.subtract(cursor).multiply(2 / 3));
            const cubicC2 = cmd.end.add(qp1.subtract(cmd.end).multiply(2 / 3));
            newPath.cubicTo(cubicC1, cubicC2, cmd.end);
          }
          cursor = cmd.end;
          break;
        case 'Cubic':
          if (cmd.control1 && cmd.control2) {
            newPath.cubicTo(cmd.control1, cmd.control2, cmd.end);
          }
          cursor = cmd.end;
          break;
        case 'Close':
          // Treat Close as Line to start, then Line -> Cubic
          const closeC1 = cursor.add(subpathStart.subtract(cursor).multiply(1 / 3));
          const closeC2 = subpathStart.subtract(subpathStart.subtract(cursor).multiply(1 / 3));
          newPath.cubicTo(closeC1, closeC2, subpathStart);
          // Note: We don't call closePath() on the new path because strictly speaking
          // we are converting structure to cubics. But we might want to preserve the 'Close' semantic?
          // For morphing, having explicit points is better.
          // However, if we want to fill, we might need the Close command.
          // But toCubic is mostly for morphing interpolation where we treat everything as curves.
          // Let's stick to explicit cubic to start.
          cursor = subpathStart;
          break;
      }
    }
    return newPath;
  }

  /**
   * Interpolates between two paths.
   * @param path1 The start path.
   * @param path2 The end path.
   * @param t The interpolation factor (0-1).
   * @returns The interpolated path.
   */
  static interpolate(path1: BezierPath, path2: BezierPath, t: number): BezierPath {
    const [p1, p2] = BezierPath.matchPoints(path1, path2);
    const result = new BezierPath();
    
    // Assuming matchPoints returns paths with identical structure (Move then Cubics)
    // We can iterate commands directly.
    const cmds1 = p1.commands;
    const cmds2 = p2.commands;
    
    for (let i = 0; i < cmds1.length; i++) {
      const c1 = cmds1[i]!;
      const c2 = cmds2[i]!;
      
      if (c1.type === 'Move' && c2.type === 'Move') {
        result.moveTo(c1.end.lerp(c2.end, t));
      } else if (c1.type === 'Cubic' && c2.type === 'Cubic') {
        if (c1.control1 && c1.control2 && c2.control1 && c2.control2) {
          result.cubicTo(
            c1.control1.lerp(c2.control1, t),
            c1.control2.lerp(c2.control2, t),
            c1.end.lerp(c2.end, t)
          );
        }
      } else {
        // Fallback for unexpected mismatch (shouldn't happen after matchPoints)
        result.moveTo(c1.end.lerp(c2.end, t));
      }
    }
    
    return result;
  }

  /**
   * Matches the number of points/commands in two paths for morphing.
   * Returns two new paths that are structurally compatible.
   * @param path1 The first path.
   * @param path2 The second path.
   * @returns A tuple [path1, path2] of compatible paths.
   */
  static matchPoints(path1: BezierPath, path2: BezierPath): [BezierPath, BezierPath] {
    let p1 = path1.toCubic();
    let p2 = path2.toCubic();

    const count1 = p1.commands.length;
    const count2 = p2.commands.length;

    if (count1 === count2) return [p1, p2];

    // Identify which path needs more points
    // We will subdivide curves in the shorter path until counts match
    if (count1 < count2) {
      p1 = BezierPath.subdividePath(p1, count2);
    } else {
      p2 = BezierPath.subdividePath(p2, count1);
    }

    return [p1, p2];
  }

  private static subdividePath(path: BezierPath, targetCount: number): BezierPath {
    const currentCount = path.commands.length;
    if (currentCount >= targetCount) return path;

    const needed = targetCount - currentCount;
    // Simple strategy: Iterate through commands and split them.
    // We can split 'needed' curves. 
    // Ideally we spread the splits evenly.
    
    // We will reconstruct the path
    const newPath = new BezierPath();
    const commands = path.commands;
    
    // We want to split 'needed' times.
    // We have 'commands.length' items.
    // However, the first command is usually 'Move', which we can't split (it's a point).
    // We only split 'Cubic' commands.
    
    // Identify indices of split-able commands (Cubics)
    const cubicIndices: number[] = [];
    for (let i = 0; i < commands.length; i++) {
      if (commands[i]!.type === 'Cubic') {
        cubicIndices.push(i);
      }
    }
    
    if (cubicIndices.length === 0) {
      // Degenerate case: Path has no curves (only moves?). 
      // Just append Moves or Line-likes?
      // If it's just a Move, we can't really "morph" it to a shape meaningfully without adding degenerate curves at the point.
      // Let's assume we can add degenerate cubics at the last point.
      const lastCmd = commands[commands.length - 1];
      if (lastCmd) {
          const pt = lastCmd.end;
          const result = path.clone();
          for(let k=0; k<needed; k++) {
              result.cubicTo(pt, pt, pt);
          }
          return result;
      }
      return path; // Should not happen for valid paths
    }

    // Determine how many times each segment needs to be split
    // For now, let's just split the first 'needed' segments once.
    // If needed > cubicIndices.length, we might need loop.
    
    // Better strategy: repeatedly find the longest segment and split it?
    // That requires tracking state.
    
    // Simpler strategy for this iteration:
    // Just split curves starting from the beginning until we have added 'needed' extra curves.
    
    let splitsPerformed = 0;
    
    let cursor = new Vector2(0, 0); // Track start of current segment
    
    for (let i = 0; i < commands.length; i++) {
      const cmd = commands[i]!;
      
      if (cmd.type === 'Move') {
        newPath.moveTo(cmd.end);
        cursor = cmd.end;
      } else if (cmd.type === 'Cubic' && splitsPerformed < needed) {
        // Split this cubic into two
        if (cmd.control1 && cmd.control2) {
           const [c1, c2] = BezierPath.splitCubic(cursor, cmd.control1, cmd.control2, cmd.end, 0.5);
           
           newPath.cubicTo(c1.control1!, c1.control2!, c1.end);
           newPath.cubicTo(c2.control1!, c2.control2!, c2.end);
           
           splitsPerformed++;
           cursor = cmd.end;
        } else {
             // Should not happen for valid Cubic
             newPath.commands.push(cmd);
             cursor = cmd.end;
        }
      } else {
        // Just copy
        if (cmd.type === 'Cubic' && cmd.control1 && cmd.control2) {
             newPath.cubicTo(cmd.control1, cmd.control2, cmd.end);
        }
        // Handle other types if any (shouldn't be in normalized path)
        cursor = cmd.end;
      }
    }
    
    // If we still need more (e.g., we ran out of curves to split once), recurse
    if (newPath.commands.length < targetCount) {
        return BezierPath.subdividePath(newPath, targetCount);
    }
    
    return newPath;
  }

  private static splitCubic(p0: Vector2, p1: Vector2, p2: Vector2, p3: Vector2, t: number): [PathCommand, PathCommand] {
      // De Casteljau's algorithm
      const p01 = p0.lerp(p1, t);
      const p12 = p1.lerp(p2, t);
      const p23 = p2.lerp(p3, t);
      
      const p012 = p01.lerp(p12, t);
      const p123 = p12.lerp(p23, t);
      
      const p0123 = p012.lerp(p123, t);
      
      const cmd1: PathCommand = {
          type: 'Cubic',
          control1: p01,
          control2: p012,
          end: p0123
      };
      
      const cmd2: PathCommand = {
          type: 'Cubic',
          control1: p123,
          control2: p23,
          end: p3
      };
      
      return [cmd1, cmd2];
  }
}