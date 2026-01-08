import { VMobject } from '../VMobject';
import { BezierPath } from '../../core/math/bezier/BezierPath';
import { Vector2 } from '../../core/math/Vector2/Vector2';

export class Line extends VMobject {
    constructor(
        public readonly start: Vector2 = Vector2.ZERO,
        public readonly end: Vector2 = Vector2.RIGHT
    ) {
        super();
        this.generatePath();
    }

    private generatePath(): void {
        const path = new BezierPath();
        path.moveTo(this.start);
        path.lineTo(this.end);
        this.pathList = [path];
    }
}
