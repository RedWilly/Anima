import { ExitAnimation } from '../categories';
import type { Mobject } from '../../../mobjects/Mobject';

/**
 * Animation that fades a Mobject out by decreasing its opacity to 0.
 * 
 * This is an exit animation - the target must already be in the scene.
 * The starting opacity is captured when the animation first runs,
 * not when it's constructed, so it correctly fades from the current opacity.
 * 
 * @example
 * scene.add(circle);
 * scene.play(new FadeOut(circle));  // Circle fades out
 */
export class FadeOut<T extends Mobject = Mobject> extends ExitAnimation<T> {
    private startOpacity: number | null = null;

    interpolate(progress: number): void {
        // Capture opacity on first call (when animation actually runs)
        if (this.startOpacity === null) {
            this.startOpacity = this.target.opacity;
        }

        const newOpacity = this.startOpacity * (1 - progress);
        this.target.setOpacity(newOpacity);
    }
}
