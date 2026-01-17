import { Color } from '../math/color/Color';
import { Timeline } from '../timeline';
import { Mobject } from '../../mobjects/Mobject';
import type { Animation } from '../animations/Animation';
import type { SceneConfig, ResolvedSceneConfig } from './types';

/**
 * Scene is the core container that manages Mobjects and coordinates animations.
 * It provides both a simple API for playing animations and access to the
 * underlying Timeline for advanced control.
 */
export class Scene {
    private readonly config: ResolvedSceneConfig;
    private readonly mobjects: Set<Mobject> = new Set();
    private readonly timeline: Timeline;
    private playheadTime = 0;

    constructor(config: SceneConfig = {}) {
        this.config = {
            width: config.width ?? 1920,
            height: config.height ?? 1080,
            backgroundColor: config.backgroundColor ?? Color.BLACK,
            frameRate: config.frameRate ?? 60,
        };
        this.timeline = new Timeline();
    }

    // ========== Configuration Getters ==========

    /** Get scene width in pixels. */
    getWidth(): number {
        return this.config.width;
    }

    /** Get scene height in pixels. */
    getHeight(): number {
        return this.config.height;
    }

    /** Get scene background color. */
    getBackgroundColor(): Color {
        return this.config.backgroundColor;
    }

    /** Get scene frame rate. */
    getFrameRate(): number {
        return this.config.frameRate;
    }

    // ========== Mobject Management ==========

    /**
     * Add mobjects to the scene.
     * Mobjects are added with opacity 0 (invisible by default).
     */
    add(...mobjects: Mobject[]): this {
        for (const m of mobjects) {
            this.mobjects.add(m);
        }
        return this;
    }

    /**
     * Remove mobjects from the scene.
     */
    remove(...mobjects: Mobject[]): this {
        for (const m of mobjects) {
            this.mobjects.delete(m);
        }
        return this;
    }

    /**
     * Get all mobjects in the scene.
     */
    getMobjects(): readonly Mobject[] {
        return [...this.mobjects];
    }

    // ========== Animation Scheduling ==========

    /**
     * Schedule animations to play at the current playhead position.
     * Animations are scheduled in parallel (all start at the same time).
     * The playhead advances to the end of the longest animation.
     */
    play(...animations: Animation[]): this {
        if (animations.length === 0) {
            return this;
        }

        this.timeline.scheduleParallel(animations, this.playheadTime);

        // Advance playhead to end of longest animation
        let maxDuration = 0;
        for (const anim of animations) {
            const totalTime = anim.getDuration() + anim.getDelay();
            if (totalTime > maxDuration) {
                maxDuration = totalTime;
            }
        }
        this.playheadTime += maxDuration;

        return this;
    }

    /**
     * Add a delay before the next play() call.
     * @param seconds Number of seconds to wait
     */
    wait(seconds: number): this {
        if (seconds < 0) {
            throw new Error('Wait duration must be non-negative');
        }
        this.playheadTime += seconds;
        return this;
    }

    /**
     * Get the current playhead time.
     */
    getCurrentTime(): number {
        return this.playheadTime;
    }

    /**
     * Get the total duration of all scheduled animations.
     */
    getTotalDuration(): number {
        return this.timeline.getTotalDuration();
    }

    // ========== ProAPI Access ==========

    /**
     * Get the underlying Timeline for advanced control.
     * Use this for direct manipulation of animation timing.
     */
    getTimeline(): Timeline {
        return this.timeline;
    }
}
