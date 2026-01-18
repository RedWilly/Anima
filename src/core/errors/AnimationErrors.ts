import type { Animation } from '../animations/Animation';
import type { Mobject } from '../../mobjects/Mobject';

/**
 * Error thrown when an animation is applied to an object that is not in the scene.
 * This typically happens when using transformative animations (MoveTo, Rotate, Scale)
 * without first adding the object to the scene or using an introductory animation.
 */
export class AnimationTargetNotInSceneError extends Error {
    readonly animationName: string;
    readonly targetType: string;

    constructor(animation: Animation, target: Mobject) {
        const animName = animation.constructor.name;
        const targetType = target.constructor.name;

        super(
            `Cannot apply '${animName}' animation to ${targetType}: target is not in scene.\n` +
            `\n` +
            `This animation requires the target to already exist in the scene ` +
            `because it transforms an existing object rather than introducing a new one.\n` +
            `\n` +
            `Solutions:\n` +
            `  1. Call scene.add(target) before this animation\n` +
            `  2. Use an introductory animation first:\n` +
            `     - FadeIn: Fades the object in from transparent\n` +
            `     - Create: Draws the object's path progressively\n` +
            `     - Draw: Draws border then fills\n` +
            `     - Write: Draws text progressively\n` +
            `\n` +
            `Example:\n` +
            `  // Option 1: Use add() for immediate visibility\n` +
            `  scene.add(circle);\n` +
            `  scene.play(new MoveTo(circle, 2, 0));\n` +
            `\n` +
            `  // Option 2: Use introductory animation\n` +
            `  scene.play(new FadeIn(circle));\n` +
            `  scene.play(new MoveTo(circle, 2, 0));`
        );

        this.name = 'AnimationTargetNotInSceneError';
        this.animationName = animName;
        this.targetType = targetType;
    }
}
