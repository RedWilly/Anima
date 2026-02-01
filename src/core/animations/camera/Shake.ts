import { TransformativeAnimation } from '../categories';
import { CameraFrame } from '../../camera/CameraFrame';
import { Vector2 } from '../../math/Vector2/Vector2';

/**
 * Configuration options for the Shake animation.
 */
interface ShakeConfig {
    /**
     * Maximum displacement distance in world units.
     * Higher values create more violent shaking.
     * @default 0.2
     */
    intensity?: number;
    /**
     * Number of oscillations per second.
     * Higher values create faster, more frantic shaking.
     * @default 10
     */
    frequency?: number;
    /**
     * Controls how quickly the shake diminishes over time.
     * - 0 = no decay (constant intensity throughout)
     * - 1 = linear decay
     * - Higher values = faster decay (shake fades quickly)
     * @default 1
     */
    decay?: number;
}

/**
 * Camera shake effect animation.
 * Creates procedural displacement using layered sine waves to simulate
 * impacts, explosions, or earthquakes.
 *
 * The shake automatically returns to the original position when complete.
 *
 * @example
 * // Basic shake effect
 * this.play(new Shake(this.frame).duration(0.5));
 *
 * @example
 * // Intense explosion shake with quick decay
 * this.play(new Shake(this.frame, {
 *   intensity: 0.5,
 *   frequency: 20,
 *   decay: 2
 * }).duration(0.3));
 *
 * @example
 * // Subtle earthquake with slow decay
 * this.play(new Shake(this.frame, {
 *   intensity: 0.1,
 *   frequency: 5,
 *   decay: 0.5
 * }).duration(3));
 */
export class Shake extends TransformativeAnimation<CameraFrame> {
    private originalPosition!: Vector2;
    private readonly intensity: number;
    private readonly frequency: number;
    private readonly decay: number;

    private readonly seedX: number;
    private readonly seedY: number;

    /**
     * Creates a new Shake animation.
     *
     * @param frame - The CameraFrame to shake
     * @param config - Configuration options for intensity, frequency, and decay
     *
     * @example
     * const shake = new Shake(scene.frame, { intensity: 0.3 });
     * this.play(shake.duration(0.5));
     */
    constructor(frame: CameraFrame, config: ShakeConfig = {}) {
        super(frame);
        this.intensity = config.intensity ?? 0.2;
        this.frequency = config.frequency ?? 10;
        this.decay = config.decay ?? 1;

        this.seedX = Math.random() * 1000;
        this.seedY = Math.random() * 1000;
    }

    /**
     * Captures the original position before shake begins.
     */
    protected captureStartState(): void {
        this.originalPosition = this.target.position;
    }

    /**
     * Applies procedural shake displacement each frame.
     * @param progress - Animation progress (0 to 1)
     */
    interpolate(progress: number): void {
        this.ensureInitialized();

        if (progress >= 1) {
            this.target.pos(this.originalPosition.x, this.originalPosition.y);
            return;
        }

        const decayFactor = 1 - Math.pow(progress, this.decay);
        const time = progress * this.durationSeconds * this.frequency;

        const offsetX = this.noise(time, this.seedX) * this.intensity * decayFactor;
        const offsetY = this.noise(time, this.seedY) * this.intensity * decayFactor;

        this.target.pos(
            this.originalPosition.x + offsetX,
            this.originalPosition.y + offsetY
        );
    }

    /**
     * Generates pseudo-random noise using layered sine waves.
     * @param t - Time value
     * @param seed - Random seed for variation
     * @returns Noise value between -1 and 1
     */
    private noise(t: number, seed: number): number {
        return Math.sin(t * 2 + seed) * 0.5 +
               Math.sin(t * 3.7 + seed * 1.3) * 0.3 +
               Math.sin(t * 7.1 + seed * 0.7) * 0.2;
    }
}
