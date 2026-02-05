import { Scene, Rectangle, Color, FadeIn, Text, VGroup } from '../src/';

export class Pol extends Scene {
    constructor() {
        super({ width: 1920, height: 1080, frameRate: 60, backgroundColor: Color.TRANSPARENT });

        const rect = new Rectangle(3, 1).pos(0, 0).fill(Color.TRANSPARENT).stroke(Color.WHITE); // or add .write here
        const tx = new Text("Anima", 'assets/fonts/Inter.ttf').pos(0, 0).fill(Color.WHITE).stroke(Color.WHITE, 3);
        this.add(tx)
        rect.write(2)
        this.play(rect);
    }
}

// or
export class Pol1 extends Scene {
    constructor() {
        super({ width: 1920, height: 1080, frameRate: 60, backgroundColor: Color.TRANSPARENT });

        const rect = new Rectangle(3, 1).pos(0, 0).fill(Color.TRANSPARENT).stroke(Color.WHITE);
        const tx = new Text("Anima", 'assets/fonts/Inter.ttf').pos(0, 0).fill(Color.WHITE).stroke(Color.WHITE, 3);

        const group = new VGroup(rect, tx);
        group.draw(2);
        this.play(group);

    }
}