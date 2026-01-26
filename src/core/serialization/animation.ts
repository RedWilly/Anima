/**
 * Animation serialization.
 * Note: Animations reference Mobjects, so we serialize target IDs.
 */

import type { Animation } from '../animations/Animation';
import { FadeIn, FadeOut } from '../animations/fade';
import { MoveTo, Rotate, Scale } from '../animations/transform';
import { MorphTo } from '../animations/morph';
import { Draw, Write, Unwrite } from '../animations/draw';
import { Sequence, Parallel } from '../animations/composition';
import { Mobject } from '../../mobjects/Mobject';
import { VMobject } from '../../mobjects/VMobject';
import { serializeVector2 } from './primitives';
import { getEasingName, getEasingByName } from './easingLookup';
import type {
    SerializedAnimation,
    SerializedAnimationConfig,
    SerializedMoveTo,
    SerializedRotate,
    SerializedScale,
    SerializedSequence,
    SerializedParallel,
    AnimationType,
} from './types';

// Maps mobject ID to mobject instance for deserialization
type MobjectRegistry = Map<string, Mobject>;

// ========== Animation Config Serialization ==========

function serializeAnimationConfig(anim: Animation): SerializedAnimationConfig {
    return {
        durationSeconds: anim.getDuration(),
        delaySeconds: anim.getDelay(),
        easingName: getEasingName(anim.getEasing()),
    };
}

/**
 * Maps animation instance to serializable type name.
 */
function getAnimationType(anim: Animation): AnimationType {
    if (anim instanceof FadeIn) return 'FadeIn';
    if (anim instanceof FadeOut) return 'FadeOut';
    if (anim instanceof MoveTo) return 'MoveTo';
    if (anim instanceof Rotate) return 'Rotate';
    if (anim instanceof Scale) return 'Scale';
    if (anim instanceof MorphTo) return 'MorphTo';
    if (anim instanceof Draw) return 'Draw';
    if (anim instanceof Write) return 'Write';
    if (anim instanceof Unwrite) return 'Unwrite';
    if (anim instanceof Sequence) return 'Sequence';
    if (anim instanceof Parallel) return 'Parallel';
    return 'Unknown';
}

// ========== Main Serialization ==========

/**
 * Serializes an animation instance to a plain object.
 *
 * @param anim The animation to serialize
 * @param getMobjectId Callback to resolve mobject references to stable IDs
 */
export function serializeAnimation(
    anim: Animation,
    getMobjectId: (m: Mobject) => string
): SerializedAnimation {
    const baseData: SerializedAnimation = {
        type: getAnimationType(anim),
        targetId: getMobjectId(anim.getTarget()),
        config: serializeAnimationConfig(anim),
    };

    // Type-specific data
    if (anim instanceof MoveTo) {
        const moveData: SerializedMoveTo = {
            ...baseData,
            type: 'MoveTo',
            destination: serializeVector2(anim.getDestination()),
        };
        return moveData;
    }

    if (anim instanceof Rotate) {
        const rotateData: SerializedRotate = {
            ...baseData,
            type: 'Rotate',
            angle: anim.getAngle(),
        };
        return rotateData;
    }

    if (anim instanceof Scale) {
        const scaleData: SerializedScale = {
            ...baseData,
            type: 'Scale',
            factor: anim.getFactor(),
        };
        return scaleData;
    }

    if (anim instanceof Sequence) {
        const seqData: SerializedSequence = {
            ...baseData,
            type: 'Sequence',
            animations: anim.getChildren().map((a: Animation) => serializeAnimation(a, getMobjectId)),
        };
        return seqData;
    }

    if (anim instanceof Parallel) {
        const parData: SerializedParallel = {
            ...baseData,
            type: 'Parallel',
            animations: anim.getChildren().map((a: Animation) => serializeAnimation(a, getMobjectId)),
        };
        return parData;
    }

    return baseData;
}

// ========== Deserialization ==========

function applyConfig(anim: Animation, config: SerializedAnimationConfig): void {
    anim.duration(config.durationSeconds);
    anim.delay(config.delaySeconds);
    const easing = getEasingByName(config.easingName);
    if (easing) {
        anim.ease(easing);
    }
}

/**
 * Restores an animation instance from serialized data.
 *
 * @param data The serialized animation data
 * @param registry Map of mobject IDs to restored instances for resolving targets
 */
export function deserializeAnimation(
    data: SerializedAnimation,
    registry: MobjectRegistry
): Animation {
    const target = registry.get(data.targetId);
    if (!target) {
        throw new Error(`Mobject not found: ${data.targetId}`);
    }

    let anim: Animation;

    switch (data.type) {
        case 'FadeIn':
            anim = new FadeIn(target);
            break;
        case 'FadeOut':
            anim = new FadeOut(target);
            break;
        case 'MoveTo': {
            const d = data as SerializedMoveTo;
            anim = new MoveTo(target, d.destination.x, d.destination.y);
            break;
        }
        case 'Rotate': {
            const d = data as SerializedRotate;
            anim = new Rotate(target, d.angle);
            break;
        }
        case 'Scale': {
            const d = data as SerializedScale;
            anim = new Scale(target, d.factor);
            break;
        }
        case 'Create':
            anim = new Write(target as VMobject);
            break;
        case 'Draw':
            anim = new Draw(target as VMobject);
            break;
        case 'Write':
            anim = new Write(target as VMobject);
            break;
        case 'Unwrite':
            anim = new Unwrite(target as VMobject);
            break;
        case 'Sequence': {
            const d = data as SerializedSequence;
            const children = d.animations.map(a => deserializeAnimation(a, registry));
            anim = new Sequence(children);
            break;
        }
        case 'Parallel': {
            const d = data as SerializedParallel;
            const children = d.animations.map(a => deserializeAnimation(a, registry));
            anim = new Parallel(children);
            break;
        }
        default:
            throw new Error(`Unknown animation type: ${data.type}`);
    }

    applyConfig(anim, data.config);
    return anim;
}
