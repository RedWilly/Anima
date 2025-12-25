/**
 * Type definitions for text entities.
 */

import type { Style, FontWeight, TextAlign, TextBaseline } from '../../types';
import type { FontMetrics } from '../../font';

/**
 * Options for creating a TextCharacter.
 */
export interface TextCharacterOptions {
    /** The character to display */
    char: string;
    /** Font family (default: 'sans-serif') */
    fontFamily?: string;
    /** Font size in pixels (default: 24) */
    fontSize?: number;
    /** Font weight (default: 'normal') */
    fontWeight?: FontWeight;
    /** Visual style */
    style?: Style;
}

/**
 * Options for creating a Text group.
 */
export interface TextOptions {
    /** Text content to display (default: '') */
    content?: string;
    /** Font family (default: 'sans-serif') */
    fontFamily?: string;
    /** Font size in pixels (default: 24) */
    fontSize?: number;
    /** Font weight (default: 'normal') */
    fontWeight?: FontWeight;
    /** Horizontal text alignment (default: 'left') */
    textAlign?: TextAlign;
    /** Vertical text baseline (default: 'middle') */
    textBaseline?: TextBaseline;
    /** Letter spacing in pixels (default: 0) */
    letterSpacing?: number;
    /** Visual style */
    style?: Style;
    /**
     * Optional FontMetrics for accurate character positioning.
     * When provided, uses real glyph metrics instead of estimates.
     */
    fontMetrics?: FontMetrics;
}

/**
 * Font configuration for measuring text.
 */
export interface FontConfig {
    fontFamily: string;
    fontSize: number;
    fontWeight: FontWeight;
}

