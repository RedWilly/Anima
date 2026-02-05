/**
 * Example: Fluent scaleTo vs scaleToXY
 *
 * Demonstrates uniform scaling with optional duration and
 * non-uniform scaling via scaleToXY.
 */
import { Scene, Circle, Rectangle, Color, easeInOutCubic } from '../src';


export class ScaleToScene extends Scene {
  constructor() {
    super({ width: 1920, height: 1080, frameRate: 60 });

    const circle = new Circle(1).pos(-3, 0).fill(Color.RED, 0.5);
    const rect = new Rectangle(2, 1).pos(3, 0).fill(Color.BLUE, 0.5);

    // Intro: fade in both shapes
    circle.fadeIn(0.6);
    rect.fadeIn(0.6);
    this.play(circle, rect);

    // Uniform scaling with inline duration
    circle.scaleTo(1.5, 0.8).ease(easeInOutCubic);
    this.play(circle);

    this.wait(0.5);

    // Uniform scaling with duration modifier
    circle.scaleTo(0.8).duration(0.6).ease(easeInOutCubic);
    this.play(circle);

    // Non-uniform scaling with scaleToXY (x, y, duration)
    rect.scaleToXY(1.8, 0.6, 0.9).ease(easeInOutCubic);
    this.play(rect);

    this.wait(0.5);
    
    rect.scaleToXY(0.6, 1.8).duration(0.9).ease(easeInOutCubic);
    this.play(rect);

    // Reset both shapes
    circle.scaleTo(1, 0.5);
    rect.scaleTo(1, 0.5);
    this.play(circle, rect);
  }
}
