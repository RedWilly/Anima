import { describe, test, expect } from 'bun:test';
import { resolve } from 'path';
import { Text, Glyph } from '../../../../src/mobjects/text';
import { Color } from '../../../../src/core/math/color/Color';
import { VGroup } from '../../../../src/mobjects/VGroup';
import { VMobject } from '../../../../src/mobjects/VMobject';

const FONT_PATH = resolve(__dirname, '../../../../assets/fonts/ComicSansMS3.ttf');

describe('Text', () => {
    test('Text is a VGroup', () => {
        const text = new Text('A', FONT_PATH);
        expect(text instanceof VGroup).toBe(true);
    });

    test('each character becomes a Glyph VMobject', () => {
        const text = new Text('Hi', FONT_PATH);
        const children = text.getChildren();

        expect(children.length).toBe(2);
        expect(children[0] instanceof Glyph).toBe(true);
        expect(children[1] instanceof Glyph).toBe(true);
    });

    test('getChildren returns glyph VMobjects', () => {
        const text = new Text('ABC', FONT_PATH);
        const children = text.getChildren();

        expect(children.length).toBe(3);
        for (const child of children) {
            expect(child instanceof VMobject).toBe(true);
            expect(child instanceof Glyph).toBe(true);
        }
    });

    test('get(index) returns specific glyph', () => {
        const text = new Text('XY', FONT_PATH);

        const glyph0 = text.get(0);
        const glyph1 = text.get(1);

        expect(glyph0 instanceof Glyph).toBe(true);
        expect(glyph1 instanceof Glyph).toBe(true);
        expect(text.get(2)).toBeUndefined();
    });

    test('getGlyph returns Glyph at index', () => {
        const text = new Text('Te', FONT_PATH);

        const glyph = text.getGlyph(0);
        expect(glyph instanceof Glyph).toBe(true);
        expect(glyph?.character).toBe('T');
    });

    test('glyphs have paths with content', () => {
        const text = new Text('A', FONT_PATH);
        const glyph = text.getGlyph(0);

        expect(glyph).toBeDefined();
        expect(glyph!.paths.length).toBeGreaterThan(0);
    });

    test('empty string creates no glyphs', () => {
        const text = new Text('', FONT_PATH);
        expect(text.getChildren().length).toBe(0);
    });
});

describe('Text Styling', () => {
    test('default is stroke only, no fill (same as geometry)', () => {
        const text = new Text('A', FONT_PATH);
        const glyph = text.getGlyph(0);

        expect(glyph?.getStrokeColor().toHex()).toBe(Color.WHITE.toHex());
        expect(glyph?.getStrokeWidth()).toBe(2);
        expect(glyph?.getFillOpacity()).toBe(0);
    });

    test('.fill() propagates to all glyphs', () => {
        const text = new Text('AB', FONT_PATH);
        text.fill(Color.BLUE);

        expect(text.getGlyph(0)?.getFillColor().toHex()).toBe(Color.BLUE.toHex());
        expect(text.getGlyph(1)?.getFillColor().toHex()).toBe(Color.BLUE.toHex());
    });

    test('.stroke() propagates to all glyphs', () => {
        const text = new Text('AB', FONT_PATH);
        text.stroke(Color.RED, 5);

        expect(text.getGlyph(0)?.getStrokeColor().toHex()).toBe(Color.RED.toHex());
        expect(text.getGlyph(0)?.getStrokeWidth()).toBe(5);
    });
});

describe('Text Per-Glyph Animation Support', () => {
    test('individual glyph can be styled independently', () => {
        const text = new Text('Hi', FONT_PATH);
        const glyph = text.getGlyph(0);

        expect(glyph).toBeDefined();
        glyph!.fill(Color.GREEN, 1);

        expect(glyph!.getFillColor().toHex()).toBe(Color.GREEN.toHex());
        // Second glyph should be unaffected (still default: no fill)
        expect(text.getGlyph(1)?.getFillOpacity()).toBe(0);
    });

    test('glyphs have character property', () => {
        const text = new Text('AB', FONT_PATH);

        expect(text.getGlyph(0)?.character).toBe('A');
        expect(text.getGlyph(1)?.character).toBe('B');
    });
});
