import { describe, test, expect } from 'bun:test';
import * as fc from 'fast-check';
import { resolve } from 'path';
import { Text, Glyph } from '../../src/mobjects/text';
import { Color } from '../../src/core/math/color/Color';

const FONT_PATH = resolve(__dirname, '../../assets/fonts/ComicSansMS3.ttf');

/** Generates alphanumeric strings that will have glyphs in most fonts. */
const textArb = fc.stringMatching(/^[A-Za-z0-9]{1,10}$/);

/** Generates fontSize values in reasonable range. */
const fontSizeArb = fc.double({ min: 8, max: 144, noNaN: true });

describe('Text Property Tests', () => {
    describe('Glyph Creation Properties', () => {
        test('text length equals glyph count for ASCII characters', () => {
            fc.assert(fc.property(
                textArb,
                (str) => {
                    const text = new Text(str, FONT_PATH);
                    return text.getChildren().length === str.length;
                }
            ));
        });

        test('every child is a Glyph instance', () => {
            fc.assert(fc.property(
                textArb,
                (str) => {
                    const text = new Text(str, FONT_PATH);
                    const children = text.getChildren();
                    return children.every(child => child instanceof Glyph);
                }
            ));
        });

        test('getGlyph(i).character equals text.charAt(i)', () => {
            fc.assert(fc.property(
                textArb,
                (str) => {
                    const text = new Text(str, FONT_PATH);
                    for (let i = 0; i < str.length; i++) {
                        const glyph = text.getGlyph(i);
                        if (!glyph || glyph.character !== str.charAt(i)) {
                            return false;
                        }
                    }
                    return true;
                }
            ));
        });

        test('glyphs are positioned from left to right (non-decreasing)', () => {
            fc.assert(fc.property(
                fc.stringMatching(/^[A-Z]{2,8}$/),
                (str) => {
                    const text = new Text(str, FONT_PATH);
                    for (let i = 1; i < str.length; i++) {
                        const prev = text.getGlyph(i - 1);
                        const curr = text.getGlyph(i);
                        if (!prev || !curr) return false;
                        // Each glyph should be at or to the right of the previous one
                        if (curr.position.x < prev.position.x - 0.01) return false;
                    }
                    return true;
                }
            ));
        });

        test('every glyph has non-empty paths', () => {
            fc.assert(fc.property(
                fc.stringMatching(/^[A-Z]{1,5}$/), // Use uppercase letters which have clear paths
                (str) => {
                    const text = new Text(str, FONT_PATH);
                    for (let i = 0; i < str.length; i++) {
                        const glyph = text.getGlyph(i);
                        if (!glyph || glyph.paths.length === 0) return false;
                    }
                    return true;
                }
            ));
        });
    });

    describe('Text Styling Properties', () => {
        test('default style color applies to all glyphs', () => {
            fc.assert(fc.property(
                textArb,
                (str) => {
                    const text = new Text(str, FONT_PATH);
                    for (let i = 0; i < str.length; i++) {
                        const glyph = text.getGlyph(i);
                        if (!glyph) return false;
                        if (glyph.getFillColor().toHex() !== Color.WHITE.toHex()) return false;
                    }
                    return true;
                }
            ));
        });

        test('custom color applies to all glyphs', () => {
            fc.assert(fc.property(
                textArb,
                fc.constantFrom(Color.RED, Color.GREEN, Color.BLUE),
                (str, color) => {
                    const text = new Text(str, FONT_PATH, { color });
                    for (let i = 0; i < str.length; i++) {
                        const glyph = text.getGlyph(i);
                        if (!glyph) return false;
                        if (glyph.getFillColor().toHex() !== color.toHex()) return false;
                    }
                    return true;
                }
            ));
        });

        test('setStyle updates all glyphs color', () => {
            fc.assert(fc.property(
                textArb,
                fc.constantFrom(Color.RED, Color.GREEN, Color.BLUE),
                (str, newColor) => {
                    const text = new Text(str, FONT_PATH);
                    text.setStyle({ color: newColor });
                    for (let i = 0; i < str.length; i++) {
                        const glyph = text.getGlyph(i);
                        if (!glyph) return false;
                        if (glyph.getFillColor().toHex() !== newColor.toHex()) return false;
                    }
                    return true;
                }
            ));
        });

        test('getStyle returns style with correct fontSize', () => {
            fc.assert(fc.property(
                textArb,
                fontSizeArb,
                (str, fontSize) => {
                    const text = new Text(str, FONT_PATH, { fontSize });
                    const style = text.getStyle();
                    return Math.abs(style.fontSize - fontSize) < 0.001;
                }
            ));
        });

        test('setStyle is idempotent for same values', () => {
            fc.assert(fc.property(
                textArb,
                fc.constantFrom(Color.RED, Color.GREEN),
                (str, color) => {
                    const text = new Text(str, FONT_PATH);
                    text.setStyle({ color });
                    const style1 = text.getStyle();
                    text.setStyle({ color });
                    const style2 = text.getStyle();
                    return style1.color.toHex() === style2.color.toHex() &&
                        style1.fontSize === style2.fontSize;
                }
            ));
        });
    });

    describe('Text as VGroup Properties', () => {
        test('Text length property equals text string length', () => {
            fc.assert(fc.property(
                textArb,
                (str) => {
                    const text = new Text(str, FONT_PATH);
                    return text.length === str.length;
                }
            ));
        });

        test('get(i) returns same as getGlyph(i) for valid indices', () => {
            fc.assert(fc.property(
                textArb,
                (str) => {
                    const text = new Text(str, FONT_PATH);
                    for (let i = 0; i < str.length; i++) {
                        if (text.get(i) !== text.getGlyph(i)) return false;
                    }
                    return true;
                }
            ));
        });

        test('out of bounds getGlyph returns undefined', () => {
            fc.assert(fc.property(
                textArb,
                fc.integer({ min: 0, max: 20 }),
                (str, offset) => {
                    const text = new Text(str, FONT_PATH);
                    const outOfBoundsIndex = str.length + offset;
                    return text.getGlyph(outOfBoundsIndex) === undefined;
                }
            ));
        });

        test('getBoundingBox returns valid bounds', () => {
            fc.assert(fc.property(
                textArb,
                (str) => {
                    const text = new Text(str, FONT_PATH);
                    const bounds = text.getBoundingBox();
                    return bounds.minX <= bounds.maxX && bounds.minY <= bounds.maxY;
                }
            ));
        });
    });

    describe('Empty String Edge Case', () => {
        test('empty string creates zero glyphs', () => {
            const text = new Text('', FONT_PATH);
            expect(text.getChildren()).toHaveLength(0);
            expect(text.length).toBe(0);
        });

        test('empty string operations do not throw', () => {
            const text = new Text('', FONT_PATH);
            expect(() => text.getGlyph(0)).not.toThrow();
            expect(() => text.setStyle({ color: Color.RED })).not.toThrow();
            expect(() => text.getStyle()).not.toThrow();
            expect(() => text.getBoundingBox()).not.toThrow();
        });
    });
});
