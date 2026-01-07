import { VMobject } from '../VMobject';
import { Matrix3x3 } from '../../core/math/matrix/Matrix3x3';
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
 * Transformations applied to the group propagate to all children.
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
                this.children.push(mob);
            }
        }
        return this;
    }

    remove(mobject: VMobject): this {
        const index = this.children.indexOf(mobject);
        if (index > -1) {
            this.children.splice(index, 1);
        }
        return this;
    }

    clear(): this {
        this.children = [];
        return this;
    }

    getChildren(): VMobject[] {
        return [...this.children];
    }

    get(index: number): VMobject | undefined {
        return this.children[index];
    }

    override applyMatrix(m: Matrix3x3): this {
        super.applyMatrix(m);
        for (const child of this.children) {
            child.applyMatrix(m);
        }
        return this;
    }

    override pos(x: number, y: number): this {
        const currentPos = this.position;
        const deltaX = x - currentPos.x;
        const deltaY = y - currentPos.y;
        return this.applyMatrix(Matrix3x3.translation(deltaX, deltaY));
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

    override stroke(color: Color, width: number): this {
        super.stroke(color, width);
        for (const child of this.children) {
            child.stroke(color, width);
        }
        return this;
    }

    override fill(color: Color, opacity: number): this {
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

    // Layout convenience methods (delegate to layout.ts functions)

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
