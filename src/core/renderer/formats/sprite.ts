import type { FrameRenderer } from '../FrameRenderer';
import type { ProgressReporter } from '../ProgressReporter';
import { writePng } from './png';
import { join } from 'path';

/**
 * Pads a number with leading zeros to reach the specified length.
 */
function padNumber(n: number, length: number): string {
    return n.toString().padStart(length, '0');
}

/**
 * Renders frames to a sprite sequence (numbered PNG files).
 */
export async function renderSpriteSequence(
    frameRenderer: FrameRenderer,
    outputDir: string,
    frameRate: number,
    totalDuration: number,
    progressReporter: ProgressReporter
): Promise<void> {
    const totalFrames = Math.max(1, Math.floor(totalDuration * frameRate) + 1);
    const digitCount = Math.max(4, totalFrames.toString().length);

    for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
        const time = frameIndex / frameRate;
        const canvas = frameRenderer.renderFrame(time);

        const filename = `frame_${padNumber(frameIndex, digitCount)}.png`;
        const outputPath = join(outputDir, filename);

        await writePng(canvas, outputPath);
        progressReporter.reportFrame(frameIndex);
    }

    progressReporter.complete();
}
