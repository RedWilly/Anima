import type { SKRSContext2D } from '@napi-rs/canvas';
import { Mobject, VMobject } from '../mobjects';
import { Matrix4x4, type PathCommand } from '../math';

/**
 * Draws a Mobject to a canvas context.
 * Handles VMobject path rendering and generic submobject recursion.
 */
export function drawMobject(
    ctx: SKRSContext2D,
    mobject: Mobject,
    worldToScreen: Matrix4x4
): void {
    // Skip invisible mobjects
    if (mobject.opacity <= 0) return;

    ctx.save();
    ctx.globalAlpha *= mobject.opacity;

    if (mobject instanceof VMobject) {
        drawVMobject(ctx, mobject, worldToScreen);
    }

    for (const child of mobject.getSubmobjects()) {
        drawMobject(ctx, child, worldToScreen);
    }

    ctx.restore();
}

/**
 * Draws a VMobject's paths to the canvas.
 */
function drawVMobject(
    ctx: SKRSContext2D,
    vmobject: VMobject,
    worldToScreen: Matrix4x4
): void {
    const paths = vmobject.paths;
    if (paths.length === 0) return;
    const transform = worldToScreen.multiply(vmobject.getRenderMatrix());

    // Draw each path
    for (const path of paths) {
        const commands = path.getCommands();
        if (commands.length === 0) continue;

        ctx.beginPath();
        applyPathCommands(ctx, commands, transform);

        // Fill first (so stroke is on top)
        if (vmobject.getFillOpacity() > 0) {
            const fillColor = vmobject.getFillColor();
            ctx.fillStyle = `rgba(${fillColor.r}, ${fillColor.g}, ${fillColor.b}, ${vmobject.getFillOpacity()})`;
            ctx.fill();
        }

        // Then stroke
        if (vmobject.getStrokeWidth() > 0) {
            const strokeColor = vmobject.getStrokeColor();
            ctx.strokeStyle = `rgba(${strokeColor.r}, ${strokeColor.g}, ${strokeColor.b}, ${strokeColor.a})`;
            ctx.lineWidth = vmobject.getStrokeWidth();
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.stroke();
        }
    }
}

/**
 * Applies BezierPath commands to a canvas context.
 */
function applyPathCommands(
    ctx: SKRSContext2D,
    commands: PathCommand[],
    transform: Matrix4x4
): void {
    for (const cmd of commands) {
        switch (cmd.type) {
            case 'Move': {
                const p = transform.transformPoint2D(cmd.end);
                ctx.moveTo(p.x, p.y);
                break;
            }
            case 'Line': {
                const p = transform.transformPoint2D(cmd.end);
                ctx.lineTo(p.x, p.y);
                break;
            }
            case 'Quadratic': {
                if (cmd.control1) {
                    const cp = transform.transformPoint2D(cmd.control1);
                    const ep = transform.transformPoint2D(cmd.end);
                    ctx.quadraticCurveTo(cp.x, cp.y, ep.x, ep.y);
                }
                break;
            }
            case 'Cubic': {
                if (cmd.control1 && cmd.control2) {
                    const cp1 = transform.transformPoint2D(cmd.control1);
                    const cp2 = transform.transformPoint2D(cmd.control2);
                    const ep = transform.transformPoint2D(cmd.end);
                    ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, ep.x, ep.y);
                }
                break;
            }
            case 'Close': {
                ctx.closePath();
                break;
            }
        }
    }
}
