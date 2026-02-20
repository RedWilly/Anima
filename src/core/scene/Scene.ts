import { Color } from '../math/color/Color';
import { Timeline } from '../timeline';
import { Camera, CameraFrame } from '../camera';
import { Mobject } from '../../mobjects/Mobject';
import type { Animation } from '../animations/Animation';
import type { SceneConfig, ResolvedSceneConfig } from './types';
import type { Segment } from '../cache/Segment';
import { hashNumber, hashCompose } from '../cache/Hashable';
import { AnimationTargetNotInSceneError } from '../errors';

/**
 * Scene is the core container that manages Mobjects and coordinates animations.
 * It provides both a simple API for playing animations and access to the
 * underlying Timeline and Camera for advanced control.
 */
export class Scene {
    private readonly config: ResolvedSceneConfig;
    private readonly mobjects: Set<Mobject> = new Set();
    private readonly timeline: Timeline;
    private readonly _camera: Camera;
    private readonly segmentList: Segment[] = [];
    private playheadTime = 0;

    constructor(config: SceneConfig = {}) {
        this.config = {
            width: config.width ?? 1920,
            height: config.height ?? 1080,
            backgroundColor: config.backgroundColor ?? Color.BLACK,
            frameRate: config.frameRate ?? 60,
        };
        this.timeline = new Timeline();
        this._camera = new Camera({
            pixelWidth: this.config.width,
            pixelHeight: this.config.height,
        });
    }

    // ========== Camera Shortcuts ==========

    get camera(): Camera {
        return this._camera;
    }

    get frame(): CameraFrame {
        return this._camera.frame;
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
     * Add mobjects to the scene and make them immediately visible.
     * Use this for static elements or backgrounds that should be visible
     * before any animations begin.
     */
    add(...mobjects: Mobject[]): this {
        for (const m of mobjects) {
            this.mobjects.add(m);
            m.setOpacity(1); // Immediately visible
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
     * Check if a mobject is registered with this scene.
     */
    has(mobject: Mobject): boolean {
        return this.mobjects.has(mobject);
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
     * 
     * Accepts either Animation objects or Mobjects with queued fluent animations.
     * When a Mobject is passed, its queued animation chain is automatically extracted.
     * 
     * - Introductory animations (FadeIn, Create, Draw, Write) auto-register
     *   their targets with the scene if not already present.
     * - Transformative animations (MoveTo, Rotate, Scale) require the target
     *   to already be in the scene, otherwise an error is thrown.
     * 
     * @example
     * // ProAPI style
     * this.play(new FadeIn(circle), new MoveTo(rect, 2, 0));
     * 
     * // FluentAPI style
     * circle.fadeIn(1).moveTo(2, 0, 1);
     * this.play(circle);
     * 
     * // Mixed
     * circle.fadeIn(1);
     * this.play(circle, new FadeIn(rect));
     */
    play(...items: Array<Animation | Mobject>): this {
        if (items.length === 0) {
            return this;
        }

        // Convert Mobjects to Animations
        const animations: Animation[] = items.map(item => {
            if (item instanceof Mobject) {
                return item.toAnimation();
            }
            return item;
        });

        // Validate and auto-register based on animation lifecycle
        for (const anim of animations) {
            this.validateAndRegisterAnimation(anim);
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

        const endTime = this.playheadTime + maxDuration;

        // Emit segment for this play() call
        this.segmentList.push({
            index: this.segmentList.length,
            startTime: this.playheadTime,
            endTime,
            animations,
            hash: this.computeSegmentHash(animations, this.playheadTime, endTime),
        });

        this.playheadTime = endTime;

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

        const endTime = this.playheadTime + seconds;

        // Emit a static segment (no animations, scene held)
        this.segmentList.push({
            index: this.segmentList.length,
            startTime: this.playheadTime,
            endTime,
            animations: [],
            hash: this.computeSegmentHash([], this.playheadTime, endTime),
        });

        this.playheadTime = endTime;
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

    /**
     * Get the Camera for view control and frame dimensions.
     * Camera calculates Manim-compatible frame dimensions from pixel resolution.
     */
    getCamera(): Camera {
        return this._camera;
    }

    /**
     * Get the list of segments emitted by play() and wait() calls.
     * Used by the Renderer for cache-aware segmented rendering.
     */
    getSegments(): readonly Segment[] {
        return this.segmentList;
    }

    // ========== Private Helpers ==========

    /**
     * Validates and registers animation targets based on lifecycle.
     * Handles composition animations (Sequence, Parallel) by processing children.
     */
    private validateAndRegisterAnimation(anim: Animation): void {
        // Check if this is a composition animation with children
        const children = this.getAnimationChildren(anim);

        if (children.length > 0) {
            // For composition animations, process each child
            for (const child of children) {
                this.validateAndRegisterAnimation(child);
            }
            return;
        }

        // Regular animation - validate/register based on lifecycle
        const target = anim.getTarget();

        switch (anim.lifecycle) {
            case 'introductory':
                // Auto-register if not already in scene (only root objects)
                if (!this.mobjects.has(target)) {
                    this.mobjects.add(target);
                }
                break;

            case 'transformative':
            case 'exit':
                // CameraFrame is exempt - it's owned by Camera, not added to scene
                if (target instanceof CameraFrame) {
                    break;
                }
                // Validate object is in scene (directly or via parent chain)
                if (!this.isInScene(target)) {
                    throw new AnimationTargetNotInSceneError(anim, target);
                }
                break;
        }
    }

    /**
     * Checks if a Mobject is in the scene.
     * An object is "in scene" if:
     * - It's directly registered in this.mobjects, OR
     * - Any ancestor in its parent chain is registered
     *
     * This respects the scene graph hierarchy - children of registered
     * VGroups are implicitly in scene via their parent.
     */
    isInScene(mobject: Mobject): boolean {
        // Check direct registration
        if (this.mobjects.has(mobject)) {
            return true;
        }

        // Check if any ancestor is registered (traverse parent chain)
        let current = mobject.parent;
        while (current !== null) {
            if (this.mobjects.has(current)) {
                return true;
            }
            current = current.parent;
        }

        return false;
    }

    /**
     * Gets children of composition animations (Sequence, Parallel).
     * Returns empty array for non-composition animations.
     */
    private getAnimationChildren(anim: Animation): readonly Animation[] {
        // Check for getChildren method (Sequence, Parallel have this)
        if ('getChildren' in anim && typeof anim.getChildren === 'function') {
            return anim.getChildren();
        }
        return [];
    }

    /**
     * Computes a holistic CRC32 hash for a segment.
     * Includes camera state, all current mobjects, animations, and timing.
     */
    private computeSegmentHash(
        animations: readonly Animation[],
        startTime: number,
        endTime: number,
    ): number {
        const cameraHash = this._camera.computeHash();
        const mobjectHashes = [...this.mobjects].map(m => m.computeHash());
        const animHashes = animations.map(a => a.computeHash());

        return hashCompose(
            cameraHash,
            ...mobjectHashes,
            ...animHashes,
            hashNumber(startTime),
            hashNumber(endTime),
        );
    }
}

