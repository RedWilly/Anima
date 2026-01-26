import { VMobject } from '../VMobject';
import { Color } from '../../core/math/color/Color';
import {
    centerGroup,
    toCorner,
    arrangeChildren,
    alignToTarget
} from './layout';
import type { CornerPosition, Direction, Edge } from './layout';

/**
 * A collection of VMobjects that can be manipulated as a single unit.
 * Uses Scene Graph hierarchy: transforms on parent are inherited by children
 * via getWorldMatrix() calculation, not by mutating child matrices.
 */
export class VGroup extends VMobject {
    protected children: VMobject[] = [];

    constructor(...mobjects: VMobject[]) {
        super();
        this.add(...mobjects);
    }

    get length(): number {
        return this.children.length;
    }

    add(...mobjects: VMobject[]): this {
        for (const mob of mobjects) {
            if (!this.children.includes(mob)) {
                mob.parent = this;
                this.children.push(mob);
            }
        }
        return this;
    }

    remove(mobject: VMobject): this {
        const index = this.children.indexOf(mobject);
        if (index > -1) {
            mobject.parent = null;
            this.children.splice(index, 1);
        }
        return this;
    }

    clear(): this {
        for (const child of this.children) {
            child.parent = null;
        }
        this.children = [];
        return this;
    }

    getChildren(): VMobject[] {
        return [...this.children];
    }

    get(index: number): VMobject | undefined {
        return this.children[index];
    }

    // Note: applyMatrix is NOT overridden - transforms stay on this group's local matrix.
    // Children inherit via getWorldMatrix() during rendering.

    override pos(x: number, y: number): this {
        // Directly set position on local matrix, don't propagate to children
        return super.pos(x, y);
    }

    override show(): this {
        super.show();
        for (const child of this.children) {
            child.show();
        }
        return this;
    }

    override hide(): this {
        super.hide();
        for (const child of this.children) {
            child.hide();
        }
        return this;
    }

    /**
     * Sets the stroke color and width for this VGroup and all children.
     * @param color - The stroke color.
     * @param width - The stroke width. Default is 2.
     * @returns this for chaining.
     */
    override stroke(color: Color, width: number = 2): this {
        super.stroke(color, width);
        for (const child of this.children) {
            child.stroke(color, width);
        }
        return this;
    }

    /**
     * Sets the fill color and opacity for this VGroup and all children.
     * @param color - The fill color.
     * @param opacity - The fill opacity. Default is 1 (fully opaque).
     * @returns this for chaining.
     */
    override fill(color: Color, opacity: number = 1): this {
        super.fill(color, opacity);
        for (const child of this.children) {
            child.fill(color, opacity);
        }
        return this;
    }

    override getBoundingBox(): { minX: number; maxX: number; minY: number; maxY: number } {
        if (this.children.length === 0) {
            return super.getBoundingBox();
        }

        let minX = Infinity;
        let maxX = -Infinity;
        let minY = Infinity;
        let maxY = -Infinity;

        for (const child of this.children) {
            const bounds = child.getBoundingBox();
            if (bounds.minX < minX) minX = bounds.minX;
            if (bounds.maxX > maxX) maxX = bounds.maxX;
            if (bounds.minY < minY) minY = bounds.minY;
            if (bounds.maxY > maxY) maxY = bounds.maxY;
        }

        return { minX, maxX, minY, maxY };
    }

    center(): this {
        centerGroup(this);
        return this;
    }

    toCorner(corner: CornerPosition, buff: number = 0.0): this {
        toCorner(this, corner, buff);
        return this;
    }

    arrange(direction: Direction = 'RIGHT', buff: number = 0.25, shouldCenter: boolean = true): this {
        arrangeChildren(this, direction, buff, shouldCenter);
        return this;
    }

    alignTo(target: VMobject, edge: Edge): this {
        alignToTarget(this, target, edge);
        return this;
    }
}
