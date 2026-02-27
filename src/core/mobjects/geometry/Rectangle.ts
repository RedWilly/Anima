import { Polygon } from './Polygon';

export class Rectangle extends Polygon {
    constructor(
        readonly width: number = 2.0,
        readonly height: number = 1.0
    ) {
        const halfW = width / 2;
        const halfH = height / 2;

        super(
            [-halfW, -halfH], // Top-Left
            [halfW, -halfH],  // Top-Right
            [halfW, halfH],   // Bottom-Right
            [-halfW, halfH]   // Bottom-Left
        );
    }
}
