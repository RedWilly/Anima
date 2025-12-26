/**
 * Unit tests for Text entity (character-based group).
 */

import { describe, expect, it } from 'bun:test';
import { text, TextCharacter, Scene } from '../src';

describe('Text', () => {
    describe('Creation', () => {
        it('should create with default values', () => {
            const t = text();
            expect(t.getContent()).toBe('');
            expect(t.getFontFamily()).toBe('Roboto');
            expect(t.getFontSize()).toBe(24);
            expect(t.getFontWeight()).toBe('normal');
            expect(t.getTextAlign()).toBe('center');
            expect(t.getTextBaseline()).toBe('middle');
            expect(t.length).toBe(0);
        });

        it('should create with custom options', () => {
            const t = text({
                content: 'Hello World',
                fontFamily: 'Georgia',
                fontSize: 48,
                fontWeight: 'bold',
                textAlign: 'center',
                textBaseline: 'top',
            });
            expect(t.getContent()).toBe('Hello World');
            expect(t.getFontFamily()).toBe('Georgia');
            expect(t.getFontSize()).toBe(48);
            expect(t.getFontWeight()).toBe('bold');
            expect(t.getTextAlign()).toBe('center');
            expect(t.getTextBaseline()).toBe('top');
            expect(t.length).toBe(11);
        });

        it('should have unique ids', () => {
            const t1 = text();
            const t2 = text();
            expect(t1.id).not.toBe(t2.id);
        });

        it('should work with factory function', () => {
            const t = text({ content: 'Factory Test', fontSize: 32 });
            expect(t.getContent()).toBe('Factory Test');
            expect(t.getFontSize()).toBe(32);
            expect(t.length).toBe(12);
        });
    });

    describe('Character Access', () => {
        it('should access individual characters with charAt', () => {
            const t = text({ content: 'Anima' });
            expect(t.charAt(0)).toBeInstanceOf(TextCharacter);
            expect(t.charAt(0).getChar()).toBe('A');
            expect(t.charAt(1).getChar()).toBe('n');
            expect(t.charAt(4).getChar()).toBe('a');
        });

        it('should throw on out-of-bounds charAt', () => {
            const t = text({ content: 'Hi' });
            expect(() => t.charAt(-1)).toThrow();
            expect(() => t.charAt(2)).toThrow();
            expect(() => t.charAt(100)).toThrow();
        });

        it('should slice characters', () => {
            const t = text({ content: 'Anima' });
            const slice = t.slice(1, 3);
            expect(slice.length).toBe(2);
            expect(slice[0].getChar()).toBe('n');
            expect(slice[1].getChar()).toBe('i');
        });

        it('should iterate with forEach', () => {
            const t = text({ content: 'ABC' });
            const chars: string[] = [];
            t.forEach((char) => chars.push(char.getChar()));
            expect(chars).toEqual(['A', 'B', 'C']);
        });

        it('should map over characters', () => {
            const t = text({ content: 'ABC' });
            const chars = t.map((char) => char.getChar());
            expect(chars).toEqual(['A', 'B', 'C']);
        });

        it('should convert to array', () => {
            const t = text({ content: 'Hi' });
            const arr = t.toArray();
            expect(arr.length).toBe(2);
            expect(arr[0]).toBeInstanceOf(TextCharacter);
        });

        it('should report correct length', () => {
            expect(text({ content: '' }).length).toBe(0);
            expect(text({ content: 'A' }).length).toBe(1);
            expect(text({ content: 'Hello' }).length).toBe(5);
        });
    });

    describe('Fluent Setters', () => {
        it('should allow chaining setContent and rebuild characters', () => {
            const t = text({ content: 'Hi' });
            expect(t.length).toBe(2);
            const result = t.setContent('Hello');
            expect(result).toBe(t);
            expect(t.getContent()).toBe('Hello');
            expect(t.length).toBe(5);
            expect(t.charAt(0).getChar()).toBe('H');
        });

        it('should allow chaining setFontFamily', () => {
            const t = text();
            const result = t.setFontFamily('Arial');
            expect(result).toBe(t);
            expect(t.getFontFamily()).toBe('Arial');
        });

        it('should allow chaining setFontSize', () => {
            const t = text();
            const result = t.setFontSize(36);
            expect(result).toBe(t);
            expect(t.getFontSize()).toBe(36);
        });

        it('should allow chaining setFontWeight', () => {
            const t = text();
            const result = t.setFontWeight(700);
            expect(result).toBe(t);
            expect(t.getFontWeight()).toBe(700);
        });

        it('should allow chaining setTextAlign', () => {
            const t = text();
            const result = t.setTextAlign('right');
            expect(result).toBe(t);
            expect(t.getTextAlign()).toBe('right');
        });

        it('should allow chaining setTextBaseline', () => {
            const t = text();
            const result = t.setTextBaseline('bottom');
            expect(result).toBe(t);
            expect(t.getTextBaseline()).toBe('bottom');
        });

        it('should allow chaining multiple setters', () => {
            const t = text()
                .setContent('Chained')
                .setFontFamily('Helvetica')
                .setFontSize(18)
                .setFontWeight('bold')
                .setTextAlign('center')
                .setTextBaseline('alphabetic');

            expect(t.getContent()).toBe('Chained');
            expect(t.getFontFamily()).toBe('Helvetica');
            expect(t.getFontSize()).toBe(18);
            expect(t.getFontWeight()).toBe('bold');
            expect(t.getTextAlign()).toBe('center');
            expect(t.getTextBaseline()).toBe('alphabetic');
        });
    });

    describe('Validation', () => {
        it('should throw on invalid fontSize in constructor', () => {
            expect(() => text({ fontSize: 0 })).toThrow();
            expect(() => text({ fontSize: -10 })).toThrow();
        });

        it('should throw on invalid fontSize in setter', () => {
            const t = text();
            expect(() => t.setFontSize(0)).toThrow();
            expect(() => t.setFontSize(-5)).toThrow();
        });

        it('should allow empty content', () => {
            const t = text({ content: '' });
            expect(t.getContent()).toBe('');
        });
    });

    describe('Style Methods', () => {
        it('should allow setting fill color', () => {
            const t = text().fill('#e74c3c');
            expect(t.getFontSize()).toBe(24);
        });

        it('should allow setting stroke color', () => {
            const t = text().stroke('#c0392b');
            expect(t.getFontSize()).toBe(24);
        });

        it('should allow setting strokeWidth', () => {
            const t = text().strokeWidth(2);
            expect(t.getFontSize()).toBe(24);
        });
    });

    describe('Integration with Scene', () => {
        it('should add Text to scene and animate position', () => {
            const s = new Scene();
            const t = s.add(text({ content: 'Animated' }));

            t.moveTo(100, 100, { duration: 1, ease: 'linear' });

            s.timeline.seek(0.5);
            expect(t.position.x).toBeCloseTo(50);
            expect(t.position.y).toBeCloseTo(50);
        });

        it('should add Text to scene and animate scale', () => {
            const s = new Scene();
            const t = s.add(text({ content: 'Scale Test' }));

            t.scaleTo(2, 2, { duration: 1, ease: 'linear' });

            s.timeline.seek(0.5);
            expect(t.scale.x).toBeCloseTo(1.5);
            expect(t.scale.y).toBeCloseTo(1.5);
        });

        it('should add Text to scene and animate opacity', () => {
            const s = new Scene();
            const t = s.add(text({ content: 'Fade Test' }));

            t.fadeOut({ duration: 1, ease: 'linear' });

            s.timeline.seek(0.5);
            expect(t.opacity).toBeCloseTo(0.5);
        });

        it('should add Text to scene and animate rotation', () => {
            const s = new Scene();
            const t = s.add(text({ content: 'Rotate' }));

            t.rotateTo(Math.PI, { duration: 1, ease: 'linear' });

            s.timeline.seek(0.5);
            expect(t.rotation).toBeCloseTo(Math.PI / 2);
        });
    });
});

describe('TextCharacter', () => {
    it('should create with default values', () => {
        const c = new TextCharacter({ char: 'A' });
        expect(c.getChar()).toBe('A');
        expect(c.getFontFamily()).toBe('Roboto');
        expect(c.getFontSize()).toBe(24);
        expect(c.getFontWeight()).toBe('normal');
    });

    it('should create with custom options', () => {
        const c = new TextCharacter({
            char: 'X',
            fontFamily: 'Arial',
            fontSize: 48,
            fontWeight: 'bold',
        });
        expect(c.getChar()).toBe('X');
        expect(c.getFontFamily()).toBe('Arial');
        expect(c.getFontSize()).toBe(48);
        expect(c.getFontWeight()).toBe('bold');
    });

    it('should allow fluent setters', () => {
        const c = new TextCharacter({ char: 'B' });
        const result = c.setChar('C').setFontFamily('Georgia').setFontSize(32);
        expect(result).toBe(c);
        expect(c.getChar()).toBe('C');
        expect(c.getFontFamily()).toBe('Georgia');
        expect(c.getFontSize()).toBe(32);
    });

    it('should throw on invalid fontSize', () => {
        expect(() => new TextCharacter({ char: 'A', fontSize: 0 })).toThrow();
        expect(() => new TextCharacter({ char: 'A', fontSize: -5 })).toThrow();
    });

    it('should build correct font string', () => {
        const c = new TextCharacter({ char: 'A', fontFamily: 'Arial', fontSize: 24, fontWeight: 'bold' });
        expect(c.getFontString()).toBe('bold 24px Arial');
    });
});
