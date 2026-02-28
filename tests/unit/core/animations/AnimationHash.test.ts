import { describe, expect, it } from 'bun:test';
import { Circle } from '../../../../src/core/mobjects/geometry/Circle';
import { Rectangle } from '../../../../src/core/mobjects/geometry/Rectangle';
import { MoveTo } from '../../../../src/core/animations/transform/MoveTo';
import { Rotate } from '../../../../src/core/animations/transform/Rotate';
import { Scale } from '../../../../src/core/animations/transform/Scale';
import { MorphTo } from '../../../../src/core/animations/morph/MorphTo';
import { Follow } from '../../../../src/core/animations/camera/Follow';
import { Parallel } from '../../../../src/core/animations/composition/Parallel';
import { Sequence } from '../../../../src/core/animations/composition/Sequence';
import { KeyframeAnimation } from '../../../../src/core/animations/keyframes/KeyframeAnimation';
import { KeyframeTrack } from '../../../../src/core/animations/keyframes/KeyframeTrack';
import { CameraFrame } from '../../../../src/core/camera/CameraFrame';
import { Vector2 } from '../../../../src/core/math/Vector2/Vector2';
import { Color } from '../../../../src/core/math/color/Color';

describe('Animation cache fingerprints', () => {
    it('MoveTo hash changes when destination changes', () => {
        const a = new MoveTo(new Circle(1), 1, 2).computeHash();
        const b = new MoveTo(new Circle(1), 3, 4).computeHash();
        expect(a).not.toBe(b);
    });

    it('Rotate hash changes when angle changes', () => {
        const a = new Rotate(new Circle(1), Math.PI / 2).computeHash();
        const b = new Rotate(new Circle(1), Math.PI / 3).computeHash();
        expect(a).not.toBe(b);
    });

    it('Scale hash changes when factor changes', () => {
        const a = new Scale(new Circle(1), 2).computeHash();
        const b = new Scale(new Circle(1), 3).computeHash();
        expect(a).not.toBe(b);
    });

    it('MorphTo hash changes when morph target style changes', () => {
        const sourceA = new Circle(1).fill(Color.RED).stroke(Color.WHITE, 2);
        const sourceB = new Circle(1).fill(Color.RED).stroke(Color.WHITE, 2);
        const targetA = new Rectangle(1, 1).fill(Color.YELLOW).stroke(Color.BLUE, 3);
        const targetB = new Rectangle(1, 1).fill(Color.YELLOW).stroke(Color.RED, 3);

        const a = new MorphTo(sourceA, targetA).computeHash();
        const b = new MorphTo(sourceB, targetB).computeHash();
        expect(a).not.toBe(b);
    });

    it('Follow hash changes when config changes', () => {
        const camera = new CameraFrame();
        const target = new Circle(1);
        const a = new Follow(camera, target, { offset: new Vector2(1, 0), damping: 0.2 }).computeHash();
        const b = new Follow(camera, target, { offset: new Vector2(2, 0), damping: 0.2 }).computeHash();
        expect(a).not.toBe(b);
    });

    it('Parallel hash changes when child animation parameters change', () => {
        const m1 = new Circle(1);
        const m2 = new Circle(1);
        const a = new Parallel([new MoveTo(m1, 1, 0)]).computeHash();
        const b = new Parallel([new MoveTo(m2, 2, 0)]).computeHash();
        expect(a).not.toBe(b);
    });

    it('Sequence hash changes when child order changes', () => {
        const targetA = new Circle(1);
        const targetB = new Circle(1);

        const moveA = new MoveTo(targetA, 1, 0);
        const rotateA = new Rotate(targetA, Math.PI / 2);
        const moveB = new MoveTo(targetB, 1, 0);
        const rotateB = new Rotate(targetB, Math.PI / 2);

        const a = new Sequence([moveA, rotateA]).computeHash();
        const b = new Sequence([rotateB, moveB]).computeHash();
        expect(a).not.toBe(b);
    });

    it('KeyframeAnimation hash changes when keyframe values change', () => {
        const targetA = new Circle(1);
        const targetB = new Circle(1);

        const trackA = new KeyframeTrack<number>()
            .addKeyframe(0, 0)
            .addKeyframe(1, 10);
        const trackB = new KeyframeTrack<number>()
            .addKeyframe(0, 0)
            .addKeyframe(1, 20);

        const animA = new KeyframeAnimation(targetA)
            .addTrack('x', trackA, (mob, value) => mob.pos(value, 0));
        const animB = new KeyframeAnimation(targetB)
            .addTrack('x', trackB, (mob, value) => mob.pos(value, 0));

        expect(animA.computeHash()).not.toBe(animB.computeHash());
    });
});
