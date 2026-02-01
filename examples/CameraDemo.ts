/**
 * Example: Camera System Demonstrations
 * 
 * This file contains multiple scenes demonstrating the camera capabilities:
 * - CameraZoomDemo: zoomIn, zoomOut, zoomToPoint
 * - CameraPanDemo: centerOn, moveTo
 * - CameraEffectsDemo: shake, save/restore
 * - CameraFitDemo: fitTo with multiple objects
 */
import { Scene } from '../src/core/scene/Scene';
import { Circle } from '../src/mobjects/geometry/Circle';
import { Rectangle } from '../src/mobjects/geometry/Rectangle';
import { FadeIn, Shake } from '../src/core/animations';
import { easeInOutQuad } from '../src/core/animations/easing';
import { Color } from '../src/core/math/color/Color';

/**
 * Demonstrates camera zoom capabilities:
 * - zoomIn: Makes objects appear larger
 * - zoomOut: Makes objects appear smaller
 * - zoomToPoint: Zooms while keeping a point fixed on screen
 */
export class CameraZoomDemo extends Scene {
    constructor() {
        super({ width: 1920, height: 1080, frameRate: 60 });

        const circle = new Circle(0.5).pos(0, 0).fill(Color.BLUE);
        const marker = new Circle(0.2).pos(2, 1).fill(Color.RED);

        this.play(new FadeIn(circle).duration(0.5));
        this.play(new FadeIn(marker).duration(0.5));

        this.wait(0.5);

        this.frame.zoomIn(2).duration(1).ease(easeInOutQuad);
        this.play(this.frame);

        this.wait(0.5);

        this.frame.zoomOut(4).duration(1).ease(easeInOutQuad);
        this.play(this.frame);

        this.wait(0.5);

        const zoomAnim = this.frame.zoomToPoint(0.5, { x: 2, y: 1 }).duration(1);
        this.play(zoomAnim);

        this.wait(1);
    }
}

/**
 * Demonstrates camera panning capabilities:
 * - centerOn: Centers camera on a specific Mobject
 * - moveTo: Moves camera to specific world coordinates
 */
export class CameraPanDemo extends Scene {
    constructor() {
        super({ width: 1920, height: 1080, frameRate: 60 });

        const leftCircle = new Circle(0.5).pos(-4, 0).fill(Color.GREEN);
        const rightRect = new Rectangle(1, 1).pos(4, 2).fill(Color.YELLOW);
        const topCircle = new Circle(0.3).pos(0, 3).fill(Color.BLUE);

        this.play(
            new FadeIn(leftCircle).duration(0.5),
            new FadeIn(rightRect).duration(0.5),
            new FadeIn(topCircle).duration(0.5)
        );

        this.wait(0.5);

        this.frame.centerOn(leftCircle).duration(1).ease(easeInOutQuad);
        this.play(this.frame);

        this.wait(0.5);

        this.frame.centerOn(rightRect).duration(1).ease(easeInOutQuad);
        this.play(this.frame);

        this.wait(0.5);

        this.frame.moveTo(0, 0).duration(1).ease(easeInOutQuad);
        this.play(this.frame);

        this.wait(0.5);

        this.frame.centerOn(topCircle).duration(0.8);
        this.play(this.frame);

        this.wait(1);
    }
}

/**
 * Demonstrates camera effects:
 * - rotate: Tilt/rotate the camera view
 * - shake: Screen shake effect for impact
 */
export class CameraEffectsDemo extends Scene {
    constructor() {
        super({ width: 1920, height: 1080, frameRate: 60 });

        // Create a circle at center
        const square  = new Rectangle(2).pos(0, 0).fill(Color.RED);

        // Fade in the circle
        this.play(new FadeIn(square).duration(0.5));
        this.wait(0.3);

        // Rotate the camera frame
        this.frame.rotate(Math.PI / 8).duration(0.6).ease(easeInOutQuad);
        this.play(this.frame);
        this.wait(0.3);

        // Rotate back
        this.frame.rotate(-Math.PI / 8).duration(0.6).ease(easeInOutQuad);
        this.play(this.frame);
        this.wait(0.3);

        // Apply camera shake for impact
        this.play(new Shake(this.frame, { intensity: 0.2 }).duration(0.4));

        this.wait(0.5);
    }
}

/**
 * Demonstrates fitTo functionality:
 * - Automatically frames one or more objects
 * - Calculates bounding box and zooms to fit all targets
 */
export class CameraFitDemo extends Scene {
    constructor() {
        super({ width: 1920, height: 1080, frameRate: 60 });

        const obj1 = new Circle(0.4).pos(-5, -3).fill(Color.RED);
        const obj2 = new Rectangle(0.8, 0.8).pos(5, 3).fill(Color.GREEN);
        const obj3 = new Circle(0.5).pos(0, 4).fill(Color.BLUE);
        const obj4 = new Rectangle(0.6, 0.6).pos(-3, 2).fill(Color.YELLOW);

        this.play(
            new FadeIn(obj1).duration(0.5),
            new FadeIn(obj2).duration(0.5),
            new FadeIn(obj3).duration(0.5),
            new FadeIn(obj4).duration(0.5)
        );

        this.wait(0.5);

        this.frame.fitTo(obj1, 0.5).duration(1).ease(easeInOutQuad);
        this.play(this.frame);

        this.wait(0.5);

        this.frame.fitTo([obj1, obj2], 1).duration(1.5);
        this.play(this.frame);

        this.wait(0.5);

        this.frame.fitTo([obj1, obj2, obj3, obj4], 0.8).duration(1.5);
        this.play(this.frame);

        this.wait(1);
    }
}
