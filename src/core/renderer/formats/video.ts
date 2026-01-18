import type { FrameRenderer } from '../FrameRenderer';
import type { ProgressReporter } from '../ProgressReporter';
import type { RenderFormat } from '../types';

/**
 * Renders a scene to a video file using FFmpeg.
 * Frames are rendered sequentially and piped to FFmpeg's stdin.
 */
export async function renderVideo(
    frameRenderer: FrameRenderer,
    outputPath: string,
    format: RenderFormat,
    frameRate: number,
    totalDuration: number,
    progressReporter: ProgressReporter
): Promise<void> {
    const { width, height } = frameRenderer.getDimensions();
    const totalFrames = Math.max(1, Math.floor(totalDuration * frameRate) + 1);

    // Determine FFmpeg arguments based on format
    const ffmpegArgs = [
        '-y', // Overwrite output
        '-f', 'image2pipe',
        '-vcodec', 'png', // Input format from pipe
        '-r', frameRate.toString(),
        '-i', '-', // Read from stdin
    ];

    if (format === 'mp4') {
        ffmpegArgs.push(
            '-c:v', 'libx264',
            '-pix_fmt', 'yuv420p',
            '-crf', '18'
        );
    } else if (format === 'webp') {
        ffmpegArgs.push(
            '-c:v', 'libwebp',
            '-lossless', '0',
            '-compression_level', '4',
            '-q:v', '75',
            '-loop', '0'
        );
    } else if (format === 'gif') {
        ffmpegArgs.push(
            '-vf', `fps=${frameRate},scale=${width}:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`
        );
    }

    ffmpegArgs.push(outputPath);

    const process = Bun.spawn(['ffmpeg', ...ffmpegArgs], {
        stdin: 'pipe',
    });

    try {
        for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
            const time = frameIndex / frameRate;
            const canvas = frameRenderer.renderFrame(time);

            // Convert canvas to PNG buffer and write to FFmpeg's stdin
            const pngBuffer = await canvas.toBuffer('image/png');
            process.stdin.write(pngBuffer);

            progressReporter.reportFrame(frameIndex);
        }

        // Close stdin and wait for FFmpeg to finish
        process.stdin.end();
        const status = await process.exited;

        if (status !== 0) {
            throw new Error(`FFmpeg process exited with code ${status}`);
        }
    } catch (error) {
        // Kill FFmpeg process if something went wrong
        process.kill();
        throw error;
    }

    progressReporter.complete();
}
