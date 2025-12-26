/**
 * Color utilities for parsing, blending, and converting colors.
 */

/**
 * RGB color components (0-255).
 */
export interface RgbColor {
    r: number;
    g: number;
    b: number;
}

/**
 * Parse a hex color string to RGB components.
 * Supports #RGB, #RRGGBB formats.
 */
export function parseHexColor(hex: string): RgbColor {
    let cleanHex = hex.replace('#', '');

    // Expand shorthand (#RGB -> #RRGGBB)
    if (cleanHex.length === 3) {
        cleanHex = cleanHex[0] + cleanHex[0] + cleanHex[1] + cleanHex[1] + cleanHex[2] + cleanHex[2];
    }

    if (cleanHex.length !== 6) {
        return { r: 0, g: 0, b: 0 };
    }

    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);

    return { r, g, b };
}

/**
 * Convert RGB components to hex color string.
 */
export function rgbToHex(r: number, g: number, b: number): string {
    const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
    const toHex = (v: number) => clamp(v).toString(16).padStart(2, '0');
    return '#' + toHex(r) + toHex(g) + toHex(b);
}

/**
 * Interpolate between two hex colors.
 * @param from - Starting color (hex string)
 * @param to - Ending color (hex string)
 * @param t - Interpolation factor (0-1)
 * @returns Interpolated color as hex string
 */
export function interpolateColor(from: string, to: string, t: number): string {
    // Handle empty strings
    if (!from || from === '') {
        return to || '';
    }
    if (!to || to === '') {
        return from;
    }

    const fromRgb = parseHexColor(from);
    const toRgb = parseHexColor(to);

    const r = fromRgb.r + (toRgb.r - fromRgb.r) * t;
    const g = fromRgb.g + (toRgb.g - fromRgb.g) * t;
    const b = fromRgb.b + (toRgb.b - fromRgb.b) * t;

    return rgbToHex(r, g, b);
}

/**
 * Interpolate a numeric value.
 */
export function interpolateNumber(from: number, to: number, t: number): number {
    return from + (to - from) * t;
}
