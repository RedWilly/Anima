/**
 * Font resolution and caching utilities.
 * 
 * Provides font loading from bundled fonts or custom paths.
 */

import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { FontMetrics } from '../../font';

/** Bundled fonts directory path. */
function getBundledFontsDir(): string {
    const currentDir = dirname(fileURLToPath(import.meta.url));
    return join(currentDir, '..', '..', '..', 'assets', 'fonts');
}

/** Cached font faces by name/path. */
const fontCache = new Map<string, FontMetrics>();

/**
 * Resolve a font family name or path to a FontMetrics object.
 * - If path ends with .ttf/.otf/.woff, loads from that file.
 * - Otherwise, looks up bundled font by name (e.g., 'Roboto' → Roboto-Regular.ttf).
 * - Falls back to Roboto if the specified font is not found.
 */
export function resolveFontFamily(fontFamily: string): FontMetrics {
    // Check cache first
    if (fontCache.has(fontFamily)) {
        return fontCache.get(fontFamily)!;
    }

    const lowerFamily = fontFamily.toLowerCase();
    const bundledDir = getBundledFontsDir();
    const robotoPath = join(bundledDir, 'Roboto-Regular.ttf');

    let fontPath: string;

    // Check if it's a file path
    if (lowerFamily.endsWith('.ttf') || lowerFamily.endsWith('.otf') || lowerFamily.endsWith('.woff')) {
        fontPath = fontFamily;
    } else {
        // Look up bundled font
        fontPath = join(bundledDir, `${fontFamily}-Regular.ttf`);
    }

    try {
        const metrics = FontMetrics.fromFileSync(fontPath);
        fontCache.set(fontFamily, metrics);
        return metrics;
    } catch {
        // Font not found, fallback to Roboto
        if (fontFamily !== 'Roboto' && !fontCache.has('Roboto')) {
            const robotoMetrics = FontMetrics.fromFileSync(robotoPath);
            fontCache.set('Roboto', robotoMetrics);
        }
        return fontCache.get('Roboto') ?? FontMetrics.fromFileSync(robotoPath);
    }
}

/**
 * Clear the font cache (useful for testing).
 */
export function clearFontCache(): void {
    fontCache.clear();
}

/**
 * Get the number of cached fonts.
 */
export function getFontCacheSize(): number {
    return fontCache.size;
}
