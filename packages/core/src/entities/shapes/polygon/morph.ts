/**
 * Morphing utilities for Polygon.
 *
 * Provides professional-quality morphing with:
 * - Point normalization (resampling to consistent count)
 * - Optimal alignment (minimize crossing artifacts)
 * - Smooth interpolation
 */

import type { Point, Style } from '../../../types';
import { interpolateColor, interpolateNumber } from '../../../utils/color';

/** Default number of points for normalized paths */
const DEFAULT_SAMPLE_COUNT = 64;

/**
 * Check if a value is a 2D array (sub-paths structure).
 */
export function isSubPaths(value: Point[] | Point[][]): value is Point[][] {
    if (value.length === 0) {
        return false;
    }
    const first = value[0];
    return Array.isArray(first);
}

/**
 * Calculate the Euclidean distance between two points.
 */
export function distance(a: Point, b: Point): number {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate the total arc length of a path.
 */
export function pathLength(points: Point[]): number {
    if (points.length < 2) return 0;
    let total = 0;
    for (let i = 1; i < points.length; i++) {
        total += distance(points[i - 1], points[i]);
    }
    return total;
}

/**
 * Calculate cumulative arc lengths for each point in a path.
 * Returns array where index i = cumulative length from start to point[i].
 */
export function cumulativeLengths(points: Point[]): number[] {
    const lengths = [0];
    for (let i = 1; i < points.length; i++) {
        lengths.push(lengths[i - 1] + distance(points[i - 1], points[i]));
    }
    return lengths;
}

/**
 * Get a point at parameter t (0-1) along a path using linear interpolation.
 * This considers the path as a continuous curve.
 */
export function getPointAtT(points: Point[], t: number): Point {
    if (points.length === 0) return { x: 0, y: 0 };
    if (points.length === 1) return { ...points[0] };
    if (t <= 0) return { ...points[0] };
    if (t >= 1) return { ...points[points.length - 1] };

    const lengths = cumulativeLengths(points);
    const totalLength = lengths[lengths.length - 1];
    const targetLength = t * totalLength;

    // Find segment containing target length
    for (let i = 1; i < lengths.length; i++) {
        if (lengths[i] >= targetLength) {
            const segmentStart = lengths[i - 1];
            const segmentEnd = lengths[i];
            const segmentLength = segmentEnd - segmentStart;

            if (segmentLength === 0) {
                return { ...points[i - 1] };
            }

            const localT = (targetLength - segmentStart) / segmentLength;
            const p0 = points[i - 1];
            const p1 = points[i];

            return {
                x: p0.x + (p1.x - p0.x) * localT,
                y: p0.y + (p1.y - p0.y) * localT,
            };
        }
    }

    return { ...points[points.length - 1] };
}

/**
 * Normalize a path to have exactly N evenly-distributed points.
 * This eliminates point count mismatches between source and target.
 */
export function normalizePointCount(points: Point[], targetCount: number = DEFAULT_SAMPLE_COUNT): Point[] {
    if (points.length === 0) return [];
    if (points.length === 1) {
        // Single point: duplicate it
        return Array.from({ length: targetCount }, () => ({ ...points[0] }));
    }
    if (targetCount <= 1) {
        return [{ ...points[0] }];
    }

    const result: Point[] = [];
    for (let i = 0; i < targetCount; i++) {
        const t = i / (targetCount - 1);
        result.push(getPointAtT(points, t));
    }
    return result;
}

/**
 * Calculate the centroid of a set of points.
 */
export function getCentroid(points: Point[]): Point {
    if (points.length === 0) return { x: 0, y: 0 };

    let sumX = 0;
    let sumY = 0;
    for (const p of points) {
        sumX += p.x;
        sumY += p.y;
    }
    return {
        x: sumX / points.length,
        y: sumY / points.length,
    };
}

/**
 * Find the optimal rotation offset for point alignment.
 * Returns the index to start from in the 'points' array to minimize
 * the total squared distance to the 'target' array.
 * 
 * This reduces "crossing" artifacts during morphing.
 */
export function findOptimalRotation(points: Point[], target: Point[]): number {
    if (points.length === 0 || target.length === 0) return 0;
    if (points.length !== target.length) {
        // Should only be called after normalization
        return 0;
    }

    const n = points.length;
    let bestOffset = 0;
    let bestScore = Infinity;

    // Try each possible rotation and find the one with minimum total distance
    for (let offset = 0; offset < n; offset++) {
        let score = 0;
        for (let i = 0; i < n; i++) {
            const srcIdx = (i + offset) % n;
            const dx = points[srcIdx].x - target[i].x;
            const dy = points[srcIdx].y - target[i].y;
            score += dx * dx + dy * dy;
        }
        if (score < bestScore) {
            bestScore = score;
            bestOffset = offset;
        }
    }

    return bestOffset;
}

/**
 * Rotate a point array by the given offset.
 */
export function rotatePoints(points: Point[], offset: number): Point[] {
    if (points.length === 0 || offset === 0) return points.map(p => ({ ...p }));

    const n = points.length;
    const result: Point[] = [];
    for (let i = 0; i < n; i++) {
        const srcIdx = (i + offset) % n;
        result.push({ ...points[srcIdx] });
    }
    return result;
}

/**
 * Prepare two point arrays for morphing:
 * 1. Normalize both to same point count
 * 2. Align starting points to minimize crossing
 */
export function prepareMorphPaths(
    start: Point[],
    end: Point[],
    sampleCount: number = DEFAULT_SAMPLE_COUNT
): { start: Point[]; end: Point[] } {
    // Normalize to same count
    const normalizedStart = normalizePointCount(start, sampleCount);
    const normalizedEnd = normalizePointCount(end, sampleCount);

    // Find optimal alignment
    const offset = findOptimalRotation(normalizedStart, normalizedEnd);
    const alignedStart = rotatePoints(normalizedStart, offset);

    return {
        start: alignedStart,
        end: normalizedEnd,
    };
}

/**
 * Interpolate between two point arrays.
 * Now uses normalized and aligned points for smooth results.
 */
export function interpolatePoints(
    start: Point[],
    end: Point[],
    progress: number
): Point[] {
    // Handle edge cases
    if (start.length === 0 && end.length === 0) return [];
    if (start.length === 0) return end.map(p => ({ ...p }));
    if (end.length === 0) return start.map(p => ({ ...p }));

    // If lengths match, interpolate directly (already normalized)
    if (start.length === end.length) {
        const result: Point[] = [];
        for (let i = 0; i < start.length; i++) {
            result.push({
                x: start[i].x + (end[i].x - start[i].x) * progress,
                y: start[i].y + (end[i].y - start[i].y) * progress,
            });
        }
        return result;
    }

    // Lengths differ: normalize first (fallback for legacy usage)
    const sampleCount = Math.max(start.length, end.length, DEFAULT_SAMPLE_COUNT);
    const { start: s, end: e } = prepareMorphPaths(start, end, sampleCount);

    const result: Point[] = [];
    for (let i = 0; i < s.length; i++) {
        result.push({
            x: s[i].x + (e[i].x - s[i].x) * progress,
            y: s[i].y + (e[i].y - s[i].y) * progress,
        });
    }
    return result;
}

/**
 * Distribute a single path's points to create multiple initial sub-paths.
 * This creates a "bloom" effect where sub-paths emerge from the source.
 * 
 * @param sourcePath - The single source path to distribute
 * @param targetCount - Number of target sub-paths to create
 * @param targetCentroids - Centroids of each target sub-path for direction hints
 * @param progress - Animation progress (0-1)
 */
function distributePathToSubPaths(
    sourcePath: Point[],
    targetCount: number,
    targetCentroids: Point[],
    progress: number
): Point[][] {
    if (sourcePath.length === 0 || targetCount === 0) return [];

    const sourceCentroid = getCentroid(sourcePath);
    const pointsPerSubPath = Math.max(8, Math.floor(sourcePath.length / targetCount));
    const result: Point[][] = [];

    for (let i = 0; i < targetCount; i++) {
        const subPath: Point[] = [];
        const targetCenter = targetCentroids[i] || sourceCentroid;

        // Create points for this sub-path
        for (let j = 0; j < pointsPerSubPath; j++) {
            const srcIdx = (i * pointsPerSubPath + j) % sourcePath.length;
            const srcPoint = sourcePath[srcIdx];

            // At progress=0: all points at source centroid
            // At progress=1: points move toward target centroid
            // This creates a "spawn from center" effect
            const spawnProgress = Math.min(1, progress * 2); // Spawn faster in first half

            subPath.push({
                x: sourceCentroid.x + (srcPoint.x - sourceCentroid.x) * spawnProgress +
                    (targetCenter.x - sourceCentroid.x) * progress * 0.3,
                y: sourceCentroid.y + (srcPoint.y - sourceCentroid.y) * spawnProgress +
                    (targetCenter.y - sourceCentroid.y) * progress * 0.3,
            });
        }
        result.push(subPath);
    }

    return result;
}

/**
 * Interpolate between two sub-path arrays.
 * Handles special cases:
 * - Single source to many targets: distributes and blooms outward
 * - Many sources to single target: collapses inward  
 * - Otherwise: normalizes each sub-path pair for smooth results
 */
export function interpolateSubPaths(
    startSubs: Point[][],
    endSubs: Point[][],
    progress: number
): Point[][] {
    if (startSubs.length === 0 && endSubs.length === 0) return [];
    if (startSubs.length === 0) return endSubs.map(sp => sp.map(p => ({ ...p })));
    if (endSubs.length === 0) return startSubs.map(sp => sp.map(p => ({ ...p })));

    // Special case: single source sub-path to many target sub-paths (shape → text)
    if (startSubs.length === 1 && endSubs.length > 1) {
        const sourcePath = startSubs[0];
        const targetCentroids = endSubs.map(sub => getCentroid(sub));

        // Distribute source into initial sub-paths
        const distributedStart = distributePathToSubPaths(
            sourcePath,
            endSubs.length,
            targetCentroids,
            progress
        );

        // Now interpolate each distributed sub-path to its target
        const result: Point[][] = [];
        for (let i = 0; i < endSubs.length; i++) {
            const startSub = distributedStart[i];
            const endSub = endSubs[i];

            const sampleCount = Math.max(startSub.length, endSub.length, 32);
            const { start: s, end: e } = prepareMorphPaths(startSub, endSub, sampleCount);

            const newPath: Point[] = [];
            for (let j = 0; j < s.length; j++) {
                newPath.push({
                    x: s[j].x + (e[j].x - s[j].x) * progress,
                    y: s[j].y + (e[j].y - s[j].y) * progress,
                });
            }
            result.push(newPath);
        }
        return result;
    }

    // Special case: many source sub-paths to single target (text → shape)
    if (startSubs.length > 1 && endSubs.length === 1) {
        const targetPath = endSubs[0];
        const targetCentroid = getCentroid(targetPath);

        // Reverse the bloom: collapse inward
        const result: Point[][] = [];
        for (let i = 0; i < startSubs.length; i++) {
            const startSub = startSubs[i];

            const sampleCount = Math.max(startSub.length, targetPath.length, 32);
            const normalizedStart = normalizePointCount(startSub, sampleCount);
            const normalizedEnd = normalizePointCount(targetPath, sampleCount);

            const newPath: Point[] = [];
            const collapseProgress = Math.max(0, (progress - 0.5) * 2); // Collapse in second half

            for (let j = 0; j < normalizedStart.length; j++) {
                const sp = normalizedStart[j];
                const ep = normalizedEnd[j];

                // Move toward target, with extra pull toward centroid
                newPath.push({
                    x: sp.x + (ep.x - sp.x) * progress +
                        (targetCentroid.x - sp.x) * collapseProgress * 0.3,
                    y: sp.y + (ep.y - sp.y) * progress +
                        (targetCentroid.y - sp.y) * collapseProgress * 0.3,
                });
            }
            result.push(newPath);
        }
        return result;
    }

    // Default case: same count or wrapping (normalize and interpolate each pair)
    const subLen = Math.max(startSubs.length, endSubs.length);
    const result: Point[][] = [];

    for (let si = 0; si < subLen; si++) {
        const startSub = startSubs[si % startSubs.length];
        const endSub = endSubs[si % endSubs.length];

        // Normalize and align each sub-path pair
        const sampleCount = Math.max(startSub.length, endSub.length, 32);
        const { start: s, end: e } = prepareMorphPaths(startSub, endSub, sampleCount);

        const newPath: Point[] = [];
        for (let pi = 0; pi < s.length; pi++) {
            newPath.push({
                x: s[pi].x + (e[pi].x - s[pi].x) * progress,
                y: s[pi].y + (e[pi].y - s[pi].y) * progress,
            });
        }
        result.push(newPath);
    }

    return result;
}

/**
 * Interpolate between two styles.
 * Handles fill, stroke, and strokeWidth with smooth color transitions.
 */
export function interpolateStyle(
    startStyle: Style,
    endStyle: Style,
    progress: number
): Style {
    const result: Style = {};

    // Interpolate fill color
    if (startStyle.fill && endStyle.fill) {
        result.fill = interpolateColor(startStyle.fill, endStyle.fill, progress);
    } else if (startStyle.fill && !endStyle.fill) {
        // Fade out fill
        result.fill = startStyle.fill;
    } else if (!startStyle.fill && endStyle.fill) {
        // Fade in fill at end
        if (progress >= 1) {
            result.fill = endStyle.fill;
        }
    }

    // Interpolate stroke color
    if (startStyle.stroke && endStyle.stroke) {
        result.stroke = interpolateColor(startStyle.stroke, endStyle.stroke, progress);
    } else if (startStyle.stroke && !endStyle.stroke) {
        result.stroke = startStyle.stroke;
    } else if (!startStyle.stroke && endStyle.stroke) {
        if (progress >= 1) {
            result.stroke = endStyle.stroke;
        }
    }

    // Interpolate stroke width
    if (startStyle.strokeWidth !== undefined && endStyle.strokeWidth !== undefined) {
        result.strokeWidth = interpolateNumber(startStyle.strokeWidth, endStyle.strokeWidth, progress);
    } else if (startStyle.strokeWidth !== undefined) {
        result.strokeWidth = startStyle.strokeWidth;
    } else if (endStyle.strokeWidth !== undefined && progress >= 1) {
        result.strokeWidth = endStyle.strokeWidth;
    }

    return result;
}
