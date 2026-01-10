import { Animation } from './Animation';
import { Mobject } from '../../mobjects/Mobject';

/**
 * Animation that fades a Mobject out by decreasing its opacity to 0.
 */
export class FadeOut<T extends Mobject = Mobject> extends Animation<T> {
    private readonly startOpacity: number;

    constructor(target: T) {
        super(target);
        this.startOpacity = target.opacity;
    }

    /**
     * Interpolates the opacity from starting value to 0.
     * @param progress Eased progress value in [0, 1].
     */
    interpolate(progress: number): void {
        const newOpacity = this.startOpacity * (1 - progress);
        this.target.setOpacity(newOpacity);
    }
}
