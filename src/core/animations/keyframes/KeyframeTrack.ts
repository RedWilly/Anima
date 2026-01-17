import type { EasingFunction } from '../easing';
import { linear } from '../easing';
import type { Keyframe, KeyframeValue, InterpolatorFn } from './types';
import { lerpNumber } from './types';

/**
 * Manages a sequence of keyframes for animating a single property.
 * Keyframes are stored sorted by time and interpolated on demand.
 */
export class KeyframeTrack<T extends KeyframeValue = number> {
    private keyframes: Array<Keyframe<T>> = [];
    private readonly interpolator: InterpolatorFn<T>;

    /**
     * Creates a new KeyframeTrack with the specified interpolator.
     * Defaults to linear number interpolation.
     */
    constructor(interpolator?: InterpolatorFn<T>) {
        this.interpolator = interpolator ?? (lerpNumber as unknown as InterpolatorFn<T>);
    }

    /**
     * Adds a keyframe at the specified normalized time.
     * Time must be in [0, 1]. Replaces existing keyframe at same time.
     */
    addKeyframe(time: number, value: T, easing?: EasingFunction): this {
        if (time < 0 || time > 1) {
            throw new Error('Keyframe time must be in [0, 1]');
        }

        // Remove existing keyframe at same time
        this.keyframes = this.keyframes.filter((kf) => kf.time !== time);

        const keyframe: Keyframe<T> = { time, value, easing };
        this.keyframes.push(keyframe);
        this.keyframes.sort((a, b) => a.time - b.time);

        return this;
    }

    removeKeyframe(time: number): boolean {
        const initialLength = this.keyframes.length;
        this.keyframes = this.keyframes.filter((kf) => kf.time !== time);
        return this.keyframes.length < initialLength;
    }

    /**
     * Gets the keyframe at the specified time.
     * Returns undefined if no keyframe exists at that time.
     */
    getKeyframe(time: number): Keyframe<T> | undefined {
        return this.keyframes.find((kf) => kf.time === time);
    }

    /**
     * Modifies an existing keyframe's value and optionally its easing.
     * Returns true if keyframe was found and modified, false otherwise.
     * Unlike addKeyframe, this does NOT create a new keyframe if one doesn't exist.
     */
    setKeyframe(time: number, value: T, easing?: EasingFunction): boolean {
        const index = this.keyframes.findIndex((kf) => kf.time === time);
        if (index === -1) {
            return false;
        }
        const existingEasing = this.keyframes[index]?.easing;
        this.keyframes[index] = { time, value, easing: easing ?? existingEasing };
        return true;
    }

    /** All keyframes sorted by time. */
    getKeyframes(): ReadonlyArray<Keyframe<T>> {
        return this.keyframes;
    }

    /** Interpolated value at normalized time (uses target keyframe easing). */
    getValueAt(time: number): T {
        if (this.keyframes.length === 0) {
            throw new Error('KeyframeTrack has no keyframes');
        }

        const clampedTime = Math.max(0, Math.min(1, time));

        // Find keyframes before and after the requested time
        let prevKeyframe: Keyframe<T> | undefined;
        let nextKeyframe: Keyframe<T> | undefined;

        for (const kf of this.keyframes) {
            if (kf.time <= clampedTime) {
                prevKeyframe = kf;
            }
            if (kf.time >= clampedTime && nextKeyframe === undefined) {
                nextKeyframe = kf;
            }
        }

        if (prevKeyframe === undefined) {
            return this.keyframes[0]!.value;
        }
        if (nextKeyframe === undefined) {
            return prevKeyframe.value;
        }
        if (prevKeyframe === nextKeyframe) {
            return prevKeyframe.value;
        }

        const span = nextKeyframe.time - prevKeyframe.time;
        const localProgress = (clampedTime - prevKeyframe.time) / span;

        const easing = nextKeyframe.easing ?? linear;
        const easedProgress = easing(localProgress);

        return this.interpolator(prevKeyframe.value, nextKeyframe.value, easedProgress);
    }

    getKeyframeCount(): number {
        return this.keyframes.length;
    }
}
