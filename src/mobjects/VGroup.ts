import { VMobject } from './VMobject';
import { Matrix3x3 } from '../core/math/matrix/Matrix3x3';
import { Vector2 } from '../core/math/Vector2/Vector2';
import { Color } from '../core/math/color/Color';
import { FRAME_X_RADIUS, FRAME_Y_RADIUS } from '../core/constants';

export class VGroup extends VMobject {
    protected _children: VMobject[] = [];

    constructor(...children: VMobject[]) {
        super();
        this.add(...children);
    }

    add(...mobjects: VMobject[]): this {
        for (const mob of mobjects) {
            if (!this._children.includes(mob)) {
                this._children.push(mob);
            }
        }
        return this;
    }

    remove(mobject: VMobject): this {
        const index = this._children.indexOf(mobject);
        if (index > -1) {
            this._children.splice(index, 1);
        }
        return this;
    }

    getChildren(): VMobject[] {
        return [...this._children];
    }

    get(index: number): VMobject | undefined {
        return this._children[index];
    }

    override applyMatrix(m: Matrix3x3): this {
        // Apply to self (updates this._matrix)
        super.applyMatrix(m);

        // Apply to all children
        for (const child of this._children) {
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
        for (const child of this._children) {
            child.show();
        }
        return this;
    }

    override hide(): this {
        super.hide();
        for (const child of this._children) {
            child.hide();
        }
        return this;
    }

    override stroke(color: Color, width: number): this {
        super.stroke(color, width);
        for (const child of this._children) {
            child.stroke(color, width);
        }
        return this;
    }

    override fill(color: Color, opacity: number): this {
        super.fill(color, opacity);
        for (const child of this._children) {
            child.fill(color, opacity);
        }
        return this;
    }

    override getBoundingBox(): { minX: number; maxX: number; minY: number; maxY: number } {
        if (this._children.length === 0) {
            return super.getBoundingBox();
        }

        let minX = Infinity;
        let maxX = -Infinity;
        let minY = Infinity;
        let maxY = -Infinity;

        for (const child of this._children) {
            const bounds = child.getBoundingBox();
            if (bounds.minX < minX) minX = bounds.minX;
            if (bounds.maxX > maxX) maxX = bounds.maxX;
            if (bounds.minY < minY) minY = bounds.minY;
            if (bounds.maxY > maxY) maxY = bounds.maxY;
        }

        return { minX, maxX, minY, maxY };
    }

    /**
     * Centers the VGroup at the origin (0, 0).
     */
    center(): this {
        const bounds = this.getBoundingBox();
        const centerX = (bounds.minX + bounds.maxX) / 2;
        const centerY = (bounds.minY + bounds.maxY) / 2;
        const shift = new Vector2(-centerX, -centerY);
        
        return this.applyMatrix(Matrix3x3.translation(shift.x, shift.y));
    }

    /**
     * Aligns the VGroup to a corner of the screen.
     * @param corner 'TOP_LEFT' | 'TOP_RIGHT' | 'BOTTOM_LEFT' | 'BOTTOM_RIGHT'
     * @param buff Buffer distance from the edge
     */
    toCorner(corner: 'TOP_LEFT' | 'TOP_RIGHT' | 'BOTTOM_LEFT' | 'BOTTOM_RIGHT', buff: number = 0.0): this {
        const bounds = this.getBoundingBox();
        const width = bounds.maxX - bounds.minX;
        const height = bounds.maxY - bounds.minY;
        
        let targetX = 0;
        let targetY = 0;

        // Remember: UP is negative Y in our Vector2 constant, but let's verify coordinate system.
        // If Vector2.UP is (0, -1), then -Y is UP.
        // Screen top is -FRAME_Y_RADIUS.
        // Screen bottom is FRAME_Y_RADIUS.
        // Screen left is -FRAME_X_RADIUS.
        // Screen right is FRAME_X_RADIUS.

        switch (corner) {
            case 'TOP_LEFT':
                targetX = -FRAME_X_RADIUS + width / 2 + buff;
                targetY = -FRAME_Y_RADIUS + height / 2 + buff; 
                break;
            case 'TOP_RIGHT':
                targetX = FRAME_X_RADIUS - width / 2 - buff;
                targetY = -FRAME_Y_RADIUS + height / 2 + buff;
                break;
            case 'BOTTOM_LEFT':
                targetX = -FRAME_X_RADIUS + width / 2 + buff;
                targetY = FRAME_Y_RADIUS - height / 2 - buff;
                break;
            case 'BOTTOM_RIGHT':
                targetX = FRAME_X_RADIUS - width / 2 - buff;
                targetY = FRAME_Y_RADIUS - height / 2 - buff;
                break;
        }

        // We want to move the center of the VGroup to targetX, targetY?
        // No, targetX/Y calculated above are where the CENTER should be to align the EDGE.
        // e.g. TOP_LEFT: Left edge at -FRAME_X + buff.
        // Center X = Left + width/2 = -FRAME_X + buff + width/2.
        
        // So we just need to move the current center to (targetX, targetY).
        const currentCenterX = (bounds.minX + bounds.maxX) / 2;
        const currentCenterY = (bounds.minY + bounds.maxY) / 2;
        
        const shiftX = targetX - currentCenterX;
        const shiftY = targetY - currentCenterY;

        return this.applyMatrix(Matrix3x3.translation(shiftX, shiftY));
    }

    /**
     * Arranges children in a line.
     */
    arrange(direction: 'RIGHT' | 'LEFT' | 'UP' | 'DOWN' = 'RIGHT', buff: number = 0.25, center: boolean = true): this {
        if (this._children.length === 0) return this;

        // We fix the first child, then move subsequent children.
        // Or we just calculate positions relative to the first.
        
        // Let's assume we keep the first child where it is (or effectively move others relative to it)
        // and then center the whole group if requested.

        let previousChild = this._children[0]!;
        
        for (let i = 1; i < this._children.length; i++) {
            const child = this._children[i]!;
            const prevBounds = previousChild.getBoundingBox();
            const childBounds = child.getBoundingBox();
            
            let shiftX = 0;
            let shiftY = 0;

            if (direction === 'RIGHT') {
                // Next child's LEFT edge should be at Prev's RIGHT edge + buff
                const targetLeft = prevBounds.maxX + buff;
                const currentLeft = childBounds.minX;
                shiftX = targetLeft - currentLeft;
                // Align centers on Y? Usually arrange does this.
                const prevCenterY = (prevBounds.minY + prevBounds.maxY) / 2;
                const childCenterY = (childBounds.minY + childBounds.maxY) / 2;
                shiftY = prevCenterY - childCenterY;

            } else if (direction === 'LEFT') {
                // Next child's RIGHT edge should be at Prev's LEFT edge - buff
                const targetRight = prevBounds.minX - buff;
                const currentRight = childBounds.maxX;
                shiftX = targetRight - currentRight;
                const prevCenterY = (prevBounds.minY + prevBounds.maxY) / 2;
                const childCenterY = (childBounds.minY + childBounds.maxY) / 2;
                shiftY = prevCenterY - childCenterY;

            } else if (direction === 'DOWN') {
                // Next child's TOP edge should be at Prev's BOTTOM edge + buff
                // Note: UP is -Y. DOWN is +Y.
                // Bottom edge is maxY (larger Y).
                const targetTop = prevBounds.maxY + buff;
                const currentTop = childBounds.minY;
                shiftY = targetTop - currentTop;
                
                const prevCenterX = (prevBounds.minX + prevBounds.maxX) / 2;
                const childCenterX = (childBounds.minX + childBounds.maxX) / 2;
                shiftX = prevCenterX - childCenterX;

            } else if (direction === 'UP') {
                // Next child's BOTTOM edge should be at Prev's TOP edge - buff
                // Top edge is minY (smaller Y).
                const targetBottom = prevBounds.minY - buff;
                const currentBottom = childBounds.maxY;
                shiftY = targetBottom - currentBottom;

                const prevCenterX = (prevBounds.minX + prevBounds.maxX) / 2;
                const childCenterX = (childBounds.minX + childBounds.maxX) / 2;
                shiftX = prevCenterX - childCenterX;
            }

            child.applyMatrix(Matrix3x3.translation(shiftX, shiftY));
            previousChild = child;
        }

        if (center) {
            this.center();
        }

        return this;
    }

    /**
     * Aligns the VGroup to a target VMobject.
     */
    alignTo(target: VMobject, edge: 'TOP' | 'BOTTOM' | 'LEFT' | 'RIGHT'): this {
        const targetBounds = target.getBoundingBox();
        const myBounds = this.getBoundingBox();

        let shiftX = 0;
        let shiftY = 0;

        switch (edge) {
            case 'TOP':
                // Align my Top (minY) with target Top (minY)
                shiftY = targetBounds.minY - myBounds.minY;
                break;
            case 'BOTTOM':
                // Align my Bottom (maxY) with target Bottom (maxY)
                shiftY = targetBounds.maxY - myBounds.maxY;
                break;
            case 'LEFT':
                // Align my Left (minX) with target Left (minX)
                shiftX = targetBounds.minX - myBounds.minX;
                break;
            case 'RIGHT':
                // Align my Right (maxX) with target Right (maxX)
                shiftX = targetBounds.maxX - myBounds.maxX;
                break;
        }

        return this.applyMatrix(Matrix3x3.translation(shiftX, shiftY));
    }
}
