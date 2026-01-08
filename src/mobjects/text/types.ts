import { Color } from '../../core/math/color/Color';

/**
 * Options for configuring Text appearance.
 */
export interface TextStyle {
    fontSize: number;
    color: Color;
}

/**
 * Default text style values.
 */
export const DEFAULT_TEXT_STYLE: TextStyle = {
    fontSize: 48,
    color: Color.WHITE
};
