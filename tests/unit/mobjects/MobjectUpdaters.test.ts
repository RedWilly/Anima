import { describe, expect, test } from 'bun:test';
import { Mobject } from '../../../src/core/mobjects/Mobject';
import { Scene } from '../../../src/core/scene';
import type { UpdaterHandle } from '../../../src/core/updaters';

describe('Mobject Updaters', () => {
  test('updater receives deterministic time/dt/frame context', () => {
    const scene = new Scene();
    const mobject = new Mobject();
    scene.add(mobject);

    const calls: Array<{ time: number; dt: number; frame: number; discontinuous: boolean }> = [];
    mobject.addUpdater((_m, ctx) => {
      calls.push({
        time: ctx.time,
        dt: ctx.dt,
        frame: ctx.frame,
        discontinuous: ctx.discontinuous,
      });
    });

    scene.evaluateFrame(0);
    scene.evaluateFrame(0.5);
    scene.evaluateFrame(1);

    expect(calls.length).toBe(3);
    expect(calls[0]).toEqual({ time: 0, dt: 0, frame: 0, discontinuous: true });
    expect(calls[1]).toEqual({ time: 0.5, dt: 0.5, frame: 1, discontinuous: false });
    expect(calls[2]).toEqual({ time: 1, dt: 0.5, frame: 2, discontinuous: false });
  });

  test('backward seeks mark updater context as discontinuous', () => {
    const scene = new Scene();
    const mobject = new Mobject();
    scene.add(mobject);

    const discontinuities: boolean[] = [];
    const deltas: number[] = [];
    mobject.addUpdater((_m, ctx) => {
      discontinuities.push(ctx.discontinuous);
      deltas.push(ctx.dt);
    });

    scene.evaluateFrame(1);
    scene.evaluateFrame(0.25);

    expect(discontinuities).toEqual([true, true]);
    expect(deltas).toEqual([0, 0]);
  });

  test('runs updaters in deterministic priority order then insertion order', () => {
    const scene = new Scene();
    const mobject = new Mobject();
    scene.add(mobject);

    const order: string[] = [];
    mobject.addUpdater(() => order.push('same-priority-first'));
    mobject.addUpdater(() => order.push('high-priority'), { priority: 10 });
    mobject.addUpdater(() => order.push('same-priority-second'));

    scene.evaluateFrame(0);

    expect(order).toEqual([
      'high-priority',
      'same-priority-first',
      'same-priority-second',
    ]);
  });

  test('runs parent updaters before child updaters', () => {
    const scene = new Scene();
    const parent = new Mobject();
    const child = new Mobject();
    parent.addSubmobjects(child);
    scene.add(parent);

    const order: string[] = [];
    parent.addUpdater(() => order.push('parent'));
    child.addUpdater(() => order.push('child'));

    scene.evaluateFrame(0);

    expect(order).toEqual(['parent', 'child']);
  });

  test('mutating updater list during execution is safe and applies next frame', () => {
    const scene = new Scene();
    const mobject = new Mobject();
    scene.add(mobject);

    const events: string[] = [];
    let firstHandle: UpdaterHandle;
    const second = () => {
      events.push('second');
    };

    firstHandle = mobject.addUpdater((mob) => {
      events.push('first');
      mob.removeUpdater(firstHandle);
      mob.addUpdater(second);
    });

    scene.evaluateFrame(0);
    expect(events).toEqual(['first']);

    scene.evaluateFrame(1);
    expect(events).toEqual(['first', 'second']);
  });

  test('supports suspending and resuming all updaters on a mobject', () => {
    const scene = new Scene();
    const mobject = new Mobject();
    scene.add(mobject);

    let count = 0;
    mobject.addUpdater(() => {
      count += 1;
    });

    mobject.suspendUpdaters();
    scene.evaluateFrame(0);
    expect(count).toBe(0);

    mobject.resumeUpdaters();
    scene.evaluateFrame(1);
    expect(count).toBe(1);
  });
});

