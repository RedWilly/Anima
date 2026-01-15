import { VGroup } from './VGroup';
import { VMobject } from '../VMobject';
import { Matrix3x3 } from '../../core/math/matrix/Matrix3x3';
import { Vector2 } from '../../core/math/Vector2/Vector2';
import { FRAME_X_RADIUS, FRAME_Y_RADIUS } from '../../core/constants';

export type CornerPosition = 'TOP_LEFT' | 'TOP_RIGHT' | 'BOTTOM_LEFT' | 'BOTTOM_RIGHT';
export type Direction = 'RIGHT' | 'LEFT' | 'UP' | 'DOWN';
export type Edge = 'TOP' | 'BOTTOM' | 'LEFT' | 'RIGHT';

/**
 * Centers a VGroup at the origin (0, 0).
 * Moves all children so the group's bounding box is centered at origin.
 */
export function centerGroup(group: VGroup): VGroup {
    const bounds = group.getBoundingBox();
    const centerX = (bounds.minX + bounds.maxX) / 2;
    const centerY = (bounds.minY + bounds.maxY) / 2;
    const translation = Matrix3x3.translation(-centerX, -centerY);

    // Apply translation to all children directly (not to group)
    for (const child of group.getChildren()) {
        child.applyMatrix(translation);
    }
    return group;
}

/**
 * Moves a VGroup to a corner of the screen.
 * Moves all children so the group's content is at the corner.
 */
export function toCorner(group: VGroup, corner: CornerPosition, buff: number = 0.0): VGroup {
    const bounds = group.getBoundingBox();
    const width = bounds.maxX - bounds.minX;
    const height = bounds.maxY - bounds.minY;

    let targetX = 0;
    let targetY = 0;

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

    const currentCenterX = (bounds.minX + bounds.maxX) / 2;
    const currentCenterY = (bounds.minY + bounds.maxY) / 2;
    const shiftX = targetX - currentCenterX;
    const shiftY = targetY - currentCenterY;
    const translation = Matrix3x3.translation(shiftX, shiftY);

    // Apply translation to all children directly
    for (const child of group.getChildren()) {
        child.applyMatrix(translation);
    }
    return group;
}

/**
 * Arranges children in a line along the specified direction.
 */
export function arrangeChildren(
    group: VGroup,
    direction: Direction = 'RIGHT',
    buff: number = 0.25,
    shouldCenter: boolean = true
): VGroup {
    const children = group.getChildren();
    if (children.length === 0) return group;

    let previousChild = children[0]!;

    for (let i = 1; i < children.length; i++) {
        const child = children[i]!;
        const prevBounds = previousChild.getBoundingBox();
        const childBounds = child.getBoundingBox();

        let shiftX = 0;
        let shiftY = 0;

        if (direction === 'RIGHT') {
            const targetLeft = prevBounds.maxX + buff;
            const currentLeft = childBounds.minX;
            shiftX = targetLeft - currentLeft;
            const prevCenterY = (prevBounds.minY + prevBounds.maxY) / 2;
            const childCenterY = (childBounds.minY + childBounds.maxY) / 2;
            shiftY = prevCenterY - childCenterY;
        } else if (direction === 'LEFT') {
            const targetRight = prevBounds.minX - buff;
            const currentRight = childBounds.maxX;
            shiftX = targetRight - currentRight;
            const prevCenterY = (prevBounds.minY + prevBounds.maxY) / 2;
            const childCenterY = (childBounds.minY + childBounds.maxY) / 2;
            shiftY = prevCenterY - childCenterY;
        } else if (direction === 'DOWN') {
            const targetTop = prevBounds.maxY + buff;
            const currentTop = childBounds.minY;
            shiftY = targetTop - currentTop;
            const prevCenterX = (prevBounds.minX + prevBounds.maxX) / 2;
            const childCenterX = (childBounds.minX + childBounds.maxX) / 2;
            shiftX = prevCenterX - childCenterX;
        } else if (direction === 'UP') {
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

    if (shouldCenter) {
        centerGroup(group);
    }

    return group;
}

/**
 * Aligns a VGroup to a target VMobject's edge.
 * Moves all children so the group is aligned with the target edge.
 */
export function alignToTarget(group: VGroup, target: VMobject, edge: Edge): VGroup {
    const targetBounds = target.getBoundingBox();
    const myBounds = group.getBoundingBox();

    let shiftX = 0;
    let shiftY = 0;

    switch (edge) {
        case 'TOP':
            shiftY = targetBounds.minY - myBounds.minY;
            break;
        case 'BOTTOM':
            shiftY = targetBounds.maxY - myBounds.maxY;
            break;
        case 'LEFT':
            shiftX = targetBounds.minX - myBounds.minX;
            break;
        case 'RIGHT':
            shiftX = targetBounds.maxX - myBounds.maxX;
            break;
    }

    const translation = Matrix3x3.translation(shiftX, shiftY);

    // Apply translation to all children directly
    for (const child of group.getChildren()) {
        child.applyMatrix(translation);
    }
    return group;
}
