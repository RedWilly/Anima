import { Scene } from '../src/core/scene/Scene';
import { Circle } from '../src/mobjects/geometry/Circle';
import { FadeIn, MoveTo } from '../src/core/animations';
import { Vector2 } from '../src/core/math/Vector2/Vector2';


export class SimpleScene extends Scene {
    constructor() {
        super({ width: 480, height: 270, frameRate: 30 });

        const circle = new Circle(1);
        this.add(circle);

        this.play(new FadeIn(circle).duration(1));
        this.play(new MoveTo(circle, new Vector2(2, 0)).duration(1));
    }
}

export class AnotherScene extends Scene {
    constructor() {
        super({ width: 480, height: 270, frameRate: 30 });
    }
}
