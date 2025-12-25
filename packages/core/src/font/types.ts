/**
 * Font metrics types for the FontMetrics service.
 */

/** Metrics for a single glyph. */
export interface GlyphMetrics {
    /** Glyph advance width in font units. */
    advanceWidth: number;
    /** Glyph ID in the font. */
    id: number;
    /** The character(s) this glyph represents. */
    codePoints: number[];
}

/** Position adjustment for a glyph after layout. */
export interface GlyphPosition {
    /** Horizontal advance to next glyph. */
    xAdvance: number;
    /** Vertical advance (typically 0 for horizontal text). */
    yAdvance: number;
    /** Horizontal offset from baseline position. */
    xOffset: number;
    /** Vertical offset from baseline position. */
    yOffset: number;
}

/** Result of laying out a string of text. */
export interface LayoutResult {
    /** Array of glyph metrics in layout order. */
    glyphs: GlyphMetrics[];
    /** Array of glyph positions corresponding to glyphs. */
    positions: GlyphPosition[];
    /** Total advance width of the laid out text in font units. */
    advanceWidth: number;
}

/** Font-level metrics. */
export interface FontInfo {
    /** Font units per em (used for scaling). */
    unitsPerEm: number;
    /** Ascender height in font units. */
    ascent: number;
    /** Descender depth in font units (typically negative). */
    descent: number;
    /** Line gap in font units. */
    lineGap: number;
    /** Cap height in font units. */
    capHeight: number;
    /** x-height in font units. */
    xHeight: number;
    /** PostScript name of the font. */
    postscriptName: string | null;
    /** Full name of the font. */
    fullName: string | null;
    /** Font family name. */
    familyName: string | null;
}

/** Options for loading a font. */
export interface FontLoadOptions {
    /** PostScript name to select from a font collection. */
    postscriptName?: string;
}

