import { Circle } from './Circle';
import { Vector2 } from '../../core/math/Vector2/Vector2';
import { Color } from '../../core/math/color/Color';

export class Point extends Circle {
    constructor(location: Vector2 = Vector2.ZERO) {
        super(0.05); // Small radius
        this.fill(Color.WHITE, 1.0);
        this.stroke(Color.WHITE, 0); // No stroke usually for points, or just fill
        this.pos(location.x, location.y);
    }
}
