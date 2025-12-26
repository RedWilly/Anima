/**
 * Text module exports.
 * Provides Text (character group) and TextCharacter entities.
 */

export { Text, text, resolveFontFamily } from './text';
export { TextCharacter } from './text-character';
export { clearFontCache, getFontCacheSize } from './font-resolver';
export type { TextOptions, TextCharacterOptions, FontConfig } from './types';

