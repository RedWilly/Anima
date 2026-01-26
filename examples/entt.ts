import { Scene, Rectangle, FadeIn, MoveTo, Rotate, Circle, Color, Text } from "../src";

export class EntFlu extends Scene {
    constructor() {
        super({ width: 1920, height: 1080, frameRate: 60 });
        const fontPath = 'assets/fonts/Inter.ttf';

        // Write - draws path progressively (preserves fill throughout)
        const text = new Text("Hello", fontPath).pos(-4, 2);
        text.fill(Color.WHITE);          
        text.stroke(Color.BLACK, 2);  
        text.write(1);
        this.play(text);

        const blueCircle = new Circle(0.5).pos(0, 2).fill(Color.fromHex('#3498db'));
        blueCircle.write(1);
        this.play(blueCircle);

        // Draw - stroke first (0-50%), then fill fades in (50-100%)
        const redRect = new Rectangle(1, 1).pos(0, 0).fill(Color.fromHex('#e74c3c'));
        redRect.draw(1);
        this.play(redRect);

        // Write another shape - green circle
        const greenCircle = new Circle(0.5).pos(0, -2).fill(Color.fromHex('#2ecc71'));
        greenCircle.write(1);
        this.play(greenCircle);
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

