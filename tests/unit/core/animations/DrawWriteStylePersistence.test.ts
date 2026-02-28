import { describe, it, expect } from 'bun:test';
import { Scene } from '../../../../src/core/scene/Scene';
import { Circle } from '../../../../src/core/mobjects/geometry/Circle';
import { Color } from '../../../../src/core/math/color/Color';

describe('Draw/Write style persistence', () => {
    it('completed Draw should not overwrite later style mutations during timeline replay', () => {
        const scene = new Scene();
        const circle = new Circle(0.5).fill(Color.RED).stroke(Color.WHITE, 3);

        scene.play(circle.draw(1));

        // User applies style changes after draw completes.
        circle.fill(Color.YELLOW).stroke(Color.BLACK, 2);

        // Force replay at a later time, which previously re-applied Draw's captured style.
        scene.wait(0.5);
        scene.getTimeline().seek(1.25);

        expect(circle.getFillColor().r).toBeCloseTo(Color.YELLOW.r, 5);
        expect(circle.getFillColor().g).toBeCloseTo(Color.YELLOW.g, 5);
        expect(circle.getFillColor().b).toBeCloseTo(Color.YELLOW.b, 5);
        expect(circle.getStrokeColor().r).toBeCloseTo(Color.BLACK.r, 5);
        expect(circle.getStrokeColor().g).toBeCloseTo(Color.BLACK.g, 5);
        expect(circle.getStrokeColor().b).toBeCloseTo(Color.BLACK.b, 5);
    });
});
