import { Scene, Rectangle, FadeIn, MoveTo, Rotate } from "../src";
import { easeInQuad } from "../src";

export class EntFlu extends Scene {
    // fluent API example
    constructor() {
        super({ width: 1920, height: 1080, frameRate: 60 });

        const rectangle = new Rectangle(2, 1);
        rectangle.fadeIn(0.5).ease(easeInQuad);
        rectangle.parallel(
            rectangle.moveTo(2, 0, 1),
            rectangle.rotate(2 * Math.PI, 1)
        );

        this.play(rectangle);
    }
}


export class EntPro extends Scene {
    // Pro API example
    constructor() {
        super({ width: 1920, height: 1080, frameRate: 60 });

        const rectangle = new Rectangle(2, 1);

         const fadeinRect = new FadeIn(rectangle).duration(0.5);
        const moveRect = new MoveTo(rectangle, 2, 0).duration(1);
        const rotateRect = new Rotate(rectangle, 2 * Math.PI).duration(1);

        this.play(fadeinRect);
        this.play(moveRect, rotateRect);
    }
}

