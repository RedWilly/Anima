import { parseHex, hslToRgb } from './conversions';

/**
 * A class representing a color with Red, Green, Blue, and Alpha components.
 * RGB values are in the range [0, 255].
 * Alpha value is in the range [0, 1].
 */
export class Color {
    readonly r: number;
    readonly g: number;
    readonly b: number;
    readonly a: number;

    constructor(r: number, g: number, b: number, a: number = 1.0) {
        this.r = Math.max(0, Math.min(255, r));
        this.g = Math.max(0, Math.min(255, g));
        this.b = Math.max(0, Math.min(255, b));
        this.a = Math.max(0, Math.min(1, a));
    }

    /**
     * Creates a Color from a hex string.
     * Supports formats: #RRGGBB, #RGB, #RRGGBBAA, #RGBA.
     */
    static fromHex(hex: string): Color {
        const { r, g, b, a } = parseHex(hex);
        return new Color(r, g, b, a);
    }

    /**
     * Creates a Color from HSL values.
     * @param h Hue in degrees [0, 360).
     * @param s Saturation [0, 1].
     * @param l Lightness [0, 1].
     * @param a Alpha [0, 1].
     */
    static fromHSL(h: number, s: number, l: number, a: number = 1.0): Color {
        const rgb = hslToRgb(h, s, l, a);
        return new Color(rgb.r, rgb.g, rgb.b, rgb.a);
    }

    /**
     * Returns the hex string representation of the color.
     * If alpha is 1, returns #RRGGBB. Otherwise #RRGGBBAA.
     */
    toHex(): string {
        const r = Math.round(this.r).toString(16).padStart(2, '0');
        const g = Math.round(this.g).toString(16).padStart(2, '0');
        const b = Math.round(this.b).toString(16).padStart(2, '0');

        if (this.a >= 0.999) {
            return `#${r}${g}${b}`;
        } else {
            const a = Math.round(this.a * 255).toString(16).padStart(2, '0');
            return `#${r}${g}${b}${a}`;
        }
    }

    /**
     * Returns the rgba string representation of the color.
     * Format: rgba(r, g, b, a)
     */
    toRGBA(): string {
        return `rgba(${Math.round(this.r)}, ${Math.round(this.g)}, ${Math.round(this.b)}, ${this.a})`;
    }

    /**
     * Linearly interpolates between this color and another.
     * @param other The target color.
     * @param t The interpolation factor (0-1).
     */
    lerp(other: Color, t: number): Color {
        t = Math.max(0, Math.min(1, t));
        const r = this.r + (other.r - this.r) * t;
        const g = this.g + (other.g - this.g) * t;
        const b = this.b + (other.b - this.b) * t;
        const a = this.a + (other.a - this.a) * t;
        return new Color(r, g, b, a);
    }

    static readonly WHITE = new Color(255, 255, 255);
    static readonly BLACK = new Color(0, 0, 0);
    static readonly RED = new Color(255, 0, 0);
    static readonly GREEN = new Color(0, 255, 0);
    static readonly BLUE = new Color(0, 0, 255);
    static readonly YELLOW = new Color(255, 255, 0);
    static readonly TRANSPARENT = new Color(0, 0, 0, 0);
}
