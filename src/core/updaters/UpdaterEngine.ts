import type { Mobject } from '../mobjects';
import type { Scene } from '../scene';
import type { UpdaterContext } from './types';

/**
 * Executes mobject updaters in a deterministic order for each scene frame.
 */
export class UpdaterEngine {
  private lastTime: number | null = null;
  private frame = 0;

  reset(): void {
    this.lastTime = null;
    this.frame = 0;
  }

  run(scene: Scene, roots: readonly Mobject[], time: number): void {
    const clampedTime = Math.max(0, time);
    const rawDelta = this.lastTime === null ? 0 : clampedTime - this.lastTime;
    const discontinuous = this.lastTime === null || rawDelta < 0;
    const dt = discontinuous ? 0 : rawDelta;

    const ctx: UpdaterContext = {
      time: clampedTime,
      dt,
      frame: this.frame,
      scene,
      discontinuous,
    };

    const visited = new Set<Mobject>();
    for (const root of roots) {
      this.runMobjectTree(root, ctx, visited);
    }

    this.lastTime = clampedTime;
    this.frame += 1;
  }

  private runMobjectTree(
    mobject: Mobject,
    ctx: UpdaterContext,
    visited: Set<Mobject>,
  ): void {
    if (visited.has(mobject)) {
      return;
    }
    visited.add(mobject);

    const updaters = mobject.getUpdaterRecordsSnapshot();
    for (const updater of updaters) {
      updater.fn(mobject, ctx);
    }

    const children = mobject.getSubmobjects();
    for (const child of children) {
      this.runMobjectTree(child, ctx, visited);
    }
  }
}

