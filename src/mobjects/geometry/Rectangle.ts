import { Polygon } from './Polygon';
import { Vector2 } from '../../core/math/Vector2/Vector2';

export class Rectangle extends Polygon {
    constructor(
        public readonly width: number = 2.0,
        public readonly height: number = 1.0
    ) {
        const halfW = width / 2;
        const halfH = height / 2;
        
        // Vertices in clockwise order starting from Top-Left
        // Y is down, so Top is -Y, Bottom is +Y
        super([
            new Vector2(-halfW, -halfH), // Top-Left
            new Vector2(halfW, -halfH),  // Top-Right
            new Vector2(halfW, halfH),   // Bottom-Right
            new Vector2(-halfW, halfH)   // Bottom-Left
        ]);
    }
}
