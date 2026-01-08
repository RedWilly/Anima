import { VMobject } from '../VMobject';
import { BezierPath } from '../../core/math/bezier/BezierPath';
import { Vector2 } from '../../core/math/Vector2/Vector2';

export class Arc extends VMobject {
    constructor(
        public readonly radius: number = 1.0,
        public readonly startAngle: number = 0,
        public readonly endAngle: number = Math.PI / 2
    ) {
        super();
        this.generatePath();
    }

    private generatePath(): void {
        const path = new BezierPath();
        const sweepAngle = this.endAngle - this.startAngle;
        const absSweep = Math.abs(sweepAngle);

        // Split into segments of at most 90 degrees to maintain accuracy
        const maxSegmentAngle = Math.PI / 2;
        const numSegments = Math.max(1, Math.ceil(absSweep / maxSegmentAngle));
        const stepAngle = sweepAngle / numSegments;

        // k = (4/3) * tan(theta/4)
        const k = (4 / 3) * Math.tan(stepAngle / 4);

        let currentAngle = this.startAngle;

        // Start point
        const startX = this.radius * Math.cos(currentAngle);
        const startY = this.radius * Math.sin(currentAngle);
        path.moveTo(new Vector2(startX, startY));

        for (let i = 0; i < numSegments; i++) {
            const alpha = currentAngle;
            const nextAngle = currentAngle + stepAngle;

            // P3 is next point
            const p3 = new Vector2(
                this.radius * Math.cos(nextAngle),
                this.radius * Math.sin(nextAngle)
            );

            // Control points
            // P1 = P0 + tangent(alpha) * R * k
            // Tangent vector rotated 90 deg from radius: (-sin, cos)
            const cp1 = new Vector2(
                this.radius * Math.cos(alpha),
                this.radius * Math.sin(alpha)
            ).add(
                new Vector2(-Math.sin(alpha), Math.cos(alpha)).multiply(this.radius * k)
            );

            // P2 = P3 - tangent(nextAngle) * R * k
            const cp2 = p3.subtract(
                new Vector2(-Math.sin(nextAngle), Math.cos(nextAngle)).multiply(this.radius * k)
            );

            path.cubicTo(cp1, cp2, p3);
            currentAngle += stepAngle;
        }

        this.pathList = [path];
    }
}
