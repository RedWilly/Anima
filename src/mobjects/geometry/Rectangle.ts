import { Polygon } from './Polygon';
import { Vector2 } from '../../core/math/Vector2/Vector2';

export class Rectangle extends Polygon {
    constructor(
        readonly width: number = 2.0,
        readonly height: number = 1.0
    ) {
        const halfW = width / 2;
        const halfH = height / 2;

        super([
            new Vector2(-halfW, -halfH), // Top-Left
            new Vector2(halfW, -halfH),  // Top-Right
            new Vector2(halfW, halfH),   // Bottom-Right
            new Vector2(-halfW, halfH)   // Bottom-Left
        ]);
    }
}
