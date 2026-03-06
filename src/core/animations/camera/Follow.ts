import { Animation } from '../Animation';
import type { AnimationLifecycle } from '../types';
import type { CameraFrame } from '../../camera';
import type { Mobject } from '../../mobjects';
import { Vector } from '../../math';

type FollowOffsetInput = Vector | readonly [number, number] | readonly [number, number, number];

/**
 * Configuration options for the Follow animation.
 */
interface FollowConfig {
    /**
     * Offset from the target's position. The camera will track
     * (target.position + offset) instead of the exact target position.
     * Accepts:
     * - `Vector`
     * - `[x, y]`
     * - `[x, y, z]`
     *
     * Note: camera follow movement is planar, so only x/y affect the CameraFrame position.
     * If provided, z is accepted for API consistency but ignored by this animation.
     * @default Vector.ZERO
     */
    offset?: FollowOffsetInput;
    /**
     * Damping factor for smooth following (0 to 1).
     * - 0 = instant snap to target (no smoothing)
     * - 0.9 = very smooth, slow following
     * Higher values create a more "laggy" camera that takes longer to catch up.
     * @default 0
     */
    damping?: number;
}

/**
 * Animation that makes a CameraFrame track a target Mobject's position over time.
 * Unlike MoveTo which captures position once, Follow reads the target position
 * every frame, allowing the camera to track moving objects.
 *
 * @example
 * // Basic follow - camera snaps to target position
 * this.play(new Follow(this.frame, movingCircle).duration(5));
 *
 * @example
 * // Smooth follow with damping
 * this.play(new Follow(this.frame, player, { damping: 0.8 }).duration(10));
 *
 * @example
 * // Follow with offset (camera leads the target)
 * this.play(new Follow(this.frame, car, {
 *   offset: [2, 0],  // Camera 2 units ahead
 *   damping: 0.5
 * }).duration(10));
 *
 * @example
 * // 3D tuple offset is accepted for consistency, but z is ignored by camera follow
 * this.play(new Follow(this.frame, car, {
 *   offset: [2, 0, 1],
 *   damping: 0.5
 * }).duration(10));
 */
export class Follow extends Animation<CameraFrame> {
    readonly lifecycle: AnimationLifecycle = 'transformative';

    private readonly followTarget: Mobject;
    private readonly offset: Vector;
    private readonly damping: number;

    /**
     * Creates a new Follow animation.
     *
     * @param frame - The CameraFrame to animate
     * @param target - The Mobject to follow
     * @param config - Configuration options
     * @throws Error if frame is null or undefined
     * @throws Error if target is null or undefined
     *
     * @example
     * const follow = new Follow(scene.frame, player, { damping: 0.7 });
     * this.play(follow.duration(10));
     */
    constructor(frame: CameraFrame, target: Mobject, config: FollowConfig = {}) {
        if (!frame) {
            throw new Error('Follow animation requires a CameraFrame');
        }
        if (!target) {
            throw new Error('Follow animation requires a target Mobject');
        }
        super(frame);
        this.followTarget = target;
        this.offset = Follow.normalizeOffset(config.offset);
        this.damping = config.damping ?? 0;
    }

    /**
     * Updates the camera position each frame to track the target.
     * @param progress - Animation progress (0 to 1)
     */
    interpolate(progress: number): void {
        const targetPos = this.followTarget.position.add(this.offset);
        const currentPos = this.target.position;

        if (this.damping > 0 && this.damping < 1) {
            const lerpFactor = 1 - this.damping;
            const newPos = currentPos.lerp(targetPos, lerpFactor);
            this.target.pos(newPos.x, newPos.y);
        } else {
            this.target.pos(targetPos.x, targetPos.y);
        }
    }

    private static normalizeOffset(offset: FollowOffsetInput | undefined): Vector {
        if (!offset) {
            return Vector.ZERO;
        }

        if (offset instanceof Vector) {
            return offset;
        }

        if (offset.length === 2) {
            return new Vector(offset[0], offset[1], 0);
        }

        return new Vector(offset[0], offset[1], offset[2]);
    }
}

