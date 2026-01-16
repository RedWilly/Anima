/**
 * Creates a Color from a hex string.
 * Supports formats: #RRGGBB, #RGB, #RRGGBBAA, #RGBA.
 */
export function parseHex(hex: string): { r: number; g: number; b: number; a: number } {
    hex = hex.replace(/^#/, '');

    let r = 0;
    let g = 0;
    let b = 0;
    let a = 1;

    if (hex.length === 3) {
        // #RGB
        const rHex = hex[0] || '';
        const gHex = hex[1] || '';
        const bHex = hex[2] || '';
        r = parseInt(rHex + rHex, 16);
        g = parseInt(gHex + gHex, 16);
        b = parseInt(bHex + bHex, 16);
    } else if (hex.length === 4) {
        // #RGBA
        const rHex = hex[0] || '';
        const gHex = hex[1] || '';
        const bHex = hex[2] || '';
        const aHex = hex[3] || '';
        r = parseInt(rHex + rHex, 16);
        g = parseInt(gHex + gHex, 16);
        b = parseInt(bHex + bHex, 16);
        a = parseInt(aHex + aHex, 16) / 255;
    } else if (hex.length === 6) {
        // #RRGGBB
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
    } else if (hex.length === 8) {
        // #RRGGBBAA
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
        a = parseInt(hex.substring(6, 8), 16) / 255;
    } else {
        throw new Error(`Invalid hex string: ${hex}`);
    }

    if (isNaN(r) || isNaN(g) || isNaN(b) || isNaN(a)) {
        throw new Error(`Invalid hex string: ${hex}`);
    }

    return { r, g, b, a };
}

/** Converts HSL values to RGB. */
export function hslToRgb(
    h: number,
    s: number,
    l: number,
    a: number = 1.0
): { r: number; g: number; b: number; a: number } {
    h = h % 360;
    if (h < 0) h += 360;
    s = Math.max(0, Math.min(1, s));
    l = Math.max(0, Math.min(1, l));
    a = Math.max(0, Math.min(1, a));

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;

    let rPrime = 0;
    let gPrime = 0;
    let bPrime = 0;

    if (0 <= h && h < 60) {
        rPrime = c;
        gPrime = x;
        bPrime = 0;
    } else if (60 <= h && h < 120) {
        rPrime = x;
        gPrime = c;
        bPrime = 0;
    } else if (120 <= h && h < 180) {
        rPrime = 0;
        gPrime = c;
        bPrime = x;
    } else if (180 <= h && h < 240) {
        rPrime = 0;
        gPrime = x;
        bPrime = c;
    } else if (240 <= h && h < 300) {
        rPrime = x;
        gPrime = 0;
        bPrime = c;
    } else if (300 <= h && h < 360) {
        rPrime = c;
        gPrime = 0;
        bPrime = x;
    }

    const r = Math.round((rPrime + m) * 255);
    const g = Math.round((gPrime + m) * 255);
    const b = Math.round((bPrime + m) * 255);

    return { r, g, b, a };
}
