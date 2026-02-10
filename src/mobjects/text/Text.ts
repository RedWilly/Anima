import * as fontkit from 'fontkit';
import { join, resolve } from 'path';
import { Color } from '../../core/math/color/Color';
import { VGroup } from '../VGroup';
import { centerGroup } from '../VGroup/layout';
import { Glyph } from './Glyph';
import type { TextStyle } from './types';
import { DEFAULT_TEXT_STYLE } from './types';

const DEFAULT_FONT_PATH = resolve(join(__dirname, '..', '..', 'fonts', 'ComicSansMS3.ttf'));

/**
 * A VGroup of vectorized glyphs created from a text string using fontkit.
 * Each character becomes a Glyph VMobject that can be individually animated.
 */
export class Text extends VGroup {
    readonly text: string;
    private style: TextStyle;
    private fontPath: string;

    constructor(
        text: string,
        fontPath?: string,
        options: Partial<TextStyle> = {}
    ) {
        super();
        this.text = text;
        this.fontPath = fontPath ?? DEFAULT_FONT_PATH;
        this.style = { ...DEFAULT_TEXT_STYLE, ...options };

        this.buildGlyphs();
        centerGroup(this);
        this.applyStyle();
    }

    private buildGlyphs(): void {
        const fontOrCollection = fontkit.openSync(this.fontPath);
        // Handle FontCollection (e.g., .ttc files) by getting first font
        const font = 'fonts' in fontOrCollection
            ? fontOrCollection.fonts[0]
            : fontOrCollection;

        if (!font) {
            throw new Error(`Could not load font from ${this.fontPath}`);
        }

        const run = font.layout(this.text);
        const scale = this.style.fontSize / font.unitsPerEm;

        let penX = 0;
        let penY = 0;

        for (let i = 0; i < run.glyphs.length; i++) {
            const glyph = run.glyphs[i];
            const pos = run.positions[i];

            if (glyph === undefined || pos === undefined) continue;

            // Get the character for this glyph position
            const char = this.getCharacterForGlyph(i);

            // Calculate glyph position with offsets
            const glyphX = penX + pos.xOffset * scale;
            const glyphY = penY + pos.yOffset * scale;

            const glyphMobject = new Glyph(glyph, char, scale, glyphX, glyphY);
            this.add(glyphMobject);

            // Advance pen position
            penX += pos.xAdvance * scale;
            penY += pos.yAdvance * scale;
        }
    }

    private getCharacterForGlyph(index: number): string {
        return this.text.charAt(index) || '';
    }

    private applyStyle(): void {
        for (const child of this.getChildren()) {
            if (child instanceof Glyph) {
                // Propagate Text's stroke/fill settings to each Glyph
                child.stroke(this.getStrokeColor(), this.getStrokeWidth());
                child.fill(this.getFillColor(), this.getFillOpacity());
            }
        }
    }

    setStyle(options: Partial<TextStyle>): this {
        this.style = { ...this.style, ...options };
        this.applyStyle();
        return this;
    }

    getStyle(): TextStyle {
        return { ...this.style };
    }

    /** Override stroke to propagate to all Glyph children. */
    override stroke(color: Color, width: number = 2): this {
        super.stroke(color, width);
        this.applyStyle();
        return this;
    }

    /** Override fill to propagate to all Glyph children. */
    override fill(color: Color, opacity?: number): this {
        super.fill(color, opacity);
        this.applyStyle();
        return this;
    }

    getGlyph(index: number): Glyph | undefined {
        const child = this.get(index);
        return child instanceof Glyph ? child : undefined;
    }
}
