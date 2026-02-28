import { describe, it, expect } from 'bun:test';
import { Scene } from '../../../../src/core/scene/Scene';
import { Circle } from '../../../../src/core/mobjects/geometry/Circle';
import { Rectangle } from '../../../../src/core/mobjects/geometry/Rectangle';
import { VGroup } from '../../../../src/core/mobjects/VGroup/VGroup';
import { Color } from '../../../../src/core/math/color/Color';
import { Draw } from '../../../../src/core/animations/draw/Draw';
import { Write } from '../../../../src/core/animations/draw/Write';

describe('Draw/Write style persistence', () => {
    it('completed Draw should not overwrite later style mutations during timeline replay', () => {
        const scene = new Scene();
        const circle = new Circle(0.5).fill(Color.RED).stroke(Color.WHITE, 3);

        scene.play(circle.draw(1));
        scene.getTimeline().seek(1);

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

    it('Draw should apply captured final style when progress jumps directly to 1', () => {
        const circle = new Circle(0.5).fill(Color.RED, 0.8).stroke(Color.WHITE, 3);
        const draw = new Draw(circle);

        // Mutate style after construction to prove interpolate(1) restores captured final style.
        circle.fill(Color.BLUE, 0.2).stroke(Color.BLACK, 1);

        draw.interpolate(1);

        expect(circle.getFillColor().r).toBeCloseTo(Color.RED.r, 5);
        expect(circle.getFillColor().g).toBeCloseTo(Color.RED.g, 5);
        expect(circle.getFillColor().b).toBeCloseTo(Color.RED.b, 5);
        expect(circle.getFillOpacity()).toBeCloseTo(0.8, 5);
        expect(circle.getStrokeColor().r).toBeCloseTo(Color.WHITE.r, 5);
        expect(circle.getStrokeColor().g).toBeCloseTo(Color.WHITE.g, 5);
        expect(circle.getStrokeColor().b).toBeCloseTo(Color.WHITE.b, 5);
        expect(circle.getStrokeWidth()).toBeCloseTo(3, 5);
    });

    it('Write should apply captured final style when progress jumps directly to 1', () => {
        const circle = new Circle(0.5).fill(Color.RED, 0.8).stroke(Color.WHITE, 3);
        const write = new Write(circle);

        // Mutate style after construction to prove interpolate(1) restores captured final style.
        circle.fill(Color.BLUE, 0.2).stroke(Color.BLACK, 1);

        write.interpolate(1);

        expect(circle.getFillColor().r).toBeCloseTo(Color.RED.r, 5);
        expect(circle.getFillColor().g).toBeCloseTo(Color.RED.g, 5);
        expect(circle.getFillColor().b).toBeCloseTo(Color.RED.b, 5);
        expect(circle.getFillOpacity()).toBeCloseTo(0.8, 5);
        expect(circle.getStrokeColor().r).toBeCloseTo(Color.WHITE.r, 5);
        expect(circle.getStrokeColor().g).toBeCloseTo(Color.WHITE.g, 5);
        expect(circle.getStrokeColor().b).toBeCloseTo(Color.WHITE.b, 5);
        expect(circle.getStrokeWidth()).toBeCloseTo(3, 5);
    });

    it('Draw should finalize fill for every child in VGroup at progress 1', () => {
        const childA = new Circle(0.3).fill(Color.YELLOW, 0.9).stroke(Color.WHITE, 2);
        const childB = new Rectangle(0.6, 0.4).fill(Color.RED, 0.7).stroke(Color.WHITE, 2);
        const group = new VGroup(childA, childB);
        const draw = new Draw(group);

        draw.interpolate(0.99);
        draw.interpolate(1);

        expect(childA.getFillOpacity()).toBeCloseTo(0.9, 5);
        expect(childB.getFillOpacity()).toBeCloseTo(0.7, 5);
    });
});
