import { Scene, Rectangle, Color, FadeIn, Text, VGroup, Circle, Parallel, Rotate, MoveTo, Line, Arrow } from '../src/';

export class Pol extends Scene {
    constructor() {
        super({ width: 1920, height: 1080, frameRate: 30, backgroundColor: Color.TRANSPARENT });

        const rect = new Rectangle(3, 1).pos(0, 0).fill(Color.TRANSPARENT).stroke(Color.WHITE, 3); // or add .write here
        const tx = new Text("Anima", 'assets/fonts/ComicSansMS3.ttf').pos(0, 0).fill(Color.WHITE).stroke(Color.WHITE, 3);
        this.add(tx)
        rect.write(2).delay(0.5)
        this.play(rect);
    }
}

// or
export class Pol1 extends Scene {
    constructor() {
        super({ width: 1920, height: 1080, frameRate: 60, backgroundColor: Color.TRANSPARENT });

        const rect = new Rectangle(3, 1).pos(0, 0).fill(Color.TRANSPARENT).stroke(Color.WHITE);
        const tx = new Text("Anima", 'assets/fonts/ComicSansMS3.ttf').pos(0, 0).fill(Color.WHITE).stroke(Color.WHITE, 3);
        const circle = new Circle(0.4).pos(-3, 0).fill(Color.RED);

        const group = new VGroup(rect, tx);
        group.draw(2);
        this.play(group);

        circle.fadeIn(0.5).moveTo(0, 1, 1);

        this.play(circle);
        new FadeIn(rect).duration(0.5),
            new Parallel([
                new Rotate(rect, Math.PI / 2).duration(1),
                new MoveTo(rect, -1, 0).duration(1)
            ])
        this.play()

    }
}

export class Poll extends Scene {
    constructor() {
        super({ width: 1920, height: 1080, frameRate: 20, backgroundColor: Color.TRANSPARENT });

        const rect = new Rectangle(3, 1).pos(0, 0).fill(Color.TRANSPARENT).stroke(Color.WHITE, 3); // or add .write here
        const tx = new Text("Anima").pos(0, 0).stroke(Color.WHITE, 3).fill(Color.BLUE);
        const circle = new Circle(0.4).pos(-3, 0).fill(Color.RED).stroke(Color.WHITE, 3);

        const group = new VGroup(rect, tx, circle).draw(2);
        this.play(group);
        // moving the circle in the group to a new position
        //need more info on how group works see skills/rules/vgroup.md
        circle.moveTo(0, 1, 1);
        this.play(circle);

        group.moveTo(0, -0.5);
        this.play(group);

        // moving the circle along the group edge
        // need to use the group position and circle position to calculate the offset
        // circle.moveAlong(group.position, group.rotation, 1);
        // this.play(circle);

        //at the top of the page
        const line = new Arrow(-3, 0, 3, 0).pos(0, 2.8).fill(Color.WHITE).stroke(Color.WHITE, 3);
        this.play(line.draw(1));

        const tx2 = new Text("stroke").pos(0, 0).stroke(Color.WHITE, 1).pos(0, 2);
        this.play(tx2.write(1));


    }
}