import { dirname, join, resolve } from 'path';

/**
 * Concatenates multiple segment video files into a single output using FFmpeg's
 * concat demuxer. Uses `-c copy` for zero re-encoding overhead.
 */
async function concatSegments(
    segmentPaths: string[],
    outputPath: string,
): Promise<void> {
    if (segmentPaths.length === 0) {
        throw new Error('No segments to concatenate');
    }

    // Single segment — just copy it directly
    if (segmentPaths.length === 1) {
        const src = Bun.file(segmentPaths[0]!);
        await Bun.write(outputPath, src);
        return;
    }

    // Write a concat list file for FFmpeg
    // Use absolute paths so FFmpeg doesn't resolve relative to the list file
    const listContent = segmentPaths
        .map(p => `file '${resolve(p).replace(/\\/g, '/')}'`)
        .join('\n');

    const listPath = join(dirname(outputPath), '.concat_list.txt');
    await Bun.write(listPath, listContent);

    try {
        const process = Bun.spawn([
            'ffmpeg', '-y',
            '-f', 'concat',
            '-safe', '0',
            '-i', listPath,
            '-c', 'copy',
            outputPath,
        ]);

        const status = await process.exited;
        if (status !== 0) {
            throw new Error(`FFmpeg concat exited with code ${status}`);
        }
    } finally {
        // Clean up temp list file
        try {
            const { unlink } = await import('fs/promises');
            await unlink(listPath);
        } catch {
            // Ignore cleanup errors
        }
    }
}

export { concatSegments };
