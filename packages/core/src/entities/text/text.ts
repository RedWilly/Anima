/**
 * Text - A group of TextCharacter entities that can be animated as a whole or individually.
 * Inspired by Manim's Text/VGroup pattern.
 */

import type { Point, AnimationOptions, FontWeight, TextAlign, TextBaseline, Style, ActionInfo } from '../../types';
import type { Timeline, ParallelOptions } from '../../timeline/timeline';
import type { Action } from '../../timeline/action';
import type { FontMetrics } from '../../font';
import { Vector2 } from '../../math';
import { TextCharacter } from './text-character';
import type { TextOptions } from './types';

let textIdCounter = 0;

/**
 * Generate a unique text ID.
 */
function generateTextId(): string {
    return `text_${++textIdCounter}`;
}

/**
 * Default style for text.
 */
const TEXT_DEFAULT_STYLE: Style = {
    fill: '#2c3e50',
    stroke: '',
    strokeWidth: 0,
};

/**
 * A text entity composed of individual character entities.
 * Each character can be accessed and animated independently.
 *
 * @example
 * const title = text({ content: 'Anima' });
 *
 * // Access individual characters
 * title.charAt(0).fill('#e74c3c');  // Color the 'A'
 *
 * // Animate a slice
 * title.slice(1, 3).forEach(c => c.fadeOut());  // Fade 'ni'
 *
 * // Stagger animation across all characters
 * title.stagger([c => c.fadeIn()], { stagger: 0.1 });
 */
export class Text {
    readonly id: string;

    protected characters: TextCharacter[] = [];
    protected content: string;
    protected fontFamily: string;
    protected fontSize: number;
    protected fontWeight: FontWeight;
    protected textAlign: TextAlign;
    protected textBaseline: TextBaseline;
    protected letterSpacing: number;
    protected style: Style;
    protected fontMetrics: FontMetrics | null = null;

    protected currentPosition: Point;
    protected currentScale: Point;
    protected currentRotation: number;
    protected currentOpacity: number;
    protected timeline: Timeline | null = null;

    constructor(options?: TextOptions) {
        this.id = generateTextId();
        this.content = options?.content ?? '';
        this.fontFamily = options?.fontFamily ?? 'sans-serif';
        this.fontSize = options?.fontSize ?? 24;
        this.fontWeight = options?.fontWeight ?? 'normal';
        this.textAlign = options?.textAlign ?? 'left';
        this.textBaseline = options?.textBaseline ?? 'middle';
        this.letterSpacing = options?.letterSpacing ?? 0;
        this.style = { ...TEXT_DEFAULT_STYLE, ...options?.style };
        this.fontMetrics = options?.fontMetrics ?? null;

        this.currentPosition = Vector2.zero();
        this.currentScale = Vector2.one();
        this.currentRotation = 0;
        this.currentOpacity = 1;

        if (options?.fontSize !== undefined) {
            this.validateFontSize(options.fontSize);
        }

        this.buildCharacters();
    }

    get length(): number {
        return this.characters.length;
    }

    get position(): Point {
        return { ...this.currentPosition };
    }

    get scale(): Point {
        return { ...this.currentScale };
    }

    get rotation(): number {
        return this.currentRotation;
    }

    get opacity(): number {
        return this.currentOpacity;
    }

    /** Throws if index is out of bounds. */
    charAt(index: number): TextCharacter {
        if (index < 0 || index >= this.characters.length) {
            throw new Error(
                `Character index ${index} out of bounds (0-${this.characters.length - 1}).`
            );
        }
        return this.characters[index];
    }

    slice(start: number, end?: number): TextCharacter[] {
        return this.characters.slice(start, end);
    }

    forEach(callback: (char: TextCharacter, index: number) => void): this {
        for (let i = 0, len = this.characters.length; i < len; i++) {
            callback(this.characters[i], i);
        }
        return this;
    }

    map<T>(callback: (char: TextCharacter, index: number) => T): T[] {
        const result: T[] = new Array(this.characters.length);
        for (let i = 0, len = this.characters.length; i < len; i++) {
            result[i] = callback(this.characters[i], i);
        }
        return result;
    }

    toArray(): TextCharacter[] {
        return [...this.characters];
    }

    getContent(): string {
        return this.content;
    }

    /** Rebuilds all character entities. */
    setContent(value: string): this {
        this.content = value;
        this.buildCharacters();
        return this;
    }

    getFontFamily(): string {
        return this.fontFamily;
    }

    /** Applies to all characters. */
    setFontFamily(value: string): this {
        this.fontFamily = value;
        for (let i = 0, len = this.characters.length; i < len; i++) {
            this.characters[i].setFontFamily(value);
        }
        return this;
    }

    getFontSize(): number {
        return this.fontSize;
    }

    /** Applies to all characters and recalculates positions. */
    setFontSize(value: number): this {
        this.validateFontSize(value);
        this.fontSize = value;
        for (let i = 0, len = this.characters.length; i < len; i++) {
            this.characters[i].setFontSize(value);
        }
        this.recalculatePositions();
        return this;
    }

    getFontWeight(): FontWeight {
        return this.fontWeight;
    }

    /** Applies to all characters. */
    setFontWeight(value: FontWeight): this {
        this.fontWeight = value;
        for (let i = 0, len = this.characters.length; i < len; i++) {
            this.characters[i].setFontWeight(value);
        }
        return this;
    }

    getTextAlign(): TextAlign {
        return this.textAlign;
    }

    setTextAlign(value: TextAlign): this {
        this.textAlign = value;
        this.recalculatePositions();
        return this;
    }

    getTextBaseline(): TextBaseline {
        return this.textBaseline;
    }

    setTextBaseline(value: TextBaseline): this {
        this.textBaseline = value;
        return this;
    }

    /** Set FontMetrics for accurate character positioning. */
    setFontMetrics(metrics: FontMetrics | null): this {
        this.fontMetrics = metrics;
        this.recalculatePositions();
        return this;
    }

    /** Get the current FontMetrics (or null if using estimates). */
    getFontMetrics(): FontMetrics | null {
        return this.fontMetrics;
    }

    /** Applies to all characters. */
    fill(color: string): this {
        for (let i = 0, len = this.characters.length; i < len; i++) {
            this.characters[i].fill(color);
        }
        this.style.fill = color;
        return this;
    }

    /** Applies to all characters. */
    stroke(color: string): this {
        for (let i = 0, len = this.characters.length; i < len; i++) {
            this.characters[i].stroke(color);
        }
        this.style.stroke = color;
        return this;
    }

    /** Applies to all characters. */
    strokeWidth(width: number): this {
        for (let i = 0, len = this.characters.length; i < len; i++) {
            this.characters[i].strokeWidth(width);
        }
        this.style.strokeWidth = width;
        return this;
    }

    bindTimeline(timeline: Timeline): this {
        this.timeline = timeline;
        for (let i = 0, len = this.characters.length; i < len; i++) {
            this.characters[i].bindTimeline(timeline);
        }
        return this;
    }

    moveTo(x: number, y: number, options?: AnimationOptions): this {
        this.scheduleAction({
            type: 'moveTo',
            targetId: this.id,
            target: { x, y },
            duration: options?.duration ?? 0.5,
            ease: options?.ease ?? 'easeInOut',
        });
        return this;
    }

    scaleTo(sx: number, sy: number, options?: AnimationOptions): this {
        this.scheduleAction({
            type: 'scaleTo',
            targetId: this.id,
            target: { x: sx, y: sy },
            duration: options?.duration ?? 0.5,
            ease: options?.ease ?? 'easeInOut',
        });
        return this;
    }

    rotateTo(angle: number, options?: AnimationOptions): this {
        this.scheduleAction({
            type: 'rotateTo',
            targetId: this.id,
            target: angle,
            duration: options?.duration ?? 0.5,
            ease: options?.ease ?? 'easeInOut',
        });
        return this;
    }

    fadeIn(options?: AnimationOptions): this {
        this.scheduleAction({
            type: 'fadeTo',
            targetId: this.id,
            target: 1,
            duration: options?.duration ?? 0.5,
            ease: options?.ease ?? 'easeInOut',
        });
        return this;
    }

    fadeOut(options?: AnimationOptions): this {
        this.scheduleAction({
            type: 'fadeTo',
            targetId: this.id,
            target: 0,
            duration: options?.duration ?? 0.5,
            ease: options?.ease ?? 'easeInOut',
        });
        return this;
    }

    wait(seconds: number): this {
        this.scheduleAction({
            type: 'wait',
            targetId: this.id,
            target: null,
            duration: seconds,
            ease: 'linear',
        });
        return this;
    }

    parallel(
        animations: Array<(text: this) => void>,
        options?: ParallelOptions
    ): this {
        if (!this.timeline) {
            throw new Error(
                `Text "${this.id}" is not bound to a timeline. ` +
                'Add the text to a scene first.'
            );
        }
        this.timeline.beginParallel(options);
        for (let i = 0, len = animations.length; i < len; i++) {
            animations[i](this);
        }
        this.timeline.endParallel();
        return this;
    }

    /**
     * Applies animation to each character with staggered timing.
     *
     * @example
     * title.stagger([c => c.fadeIn()], { stagger: 0.1 });
     */
    stagger(
        animations: Array<(char: TextCharacter, index: number) => void>,
        options?: ParallelOptions
    ): this {
        if (!this.timeline) {
            throw new Error(
                `Text "${this.id}" is not bound to a timeline. ` +
                'Add the text to a scene first.'
            );
        }

        const charAnimations: Array<() => void> = [];
        for (let i = 0, len = this.characters.length; i < len; i++) {
            const char = this.characters[i];
            for (let j = 0, animLen = animations.length; j < animLen; j++) {
                const animation = animations[j];
                charAnimations.push(() => animation(char, i));
            }
        }

        this.timeline.beginParallel(options);
        for (let i = 0, len = charAnimations.length; i < len; i++) {
            charAnimations[i]();
        }
        this.timeline.endParallel();

        return this;
    }

    applyAction(action: ActionInfo, progress: number): void {
        switch (action.type) {
            case 'moveTo':
                if (action.startValue && typeof action.target === 'object' && action.target !== null) {
                    const start = action.startValue as Point;
                    const end = action.target as Point;
                    this.currentPosition = Vector2.lerp(start, end, progress);
                }
                break;
            case 'scaleTo':
                if (action.startValue && typeof action.target === 'object' && action.target !== null) {
                    const start = action.startValue as Point;
                    const end = action.target as Point;
                    this.currentScale = Vector2.lerp(start, end, progress);
                }
                break;
            case 'rotateTo':
                if (typeof action.startValue === 'number' && typeof action.target === 'number') {
                    const start = action.startValue;
                    const end = action.target;
                    this.currentRotation = start + (end - start) * progress;
                }
                break;
            case 'fadeTo':
                if (typeof action.startValue === 'number' && typeof action.target === 'number') {
                    const start = action.startValue;
                    const end = action.target;
                    this.currentOpacity = start + (end - start) * progress;
                }
                break;
        }
    }

    captureState(actionType: string): Point | number | null {
        switch (actionType) {
            case 'moveTo':
                return { ...this.currentPosition };
            case 'scaleTo':
                return { ...this.currentScale };
            case 'rotateTo':
                return this.currentRotation;
            case 'fadeTo':
                return this.currentOpacity;
            default:
                return null;
        }
    }

    render(ctx: CanvasRenderingContext2D): void {
        ctx.save();

        // Apply group transform
        ctx.translate(this.currentPosition.x, this.currentPosition.y);
        ctx.rotate(this.currentRotation);
        ctx.scale(this.currentScale.x, this.currentScale.y);
        ctx.globalAlpha = this.currentOpacity;

        // Render each character at its offset
        for (let i = 0, len = this.characters.length; i < len; i++) {
            const char = this.characters[i];
            ctx.save();
            ctx.translate(char.offsetX, 0);
            char.render(ctx);
            ctx.restore();
        }

        ctx.restore();
    }

    protected buildCharacters(): void {
        this.characters = [];

        for (let i = 0, len = this.content.length; i < len; i++) {
            const char = new TextCharacter({
                char: this.content[i],
                fontFamily: this.fontFamily,
                fontSize: this.fontSize,
                fontWeight: this.fontWeight,
                style: { ...this.style },
            });

            if (this.timeline) {
                char.bindTimeline(this.timeline);
            }

            this.characters.push(char);
        }

        this.recalculatePositions();
    }

    /** Uses FontMetrics if available, otherwise falls back to estimates. */
    protected recalculatePositions(): void {
        let totalWidth = 0;

        if (this.fontMetrics) {
            // Use accurate metrics from fontkit
            const layout = this.fontMetrics.layout(this.content);
            for (let i = 0, len = this.characters.length; i < len; i++) {
                if (i < layout.positions.length) {
                    const pos = layout.positions[i];
                    const widthPx = this.fontMetrics.unitsToPixels(pos.xAdvance, this.fontSize);
                    this.characters[i].charWidth = widthPx;
                    totalWidth += widthPx + this.letterSpacing;
                }
            }
        } else {
            // Fallback: estimate width as 0.6 * fontSize
            const avgCharWidth = this.fontSize * 0.6;
            for (let i = 0, len = this.characters.length; i < len; i++) {
                this.characters[i].charWidth = avgCharWidth;
                totalWidth += avgCharWidth + this.letterSpacing;
            }
        }

        if (this.characters.length > 0) {
            totalWidth -= this.letterSpacing;
        }

        // Calculate starting offset based on alignment
        let startX = 0;
        if (this.textAlign === 'center') {
            startX = -totalWidth / 2;
        } else if (this.textAlign === 'right') {
            startX = -totalWidth;
        }

        // Set offsets
        let currentX = startX;
        for (let i = 0, len = this.characters.length; i < len; i++) {
            this.characters[i].offsetX = currentX;
            currentX += this.characters[i].charWidth + this.letterSpacing;
        }
    }

    protected scheduleAction(action: Omit<Action, 'startTime' | 'startValue'>): void {
        if (!this.timeline) {
            throw new Error(
                `Text "${this.id}" is not bound to a timeline. ` +
                'Add the text to a scene first.'
            );
        }
        this.timeline.scheduleAction(action, this);
    }

    private validateFontSize(value: number): void {
        if (value <= 0) {
            throw new Error(
                `Font size must be positive (received: ${value}). ` +
                'Use a positive number, e.g., setFontSize(24).'
            );
        }
    }
}

export function text(options?: TextOptions): Text {
    return new Text(options);
}

