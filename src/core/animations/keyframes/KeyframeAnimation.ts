import { Animation } from '../Animation';
import type { AnimationLifecycle } from '../types';
import type { Mobject } from '../../../mobjects/Mobject';
import { KeyframeTrack } from './KeyframeTrack';
import type { KeyframeValue } from './types';

/**
 * Property setter function type for applying values to a Mobject.
 */
type PropertySetter<T extends Mobject, V> = (target: T, value: V) => void;

/**
 * Internal track entry storing the track and its property setter.
 */
interface TrackEntry<T extends Mobject, V extends KeyframeValue> {
    track: KeyframeTrack<V>;
    setter: PropertySetter<T, V>;
}

/**
 * Animation that interpolates multiple property tracks via keyframes.
 * Each track controls a single property and is interpolated independently.
 * 
 * This is a transformative animation - the target must already be in the scene.
 */
export class KeyframeAnimation<T extends Mobject = Mobject> extends Animation<T> {
    private readonly tracks: Map<string, TrackEntry<T, KeyframeValue>> = new Map();

    readonly lifecycle: AnimationLifecycle = 'transformative';

    /**
     * Adds a named keyframe track with its property setter.
     * The setter is called during interpolation to apply values to the target.
     */
    addTrack<V extends KeyframeValue>(
        name: string,
        track: KeyframeTrack<V>,
        setter: PropertySetter<T, V>
    ): this {
        this.tracks.set(name, {
            track: track as unknown as KeyframeTrack<KeyframeValue>,
            setter: setter as unknown as PropertySetter<T, KeyframeValue>,
        });
        return this;
    }

    /** Gets a track by name. */
    getTrack<V extends KeyframeValue>(name: string): KeyframeTrack<V> | undefined {
        const entry = this.tracks.get(name);
        return entry?.track as KeyframeTrack<V> | undefined;
    }

    /** All track names. */
    getTrackNames(): string[] {
        return Array.from(this.tracks.keys());
    }

    /**
     * Interpolates all tracks at the given progress and applies values to target.
     */
    interpolate(progress: number): void {
        for (const entry of this.tracks.values()) {
            const value = entry.track.getValueAt(progress);
            entry.setter(this.target, value);
        }
    }
}
