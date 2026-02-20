import * as fontkit from 'fontkit';
import { join, resolve } from 'path';
import { Color } from '../../core/math/color/Color';
import { VGroup } from '../VGroup';
import { centerGroup } from '../VGroup/layout';
import { Glyph } from './Glyph';

const DEFAULT_FONT_PATH = resolve(join(__dirname, '..', '..', 'fonts', 'ComicSansMS3.ttf'));

/**
 * A VGroup of vectorized glyphs created from a text string using fontkit.
 * Each character becomes a Glyph VMobject that can be individually animated.
 *
 * Uses VMobject's fill/stroke as the source of truth (same as geometry).
 * Default: white fill, white stroke width 2.
 */
export class Text extends VGroup {
    readonly text: string;
    private fontSize: number;
    private fontPath: string;

    constructor(
        text: string,
        fontPath?: string,
        options: { fontSize?: number } = {}
    ) {
        super();
        this.text = text;
        this.fontPath = fontPath ?? DEFAULT_FONT_PATH;
        this.fontSize = options.fontSize ?? 1;

        this.buildGlyphs();
        centerGroup(this);
        this.propagate();
    }

    private buildGlyphs(): void {
        const fontOrCollection = fontkit.openSync(this.fontPath);
        const font = 'fonts' in fontOrCollection
            ? fontOrCollection.fonts[0]
            : fontOrCollection;

        if (!font) {
            throw new Error(`Could not load font from ${this.fontPath}`);
        }

        const run = font.layout(this.text);
        const scale = this.fontSize / font.unitsPerEm;

        let penX = 0;
        let penY = 0;

        for (let i = 0; i < run.glyphs.length; i++) {
            const glyph = run.glyphs[i];
            const pos = run.positions[i];

            if (glyph === undefined || pos === undefined) continue;

            const char = this.text.charAt(i) || '';
            const glyphX = penX + pos.xOffset * scale;
            const glyphY = penY + pos.yOffset * scale;

            this.add(new Glyph(glyph, char, scale, glyphX, glyphY));

            penX += pos.xAdvance * scale;
            penY += pos.yAdvance * scale;
        }
    }

    /** Propagates this Text's fill/stroke to all Glyph children. */
    private propagate(): void {
        for (const child of this.getChildren()) {
            if (child instanceof Glyph) {
                child.stroke(this.getStrokeColor(), this.getStrokeWidth());
                child.fill(this.getFillColor(), this.getFillOpacity());
            }
        }
    }

    override stroke(color: Color, width: number = 2): this {
        super.stroke(color, width);
        this.propagate();
        return this;
    }

    override fill(color: Color, opacity?: number): this {
        super.fill(color, opacity);
        this.propagate();
        return this;
    }

    getFontSize(): number {
        return this.fontSize;
    }

    getGlyph(index: number): Glyph | undefined {
        const child = this.get(index);
        return child instanceof Glyph ? child : undefined;
    }
}
