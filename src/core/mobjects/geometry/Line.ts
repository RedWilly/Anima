import { VMobject } from '../VMobject';
import { BezierPath, Vector } from '../../math';

export class Line extends VMobject {
    readonly start: Vector;
    readonly end: Vector;

    constructor(x1: number = 0, y1: number = 0, x2: number = 1, y2: number = 0) {
        super();
        this.start = new Vector(x1, y1);
        this.end = new Vector(x2, y2);
        this.generatePath();
    }

    private generatePath(): void {
        const path = new BezierPath();
        path.moveTo(this.start);
        path.lineTo(this.end);
        this.paths = [path];
    }
}

