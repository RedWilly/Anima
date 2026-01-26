import {
    Scene,
    Rectangle,
    Circle,
    Color,
    Text,
    Arrow,
    // Pro API imports
    FadeIn,
    FadeOut,
    MoveTo,
    Rotate,
    Scale,
    Write,
    Draw,
    Unwrite,
    Sequence,
    Parallel,
    // Easing functions
    easeOutBack,
    easeInOutCubic,
    easeOutElastic,
    smooth,
    thereAndBack
} from "../src";

/**
 * EntFlu - Fluent API Demo
 *
 * Demonstrates the chainable, expressive fluent API for building animations.
 * Best for: Quick prototyping, readable animation sequences, simple scenes.
 */
export class EntFlu extends Scene {
    constructor() {
        super({ width: 1920, height: 1080, frameRate: 60 });
        const fontPath = 'assets/fonts/Inter.ttf';

        // ========== Title Animation ==========
        const title = new Text("Anima", fontPath, { fontSize: 1.5 })
            .pos(0, 3)
            .fill(Color.WHITE)
            .stroke(Color.WHITE, 3);
            // .stroke(Color.fromHex('#6366f1'), 3);

        // Write the title with a nice ease
        title.draw(1.5).ease(smooth);
        this.play(title);

        this.wait(0.3);

        // ========== Shape Showcase ==========
        // Create shapes in a row
        const circle = new Circle(0.6)
            .pos(-4, 0)
            .fill(Color.fromHex('#3b82f6'))
            .stroke(Color.WHITE, 2);

        const square = new Rectangle(1, 1)
            .pos(0, 0)
            .fill(Color.fromHex('#8b5cf6'))
            .stroke(Color.WHITE, 2);

        const diamond = new Rectangle(0.8, 0.8)
            .pos(4, 0)
            .setRotation(Math.PI / 4)
            .fill(Color.fromHex('#ec4899'))
            .stroke(Color.WHITE, 2);

        // Draw all shapes simultaneously with staggered timing
        circle.draw(1).ease(easeOutBack);
        this.play(circle);

        square.draw(1).ease(easeOutBack);
        this.play(square);

        diamond.draw(1).ease(easeOutBack);
        this.play(diamond);

        this.wait(0.5);

        // ========== Transform Animations ==========
        // Move shapes to form a triangle pattern
        circle.moveTo(-2, -2, 1).ease(easeInOutCubic);
        square.moveTo(0, 1, 1).ease(easeInOutCubic);
        diamond.moveTo(2, -2, 1).ease(easeInOutCubic);
        this.play(circle, square, diamond);

        // Rotate and scale simultaneously
        circle.rotate(Math.PI * 2, 1).scaleTo(1.3, 0.5);
        square.rotate(-Math.PI, 1).scaleTo(1.5, 0.5);
        diamond.rotate(Math.PI, 1).scaleTo(1.2, 0.5);
        this.play(circle, square, diamond);

        this.wait(0.3);

        // ========== Connecting Arrow ==========
        const arrow = new Arrow(-1.5, -1.5, 1.5, -1.5)
            .stroke(Color.fromHex('#22c55e'), 3);

        arrow.draw(0.8).ease(smooth);
        this.play(arrow);

        // Pulse the arrow
        arrow.scaleTo(1.2, 0.3).scaleTo(1, 0.3);
        this.play(arrow);

        this.wait(0.5);

        // ========== Exit Animation ==========
        // Unwrite everything in reverse order
        arrow.unwrite(0.5);
        this.play(arrow);

        diamond.unwrite(0.6);
        square.unwrite(0.6);
        circle.unwrite(0.6);
        this.play(circle, square, diamond);

        title.unwrite(1).ease(smooth);
        this.play(title);
    }
}


/**
 * EntPro - Pro API Demo
 *
 * Demonstrates the explicit, object-oriented Pro API for full control.
 * Best for: Complex compositions, reusable animations, timeline manipulation.
 */
export class EntPro extends Scene {
    constructor() {
        super({ width: 1920, height: 1080, frameRate: 60 });
        const fontPath = 'assets/fonts/Inter.ttf';

        // ========== Create Mobjects ==========
        const title = new Text("Pro API", fontPath, { fontSize: 1.2 })
            .pos(0, 3)
            .fill(Color.WHITE)
            .stroke(Color.WHITE, 3);
            // .stroke(Color.fromHex('#f59e0b'), 3);

        const mainRectangle = new Rectangle(1)
            .pos(0, 0)
            .fill(Color.fromHex('#0ea5e9'))
            .stroke(Color.WHITE, 3);

        const orbitCircle1 = new Circle(0.3)
            .pos(2, 0)
            .fill(Color.fromHex('#f43f5e'));

        const orbitCircle2 = new Circle(0.3)
            .pos(-2, 0)
            .fill(Color.fromHex('#22c55e'));

        const orbitCircle3 = new Circle(0.3)
            .pos(0, 2)
            .fill(Color.fromHex('#a855f7'));

        // ========== Intro Sequence ==========
        // Write title with explicit animation object
        const writeTitle = new Write(title).duration(1.5).ease(smooth);
        this.play(writeTitle);

        this.wait(0.3);

        // Draw main circle
        const drawMain = new Draw(mainRectangle).duration(1).ease(easeOutBack);
        this.play(drawMain);

        // Fade in orbit circles simultaneously using Parallel
        const fadeInOrbits = new Parallel([
            new FadeIn(orbitCircle1).duration(0.5).ease(easeOutBack),
            new FadeIn(orbitCircle2).duration(0.5).ease(easeOutBack),
            new FadeIn(orbitCircle3).duration(0.5).ease(easeOutBack)
        ]);
        this.play(fadeInOrbits);

        this.wait(0.3);

        // ========== Orbital Animation ==========
        // Rotate orbits around center (using Parallel for simultaneous rotation)
        const orbitAnimation = new Parallel([
            new Rotate(orbitCircle1, Math.PI * 2).duration(2).ease(easeInOutCubic),
            new Rotate(orbitCircle2, -Math.PI * 2).duration(2).ease(easeInOutCubic),
            new Rotate(orbitCircle3, Math.PI).duration(2).ease(easeInOutCubic)
        ]);

        // Scale main circle with elastic bounce
        const pulseMain = new Scale(mainRectangle, 1.3).duration(1).ease(easeOutElastic);

        // Play orbit and pulse together
        this.play(orbitAnimation, pulseMain);

        // Scale back
        const scaleBack = new Scale(mainRectangle, 1 / 1.3).duration(0.5).ease(smooth);
        this.play(scaleBack);

        this.wait(0.3);

        // ========== Complex Sequence ==========
        // Build a reusable animation sequence
        const complexSequence = new Sequence([
            new MoveTo(mainRectangle, 0, -3).duration(2).ease(easeInOutCubic),
            new Parallel([
                new Rotate(mainRectangle, Math.PI).duration(0.8),
                new Scale(mainRectangle, 0.7).duration(0.8)
            ]),
            new MoveTo(mainRectangle, 0, 0).duration(0.5).ease(easeInOutCubic),
            new Scale(mainRectangle, 1 / 0.7).duration(0.3).ease(easeOutBack)
        ]);
        this.play(complexSequence);

        this.wait(0.5);

        // ========== Exit Sequence ==========
        // Fade out orbits
        const fadeOutOrbits = new Parallel([
            new FadeOut(orbitCircle1).duration(0.4),
            new FadeOut(orbitCircle2).duration(0.4),
            new FadeOut(orbitCircle3).duration(0.4)
        ]);
        this.play(fadeOutOrbits);

        // Unwrite main elements
        const exitMain = new Unwrite(mainRectangle).duration(0.8).ease(smooth);
        const exitTitle = new Unwrite(title).duration(1).ease(smooth);

        this.play(exitMain);
        this.play(exitTitle);
    }
}

