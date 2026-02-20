import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { SegmentCache } from '../../src/core/cache/SegmentCache';
import { join } from 'path';
import { mkdtemp, rm, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { existsSync } from 'fs';

describe('SegmentCache', () => {
    let cacheDir: string;
    let cache: SegmentCache;

    beforeEach(async () => {
        cacheDir = await mkdtemp(join(tmpdir(), 'anima-cache-test-'));
        cache = new SegmentCache(cacheDir);
        await cache.init();
    });

    afterEach(async () => {
        await rm(cacheDir, { recursive: true, force: true });
    });

    it('has() returns false for uncached hash', () => {
        expect(cache.has(0xdeadbeef)).toBe(false);
    });

    it('has() returns true after file exists', async () => {
        const hash = 0xabcdef01;
        const path = cache.getPath(hash);
        await writeFile(path, 'test');
        expect(cache.has(hash)).toBe(true);
    });

    it('getPath() returns correct format', () => {
        const path = cache.getPath(0x00ff00ff);
        expect(path).toContain('segment_00ff00ff.mp4');
    });

    it('getPath() pads hash to 8 hex chars', () => {
        const path = cache.getPath(0x0000000f);
        expect(path).toContain('segment_0000000f.mp4');
    });

    it('prune() removes orphaned files', async () => {
        // Create 3 segment files
        const hashes = [0x11111111, 0x22222222, 0x33333333];
        for (const hash of hashes) {
            await writeFile(cache.getPath(hash), 'data');
        }

        // Only keep first two
        const active = new Set([0x11111111, 0x22222222]);
        await cache.prune(active);

        expect(cache.has(0x11111111)).toBe(true);
        expect(cache.has(0x22222222)).toBe(true);
        expect(cache.has(0x33333333)).toBe(false);
    });

    it('prune() ignores non-segment files', async () => {
        const otherFile = join(cacheDir, 'other.txt');
        await writeFile(otherFile, 'keep me');

        await cache.prune(new Set());

        expect(existsSync(otherFile)).toBe(true);
    });
});
