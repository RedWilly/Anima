import { VMobject } from '../VMobject';
import { BezierPath } from '../../core/math/bezier/BezierPath';
import { Vector2 } from '../../core/math/Vector2/Vector2';
import type { Glyph as FontkitGlyph } from 'fontkit';

/**
 * Converts a fontkit path command to BezierPath commands.
 * Fontkit uses: moveTo, lineTo, quadraticCurveTo, bezierCurveTo, closePath
 */
function convertFontkitPath(
    fontkitPath: FontkitGlyph['path'],
    scale: number,
    offsetX: number,
    offsetY: number
): BezierPath {
    const path = new BezierPath();
    const commands = fontkitPath.commands;

    const transformX = (val: number) => val * scale + offsetX;
    const transformY = (val: number) => -val * scale + offsetY;

    for (const cmd of commands) {
        const type = cmd.command;
        const args = cmd.args;

        if (type === 'moveTo' && args.length >= 2) {
            const x = args[0] ?? 0;
            const y = args[1] ?? 0;
            path.moveTo(new Vector2(transformX(x), transformY(y)));
        } else if (type === 'lineTo' && args.length >= 2) {
            const x = args[0] ?? 0;
            const y = args[1] ?? 0;
            path.lineTo(new Vector2(transformX(x), transformY(y)));
        } else if (type === 'quadraticCurveTo' && args.length >= 4) {
            const cpx = args[0] ?? 0;
            const cpy = args[1] ?? 0;
            const x = args[2] ?? 0;
            const y = args[3] ?? 0;
            const cp = new Vector2(transformX(cpx), transformY(cpy));
            const end = new Vector2(transformX(x), transformY(y));
            path.quadraticTo(cp, end);
        } else if (type === 'bezierCurveTo' && args.length >= 6) {
            const cp1x = args[0] ?? 0;
            const cp1y = args[1] ?? 0;
            const cp2x = args[2] ?? 0;
            const cp2y = args[3] ?? 0;
            const x = args[4] ?? 0;
            const y = args[5] ?? 0;
            const cp1 = new Vector2(transformX(cp1x), transformY(cp1y));
            const cp2 = new Vector2(transformX(cp2x), transformY(cp2y));
            const end = new Vector2(transformX(x), transformY(y));
            path.cubicTo(cp1, cp2, end);
        } else if (type === 'closePath') {
            path.closePath();
        }
    }

    return path;
}

/**
 * A VMobject representing a single glyph character.
 * Converts fontkit glyph path to BezierPath for rendering.
 */
export class Glyph extends VMobject {
    readonly character: string;
    readonly glyphId: number;

    constructor(
        fontkitGlyph: FontkitGlyph,
        character: string,
        scale: number,
        offsetX: number,
        offsetY: number
    ) {
        super();
        this.character = character;
        this.glyphId = fontkitGlyph.id;

        const glyphPath = fontkitGlyph.path;
        if (glyphPath.commands.length > 0) {
            const bezierPath = convertFontkitPath(glyphPath, scale, offsetX, offsetY);
            this.addPath(bezierPath);
        }
    }
}
