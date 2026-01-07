import { describe, expect, test } from 'bun:test';
import { Color } from '../../../../src/core/math/color/Color';

describe('Color', () => {
  test('should create a color with rgba values', () => {
    const color = new Color(10, 20, 30, 0.5);
    expect(color.r).toBe(10);
    expect(color.g).toBe(20);
    expect(color.b).toBe(30);
    expect(color.a).toBe(0.5);
  });

  test('should clamp values in constructor', () => {
    const color = new Color(300, -10, 500, 2);
    expect(color.r).toBe(255);
    expect(color.g).toBe(0);
    expect(color.b).toBe(255);
    expect(color.a).toBe(1);
  });

  describe('fromHex', () => {
    test('should parse #RRGGBB', () => {
      const color = Color.fromHex('#ff0000');
      expect(color.r).toBe(255);
      expect(color.g).toBe(0);
      expect(color.b).toBe(0);
      expect(color.a).toBe(1);
    });

    test('should parse #RGB', () => {
      const color = Color.fromHex('#0f0');
      expect(color.r).toBe(0);
      expect(color.g).toBe(255);
      expect(color.b).toBe(0);
      expect(color.a).toBe(1);
    });

    test('should parse #RRGGBBAA', () => {
      const color = Color.fromHex('#0000ff80');
      expect(color.r).toBe(0);
      expect(color.g).toBe(0);
      expect(color.b).toBe(255);
      // 0x80 = 128, 128/255 ~= 0.50196
      expect(color.a).toBeCloseTo(128 / 255);
    });

    test('should parse #RGBA', () => {
      const color = Color.fromHex('#f008');
      expect(color.r).toBe(255);
      expect(color.g).toBe(0);
      expect(color.b).toBe(0);
      // 0x8 = 0x88 = 136, 136/255
      expect(color.a).toBeCloseTo(136 / 255);
    });

    test('should throw error for invalid hex', () => {
      expect(() => Color.fromHex('invalid')).toThrow();
      expect(() => Color.fromHex('#12')).toThrow();
      expect(() => Color.fromHex('#zzzzzz')).toThrow();
    });
  });

  describe('fromHSL', () => {
    test('should convert pure red', () => {
      const color = Color.fromHSL(0, 1, 0.5);
      expect(color.r).toBe(255);
      expect(color.g).toBe(0);
      expect(color.b).toBe(0);
    });

    test('should convert pure green', () => {
      const color = Color.fromHSL(120, 1, 0.5);
      expect(color.r).toBe(0);
      expect(color.g).toBe(255);
      expect(color.b).toBe(0);
    });

    test('should convert pure blue', () => {
      const color = Color.fromHSL(240, 1, 0.5);
      expect(color.r).toBe(0);
      expect(color.g).toBe(0);
      expect(color.b).toBe(255);
    });

    test('should convert white', () => {
      const color = Color.fromHSL(0, 0, 1);
      expect(color.r).toBe(255);
      expect(color.g).toBe(255);
      expect(color.b).toBe(255);
    });

    test('should convert black', () => {
      const color = Color.fromHSL(0, 0, 0);
      expect(color.r).toBe(0);
      expect(color.g).toBe(0);
      expect(color.b).toBe(0);
    });

    test('should handle hue wrapping', () => {
      const color1 = Color.fromHSL(360, 1, 0.5);
      const color2 = Color.fromHSL(0, 1, 0.5);
      expect(color1.r).toBe(color2.r);
      expect(color1.g).toBe(color2.g);
      expect(color1.b).toBe(color2.b);

      const color3 = Color.fromHSL(370, 1, 0.5);
      const color4 = Color.fromHSL(10, 1, 0.5);
      expect(color3.r).toBe(color4.r);
      expect(color3.g).toBe(color4.g);
      expect(color3.b).toBe(color4.b);
    });
  });

  describe('toHex', () => {
    test('should return #RRGGBB when alpha is 1', () => {
      const color = new Color(255, 0, 0);
      expect(color.toHex()).toBe('#ff0000');
    });

    test('should return #RRGGBBAA when alpha is not 1', () => {
      const color = new Color(0, 255, 0, 0.5);
      // 0.5 * 255 = 127.5 -> 128 -> 80
      expect(color.toHex()).toBe('#00ff0080');
    });

    test('should pad zeros correctly', () => {
      const color = new Color(10, 10, 10);
      expect(color.toHex()).toBe('#0a0a0a');
    });
  });

  describe('toRGBA', () => {
    test('should return correct rgba string', () => {
      const color = new Color(255, 128, 0, 0.5);
      expect(color.toRGBA()).toBe('rgba(255, 128, 0, 0.5)');
    });
  });

  describe('lerp', () => {
    test('should interpolate between two colors', () => {
      const c1 = new Color(0, 0, 0, 0);
      const c2 = new Color(100, 200, 50, 1);
      const result = c1.lerp(c2, 0.5);

      expect(result.r).toBe(50);
      expect(result.g).toBe(100);
      expect(result.b).toBe(25);
      expect(result.a).toBe(0.5);
    });

    test('should clamp t between 0 and 1', () => {
      const c1 = new Color(0, 0, 0);
      const c2 = new Color(100, 100, 100);

      const r1 = c1.lerp(c2, -1);
      expect(r1.r).toBe(0);

      const r2 = c1.lerp(c2, 2);
      expect(r2.r).toBe(100);
    });
  });

  describe('Constants', () => {
    test('should have correct predefined colors', () => {
      expect(Color.WHITE.toHex()).toBe('#ffffff');
      expect(Color.BLACK.toHex()).toBe('#000000');
      expect(Color.RED.toHex()).toBe('#ff0000');
      expect(Color.GREEN.toHex()).toBe('#00ff00');
      expect(Color.BLUE.toHex()).toBe('#0000ff');
    });
  });
});
