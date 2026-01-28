import { Scene } from '../src/core/scene/Scene';
import { Rectangle } from '../src/mobjects/geometry/Rectangle';
import { MoveTo } from '../src/core/animations/transform/MoveTo';
import { Rotate } from '../src/core/animations/transform/Rotate';
import { Scale } from '../src/core/animations/transform/Scale';
import { Sequence } from '../src/core/animations/composition/Sequence';
import { Parallel } from '../src/core/animations/composition/Parallel';
import { easeInOutCubic, easeOutBack } from '../src/core/animations/easing/standard';
import { Color } from '../src/core/math/color/Color';

export class ComplexSequenceScene extends Scene {
    constructor() {
        super({
            width: 1080,
            height: 720,
            backgroundColor: Color.BLACK,
            frameRate: 60
        });
        // Create a main rectangle with red stroke and blue fill
        const mainRectangle = new Rectangle(2, 1)
            .pos(0, 0)
            .stroke(Color.RED, 3)
            .fill(Color.BLUE, 0.5);

        this.add(mainRectangle);

        // Create a complex nested animation sequence
        const complexSequence = new Sequence([
            // Move the rectangle down with ease
            new MoveTo(mainRectangle, 0, -3).duration(2).ease(easeInOutCubic),
            
            // Rotate and scale simultaneously
            new Parallel([
                new Rotate(mainRectangle, Math.PI).duration(0.8),
                new Scale(mainRectangle, 0.7).duration(0.8)
            ]),
            
            // Move the rectangle back up with ease
            new MoveTo(mainRectangle, 0, 0).duration(0.5).ease(easeInOutCubic),
            
            // Scale back to original size with a bounce effect
            new Scale(mainRectangle, 1 ).duration(0.3).ease(easeOutBack)
        ]);

        // Play the complex sequence
        this.play(complexSequence);
    }
}

// Run the scene directly if this file is executed
if (import.meta.main) {
    async function run(): Promise<void> {
        const scene = new ComplexSequenceScene();
        
        console.log('Animation sequence created!');
        console.log('Use `bun run render examples/ComplexSequenceScene.ts` to render it');
    }

    run().catch(console.error);
}
