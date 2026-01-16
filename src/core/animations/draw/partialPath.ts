import { BezierPath } from '../../math/bezier/BezierPath';
import { Vector2 } from '../../math/Vector2/Vector2';
import type { PathCommand } from '../../math/bezier/types';
import { getQuadraticLength, getCubicLength } from '../../math/bezier/length';
import { evaluateQuadratic } from '../../math/bezier/evaluators';
import { splitCubicAt } from '../../math/bezier/split';

/**
 * Returns a partial BezierPath from the start up to a given normalized t (0–1).
 * The path is truncated at the exact point corresponding to t * totalLength.
 */
export function getPartialPath(path: BezierPath, t: number): BezierPath {
    if (t <= 0) {
        return new BezierPath();
    }
    if (t >= 1) {
        return path.clone();
    }

    const totalLength = path.getLength();
    if (totalLength === 0) {
        return path.clone();
    }

    const targetLength = t * totalLength;
    const commands = path.getCommands();
    const result = new BezierPath();

    let accumulatedLength = 0;
    let cursor = Vector2.ZERO;
    let subpathStart = Vector2.ZERO;

    for (const cmd of commands) {
        const segmentLength = getSegmentLength(cmd, cursor, subpathStart);
        const newAccumulated = accumulatedLength + segmentLength;

        if (newAccumulated <= targetLength) {
            // Include entire segment
            appendCommand(result, cmd, cursor, subpathStart);
            updateCursor(cmd, cursor, subpathStart, (c, s) => {
                cursor = c;
                subpathStart = s;
            });
            accumulatedLength = newAccumulated;
        } else {
            // Partial segment needed
            const remaining = targetLength - accumulatedLength;
            const localT = segmentLength > 0 ? remaining / segmentLength : 0;
            appendPartialCommand(result, cmd, cursor, subpathStart, localT);
            break;
        }
    }

    return result;
}

function getSegmentLength(
    cmd: PathCommand,
    cursor: Vector2,
    subpathStart: Vector2
): number {
    switch (cmd.type) {
        case 'Move':
            return 0;
        case 'Line':
            return cursor.subtract(cmd.end).length();
        case 'Quadratic':
            if (cmd.control1) {
                return getQuadraticLength(cursor, cmd.control1, cmd.end);
            }
            return 0;
        case 'Cubic':
            if (cmd.control1 && cmd.control2) {
                return getCubicLength(cursor, cmd.control1, cmd.control2, cmd.end);
            }
            return 0;
        case 'Close':
            return cursor.subtract(subpathStart).length();
        default:
            return 0;
    }
}

function updateCursor(
    cmd: PathCommand,
    _cursor: Vector2,
    subpathStart: Vector2,
    update: (cursor: Vector2, subpathStart: Vector2) => void
): void {
    switch (cmd.type) {
        case 'Move':
            update(cmd.end, cmd.end);
            break;
        case 'Close':
            update(subpathStart, subpathStart);
            break;
        default:
            update(cmd.end, subpathStart);
            break;
    }
}

function appendCommand(
    result: BezierPath,
    cmd: PathCommand,
    _cursor: Vector2,
    _subpathStart: Vector2
): void {
    switch (cmd.type) {
        case 'Move':
            result.moveTo(cmd.end);
            break;
        case 'Line':
            result.lineTo(cmd.end);
            break;
        case 'Quadratic':
            if (cmd.control1) {
                result.quadraticTo(cmd.control1, cmd.end);
            }
            break;
        case 'Cubic':
            if (cmd.control1 && cmd.control2) {
                result.cubicTo(cmd.control1, cmd.control2, cmd.end);
            }
            break;
        case 'Close':
            result.closePath();
            break;
    }
}

function appendPartialCommand(
    result: BezierPath,
    cmd: PathCommand,
    cursor: Vector2,
    subpathStart: Vector2,
    localT: number
): void {
    switch (cmd.type) {
        case 'Move':
            result.moveTo(cmd.end);
            break;
        case 'Line': {
            const point = cursor.lerp(cmd.end, localT);
            result.lineTo(point);
            break;
        }
        case 'Quadratic': {
            if (cmd.control1) {
                const point = evaluateQuadratic(cursor, cmd.control1, cmd.end, localT);
                // Approximate with line for partial quadratic
                result.lineTo(point);
            }
            break;
        }
        case 'Cubic': {
            if (cmd.control1 && cmd.control2) {
                const [first] = splitCubicAt(cursor, cmd.control1, cmd.control2, cmd.end, localT);
                result.cubicTo(first.control1, first.control2, first.end);
            }
            break;
        }
        case 'Close': {
            const point = cursor.lerp(subpathStart, localT);
            result.lineTo(point);
            break;
        }
    }
}
