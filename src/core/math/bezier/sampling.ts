import { Vector2 } from '../Vector2/Vector2';
import type { PathCommand } from './types';
import { evaluateQuadratic, evaluateCubic } from './evaluators';
import { evaluateQuadraticDerivative, evaluateCubicDerivative } from './evaluators';
import { getQuadraticLength, getCubicLength } from './length';

/**
 * Calculates the total length of a path from its commands.
 */
export function getPathLength(commands: PathCommand[]): number {
    let length = 0;
    let cursor = new Vector2(0, 0);
    let subpathStart = new Vector2(0, 0);

    for (const cmd of commands) {
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
                    length += getQuadraticLength(cursor, cmd.control1, cmd.end);
                }
                cursor = cmd.end;
                break;
            case 'Cubic':
                if (cmd.control1 && cmd.control2) {
                    length += getCubicLength(cursor, cmd.control1, cmd.control2, cmd.end);
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
 */
export function getPointAtPath(commands: PathCommand[], t: number): Vector2 {
    const totalLength = getPathLength(commands);
    if (totalLength === 0) {
        return commands.length > 0 ? commands[commands.length - 1]!.end : Vector2.ZERO;
    }

    t = Math.max(0, Math.min(1, t));
    const targetDistance = t * totalLength;

    let currentDistance = 0;
    let cursor = new Vector2(0, 0);
    let subpathStart = new Vector2(0, 0);

    for (const cmd of commands) {
        let segmentLength = 0;
        switch (cmd.type) {
            case 'Move':
                cursor = cmd.end;
                subpathStart = cmd.end;
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
                    segmentLength = getQuadraticLength(cursor, cmd.control1, cmd.end);
                    if (currentDistance + segmentLength >= targetDistance) {
                        const localT = (targetDistance - currentDistance) / segmentLength;
                        return evaluateQuadratic(cursor, cmd.control1, cmd.end, localT);
                    }
                }
                cursor = cmd.end;
                break;
            case 'Cubic':
                if (cmd.control1 && cmd.control2) {
                    segmentLength = getCubicLength(cursor, cmd.control1, cmd.control2, cmd.end);
                    if (currentDistance + segmentLength >= targetDistance) {
                        const localT = (targetDistance - currentDistance) / segmentLength;
                        return evaluateCubic(cursor, cmd.control1, cmd.control2, cmd.end, localT);
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

    return cursor;
}

/**
 * Returns the tangent vector on the path at the normalized position t (0-1).
 */
export function getTangentAtPath(commands: PathCommand[], t: number): Vector2 {
    const totalLength = getPathLength(commands);
    if (totalLength === 0) return Vector2.RIGHT;

    t = Math.max(0, Math.min(1, t));
    const targetDistance = t * totalLength;

    let currentDistance = 0;
    let cursor = new Vector2(0, 0);
    let subpathStart = new Vector2(0, 0);

    for (const cmd of commands) {
        let segmentLength = 0;
        switch (cmd.type) {
            case 'Move':
                cursor = cmd.end;
                subpathStart = cmd.end;
                break;
            case 'Line':
                segmentLength = cursor.subtract(cmd.end).length();
                if (currentDistance + segmentLength >= targetDistance) {
                    return cmd.end.subtract(cursor).normalize();
                }
                cursor = cmd.end;
                break;
            case 'Quadratic':
                if (cmd.control1) {
                    segmentLength = getQuadraticLength(cursor, cmd.control1, cmd.end);
                    if (currentDistance + segmentLength >= targetDistance) {
                        const localT = (targetDistance - currentDistance) / segmentLength;
                        return evaluateQuadraticDerivative(cursor, cmd.control1, cmd.end, localT).normalize();
                    }
                }
                cursor = cmd.end;
                break;
            case 'Cubic':
                if (cmd.control1 && cmd.control2) {
                    segmentLength = getCubicLength(cursor, cmd.control1, cmd.control2, cmd.end);
                    if (currentDistance + segmentLength >= targetDistance) {
                        const localT = (targetDistance - currentDistance) / segmentLength;
                        return evaluateCubicDerivative(
                            cursor, cmd.control1, cmd.control2, cmd.end, localT
                        ).normalize();
                    }
                }
                cursor = cmd.end;
                break;
            case 'Close':
                segmentLength = cursor.subtract(subpathStart).length();
                if (currentDistance + segmentLength >= targetDistance) {
                    return subpathStart.subtract(cursor).normalize();
                }
                cursor = subpathStart;
                break;
        }
        currentDistance += segmentLength;
    }

    return Vector2.RIGHT;
}
