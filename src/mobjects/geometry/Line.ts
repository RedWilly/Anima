import { VMobject } from '../VMobject';
import { BezierPath } from '../../core/math/bezier/BezierPath';
import { Vector2 } from '../../core/math/Vector2/Vector2';

export class Line extends VMobject {
    readonly start: Vector2;
    readonly end: Vector2;

    constructor(x1: number = 0, y1: number = 0, x2: number = 1, y2: number = 0) {
        super();
        this.start = new Vector2(x1, y1);
        this.end = new Vector2(x2, y2);
        this.generatePath();
    }

    private generatePath(): void {
        const path = new BezierPath();
        path.moveTo(this.start);
        path.lineTo(this.end);
        this.pathList = [path];
    }
}
