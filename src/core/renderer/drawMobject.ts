import type { SKRSContext2D } from '@napi-rs/canvas';
import { VMobject } from '../../mobjects/VMobject';
import { VGroup } from '../../mobjects/VGroup';
import type { Mobject } from '../../mobjects/Mobject';
import { Matrix3x3 } from '../math/matrix/Matrix3x3';
import type { PathCommand } from '../math/bezier/types';

/**
 * Draws a Mobject to a canvas context.
 * Handles VMobject path rendering and VGroup recursion.
 */
export function drawMobject(
    ctx: SKRSContext2D,
    mobject: Mobject,
    worldToScreen: Matrix3x3
): void {
    // Skip invisible mobjects
    if (mobject.opacity <= 0) return;

    if (mobject instanceof VGroup) {
        drawVGroup(ctx, mobject, worldToScreen);
    } else if (mobject instanceof VMobject) {
        drawVMobject(ctx, mobject, worldToScreen);
    }
    // Base Mobject has no visual representation
}

/**
 * Draws a VGroup by recursively drawing its children.
 */
function drawVGroup(
    ctx: SKRSContext2D,
    vgroup: VGroup,
    worldToScreen: Matrix3x3
): void {
    // VGroup opacity affects all children
    if (vgroup.opacity <= 0) return;

    ctx.save();
    ctx.globalAlpha *= vgroup.opacity;

    for (const child of vgroup.getChildren()) {
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
    worldToScreen: Matrix3x3
): void {
    const paths = vmobject.paths;
    if (paths.length === 0) return;

    // Combine mobject's world matrix with world-to-screen transform
    const mobjectWorld = vmobject.getWorldMatrix();
    const transform = worldToScreen.multiply(mobjectWorld);

    ctx.save();
    ctx.globalAlpha *= vmobject.opacity;

    // Draw each path
    for (const path of paths) {
        const commands = path.getCommands();
        if (commands.length === 0) continue;

        ctx.beginPath();
        applyPathCommands(ctx, commands, transform);

        // Fill first (so stroke is on top)
        if (vmobject.fillOpacity > 0) {
            const fillColor = vmobject.fillColor;
            ctx.fillStyle = `rgba(${fillColor.r}, ${fillColor.g}, ${fillColor.b}, ${vmobject.fillOpacity})`;
            ctx.fill();
        }

        // Then stroke
        if (vmobject.strokeWidth > 0) {
            const strokeColor = vmobject.strokeColor;
            ctx.strokeStyle = `rgba(${strokeColor.r}, ${strokeColor.g}, ${strokeColor.b}, ${strokeColor.a})`;
            ctx.lineWidth = vmobject.strokeWidth;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.stroke();
        }
    }

    ctx.restore();
}

/**
 * Applies BezierPath commands to a canvas context.
 */
function applyPathCommands(
    ctx: SKRSContext2D,
    commands: PathCommand[],
    transform: Matrix3x3
): void {
    for (const cmd of commands) {
        switch (cmd.type) {
            case 'Move': {
                const p = transform.transformPoint(cmd.end);
                ctx.moveTo(p.x, p.y);
                break;
            }
            case 'Line': {
                const p = transform.transformPoint(cmd.end);
                ctx.lineTo(p.x, p.y);
                break;
            }
            case 'Quadratic': {
                if (cmd.control1) {
                    const cp = transform.transformPoint(cmd.control1);
                    const ep = transform.transformPoint(cmd.end);
                    ctx.quadraticCurveTo(cp.x, cp.y, ep.x, ep.y);
                }
                break;
            }
            case 'Cubic': {
                if (cmd.control1 && cmd.control2) {
                    const cp1 = transform.transformPoint(cmd.control1);
                    const cp2 = transform.transformPoint(cmd.control2);
                    const ep = transform.transformPoint(cmd.end);
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
