import { describe, it, expect, beforeEach } from 'bun:test';
import { Scene } from '../../src/core/scene/Scene';
import { Circle } from '../../src/mobjects/geometry/Circle';
import { Rectangle } from '../../src/mobjects/geometry/Rectangle';
import { MoveTo } from '../../src/core/animations/transform/MoveTo';
import { Scale } from '../../src/core/animations/transform/Scale';
import { Parallel } from '../../src/core/animations/composition/Parallel';
import { Sequence } from '../../src/core/animations/composition/Sequence';
import { CameraFrame } from '../../src/core/camera/CameraFrame';

describe('Camera Integration Tests', () => {
    let scene: Scene;

    beforeEach(() => {
        scene = new Scene({ width: 1920, height: 1080, frameRate: 60 });
    });

    describe('Scene with camera zoom animation renders correctly', () => {
        it('frame.zoomIn(2) scales frame to 0.5', () => {
            const frame = scene.frame;
            expect(frame).toBeInstanceOf(CameraFrame);

            const zoomAnim = frame.zoomIn(2).duration(1).toAnimation();

            zoomAnim.update(0);
            expect(frame.scale.x).toBeCloseTo(1, 5);
            expect(frame.scale.y).toBeCloseTo(1, 5);

            zoomAnim.update(0.5);
            expect(frame.scale.x).toBeCloseTo(0.75, 5);
            expect(frame.scale.y).toBeCloseTo(0.75, 5);

            zoomAnim.update(1);
            expect(frame.scale.x).toBeCloseTo(0.5, 5);
            expect(frame.scale.y).toBeCloseTo(0.5, 5);
        });

        it('frame.zoomOut(2) scales frame to 2', () => {
            const frame = scene.frame;
            const zoomAnim = frame.zoomOut(2).duration(1).toAnimation();

            zoomAnim.update(0);
            expect(frame.scale.x).toBeCloseTo(1, 5);

            zoomAnim.update(1);
            expect(frame.scale.x).toBeCloseTo(2, 5);
            expect(frame.scale.y).toBeCloseTo(2, 5);
        });

        it('camera.zoom reflects frame scale changes', () => {
            const camera = scene.camera;
            const frame = scene.frame;

            expect(camera.zoom).toBe(1);

            frame.setScale(0.5, 0.5);
            expect(camera.zoom).toBe(2);

            frame.setScale(2, 2);
            expect(camera.zoom).toBe(0.5);
        });

        it('view matrix changes after zoom animation', () => {
            const camera = scene.camera;
            const frame = scene.frame;

            const initialMatrix = camera.getViewMatrix();
            const initialValues = [...initialMatrix.values];
            
            const zoomAnim = frame.zoomIn(2).duration(1).toAnimation();
            zoomAnim.update(1);

            const finalMatrix = camera.getViewMatrix();
            expect([...finalMatrix.values]).not.toEqual(initialValues);
        });
    });

    describe('Scene with camera pan animation renders correctly', () => {
        it('frame.moveTo(5, 3) moves camera center', () => {
            const frame = scene.frame;
            const moveAnim = frame.moveTo(5, 3).duration(1).toAnimation();

            moveAnim.update(0);
            expect(frame.position.x).toBeCloseTo(0, 5);
            expect(frame.position.y).toBeCloseTo(0, 5);

            moveAnim.update(0.5);
            expect(frame.position.x).toBeCloseTo(2.5, 5);
            expect(frame.position.y).toBeCloseTo(1.5, 5);

            moveAnim.update(1);
            expect(frame.position.x).toBeCloseTo(5, 5);
            expect(frame.position.y).toBeCloseTo(3, 5);
        });

        it('frame.centerOn(target) moves camera to target position', () => {
            const frame = scene.frame;
            const circle = new Circle(1);
            circle.pos(10, -5);
            scene.add(circle);

            const centerAnim = frame.centerOn(circle).duration(1).toAnimation();

            centerAnim.update(1);
            expect(frame.position.x).toBeCloseTo(10, 5);
            expect(frame.position.y).toBeCloseTo(-5, 5);
        });

        it('camera.position reflects frame position changes', () => {
            const camera = scene.camera;
            const frame = scene.frame;

            expect(camera.position.x).toBe(0);
            expect(camera.position.y).toBe(0);

            frame.pos(7, -3);
            expect(camera.position.x).toBe(7);
            expect(camera.position.y).toBe(-3);
        });

        it('view matrix changes after pan animation', () => {
            const camera = scene.camera;
            const frame = scene.frame;

            const initialMatrix = camera.getViewMatrix();
            const initialValues = [...initialMatrix.values];
            
            const moveAnim = frame.moveTo(5, 5).duration(1).toAnimation();
            moveAnim.update(1);

            const finalMatrix = camera.getViewMatrix();
            expect([...finalMatrix.values]).not.toEqual(initialValues);
        });
    });

    describe('Camera + object animations in Parallel work correctly', () => {
        it('camera zoom and object move happen simultaneously', () => {
            const frame = scene.frame;
            const circle = new Circle(1);
            circle.pos(0, 0);
            scene.add(circle);

            const zoomAnim = frame.zoomIn(2).duration(1).toAnimation();
            const moveAnim = new MoveTo(circle, 5, 5);
            moveAnim.duration(1);

            const parallel = new Parallel([zoomAnim, moveAnim]);

            parallel.update(0);
            expect(frame.scale.x).toBeCloseTo(1, 5);
            expect(circle.position.x).toBeCloseTo(0, 5);

            parallel.update(0.5);
            expect(frame.scale.x).toBeCloseTo(0.75, 5);
            expect(circle.position.x).toBeCloseTo(2.5, 5);
            expect(circle.position.y).toBeCloseTo(2.5, 5);

            parallel.update(1);
            expect(frame.scale.x).toBeCloseTo(0.5, 5);
            expect(circle.position.x).toBeCloseTo(5, 5);
            expect(circle.position.y).toBeCloseTo(5, 5);
        });

        it('camera pan and object scale happen simultaneously', () => {
            const frame = scene.frame;
            const rect = new Rectangle(2, 1);
            rect.pos(0, 0);
            rect.setScale(1, 1);
            scene.add(rect);

            const panAnim = frame.moveTo(10, 10).duration(2).toAnimation();
            const scaleAnim = new Scale(rect, 3);
            scaleAnim.duration(2);

            const parallel = new Parallel([panAnim, scaleAnim]);

            parallel.update(0);
            expect(frame.position.x).toBeCloseTo(0, 5);
            expect(rect.scale.x).toBeCloseTo(1, 5);

            parallel.update(0.5);
            expect(frame.position.x).toBeCloseTo(5, 5);
            expect(frame.position.y).toBeCloseTo(5, 5);
            expect(rect.scale.x).toBeCloseTo(2, 5);

            parallel.update(1);
            expect(frame.position.x).toBeCloseTo(10, 5);
            expect(frame.position.y).toBeCloseTo(10, 5);
            expect(rect.scale.x).toBeCloseTo(3, 5);
        });

        it('multiple camera operations in parallel with object animations', () => {
            const frame = scene.frame;
            const circle = new Circle(1);
            circle.pos(-5, -5);
            scene.add(circle);

            const zoomAnim = frame.zoomOut(3).duration(1.5).toAnimation();
            const panAnim = frame.moveTo(0, 0).duration(1.5).toAnimation();
            const objMoveAnim = new MoveTo(circle, 5, 5);
            objMoveAnim.duration(1.5);

            const parallel = new Parallel([zoomAnim, panAnim, objMoveAnim]);

            parallel.update(1);
            expect(frame.scale.x).toBeCloseTo(3, 5);
            expect(frame.position.x).toBeCloseTo(0, 5);
            expect(circle.position.x).toBeCloseTo(5, 5);
        });
    });

    describe('Camera in Sequence with object animations works correctly', () => {
        it('camera zoom then object move happen in sequence', () => {
            const frame = scene.frame;
            const circle = new Circle(1);
            circle.pos(0, 0);
            scene.add(circle);

            const zoomAnim = frame.zoomIn(2).duration(1).toAnimation();
            const moveAnim = new MoveTo(circle, 5, 5);
            moveAnim.duration(1);

            const sequence = new Sequence([zoomAnim, moveAnim]);

            sequence.update(0);
            expect(frame.scale.x).toBeCloseTo(1, 5);
            expect(circle.position.x).toBeCloseTo(0, 5);

            sequence.update(0.25);
            expect(frame.scale.x).toBeCloseTo(0.75, 5);
            expect(circle.position.x).toBeCloseTo(0, 5);

            sequence.update(0.5);
            expect(frame.scale.x).toBeCloseTo(0.5, 5);
            expect(circle.position.x).toBeCloseTo(0, 5);

            sequence.update(0.75);
            expect(frame.scale.x).toBeCloseTo(0.5, 5);
            expect(circle.position.x).toBeCloseTo(2.5, 5);

            sequence.update(1);
            expect(frame.scale.x).toBeCloseTo(0.5, 5);
            expect(circle.position.x).toBeCloseTo(5, 5);
        });

        it('object move then camera pan happen in sequence', () => {
            const frame = scene.frame;
            const rect = new Rectangle(2, 1);
            rect.pos(0, 0);
            scene.add(rect);

            const moveAnim = new MoveTo(rect, 10, 0);
            moveAnim.duration(1);
            const panAnim = frame.moveTo(10, 0).duration(1).toAnimation();

            const sequence = new Sequence([moveAnim, panAnim]);

            sequence.update(0);
            expect(rect.position.x).toBeCloseTo(0, 5);
            expect(frame.position.x).toBeCloseTo(0, 5);

            sequence.update(0.5);
            expect(rect.position.x).toBeCloseTo(10, 5);
            expect(frame.position.x).toBeCloseTo(0, 5);

            sequence.update(1);
            expect(rect.position.x).toBeCloseTo(10, 5);
            expect(frame.position.x).toBeCloseTo(10, 5);
        });

        it('complex sequence: zoom -> object move -> pan -> scale', () => {
            const frame = scene.frame;
            const circle = new Circle(1);
            circle.pos(0, 0);
            circle.setScale(1, 1);
            scene.add(circle);

            const zoomAnim = frame.zoomOut(2).duration(0.5).toAnimation();
            const moveAnim = new MoveTo(circle, 3, 3);
            moveAnim.duration(0.5);
            const panAnim = frame.moveTo(3, 3).duration(0.5).toAnimation();
            const scaleAnim = new Scale(circle, 2);
            scaleAnim.duration(0.5);

            const sequence = new Sequence([zoomAnim, moveAnim, panAnim, scaleAnim]);
            expect(sequence.getDuration()).toBe(2);

            sequence.update(0);
            expect(frame.scale.x).toBeCloseTo(1, 5);
            expect(circle.position.x).toBeCloseTo(0, 5);

            sequence.update(0.25);
            expect(frame.scale.x).toBeCloseTo(2, 5);
            expect(circle.position.x).toBeCloseTo(0, 5);
            expect(frame.position.x).toBeCloseTo(0, 5);

            sequence.update(0.5);
            expect(frame.scale.x).toBeCloseTo(2, 5);
            expect(circle.position.x).toBeCloseTo(3, 5);
            expect(frame.position.x).toBeCloseTo(0, 5);

            sequence.update(0.75);
            expect(frame.scale.x).toBeCloseTo(2, 5);
            expect(circle.position.x).toBeCloseTo(3, 5);
            expect(frame.position.x).toBeCloseTo(3, 5);

            sequence.update(1);
            expect(frame.scale.x).toBeCloseTo(2, 5);
            expect(circle.position.x).toBeCloseTo(3, 5);
            expect(circle.scale.x).toBeCloseTo(2, 5);
            expect(frame.position.x).toBeCloseTo(3, 5);
        });

        it('sequence with parallel block containing camera and object animations', () => {
            const frame = scene.frame;
            const circle = new Circle(1);
            circle.pos(0, 0);
            scene.add(circle);

            const moveAnim = new MoveTo(circle, 5, 0);
            moveAnim.duration(1);

            const zoomAnim = frame.zoomIn(2).duration(1).toAnimation();
            const panAnim = frame.moveTo(5, 0).duration(1).toAnimation();
            const parallelCameraAnim = new Parallel([zoomAnim, panAnim]);

            const sequence = new Sequence([moveAnim, parallelCameraAnim]);
            expect(sequence.getDuration()).toBe(2);

            sequence.update(0);
            expect(circle.position.x).toBeCloseTo(0, 5);
            expect(frame.scale.x).toBeCloseTo(1, 5);
            expect(frame.position.x).toBeCloseTo(0, 5);

            sequence.update(0.5);
            expect(circle.position.x).toBeCloseTo(5, 5);
            expect(frame.scale.x).toBeCloseTo(1, 5);
            expect(frame.position.x).toBeCloseTo(0, 5);

            sequence.update(1);
            expect(circle.position.x).toBeCloseTo(5, 5);
            expect(frame.scale.x).toBeCloseTo(0.5, 5);
            expect(frame.position.x).toBeCloseTo(5, 5);
        });
    });
});
