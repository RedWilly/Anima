/**
 * Example: Mixed API Usage
 * 
 * This example demonstrates mixing ProAPI and FluentAPI in the same scene.
 * Use whichever approach fits each situation best.
 * 
 * - FluentAPI for quick, simple animations
 * - ProAPI for complex, reusable, or timeline-controlled animations
 */
import { Scene } from '../src/core/scene/Scene';
import { Circle } from '../src/mobjects/geometry/Circle';
import { Rectangle } from '../src/mobjects/geometry/Rectangle';
import { FadeIn, MoveTo, Rotate, FadeOut } from '../src/core/animations';
import { easeInOutQuad, linear } from '../src/core/animations/easing';

export class MixedAPIScene extends Scene {
    constructor() {
        super({ width: 1920, height: 1080, frameRate: 60 });

        // Create mobjects
        const circle = new Circle(1).pos(-3, 0);
        const rect = new Rectangle(2, 1).pos(3, 0);

        // --- Mix ProAPI and FluentAPI ---
        // ProAPI for circle
        const circleIntro = new FadeIn(circle)
            .duration(0.5)
            .ease(easeInOutQuad);

        // FluentAPI for rect (simpler syntax!)
        rect.fadeIn(0.5).ease(easeInOutQuad);

        // Mix them - both Animation and Mobject work in play()!
        this.play(circleIntro, rect);

        // --- ProAPI: Complex animation sequence on circle ---
        const moveUp = new MoveTo(circle, -3, 2).duration(0.5).ease(linear);
        const moveRight = new MoveTo(circle, 0, 2).duration(0.5).ease(linear);
        const rotate = new Rotate(circle, Math.PI * 2).duration(1);

        // Use Timeline for precise control
        const timeline = this.getTimeline();
        const startTime = this.getCurrentTime();
        timeline.schedule(moveUp, startTime);
        timeline.schedule(moveRight, startTime + 0.5);
        timeline.schedule(rotate, startTime);

        // Advance playhead manually for ProAPI timeline usage
        this.wait(1);

        // --- FluentAPI: Quick transformations on rect ---
        rect.moveTo(-3, -1, 0.5).scaleTo(1.5, 0.5);
        this.play(rect);

        this.wait(0.5);

        // --- Mix exit animations ---
        const circleExit = new FadeOut(circle).duration(0.5);
        rect.fadeOut(0.5);

        this.play(circleExit, rect);
    }
}
