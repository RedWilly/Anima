/**
 * Scene serialization - the main entry point for serializing/deserializing Scenes.
 */

import { Scene } from '../scene';
import { Mobject } from '../../mobjects/Mobject';
import { serializeMobject, deserializeMobject, resetIdCounter } from './mobject';
import { serializeAnimation, deserializeAnimation } from './animation';
import { serializeColor, deserializeColor } from './primitives';
import type { Animation } from '../animations/Animation';
import type {
    SerializedScene,
    SerializedSceneConfig,
    SerializedTimeline,
    SerializedScheduledAnimation,
    SerializedMobject,
} from './types';

const SERIALIZATION_VERSION = '1.0.0';

// Track mobject IDs during serialization
const serializationIdMap = new Map<Mobject, string>();
let serializationIdCounter = 0;

function getSerializationId(m: Mobject): string {
    let id = serializationIdMap.get(m);
    if (!id) {
        id = `mob_${serializationIdCounter++}`;
        serializationIdMap.set(m, id);
    }
    return id;
}

function resetSerializationState(): void {
    serializationIdMap.clear();
    serializationIdCounter = 0;
    resetIdCounter();
}

// ========== Scene Serialization ==========

function serializeSceneConfig(scene: Scene): SerializedSceneConfig {
    return {
        width: scene.getWidth(),
        height: scene.getHeight(),
        backgroundColor: serializeColor(scene.getBackgroundColor()),
        frameRate: scene.getFrameRate(),
    };
}

function serializeTimeline(scene: Scene): SerializedTimeline {
    const timeline = scene.getTimeline();
    const scheduled = timeline.getScheduled();

    const serializedScheduled: SerializedScheduledAnimation[] = scheduled.map(s => ({
        animation: serializeAnimation(s.animation, getSerializationId),
        startTime: s.startTime,
    }));

    return {
        loop: timeline.isLooping(),
        scheduled: serializedScheduled,
    };
}

/**
 * Serialize a Scene to a JSON-compatible object.
 */
export function serializeScene(scene: Scene): SerializedScene {
    resetSerializationState();

    const mobjects = scene.getMobjects();
    const serializedMobjects: SerializedMobject[] = mobjects.map(m => serializeMobject(m));

    return {
        version: SERIALIZATION_VERSION,
        config: serializeSceneConfig(scene),
        mobjects: serializedMobjects,
        timeline: serializeTimeline(scene),
    };
}

/**
 * Serialize a Scene to a JSON string.
 */
export function serialize(scene: Scene): string {
    const data = serializeScene(scene);
    return JSON.stringify(data);
}

// ========== Scene Deserialization ==========

/**
 * Deserialize a Scene from a JSON-compatible object.
 */
export function deserializeScene(data: SerializedScene): Scene {
    // Verify version compatibility
    if (!data.version) {
        throw new Error('Missing serialization version');
    }

    // Create scene with config
    const scene = new Scene({
        width: data.config.width,
        height: data.config.height,
        backgroundColor: deserializeColor(data.config.backgroundColor),
        frameRate: data.config.frameRate,
    });

    // Build mobject registry for animation deserialization
    const mobjectRegistry = new Map<string, Mobject>();
    const mobjects: Mobject[] = [];

    for (const serializedMob of data.mobjects) {
        const mob = deserializeMobject(serializedMob);
        mobjectRegistry.set(serializedMob.id, mob);
        mobjects.push(mob);
    }

    // Add mobjects to scene
    scene.add(...mobjects);

    // Deserialize and schedule animations
    const timeline = scene.getTimeline();
    for (const scheduled of data.timeline.scheduled) {
        const animation = deserializeAnimation(scheduled.animation, mobjectRegistry);
        timeline.schedule(animation, scheduled.startTime);
    }

    return scene;
}

/**
 * Deserialize a Scene from a JSON string.
 */
export function deserialize(json: string): Scene {
    const data = JSON.parse(json) as SerializedScene;
    return deserializeScene(data);
}
