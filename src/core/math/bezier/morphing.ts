import { Vector2 } from '../Vector2/Vector2';
import type { PathCommand } from './types';

/**
 * Converts a path to use only cubic Bezier curves.
 * Lines and quadratics are converted to equivalent cubics.
 */
export function toCubicCommands(commands: PathCommand[]): PathCommand[] {
    const result: PathCommand[] = [];
    let cursor = new Vector2(0, 0);
    let subpathStart = new Vector2(0, 0);

    for (const cmd of commands) {
        switch (cmd.type) {
            case 'Move':
                result.push({ type: 'Move', end: cmd.end });
                cursor = cmd.end;
                subpathStart = cmd.end;
                break;
            case 'Line': {
                // Convert Line to Cubic: P0, P1 -> P0, P0+(P1-P0)/3, P1-(P1-P0)/3, P1
                const delta = cmd.end.subtract(cursor);
                const c1 = cursor.add(delta.multiply(1 / 3));
                const c2 = cmd.end.subtract(delta.multiply(1 / 3));
                result.push({ type: 'Cubic', control1: c1, control2: c2, end: cmd.end });
                cursor = cmd.end;
                break;
            }
            case 'Quadratic':
                if (cmd.control1) {
                    // Convert Quadratic to Cubic
                    // CP1 = P0 + 2/3 * (QP1 - P0)
                    // CP2 = P1 + 2/3 * (QP1 - P1)
                    const qp1 = cmd.control1;
                    const cubicC1 = cursor.add(qp1.subtract(cursor).multiply(2 / 3));
                    const cubicC2 = cmd.end.add(qp1.subtract(cmd.end).multiply(2 / 3));
                    result.push({ type: 'Cubic', control1: cubicC1, control2: cubicC2, end: cmd.end });
                }
                cursor = cmd.end;
                break;
            case 'Cubic':
                if (cmd.control1 && cmd.control2) {
                    result.push({
                        type: 'Cubic',
                        control1: cmd.control1,
                        control2: cmd.control2,
                        end: cmd.end
                    });
                }
                cursor = cmd.end;
                break;
            case 'Close': {
                // Convert close to cubic line back to start
                const delta = subpathStart.subtract(cursor);
                const c1 = cursor.add(delta.multiply(1 / 3));
                const c2 = subpathStart.subtract(delta.multiply(1 / 3));
                result.push({ type: 'Cubic', control1: c1, control2: c2, end: subpathStart });
                cursor = subpathStart;
                break;
            }
        }
    }
    return result;
}

/**
 * Splits a cubic Bezier curve at parameter t using De Casteljau's algorithm.
 */
export function splitCubic(
    p0: Vector2,
    p1: Vector2,
    p2: Vector2,
    p3: Vector2,
    t: number
): [PathCommand, PathCommand] {
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

/**
 * Subdivides a path to match a target command count.
 * Uses iterative approach to avoid stack overflow on complex paths.
 */
export function subdividePath(commands: PathCommand[], targetCount: number): PathCommand[] {
    let currentCommands = commands;

    while (currentCommands.length < targetCount) {
        const needed = targetCount - currentCommands.length;
        const result: PathCommand[] = [];

        // Identify cubic indices for splitting
        const cubicIndices: number[] = [];
        for (let i = 0; i < currentCommands.length; i++) {
            if (currentCommands[i]!.type === 'Cubic') {
                cubicIndices.push(i);
            }
        }

        if (cubicIndices.length === 0) {
            // No curves to split - add degenerate cubics at last point
            const lastCmd = currentCommands[currentCommands.length - 1];
            if (lastCmd) {
                const pt = lastCmd.end;
                const resultCmds = [...currentCommands];
                for (let k = 0; k < needed; k++) {
                    resultCmds.push({ type: 'Cubic', control1: pt, control2: pt, end: pt });
                }
                return resultCmds;
            }
            return currentCommands;
        }

        let splitsPerformed = 0;
        let cursor = new Vector2(0, 0);

        for (let i = 0; i < currentCommands.length; i++) {
            const cmd = currentCommands[i]!;

            if (cmd.type === 'Move') {
                result.push({ type: 'Move', end: cmd.end });
                cursor = cmd.end;
            } else if (cmd.type === 'Cubic' && splitsPerformed < needed) {
                if (cmd.control1 && cmd.control2) {
                    const [c1, c2] = splitCubic(cursor, cmd.control1, cmd.control2, cmd.end, 0.5);
                    result.push(c1);
                    result.push(c2);
                    splitsPerformed++;
                    cursor = cmd.end;
                } else {
                    result.push(cmd);
                    cursor = cmd.end;
                }
            } else {
                if (cmd.type === 'Cubic' && cmd.control1 && cmd.control2) {
                    result.push({
                        type: 'Cubic',
                        control1: cmd.control1,
                        control2: cmd.control2,
                        end: cmd.end
                    });
                }
                cursor = cmd.end;
            }
        }

        currentCommands = result;
    }

    return currentCommands;
}
