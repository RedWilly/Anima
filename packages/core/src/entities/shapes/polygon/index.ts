/**
 * Polygon module exports.
 */

export { Polygon, polygon } from './polygon';
export type { PolygonOptions, MorphTarget, MorphOptions } from './types';
export {
    isSubPaths,
    interpolatePoints,
    interpolateSubPaths,
    interpolateStyle,
    normalizePointCount,
    prepareMorphPaths,
    findOptimalRotation,
    getCentroid,
    pathLength,
    distance,
} from './morph';
