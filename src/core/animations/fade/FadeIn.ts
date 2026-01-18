import { IntroductoryAnimation } from '../categories';
import type { Mobject } from '../../../mobjects/Mobject';

/**
 * Animation that fades a Mobject in by increasing its opacity from 0 to 1.
 * 
 * This is an introductory animation - it auto-registers the target with the scene.
 * You do not need to call scene.add() before using FadeIn.
 * 
 * @example
 * const circle = new Circle(1);
 * scene.play(new FadeIn(circle));  // Circle is auto-registered and faded in
 */
export class FadeIn<T extends Mobject = Mobject> extends IntroductoryAnimation<T> {
    private readonly startOpacity: number;

    constructor(target: T) {
        super(target);
        this.startOpacity = target.opacity;
    }

    interpolate(progress: number): void {
        const newOpacity = this.startOpacity + (1 - this.startOpacity) * progress;
        this.target.setOpacity(newOpacity);
    }
}
