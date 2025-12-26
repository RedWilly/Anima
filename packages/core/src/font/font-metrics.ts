/**
 * FontMetrics - Service for accurate font measurement using fontkit.
 *
 * Provides deterministic glyph metrics independent of browser/OS.
 *
 * fontkit.create() returns Font | FontCollection union.
 * When postscriptName is provided or buffer contains a single font,
 * the result is always Font. Cast is safe and necessary.   
 */

import * as fontkit from 'fontkit';
import type { Font } from 'fontkit';
import type {
    FontInfo,
    FontLoadOptions,
    GlyphMetrics,
    GlyphPosition,
    LayoutResult,
} from './types';

/**
 * Wraps a fontkit Font to provide metrics and layout.
 */
export class FontMetrics {
    private readonly font: Font;
    private readonly info: FontInfo;

    private constructor(font: Font) {
        this.font = font;
        this.info = {
            unitsPerEm: font.unitsPerEm,
            ascent: font.ascent,
            descent: font.descent,
            lineGap: font.lineGap,
            capHeight: font.capHeight ?? font.ascent,
            xHeight: font.xHeight ?? font.ascent * 0.5,
            postscriptName: font.postscriptName ?? null,
            fullName: font.fullName ?? null,
            familyName: font.familyName ?? null,
        };
    }

    /**
     * Create FontMetrics from a font file buffer.
     * Works in both browser (ArrayBuffer/Uint8Array) and Node (Buffer).
     */
    static fromBuffer(
        buffer: ArrayBuffer | Uint8Array | Buffer,
        options?: FontLoadOptions
    ): FontMetrics {
        const buf = buffer instanceof ArrayBuffer
            ? Buffer.from(buffer)
            : Buffer.from(buffer);
        const font = fontkit.create(buf, options?.postscriptName);
        return new FontMetrics(font as Font);
    }

    /**
     * Create FontMetrics by loading a font file (Node.js only).
     * Returns a Promise that resolves to FontMetrics.
     */
    static async fromFile(
        path: string,
        options?: FontLoadOptions
    ): Promise<FontMetrics> {
        const font = await fontkit.open(path, options?.postscriptName);
        return new FontMetrics(font as Font);
    }

    /**
     * Create FontMetrics by loading a font file synchronously (Node.js only).
     */
    static fromFileSync(
        path: string,
        options?: FontLoadOptions
    ): FontMetrics {
        const font = fontkit.openSync(path, options?.postscriptName);
        return new FontMetrics(font as Font);
    }

    /** Get font info (units per em, ascent, descent, etc). */
    getInfo(): FontInfo {
        return { ...this.info };
    }

    /** Get units per em for scaling calculations. */
    get unitsPerEm(): number {
        return this.info.unitsPerEm;
    }

    /** Convert font units to pixels at a given font size. */
    unitsToPixels(units: number, fontSize: number): number {
        return (units / this.info.unitsPerEm) * fontSize;
    }

    /** Convert pixels to font units at a given font size. */
    pixelsToUnits(pixels: number, fontSize: number): number {
        return (pixels / fontSize) * this.info.unitsPerEm;
    }

    /**
     * Layout a string and get glyph metrics and positions.
     * Applies OpenType features like kerning and ligatures.
     */
    layout(text: string): LayoutResult {
        const run = this.font.layout(text);
        const glyphs: GlyphMetrics[] = [];
        const positions: GlyphPosition[] = [];
        let advanceWidth = 0;

        for (let i = 0, len = run.glyphs.length; i < len; i++) {
            const glyph = run.glyphs[i];
            const pos = run.positions[i];

            glyphs.push({
                advanceWidth: glyph.advanceWidth,
                id: glyph.id,
                codePoints: glyph.codePoints,
            });

            positions.push({
                xAdvance: pos.xAdvance,
                yAdvance: pos.yAdvance,
                xOffset: pos.xOffset,
                yOffset: pos.yOffset,
            });

            advanceWidth += pos.xAdvance;
        }

        return { glyphs, positions, advanceWidth };
    }

    /**
     * Get the advance width of a string in font units.
     * Faster than full layout if you only need width.
     */
    measureText(text: string): number {
        const run = this.font.layout(text);
        let width = 0;
        for (let i = 0, len = run.positions.length; i < len; i++) {
            width += run.positions[i].xAdvance;
        }
        return width;
    }

    /**
     * Get the advance width of a string in pixels at a given font size.
     */
    measureTextPx(text: string, fontSize: number): number {
        return this.unitsToPixels(this.measureText(text), fontSize);
    }

    /**
     * Get line height in font units (ascent - descent + lineGap).
     */
    getLineHeight(): number {
        return this.info.ascent - this.info.descent + this.info.lineGap;
    }

    /**
     * Get line height in pixels at a given font size.
     */
    getLineHeightPx(fontSize: number): number {
        return this.unitsToPixels(this.getLineHeight(), fontSize);
    }

    /**
     * Get vector points from a glyph path for morphing.
     * Samples curves to produce a list of points.
     */
    getGlyphPath(char: string, fontSize: number, curveSegments = 8): { x: number; y: number }[] {
        const run = this.font.layout(char);
        if (run.glyphs.length === 0) {
            return [];
        }

        const glyph = run.glyphs[0];
        const path = glyph.path;
        if (!path || !path.commands) {
            return [];
        }

        const scale = fontSize / this.info.unitsPerEm;
        const points: { x: number; y: number }[] = [];
        let currentX = 0;
        let currentY = 0;

        for (const cmd of path.commands) {
            switch (cmd.command) {
                case 'moveTo':
                    currentX = cmd.args[0] * scale;
                    currentY = -cmd.args[1] * scale;
                    points.push({ x: currentX, y: currentY });
                    break;
                case 'lineTo':
                    currentX = cmd.args[0] * scale;
                    currentY = -cmd.args[1] * scale;
                    points.push({ x: currentX, y: currentY });
                    break;
                case 'quadraticCurveTo': {
                    const cx = cmd.args[0] * scale;
                    const cy = -cmd.args[1] * scale;
                    const ex = cmd.args[2] * scale;
                    const ey = -cmd.args[3] * scale;
                    for (let i = 1; i <= curveSegments; i++) {
                        const t = i / curveSegments;
                        const mt = 1 - t;
                        const x = mt * mt * currentX + 2 * mt * t * cx + t * t * ex;
                        const y = mt * mt * currentY + 2 * mt * t * cy + t * t * ey;
                        points.push({ x, y });
                    }
                    currentX = ex;
                    currentY = ey;
                    break;
                }
                case 'bezierCurveTo': {
                    const c1x = cmd.args[0] * scale;
                    const c1y = -cmd.args[1] * scale;
                    const c2x = cmd.args[2] * scale;
                    const c2y = -cmd.args[3] * scale;
                    const ex = cmd.args[4] * scale;
                    const ey = -cmd.args[5] * scale;
                    for (let i = 1; i <= curveSegments; i++) {
                        const t = i / curveSegments;
                        const mt = 1 - t;
                        const x = mt * mt * mt * currentX + 3 * mt * mt * t * c1x + 3 * mt * t * t * c2x + t * t * t * ex;
                        const y = mt * mt * mt * currentY + 3 * mt * mt * t * c1y + 3 * mt * t * t * c2y + t * t * t * ey;
                        points.push({ x, y });
                    }
                    currentX = ex;
                    currentY = ey;
                    break;
                }
                case 'closePath':
                    break;
            }
        }

        return points;
    }
}

