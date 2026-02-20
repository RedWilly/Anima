import { Line } from './Line';
import { Vector2 } from '../../core/math/Vector2/Vector2';
import { BezierPath } from '../../core/math/bezier/BezierPath';

export class Arrow extends Line {
    constructor(
        x1: number = 0,
        y1: number = 0,
        x2: number = 1,
        y2: number = 0,
        readonly tipLength: number = 0.25,
        readonly tipAngle: number = Math.PI / 6
    ) {
        super(x1, y1, x2, y2);
        this.addTip();
    }

    private addTip(): void {
        const direction = this.end.subtract(this.start);
        if (direction.length() === 0) return;

        const normalizedDir = direction.normalize();
        const angle = Math.atan2(normalizedDir.y, normalizedDir.x);

        // Calculate tip vertices
        // The tip points backwards from the end
        const angle1 = angle + Math.PI - this.tipAngle;
        const angle2 = angle + Math.PI + this.tipAngle;

        const p1 = this.end.add(new Vector2(Math.cos(angle1), Math.sin(angle1)).multiply(this.tipLength));
        const p2 = this.end.add(new Vector2(Math.cos(angle2), Math.sin(angle2)).multiply(this.tipLength));

        const tipPath = new BezierPath();
        tipPath.moveTo(this.end);
        tipPath.lineTo(p1);
        tipPath.lineTo(p2);
        tipPath.closePath();

        this.addPath(tipPath);
    }
}
