import { Animation } from '../Animation';
import { Mobject } from '../../../mobjects/Mobject';

/**
 * Animation that fades a Mobject in by increasing its opacity from 0 to 1.
 */
export class FadeIn<T extends Mobject = Mobject> extends Animation<T> {
    private readonly startOpacity: number;

    constructor(target: T) {
        super(target);
        this.startOpacity = target.opacity;
    }

    /**
     * Interpolates the opacity from starting value to 1.
     * @param progress Eased progress value in [0, 1].
     */
    interpolate(progress: number): void {
        const newOpacity = this.startOpacity + (1 - this.startOpacity) * progress;
        this.target.setOpacity(newOpacity);
    }
}
