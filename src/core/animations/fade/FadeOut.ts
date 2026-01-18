import { ExitAnimation } from '../categories';
import type { Mobject } from '../../../mobjects/Mobject';

/**
 * Animation that fades a Mobject out by decreasing its opacity to 0.
 * 
 * This is an exit animation - the target must already be in the scene.
 * 
 * @example
 * scene.add(circle);
 * scene.play(new FadeOut(circle));  // Circle fades out
 */
export class FadeOut<T extends Mobject = Mobject> extends ExitAnimation<T> {
    private readonly startOpacity: number;

    constructor(target: T) {
        super(target);
        this.startOpacity = target.opacity;
    }

    interpolate(progress: number): void {
        const newOpacity = this.startOpacity * (1 - progress);
        this.target.setOpacity(newOpacity);
    }
}
