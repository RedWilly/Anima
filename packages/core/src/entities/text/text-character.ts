/**
 * TextCharacter - A single character entity that can be individually animated.
 */

import type { Style, FontWeight } from '../../types';
import { Shape } from '../shape';
import type { TextCharacterOptions } from './types';

/**
 * Default style for text characters.
 */
const TEXT_CHAR_DEFAULT_STYLE: Style = {
    fill: '#2c3e50',
    stroke: '',
    strokeWidth: 0,
};

/**
 * A single character entity with its own position, style, and transform.
 * Part of a Text group but can be animated individually.
 */
export class TextCharacter extends Shape {
    private char: string;
    private fontFamily: string;
    private fontSize: number;
    private fontWeight: FontWeight;
    
    /** Character width in pixels (set by parent Text group) */
    charWidth: number = 0;
    
    /** X offset from the Text group origin (set by parent) */
    offsetX: number = 0;

    constructor(options: TextCharacterOptions) {
        super(options.style ?? TEXT_CHAR_DEFAULT_STYLE);
        this.char = options.char;
        this.fontFamily = options.fontFamily ?? 'sans-serif';
        this.fontSize = options.fontSize ?? 24;
        this.fontWeight = options.fontWeight ?? 'normal';
        
        this.validateFontSize(this.fontSize);
    }

    getChar(): string {
        return this.char;
    }

    setChar(value: string): this {
        this.char = value;
        return this;
    }

    getFontFamily(): string {
        return this.fontFamily;
    }

    setFontFamily(value: string): this {
        this.fontFamily = value;
        return this;
    }

    getFontSize(): number {
        return this.fontSize;
    }

    setFontSize(value: number): this {
        this.validateFontSize(value);
        this.fontSize = value;
        return this;
    }

    getFontWeight(): FontWeight {
        return this.fontWeight;
    }

    setFontWeight(value: FontWeight): this {
        this.fontWeight = value;
        return this;
    }

    /** Returns CSS font string, e.g., "bold 24px Arial". */
    getFontString(): string {
        return `${this.fontWeight} ${this.fontSize}px ${this.fontFamily}`;
    }

    render(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        this.applyTransform(ctx);

        ctx.font = this.getFontString();
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';

        // Fill character
        if (this.style.fill) {
            ctx.fillStyle = this.style.fill;
            ctx.fillText(this.char, 0, 0);
        }

        // Stroke character
        if (this.style.stroke && this.style.strokeWidth > 0) {
            ctx.strokeStyle = this.style.stroke;
            ctx.lineWidth = this.style.strokeWidth;
            ctx.strokeText(this.char, 0, 0);
        }

        ctx.restore();
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

