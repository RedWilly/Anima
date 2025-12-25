/**
 * Scene - the main container for animations.
 */

import type { Entity } from '../entities/entity';
import { Timeline } from '../timeline/timeline';

export interface SceneOptions {
    /** Width of the scene in pixels (default: 800) */
    width?: number;
    /** Height of the scene in pixels (default: 600) */
    height?: number;
    /** Background color (default: '#1a1a2e') */
    background?: string;
    /** Frames per second (default: 60) */
    fps?: number;
}

/**
 * Scene is the main container for all visual entities and timeline.
 */
export class Scene {
    readonly width: number;
    readonly height: number;
    readonly background: string;
    readonly timeline: Timeline;

    private entities: Entity[] = [];

    constructor(options?: SceneOptions) {
        this.width = options?.width ?? 800;
        this.height = options?.height ?? 600;
        this.background = options?.background ?? '#1a1a2e';
        this.timeline = new Timeline({ fps: options?.fps ?? 60 });
    }

    /**
     * Add an entity to the scene.
     */
    add<T extends Entity>(entity: T): T {
        this.entities.push(entity);
        this.timeline.registerEntity(entity);
        return entity;
    }

    /**
     * Get all entities in the scene.
     */
    getEntities(): readonly Entity[] {
        return this.entities;
    }

    /**
     * Insert a wait action into the timeline.
     */
    wait(seconds: number): this {
        // Create a no-op wait action
        // This affects the timeline's scheduled end time
        if (this.entities.length > 0) {
            this.entities[0].wait(seconds);
        }
        return this;
    }

    /**
     * Execute multiple animation callbacks simultaneously.
     * All animations within the parallel block start at the same time.
     * The parallel block completes when the longest animation finishes.
     *
     * @example
     * scene.parallel(
     *   () => circle.moveTo(100, 200),
     *   () => rect.fadeOut(),
     *   () => scene.wait(0.5)  // Parallel wait acts as minimum duration
     * );
     */
    parallel(...animations: Array<() => void>): this {
        this.timeline.beginParallel();
        for (const animation of animations) {
            animation();
        }
        this.timeline.endParallel();
        return this;
    }

    /**
     * Start playback.
     */
    play(): this {
        this.timeline.play();
        return this;
    }

    /**
     * Pause playback.
     */
    pause(): this {
        this.timeline.pause();
        return this;
    }

    /**
     * Seek to a specific time.
     */
    seek(time: number): this {
        this.timeline.seek(time);
        return this;
    }

    /**
     * Reset the scene to the beginning.
     */
    reset(): this {
        this.timeline.reset();
        return this;
    }

    /**
     * Render the scene to a canvas context.
     */
    render(ctx: CanvasRenderingContext2D): void {
        // Clear and fill background
        ctx.fillStyle = this.background;
        ctx.fillRect(0, 0, this.width, this.height);

        // Render all entities
        for (const entity of this.entities) {
            entity.render(ctx);
        }
    }

    /**
     * Get the total duration of the scene.
     */
    get duration(): number {
        return this.timeline.duration;
    }

    /**
     * Get the current playback time.
     */
    get currentTime(): number {
        return this.timeline.time;
    }
}
