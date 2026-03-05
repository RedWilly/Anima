import type { Mobject } from '../mobjects';
import type { Scene } from '../scene';

/**
 * Context provided to updater functions on each frame evaluation.
 */
interface UpdaterContext {
  /** Absolute scene time in seconds. */
  readonly time: number;
  /** Time delta from previous evaluated frame (seconds). */
  readonly dt: number;
  /** Monotonic frame index produced by the updater engine. */
  readonly frame: number;
  /** The scene currently being evaluated. */
  readonly scene: Scene;
  /**
   * True when evaluation is discontinuous (first frame or backward seek).
   * Updaters using integrators can use this to reset internal accumulators.
   */
  readonly discontinuous: boolean;
}

/**
 * A function that mutates a mobject every evaluated frame.
 */
type UpdaterFunction<T extends Mobject = Mobject> = (
  mobject: T,
  context: UpdaterContext,
) => void;

/**
 * Public options accepted by Mobject.addUpdater.
 */
interface UpdaterOptions {
  /**
   * Higher priority runs first. Default: 0.
   * Ties are resolved by insertion order.
   */
  priority?: number;
  /** Whether this updater starts enabled. Default: true. */
  enabled?: boolean;
  /** Optional descriptive label for debugging/introspection. */
  name?: string;
}

/**
 * Opaque handle returned from addUpdater for later removal/toggling.
 */
interface UpdaterHandle {
  readonly id: number;
}

/**
 * Internal normalized representation stored by each mobject.
 */
interface MobjectUpdaterRecord {
  readonly id: number;
  readonly order: number;
  readonly name?: string;
  readonly fn: UpdaterFunction<Mobject>;
  priority: number;
  enabled: boolean;
}

export type {
  MobjectUpdaterRecord,
  UpdaterContext,
  UpdaterFunction,
  UpdaterHandle,
  UpdaterOptions,
};

