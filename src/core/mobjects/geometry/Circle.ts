import { Arc } from './Arc';

export class Circle extends Arc {
    constructor(radius: number = 1.0) {
        super(radius, 0, Math.PI * 2);
        // Ensure path is closed for a full circle
        const firstPath = this.paths[0];
        if (firstPath) {
            firstPath.closePath();
            this.paths = [firstPath];
        }
    }
}
