/**
 * Mobject and VMobject serialization.
 */

import { Mobject } from '../../mobjects/Mobject';
import { VMobject } from '../../mobjects/VMobject';
import { VGroup } from '../../mobjects/VGroup/VGroup';
import { Circle, Rectangle, Line, Arrow, Arc, Polygon, Point } from '../../mobjects/geometry';
import { Vector2 } from '../math/Vector2/Vector2';
import {
    serializeMatrix3x3,
    deserializeMatrix3x3,
    serializeColor,
    deserializeColor,
    serializeBezierPath,
    deserializeBezierPath,
    serializeVector2,
    deserializeVector2,
} from './primitives';
import { getSerializer } from './registry';
import type {
    SerializedMobject,
    SerializedVMobject,
    SerializedVGroup,
    MobjectType,
    SerializedCircle,
    SerializedRectangle,
    SerializedLine,
    SerializedArc,
    SerializedPolygon,
    SerializedPoint,
} from './types';

// ID generation - uses a simple incrementing counter
let idCounter = 0;
const mobjectIdMap = new WeakMap<Mobject, string>();

function getMobjectId(m: Mobject): string {
    let id = mobjectIdMap.get(m);
    if (!id) {
        id = `mob_${idCounter++}`;
        mobjectIdMap.set(m, id);
    }
    return id;
}

/**
 * Reset ID counter (useful for testing).
 */
export function resetIdCounter(): void {
    idCounter = 0;
}

/**
 * Get the type name for a mobject instance.
 */
function getMobjectType(m: Mobject): MobjectType {
    if (m instanceof Circle) return 'Circle';
    if (m instanceof Rectangle) return 'Rectangle';
    if (m instanceof Arrow) return 'Arrow';
    if (m instanceof Line) return 'Line';
    if (m instanceof Arc) return 'Arc';
    if (m instanceof Polygon) return 'Polygon';
    if (m instanceof Point) return 'Point';
    if (m instanceof VGroup) return 'VGroup';
    if (m instanceof VMobject) return 'VMobject';
    return 'Mobject';
}

// ========== Base Mobject Serialization ==========

function serializeMobjectBase(m: Mobject): SerializedMobject {
    return {
        type: getMobjectType(m),
        id: getMobjectId(m),
        matrix: serializeMatrix3x3(m.matrix),
        opacity: m.opacity,
    };
}

// ========== VMobject Serialization ==========

function serializeVMobjectBase(v: VMobject): SerializedVMobject {
    const base = serializeMobjectBase(v);
    return {
        ...base,
        paths: v.paths.map(serializeBezierPath),
        strokeColor: serializeColor(v.strokeColor),
        strokeWidth: v.strokeWidth,
        fillColor: serializeColor(v.fillColor),
        fillOpacity: v.fillOpacity,
    };
}

// ========== Primitive-Specific Serialization ==========

function serializeCircle(c: Circle): SerializedCircle {
    const base = serializeVMobjectBase(c);
    // Circle extends Arc, extract radius from the path bounding
    const arc = c as Arc;
    return { ...base, type: 'Circle', radius: arc.radius };
}

function serializeRectangle(r: Rectangle): SerializedRectangle {
    const base = serializeVMobjectBase(r);
    return { ...base, type: 'Rectangle', width: r.width, height: r.height };
}

function serializeLine(l: Line): SerializedLine {
    const base = serializeVMobjectBase(l);
    return {
        ...base,
        type: 'Line',
        start: serializeVector2(l.start),
        end: serializeVector2(l.end),
    };
}

function serializeArc(a: Arc): SerializedArc {
    const base = serializeVMobjectBase(a);
    return {
        ...base,
        type: 'Arc',
        radius: a.radius,
        startAngle: a.startAngle,
        endAngle: a.endAngle,
    };
}

function serializePolygon(p: Polygon): SerializedPolygon {
    const base = serializeVMobjectBase(p);
    return {
        ...base,
        type: 'Polygon',
        vertices: p.vertices.map(serializeVector2),
    };
}

function serializePoint(p: Point): SerializedVMobject {
    // Point extends Circle, serialize as VMobject with Point type
    const base = serializeVMobjectBase(p);
    return { ...base, type: 'Point' };
}

// ========== VGroup Serialization ==========

function serializeVGroup(g: VGroup): SerializedVGroup {
    const base = serializeMobjectBase(g);
    return {
        ...base,
        type: 'VGroup',
        children: g.getChildren().map(serializeMobject),
    };
}

// ========== Main Serialization Entry Point ==========

export function serializeMobject(m: Mobject): SerializedMobject {
    // Check for custom serializer first
    const typeName = m.constructor.name;
    const customSerializer = getSerializer(typeName);
    if (customSerializer) {
        return customSerializer.serialize(m);
    }

    // Handle built-in types
    if (m instanceof Circle) return serializeCircle(m);
    if (m instanceof Rectangle) return serializeRectangle(m);
    if (m instanceof Arrow) return serializeLine(m as unknown as Line);
    if (m instanceof Line) return serializeLine(m);
    if (m instanceof Arc) return serializeArc(m);
    if (m instanceof Polygon) return serializePolygon(m);
    if (m instanceof Point) return serializePoint(m);
    if (m instanceof VGroup) return serializeVGroup(m);
    if (m instanceof VMobject) return serializeVMobjectBase(m);
    return serializeMobjectBase(m);
}

// ========== Deserialization ==========

function applyMobjectBase(m: Mobject, data: SerializedMobject): void {
    const matrix = deserializeMatrix3x3(data.matrix);
    m.applyMatrix(matrix);
    m.setOpacity(data.opacity);
}

function applyVMobjectBase(v: VMobject, data: SerializedVMobject): void {
    applyMobjectBase(v, data);
    v.paths = data.paths.map(deserializeBezierPath);
    v.strokeColor = deserializeColor(data.strokeColor);
    v.strokeWidth = data.strokeWidth;
    v.fillColor = deserializeColor(data.fillColor);
    v.fillOpacity = data.fillOpacity;
}

export function deserializeMobject(data: SerializedMobject): Mobject {
    // Check for custom serializer first
    const customSerializer = getSerializer(data.type);
    if (customSerializer) {
        return customSerializer.deserialize(data) as Mobject;
    }

    switch (data.type) {
        case 'Circle': {
            const d = data as SerializedCircle;
            const circle = new Circle(d.radius);
            applyVMobjectBase(circle, d);
            return circle;
        }
        case 'Rectangle': {
            const d = data as SerializedRectangle;
            const rect = new Rectangle(d.width, d.height);
            applyVMobjectBase(rect, d);
            return rect;
        }
        case 'Line': {
            const d = data as SerializedLine;
            const start = deserializeVector2(d.start);
            const end = deserializeVector2(d.end);
            const line = new Line(start, end);
            applyVMobjectBase(line, d);
            return line;
        }
        case 'Arc': {
            const d = data as SerializedArc;
            const arc = new Arc(d.radius, d.startAngle, d.endAngle);
            applyVMobjectBase(arc, d);
            return arc;
        }
        case 'Polygon': {
            const d = data as SerializedPolygon;
            const vertices = d.vertices.map(deserializeVector2);
            const polygon = new Polygon(vertices);
            applyVMobjectBase(polygon, d);
            return polygon;
        }
        case 'Point': {
            // Point constructor takes location, but we restore state via matrix
            const d = data as SerializedCircle;
            const point = new Point();
            applyVMobjectBase(point, d);
            return point;
        }
        case 'VGroup': {
            const d = data as SerializedVGroup;
            const children = d.children.map(deserializeMobject) as VMobject[];
            const group = new VGroup(...children);
            applyMobjectBase(group, d);
            return group;
        }
        case 'VMobject': {
            const d = data as SerializedVMobject;
            const vmob = new VMobject();
            applyVMobjectBase(vmob, d);
            return vmob;
        }
        default: {
            // Generic Mobject fallback
            const mob = new VMobject();
            if ('paths' in data) {
                applyVMobjectBase(mob, data as SerializedVMobject);
            } else {
                applyMobjectBase(mob, data);
            }
            return mob;
        }
    }
}
