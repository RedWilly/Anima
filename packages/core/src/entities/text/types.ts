/**
 * Type definitions for text entities.
 */

import type { Style, FontWeight, TextAlign, TextBaseline } from '../../types';

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
    /**
     * Font family name or path to font file.
     * - If a path (ends with .ttf/.otf), loads that font file.
     * - If a name, uses bundled font if available (e.g., 'Roboto').
     * - Default: 'Roboto' (bundled).
     */
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
}

/**
 * Font configuration for measuring text.
 */
export interface FontConfig {
    fontFamily: string;
    fontSize: number;
    fontWeight: FontWeight;
}

