/**
 * Example: FluentAPI Only
 * 
 * This example demonstrates the FluentAPI approach where animations
 * are chained directly on mobjects for a more declarative style.
 * 
 * Best for: Quick prototyping, simple animations, readable code
 */
import { Scene } from '../src/core/scene/Scene';
import { Circle } from '../src/mobjects/geometry/Circle';
import { Rectangle } from '../src/mobjects/geometry/Rectangle';
import { easeInOutQuad } from '../src/core/animations/easing';
import { Arrow  } from '../src/mobjects';


export class FluentAPIScene extends Scene {
    constructor() {
        super({ width: 1920, height: 1080, frameRate: 60 });

        // Create mobjects
        const circle = new Circle(1).pos(-3, 0);
        const rect = new Rectangle(2, 1).pos(3, 0);
        const arrow = new Arrow(-2, -2, 2, 2);

        // FluentAPI: Chain animations directly on mobjects
        circle.fadeIn(0.5).ease(easeInOutQuad);
        rect.fadeIn(0.5).ease(easeInOutQuad);
        arrow.fadeIn(0.5).ease(easeInOutQuad);
        this.play(circle, rect, arrow);

        // FluentAPI: Chain transformations
        circle.moveTo(0, 2, 1).rotate(Math.PI, 1);
        this.play(circle);

        // Scale transformations
        circle.scaleTo(0.5, 0.5);
        rect.scaleTo(2, 0.5);
        this.play(circle, rect);

        this.wait(0.5);

        arrow.rotate(Math.PI / 2, 1)
        this.play(arrow)

        // FluentAPI: Exit animations
        circle.fadeOut(0.5);
        rect.fadeOut(0.5);
        arrow.fadeOut(0.5)
        this.play(circle, rect, arrow);
    }
}
