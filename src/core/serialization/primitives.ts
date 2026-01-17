/**
 * Serializers for primitive math types.
 */

import { Vector2 } from '../math/Vector2/Vector2';
import { Matrix3x3 } from '../math/matrix/Matrix3x3';
import { Color } from '../math/color/Color';
import { BezierPath } from '../math/bezier/BezierPath';
import type { PathCommand } from '../math/bezier/types';
import type {
    SerializedVector2,
    SerializedMatrix3x3,
    SerializedColor,
    SerializedBezierPath,
    SerializedPathCommand,
} from './types';

// ========== Vector2 ==========

/** Converts a Vector2 to a plain object for serialization. */
export function serializeVector2(v: Vector2): SerializedVector2 {
    return { x: v.x, y: v.y };
}

/** Restores a Vector2 from serialized data. */
export function deserializeVector2(data: SerializedVector2): Vector2 {
    return new Vector2(data.x, data.y);
}

// ========== Matrix3x3 ==========

/** Converts a Matrix3x3 to a plain object for serialization. */
export function serializeMatrix3x3(m: Matrix3x3): SerializedMatrix3x3 {
    return { values: Array.from(m.values) };
}

/** Restores a Matrix3x3 from serialized data. */
export function deserializeMatrix3x3(data: SerializedMatrix3x3): Matrix3x3 {
    const values = new Float32Array(data.values);
    return new Matrix3x3(values);
}

// ========== Color ==========

/** Converts a Color to a plain object for serialization. */
export function serializeColor(c: Color): SerializedColor {
    return { r: c.r, g: c.g, b: c.b, a: c.a };
}

/** Restores a Color from serialized data. */
export function deserializeColor(data: SerializedColor): Color {
    return new Color(data.r, data.g, data.b, data.a);
}

// ========== PathCommand ==========

function serializePathCommand(cmd: PathCommand): SerializedPathCommand {
    const result: SerializedPathCommand = {
        type: cmd.type,
        end: serializeVector2(cmd.end),
    };

    // Add control points if they exist
    const withControl1 = cmd.control1
        ? { ...result, control1: serializeVector2(cmd.control1) }
        : result;
    const withControl2 = cmd.control2
        ? { ...withControl1, control2: serializeVector2(cmd.control2) }
        : withControl1;

    return withControl2;
}

function deserializePathCommand(data: SerializedPathCommand): PathCommand {
    const result: PathCommand = {
        type: data.type,
        end: deserializeVector2(data.end),
    };

    if (data.control1) {
        return { ...result, control1: deserializeVector2(data.control1) };
    }
    if (data.control2) {
        return { ...result, control2: deserializeVector2(data.control2) };
    }
    return result;
}

// ========== BezierPath ==========

/** Converts a BezierPath to a plain object for serialization. */
export function serializeBezierPath(path: BezierPath): SerializedBezierPath {
    const commands = path.getCommands().map(serializePathCommand);
    return { commands };
}

/** Restores a BezierPath from serialized data. */
export function deserializeBezierPath(data: SerializedBezierPath): BezierPath {
    const path = new BezierPath();
    for (const cmd of data.commands) {
        const end = deserializeVector2(cmd.end);
        switch (cmd.type) {
            case 'Move':
                path.moveTo(end);
                break;
            case 'Line':
                path.lineTo(end);
                break;
            case 'Quadratic':
                if (cmd.control1) {
                    path.quadraticTo(deserializeVector2(cmd.control1), end);
                }
                break;
            case 'Cubic':
                if (cmd.control1 && cmd.control2) {
                    path.cubicTo(
                        deserializeVector2(cmd.control1),
                        deserializeVector2(cmd.control2),
                        end
                    );
                }
                break;
            case 'Close':
                path.closePath();
                break;
        }
    }
    return path;
}
