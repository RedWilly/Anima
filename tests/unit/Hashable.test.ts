import { describe, it, expect } from 'bun:test';
import {
    crc32,
    hashNumber,
    hashString,
    hashFloat32Array,
    hashCompose,
} from '../../src/core/cache/Hashable';

describe('CRC32 Hashing Utilities', () => {
    describe('crc32', () => {
        it('produces consistent output for identical input', () => {
            const data = new Uint8Array([1, 2, 3, 4, 5]);
            expect(crc32(data)).toBe(crc32(data));
        });

        it('produces different output for different input', () => {
            const a = new Uint8Array([1, 2, 3]);
            const b = new Uint8Array([4, 5, 6]);
            expect(crc32(a)).not.toBe(crc32(b));
        });

        it('handles empty input', () => {
            const result = crc32(new Uint8Array(0));
            expect(typeof result).toBe('number');
            expect(result).toBeGreaterThanOrEqual(0);
        });

        it('returns unsigned 32-bit integers', () => {
            const data = new Uint8Array([255, 128, 0, 64]);
            const result = crc32(data);
            expect(result).toBeGreaterThanOrEqual(0);
            expect(result).toBeLessThanOrEqual(0xffffffff);
        });
    });

    describe('hashNumber', () => {
        it('same number produces same hash', () => {
            expect(hashNumber(42)).toBe(hashNumber(42));
            expect(hashNumber(3.14159)).toBe(hashNumber(3.14159));
        });

        it('different numbers produce different hashes', () => {
            expect(hashNumber(1)).not.toBe(hashNumber(2));
            expect(hashNumber(0)).not.toBe(hashNumber(-0.001));
        });

        it('handles edge cases', () => {
            expect(hashNumber(0)).toBe(hashNumber(0));
            expect(hashNumber(Infinity)).toBe(hashNumber(Infinity));
            expect(hashNumber(-Infinity)).toBe(hashNumber(-Infinity));
            expect(hashNumber(NaN)).toBe(hashNumber(NaN));
        });
    });

    describe('hashString', () => {
        it('same string produces same hash', () => {
            expect(hashString('hello')).toBe(hashString('hello'));
        });

        it('different strings produce different hashes', () => {
            expect(hashString('hello')).not.toBe(hashString('world'));
        });

        it('handles empty string', () => {
            expect(hashString('')).toBe(hashString(''));
        });
    });

    describe('hashFloat32Array', () => {
        it('same array produces same hash', () => {
            const arr = new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]);
            expect(hashFloat32Array(arr)).toBe(hashFloat32Array(arr));
        });

        it('different arrays produce different hashes', () => {
            const a = new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]);
            const b = new Float32Array([2, 0, 0, 0, 1, 0, 0, 0, 1]);
            expect(hashFloat32Array(a)).not.toBe(hashFloat32Array(b));
        });
    });

    describe('hashCompose', () => {
        it('is order-dependent', () => {
            const a = hashNumber(1);
            const b = hashNumber(2);
            expect(hashCompose(a, b)).not.toBe(hashCompose(b, a));
        });

        it('same inputs produce same result', () => {
            const a = hashNumber(1);
            const b = hashNumber(2);
            expect(hashCompose(a, b)).toBe(hashCompose(a, b));
        });

        it('handles single input', () => {
            const a = hashNumber(42);
            expect(typeof hashCompose(a)).toBe('number');
        });

        it('different compositions produce different results', () => {
            const a = hashNumber(1);
            const b = hashNumber(2);
            const c = hashNumber(3);
            expect(hashCompose(a, b)).not.toBe(hashCompose(a, c));
        });
    });
});
