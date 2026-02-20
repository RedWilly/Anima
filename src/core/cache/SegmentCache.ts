import { existsSync } from 'fs';
import { mkdir, readdir, unlink } from 'fs/promises';
import { join } from 'path';

/**
 * Manages a disk-based cache of rendered segment partial files.
 *
 * Each segment is stored as a video file keyed by its CRC32 hash.
 * On re-render, segments whose hashes match an existing file are skipped.
 */
class SegmentCache {
    private readonly cacheDir: string;

    constructor(cacheDir: string) {
        this.cacheDir = cacheDir;
    }

    /** Ensure the cache directory exists. */
    async init(): Promise<void> {
        await mkdir(this.cacheDir, { recursive: true });
    }

    /** Check if a rendered segment file exists for the given hash. */
    has(hash: number): boolean {
        return existsSync(this.getPath(hash));
    }

    /** Get the absolute file path for a segment hash. */
    getPath(hash: number): string {
        const name = `segment_${hash.toString(16).padStart(8, '0')}.mp4`;
        return join(this.cacheDir, name);
    }

    /** Get the cache directory path. */
    getDir(): string {
        return this.cacheDir;
    }

    /**
     * Remove cached files that are not in the active set.
     * Call after a full render to clean up stale segments.
     */
    async prune(activeHashes: Set<number>): Promise<void> {
        if (!existsSync(this.cacheDir)) return;

        const entries = await readdir(this.cacheDir);
        const removals: Promise<void>[] = [];

        for (const entry of entries) {
            // Only prune segment files we created
            if (!entry.startsWith('segment_') || !entry.endsWith('.mp4')) continue;

            // Extract hash from filename: segment_XXXXXXXX.mp4
            const hexStr = entry.slice(8, 16);
            const hash = parseInt(hexStr, 16);

            if (!activeHashes.has(hash)) {
                removals.push(unlink(join(this.cacheDir, entry)));
            }
        }

        await Promise.all(removals);
    }
}

export { SegmentCache };
