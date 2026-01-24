/**
 * Example: ProAPI Only
 * 
 * This example demonstrates the ProAPI approach where animations
 * are created as explicit objects with full control over configuration.
 * 
 * Best for: Complex animations, timeline manipulation, reusable animation logic
 */
import { Scene } from '../src/core/scene/Scene';
import { Circle } from '../src/mobjects/geometry/Circle';
import { Rectangle } from '../src/mobjects/geometry/Rectangle';
import { Arrow  } from '../src/mobjects';
import { FadeIn, FadeOut, MoveTo, Rotate, Scale } from '../src/core/animations';
import { easeInOutQuad } from '../src/core/animations/easing';

export class ProAPIScene extends Scene {
    constructor() {
        super({ width: 1920, height: 1080, frameRate: 60 });

        // Create mobjects
        const circle = new Circle(1).pos(-3, 0);
        const rect = new Rectangle(2, 1).pos(3, 0);
        const arrow = new Arrow(-2, -2, 2, 2);

        // ProAPI: Create animation objects explicitly
        // FadeIn is introductory - auto-registers with scene
        const circleIntro = new FadeIn(circle)
            .duration(0.5)
            .ease(easeInOutQuad);

        const rectIntro = new FadeIn(rect)
            .duration(0.5)
            .ease(easeInOutQuad);

        const arrowIntro = new FadeIn(arrow)
            .duration(0.5)
            .ease(easeInOutQuad);

        // Play intro animations in parallel
        this.play(circleIntro, rectIntro, arrowIntro);

        // ProAPI: Transformative animations (objects now in scene)
        const circleMove = new MoveTo(circle, 0, 2).duration(1);
        const circleRotate = new Rotate(circle, Math.PI).duration(1);

        this.play(circleMove, circleRotate);

        // Scale and fade out
        const circleScale = new Scale(circle, 0.5).duration(0.5);
        const rectScale = new Scale(rect, 2).duration(0.5);

        this.play(circleScale, rectScale);

        this.wait(0.5);

        // Arrow rotation animation
        const arrowRotate = new Rotate(arrow, Math.PI / 2).duration(1);
        this.play(arrowRotate);

        this.wait(0.5);

        // Exit animations
        const circleExit = new FadeOut(circle).duration(0.5);
        const rectExit = new FadeOut(rect).duration(0.5);
        const arrowExit = new FadeOut(arrow).duration(0.5);

        this.play(circleExit, rectExit, arrowExit);
    }
}
