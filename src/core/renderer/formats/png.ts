import type { Canvas } from '@napi-rs/canvas';

/**
 * Encodes a canvas frame to PNG and writes to file.
 */
export async function writePng(canvas: Canvas, outputPath: string): Promise<void> {
    const buffer = canvas.toBuffer('image/png');
    await Bun.write(outputPath, buffer);
}
