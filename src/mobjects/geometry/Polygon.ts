import { VMobject } from '../VMobject';
import { BezierPath } from '../../core/math/bezier/BezierPath';
import { Vector2 } from '../../core/math/Vector2/Vector2';

export class Polygon extends VMobject {
    readonly vertices: Vector2[];

    constructor(...points: Array<[number, number]>) {
        super();
        this.vertices = points.map(([x, y]) => new Vector2(x, y));
        this.generatePath();
    }

    private generatePath(): void {
        if (this.vertices.length === 0) return;

        const path = new BezierPath();
        path.moveTo(this.vertices[0]!);
        for (let i = 1; i < this.vertices.length; i++) {
            path.lineTo(this.vertices[i]!);
        }
        path.closePath();
        this.pathList = [path];
    }
}
