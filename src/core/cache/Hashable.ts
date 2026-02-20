/**
 * CRC32 hashing utilities for segment caching.
 *
 * Uses a standard 256-entry lookup table for O(1) per-byte computation.
 * Non-cryptographic — optimized for fast "did anything change?" detection.
 */

/** CRC32 lookup table (IEEE polynomial 0xEDB88320). */
const CRC32_TABLE = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
    let crc = i;
    for (let j = 0; j < 8; j++) {
        crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
    CRC32_TABLE[i] = crc;
}

/** Compute CRC32 of a Uint8Array. */
function crc32(data: Uint8Array): number {
    let crc = 0xffffffff;
    for (let i = 0; i < data.length; i++) {
        crc = (crc >>> 8) ^ CRC32_TABLE[(crc ^ data[i]!) & 0xff]!;
    }
    return (crc ^ 0xffffffff) >>> 0;
}

/** Shared buffer for float64 serialization. */
const FLOAT64_VIEW = new Float64Array(1);
const FLOAT64_BYTES = new Uint8Array(FLOAT64_VIEW.buffer);

/** Hash a single floating-point number via its IEEE 754 representation. */
function hashNumber(n: number): number {
    FLOAT64_VIEW[0] = n;
    return crc32(FLOAT64_BYTES);
}

/** Hash a UTF-8 string. */
function hashString(s: string): number {
    const encoder = new TextEncoder();
    return crc32(encoder.encode(s));
}

/** Hash a Float32Array (e.g., matrix values). */
function hashFloat32Array(arr: Float32Array): number {
    return crc32(new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength));
}

/**
 * Compose multiple CRC32 hashes into a single hash.
 * Order-dependent: hashCompose(a, b) !== hashCompose(b, a).
 */
function hashCompose(...hashes: number[]): number {
    const buf = new Uint8Array(hashes.length * 4);
    const view = new DataView(buf.buffer);
    for (let i = 0; i < hashes.length; i++) {
        view.setUint32(i * 4, hashes[i]!, false);
    }
    return crc32(buf);
}

/** Protocol for objects that contribute to segment hashing. */
interface Hashable {
    computeHash(): number;
}

export {
    crc32,
    hashNumber,
    hashString,
    hashFloat32Array,
    hashCompose,
};
export type { Hashable };
