import { describe, expect, test } from 'bun:test';
import { Scene } from '../../../../src/core/scene';
import { Mobject } from '../../../../src/core/mobjects/Mobject';
import { MoveTo } from '../../../../src/core/animations';

describe('Scene Updater Integration', () => {
  test('evaluates animations before updaters in each frame', () => {
    const scene = new Scene();
    const mobject = new Mobject();
    scene.add(mobject);
    scene.play(new MoveTo(mobject, 10, 0).duration(1));

    const seenX: number[] = [];
    mobject.addUpdater((mob) => {
      seenX.push(mob.position.x);
    });

    scene.evaluateFrame(0.5);

    expect(seenX.length).toBe(1);
    expect(seenX[0]).toBeCloseTo(5, 5);
  });

  test('reports active updaters across scene objects and camera frame', () => {
    const scene = new Scene();
    const mobject = new Mobject();
    scene.add(mobject);

    expect(scene.hasActiveUpdaters()).toBe(false);

    mobject.addUpdater(() => {
      // no-op
    });
    expect(scene.hasActiveUpdaters()).toBe(true);

    mobject.clearUpdaters();
    expect(scene.hasActiveUpdaters()).toBe(false);

    scene.frame.addUpdater(() => {
      // no-op
    });
    expect(scene.hasActiveUpdaters()).toBe(true);
  });
});

