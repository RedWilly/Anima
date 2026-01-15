import { Vector2 } from '../Vector2/Vector2';
import type { PathCommand } from './types';
import { getTangentAtPath } from './sampling';
import { getQuadraticLength, getCubicLength } from './length';
import { evaluateQuadratic, evaluateCubic } from './evaluators';
import { toCubicCommands, subdividePath } from './morphing';

/**
 * A class representing a Bezier path, capable of storing standard path commands
 * (move, line, quadratic curve, cubic curve, close).
 */
export class BezierPath {
    private commands: PathCommand[] = [];
    private currentPoint: Vector2 = Vector2.ZERO;
    private startPoint: Vector2 = Vector2.ZERO;

    // Caching for O(1) length and O(log N) point sampling
    private cachedLength: number | null = null;
    private segmentLengths: number[] = [];
    private segmentCDF: number[] = [];

    /** Invalidates the cached length data. Called after any path modification. */
    private invalidateCache(): void {
        this.cachedLength = null;
        this.segmentLengths = [];
        this.segmentCDF = [];
    }

    /** Builds the cache if not already valid. */
    private ensureCache(): void {
        if (this.cachedLength !== null) return;

        this.segmentLengths = [];
        this.segmentCDF = [];
        let totalLength = 0;
        let cursor = Vector2.ZERO;
        let subpathStart = Vector2.ZERO;

        for (const cmd of this.commands) {
            let segmentLength = 0;
            switch (cmd.type) {
                case 'Move':
                    cursor = cmd.end;
                    subpathStart = cmd.end;
                    break;
                case 'Line':
                    segmentLength = cursor.subtract(cmd.end).length();
                    cursor = cmd.end;
                    break;
                case 'Quadratic':
                    if (cmd.control1) {
                        segmentLength = getQuadraticLength(cursor, cmd.control1, cmd.end);
                    }
                    cursor = cmd.end;
                    break;
                case 'Cubic':
                    if (cmd.control1 && cmd.control2) {
                        segmentLength = getCubicLength(cursor, cmd.control1, cmd.control2, cmd.end);
                    }
                    cursor = cmd.end;
                    break;
                case 'Close':
                    segmentLength = cursor.subtract(subpathStart).length();
                    cursor = subpathStart;
                    break;
            }
            this.segmentLengths.push(segmentLength);
            totalLength += segmentLength;
            this.segmentCDF.push(totalLength);
        }

        this.cachedLength = totalLength;
    }

    /**
     * Moves the current point to the specified location.
     * Starts a new subpath.
     */
    moveTo(point: Vector2): void {
        this.invalidateCache();
        this.commands.push({ type: 'Move', end: point });
        this.currentPoint = point;
        this.startPoint = point;
    }

    /**
     * Adds a line segment from the current point to the specified point.
     */
    lineTo(point: Vector2): void {
        this.invalidateCache();
        this.commands.push({ type: 'Line', end: point });
        this.currentPoint = point;
    }

    /**
     * Adds a quadratic Bezier curve from the current point to the specified end point.
     */
    quadraticTo(control: Vector2, end: Vector2): void {
        this.invalidateCache();
        this.commands.push({ type: 'Quadratic', control1: control, end: end });
        this.currentPoint = end;
    }

    /**
     * Adds a cubic Bezier curve from the current point to the specified end point.
     */
    cubicTo(control1: Vector2, control2: Vector2, end: Vector2): void {
        this.invalidateCache();
        this.commands.push({
            type: 'Cubic',
            control1: control1,
            control2: control2,
            end: end
        });
        this.currentPoint = end;
    }

    /**
     * Closes the current subpath by drawing a line to the start point.
     */
    closePath(): void {
        this.invalidateCache();
        this.commands.push({ type: 'Close', end: this.startPoint });
        this.currentPoint = this.startPoint;
    }

    /** Returns the list of commands in this path. */
    getCommands(): PathCommand[] {
        return [...this.commands];
    }

    /** Calculates the total length of the path. */
    getLength(): number {
        this.ensureCache();
        return this.cachedLength!;
    }

    /**
     * Returns the point on the path at the normalized position t (0-1).
     * Uses cached CDF for O(log N) lookup instead of O(N) recalculation.
     */
    getPointAt(t: number): Vector2 {
        this.ensureCache();
        const totalLength = this.cachedLength!;

        if (totalLength === 0 || this.commands.length === 0) {
            return this.commands.length > 0 ? this.commands[this.commands.length - 1]!.end : Vector2.ZERO;
        }

        t = Math.max(0, Math.min(1, t));
        const targetDistance = t * totalLength;

        // Binary search for the segment containing targetDistance
        let low = 0;
        let high = this.segmentCDF.length - 1;
        while (low < high) {
            const mid = (low + high) >>> 1;
            if (this.segmentCDF[mid]! < targetDistance) {
                low = mid + 1;
            } else {
                high = mid;
            }
        }

        const segmentIndex = low;
        const cmd = this.commands[segmentIndex];
        if (!cmd) return Vector2.ZERO;

        // Calculate the starting cursor for this segment
        let cursor = Vector2.ZERO;
        let subpathStart = Vector2.ZERO;
        for (let i = 0; i < segmentIndex; i++) {
            const c = this.commands[i]!;
            if (c.type === 'Move') {
                cursor = c.end;
                subpathStart = c.end;
            } else if (c.type === 'Close') {
                cursor = subpathStart;
            } else {
                cursor = c.end;
            }
        }

        // Calculate local t within this segment
        const segmentStart = segmentIndex > 0 ? this.segmentCDF[segmentIndex - 1]! : 0;
        const segmentLength = this.segmentLengths[segmentIndex]!;
        const localT = segmentLength > 0 ? (targetDistance - segmentStart) / segmentLength : 0;

        // Evaluate the point at localT
        switch (cmd.type) {
            case 'Move':
                return cmd.end;
            case 'Line':
                return cursor.lerp(cmd.end, localT);
            case 'Quadratic':
                if (cmd.control1) {
                    return evaluateQuadratic(cursor, cmd.control1, cmd.end, localT);
                }
                return cmd.end;
            case 'Cubic':
                if (cmd.control1 && cmd.control2) {
                    return evaluateCubic(cursor, cmd.control1, cmd.control2, cmd.end, localT);
                }
                return cmd.end;
            case 'Close':
                return cursor.lerp(subpathStart, localT);
            default:
                return cursor;
        }
    }

    /** Returns the tangent vector on the path at the normalized position t (0-1). */
    getTangentAt(t: number): Vector2 {
        return getTangentAtPath(this.commands, t);
    }

    /** Returns a list of evenly spaced points along the path. */
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

    /** Returns the number of commands (segments) in the path. */
    getPointCount(): number {
        return this.commands.length;
    }

    /** Creates a deep copy of the path. */
    clone(): BezierPath {
        const newPath = new BezierPath();
        newPath.commands = this.commands.map(cmd => ({ ...cmd }));
        newPath.currentPoint = this.currentPoint;
        newPath.startPoint = this.startPoint;
        return newPath;
    }

    /** Returns a new BezierPath where all segments are converted to Cubic curves. */
    toCubic(): BezierPath {
        const newPath = new BezierPath();
        const cubicCmds = toCubicCommands(this.commands);
        for (const cmd of cubicCmds) {
            if (cmd.type === 'Move') {
                newPath.moveTo(cmd.end);
            } else if (cmd.type === 'Cubic' && cmd.control1 && cmd.control2) {
                newPath.cubicTo(cmd.control1, cmd.control2, cmd.end);
            }
        }
        return newPath;
    }

    /** Interpolates between two paths. */
    static interpolate(path1: BezierPath, path2: BezierPath, t: number): BezierPath {
        const [p1, p2] = BezierPath.matchPoints(path1, path2);
        const result = new BezierPath();

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
                result.moveTo(c1.end.lerp(c2.end, t));
            }
        }

        return result;
    }

    /** Matches the number of points/commands in two paths for morphing. */
    static matchPoints(path1: BezierPath, path2: BezierPath): [BezierPath, BezierPath] {
        let p1 = path1.toCubic();
        let p2 = path2.toCubic();

        const count1 = p1.commands.length;
        const count2 = p2.commands.length;

        if (count1 === count2) return [p1, p2];

        if (count1 < count2) {
            const subdivided = subdividePath(p1.commands, count2);
            p1 = BezierPath.fromCommands(subdivided);
        } else {
            const subdivided = subdividePath(p2.commands, count1);
            p2 = BezierPath.fromCommands(subdivided);
        }

        return [p1, p2];
    }

    /** Creates a BezierPath from an array of commands. */
    private static fromCommands(commands: PathCommand[]): BezierPath {
        const path = new BezierPath();
        for (const cmd of commands) {
            if (cmd.type === 'Move') {
                path.moveTo(cmd.end);
            } else if (cmd.type === 'Cubic' && cmd.control1 && cmd.control2) {
                path.cubicTo(cmd.control1, cmd.control2, cmd.end);
            }
        }
        return path;
    }
}
