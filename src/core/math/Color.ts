/**
 * A class representing a color with Red, Green, Blue, and Alpha components.
 * RGB values are in the range [0, 255].
 * Alpha value is in the range [0, 1].
 */
export class Color {
  readonly r: number;
  readonly g: number;
  readonly b: number;
  readonly a: number;

  constructor(r: number, g: number, b: number, a: number = 1.0) {
    this.r = Math.max(0, Math.min(255, r));
    this.g = Math.max(0, Math.min(255, g));
    this.b = Math.max(0, Math.min(255, b));
    this.a = Math.max(0, Math.min(1, a));
  }

  /**
   * Creates a Color from a hex string.
   * Supports formats: #RRGGBB, #RGB, #RRGGBBAA, #RGBA.
   * @param hex The hex string.
   * @returns A new Color instance.
   */
  static fromHex(hex: string): Color {
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

    return new Color(r, g, b, a);
  }

  /**
   * Creates a Color from HSL values.
   * @param h Hue in degrees [0, 360).
   * @param s Saturation [0, 1].
   * @param l Lightness [0, 1].
   * @param a Alpha [0, 1].
   * @returns A new Color instance.
   */
  static fromHSL(h: number, s: number, l: number, a: number = 1.0): Color {
    h = h % 360;
    if (h < 0) h += 360;
    s = Math.max(0, Math.min(1, s));
    l = Math.max(0, Math.min(1, l));
    a = Math.max(0, Math.min(1, a));

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;

    let r_prime = 0;
    let g_prime = 0;
    let b_prime = 0;

    if (0 <= h && h < 60) {
      r_prime = c;
      g_prime = x;
      b_prime = 0;
    } else if (60 <= h && h < 120) {
      r_prime = x;
      g_prime = c;
      b_prime = 0;
    } else if (120 <= h && h < 180) {
      r_prime = 0;
      g_prime = c;
      b_prime = x;
    } else if (180 <= h && h < 240) {
      r_prime = 0;
      g_prime = x;
      b_prime = c;
    } else if (240 <= h && h < 300) {
      r_prime = x;
      g_prime = 0;
      b_prime = c;
    } else if (300 <= h && h < 360) {
      r_prime = c;
      g_prime = 0;
      b_prime = x;
    }

    const r = Math.round((r_prime + m) * 255);
    const g = Math.round((g_prime + m) * 255);
    const b = Math.round((b_prime + m) * 255);

    return new Color(r, g, b, a);
  }

  /**
   * Returns the hex string representation of the color.
   * If alpha is 1, returns #RRGGBB.
   * If alpha is less than 1, returns #RRGGBBAA.
   * @returns Hex string.
   */
  toHex(): string {
    const r = Math.round(this.r).toString(16).padStart(2, '0');
    const g = Math.round(this.g).toString(16).padStart(2, '0');
    const b = Math.round(this.b).toString(16).padStart(2, '0');

    if (this.a >= 0.999) {
      return `#${r}${g}${b}`;
    } else {
      const a = Math.round(this.a * 255).toString(16).padStart(2, '0');
      return `#${r}${g}${b}${a}`;
    }
  }

  /**
   * Returns the rgba string representation of the color.
   * Format: rgba(r, g, b, a)
   * @returns RGBA string.
   */
  toRGBA(): string {
    return `rgba(${Math.round(this.r)}, ${Math.round(this.g)}, ${Math.round(this.b)}, ${this.a})`;
  }

  /**
   * Linearly interpolates between this color and another.
   * @param other The target color.
   * @param t The interpolation factor (0-1).
   * @returns The interpolated color.
   */
  lerp(other: Color, t: number): Color {
    t = Math.max(0, Math.min(1, t));
    const r = this.r + (other.r - this.r) * t;
    const g = this.g + (other.g - this.g) * t;
    const b = this.b + (other.b - this.b) * t;
    const a = this.a + (other.a - this.a) * t;
    return new Color(r, g, b, a);
  }

  static readonly WHITE = new Color(255, 255, 255);
  static readonly BLACK = new Color(0, 0, 0);
  static readonly RED = new Color(255, 0, 0);
  static readonly GREEN = new Color(0, 255, 0);
  static readonly BLUE = new Color(0, 0, 255);
  static readonly TRANSPARENT = new Color(0, 0, 0, 0);
}
