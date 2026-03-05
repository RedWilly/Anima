import { hashFloat32Array, hashNumber, hashCompose } from '../cache';
import { Matrix4x4, Vector } from '../math';
import type {
  MobjectUpdaterRecord,
  UpdaterFunction,
  UpdaterHandle,
  UpdaterOptions,
} from '../updaters';
import {
  Animation,
  type EasingFunction,
  createFadeIn,
  createFadeOut,
  createMoveTo,
  createRotate,
  createScale,
  createParallel,
  createSequence,
  type QueueEntry,
  isPrebuilt,
} from '../animations/mobjectApi';

/**
 * Manages a queue of animations for fluent chaining.
 * This is an internal implementation detail of Mobject's fluent API.
 */
class AnimationQueue {
  private readonly target: Mobject;
  private readonly queue: QueueEntry[] = [];

  constructor(target: Mobject) {
    this.target = target;
  }

  enqueueAnimation(animation: Animation<Mobject>): void {
    this.queue.push({ animation });
  }

  setLastDuration(seconds: number): void {
    if (seconds <= 0) {
      throw new Error('Duration must be positive');
    }

    const last = this.queue[this.queue.length - 1];
    if (!last) return;

    if (isPrebuilt(last)) {
      last.animation.duration(seconds);
    } else {
      last.config.durationSeconds = seconds;
    }
  }

  setLastEasing(easing: EasingFunction): void {
    const last = this.queue[this.queue.length - 1];
    if (!last) return;

    if (isPrebuilt(last)) {
      last.animation.ease(easing);
    } else {
      last.config.easing = easing;
    }
  }

  setLastDelay(seconds: number): void {
    if (seconds < 0) {
      throw new Error('Delay must be non-negative');
    }

    const last = this.queue[this.queue.length - 1];
    if (!last) return;

    if (isPrebuilt(last)) {
      last.animation.delay(seconds);
    } else {
      last.config.delaySeconds = seconds;
    }
  }

  isEmpty(): boolean {
    return this.queue.length === 0;
  }

  popLastAnimation(): Animation<Mobject> | null {
    const last = this.queue.pop();
    if (!last) return null;

    if (isPrebuilt(last)) {
      return last.animation;
    }

    const anim = last.factory(this.target);
    anim.duration(last.config.durationSeconds);
    if (last.config.easing) {
      anim.ease(last.config.easing);
    }
    if (last.config.delaySeconds !== undefined) {
      anim.delay(last.config.delaySeconds);
    }
    return anim;
  }

  toAnimation(): Animation<Mobject> {
    if (this.queue.length === 0) {
      throw new Error('toAnimation() called with an empty animation queue.');
    }

    const animations: Array<Animation<Mobject>> = [];

    for (const entry of this.queue) {
      if (isPrebuilt(entry)) {
        animations.push(entry.animation);
      } else {
        const anim = entry.factory(this.target);
        anim.duration(entry.config.durationSeconds);

        if (entry.config.easing) {
          anim.ease(entry.config.easing);
        }

        if (entry.config.delaySeconds !== undefined) {
          anim.delay(entry.config.delaySeconds);
        }

        animations.push(anim);
      }
    }

    this.queue.length = 0;

    if (animations.length === 1 && animations[0]) {
      return animations[0];
    }

    return createSequence(animations);
  }

  getTotalDuration(): number {
    let total = 0;
    for (const entry of this.queue) {
      if (isPrebuilt(entry)) {
        total += entry.animation.getDuration() + entry.animation.getDelay();
      } else {
        total += entry.config.durationSeconds;
        if (entry.config.delaySeconds !== undefined) {
          total += entry.config.delaySeconds;
        }
      }
    }
    return total;
  }
}

interface MobjectState {
  position: Vector;
  scale: Vector;
  rotation: number;
}

/**
 * Base class for all mathematical objects.
 * Manages position, rotation, scale, and opacity via a local transformation matrix.
 * Includes fluent animation API for chainable animations.
 */
export class Mobject {
  protected localMatrix: Matrix4x4;
  protected opacityValue: number;
  protected animQueue: AnimationQueue | null = null;
  protected pointCloud: Vector[] = [];
  protected submobjects: Mobject[] = [];
  private savedStates: MobjectState[] = [];
  private logicalRotation = 0;
  private logicalScale = new Vector(1, 1);
  private updaters: MobjectUpdaterRecord[] = [];
  private nextUpdaterId = 1;
  private nextUpdaterOrder = 0;
  private updatersEnabled = true;

  parent: Mobject | null = null;

  constructor() {
    this.localMatrix = Matrix4x4.identity();
    this.opacityValue = 0;
  }

  protected getQueue(): AnimationQueue {
    if (!this.animQueue) {
      this.animQueue = new AnimationQueue(this);
    }
    return this.animQueue;
  }

  // ========== Transform Properties ==========

  get matrix(): Matrix4x4 {
    return this.localMatrix;
  }

  getWorldMatrix(): Matrix4x4 {
    if (this.usesGeometryTransforms()) {
      // Geometry-backed mobjects keep points in world space, so localMatrix
      // already represents their effective world transform.
      return this.localMatrix;
    }

    if (this.parent === null) {
      return this.localMatrix;
    }
    return this.parent.getWorldMatrix().multiply(this.localMatrix);
  }

  /**
   * Matrix used by renderer.
   * Geometry-driven mobjects bake their own transform into points,
   * so only ancestor matrix transforms should be applied at draw time.
   */
  getRenderMatrix(): Matrix4x4 {
    if (this.usesGeometryTransforms()) {
      if (this.parent === null) {
        return Matrix4x4.identity();
      }
      return this.parent.getRenderMatrix();
    }

    if (this.parent === null) {
      return this.localMatrix;
    }
    return this.parent.getRenderMatrix().multiply(this.localMatrix);
  }

  get position(): Vector {
    if (this.usesGeometryTransforms()) {
      const center = this.getGeometryCenter();
      if (center) {
        return center;
      }
    }
    const m = this.localMatrix.values;
    return new Vector(m[3]!, m[7]!, m[11]!);
  }

  get rotation(): number {
    if (this.usesGeometryTransforms()) {
      return this.logicalRotation;
    }
    const m = this.localMatrix.values;
    return Math.atan2(m[4]!, m[0]!);
  }

  get scale(): Vector {
    if (this.usesGeometryTransforms()) {
      return this.logicalScale;
    }
    const m = this.localMatrix.values;
    const sx = Math.sqrt(m[0]! * m[0]! + m[4]! * m[4]!);
    const sy = Math.sqrt(m[1]! * m[1]! + m[5]! * m[5]!);
    return new Vector(sx, sy);
  }

  get opacity(): number {
    return this.opacityValue;
  }

  // ========== Immediate State Setters ==========

  pos(x: number, y: number, z?: number): this {
    const targetZ = z ?? this.position.z;

    if (this.usesGeometryTransforms()) {
      const current = this.position;
      const dx = x - current.x;
      const dy = y - current.y;
      const dz = targetZ - current.z;
      if (Math.abs(dx) > 1e-12 || Math.abs(dy) > 1e-12 || Math.abs(dz) > 1e-12) {
        this.applyMatrix(Matrix4x4.translation(dx, dy, dz));
      }
      return this;
    }

    const newValues = new Float32Array(this.localMatrix.values);
    newValues[3] = x;
    newValues[7] = y;
    newValues[11] = targetZ;
    this.setLocalMatrix(new Matrix4x4(newValues));
    return this;
  }

  show(): this {
    this.opacityValue = 1;
    return this;
  }

  hide(): this {
    this.opacityValue = 0;
    return this;
  }

  setOpacity(value: number): this {
    this.opacityValue = Math.max(0, Math.min(1, value));
    return this;
  }

  setRotation(angle: number): this {
    if (this.usesGeometryTransforms()) {
      const delta = angle - this.logicalRotation;
      if (Math.abs(delta) < 1e-12) {
        return this;
      }

      const pivot = this.position;
      const transform = Matrix4x4.translation(pivot.x, pivot.y, pivot.z)
        .multiply(Matrix4x4.rotationZ(delta))
        .multiply(Matrix4x4.translation(-pivot.x, -pivot.y, -pivot.z));

      this.applyMatrix(transform);
      this.logicalRotation = angle;
      this.syncLocalMatrixFromGeometry();
      return this;
    }

    const m = this.localMatrix.values;
    const posX = m[3]!;
    const posY = m[7]!;
    const posZ = m[11]!;
    const currentScale = this.scale;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const newValues = new Float32Array(16);
    newValues[0] = cos * currentScale.x;
    newValues[1] = -sin * currentScale.y;
    newValues[3] = posX;
    newValues[4] = sin * currentScale.x;
    newValues[5] = cos * currentScale.y;
    newValues[7] = posY;
    newValues[10] = 1;
    newValues[11] = posZ;
    newValues[15] = 1;
    this.setLocalMatrix(new Matrix4x4(newValues));
    return this;
  }

  setScale(sx: number, sy: number): this {
    if (this.usesGeometryTransforms()) {
      const current = this.logicalScale;
      const deltaX = current.x === 0 ? sx : sx / current.x;
      const deltaY = current.y === 0 ? sy : sy / current.y;
      if (Math.abs(deltaX - 1) < 1e-12 && Math.abs(deltaY - 1) < 1e-12) {
        return this;
      }

      const pivot = this.position;
      const transform = Matrix4x4.translation(pivot.x, pivot.y, pivot.z)
        .multiply(Matrix4x4.scale(deltaX, deltaY, 1))
        .multiply(Matrix4x4.translation(-pivot.x, -pivot.y, -pivot.z));

      this.applyMatrix(transform);
      this.logicalScale = new Vector(sx, sy);
      this.syncLocalMatrixFromGeometry();
      return this;
    }

    const m = this.localMatrix.values;
    const posX = m[3]!;
    const posY = m[7]!;
    const posZ = m[11]!;
    const currentRotation = this.rotation;
    const cos = Math.cos(currentRotation);
    const sin = Math.sin(currentRotation);
    const newValues = new Float32Array(16);
    newValues[0] = cos * sx;
    newValues[1] = -sin * sy;
    newValues[3] = posX;
    newValues[4] = sin * sx;
    newValues[5] = cos * sy;
    newValues[7] = posY;
    newValues[10] = 1;
    newValues[11] = posZ;
    newValues[15] = 1;
    this.setLocalMatrix(new Matrix4x4(newValues));
    return this;
  }

  applyMatrix(m: Matrix4x4): this {
    if (this.usesGeometryTransforms()) {
      this.applyMatrixToOwnGeometry(m);
      for (const child of this.submobjects) {
        child.applyMatrix(m);
      }

      this.updateLogicalStateFromMatrix(m);
      this.syncLocalMatrixFromGeometry();
      return this;
    }

    this.setLocalMatrix(m.multiply(this.localMatrix));
    return this;
  }

  // ========== Scene Graph / Geometry Primitives ==========

  addSubmobjects(...mobjects: Mobject[]): this {
    for (const mob of mobjects) {
      if (mob === this) continue;
      if (this.submobjects.includes(mob)) continue;

      if (mob.parent) {
        mob.parent.removeSubmobject(mob);
      }

      mob.parent = this;
      this.submobjects.push(mob);
    }
    this.syncLocalMatrixFromGeometry();
    return this;
  }

  removeSubmobject(mobject: Mobject): this {
    const index = this.submobjects.indexOf(mobject);
    if (index >= 0) {
      this.submobjects.splice(index, 1);
      mobject.parent = null;
    }
    this.syncLocalMatrixFromGeometry();
    return this;
  }

  clearSubmobjects(): this {
    for (const child of this.submobjects) {
      child.parent = null;
    }
    this.submobjects = [];
    this.syncLocalMatrixFromGeometry();
    return this;
  }

  getSubmobjects(): Mobject[] {
    return [...this.submobjects];
  }

  // ========== Updaters ==========

  addUpdater(fn: UpdaterFunction<this>, options: UpdaterOptions = {}): UpdaterHandle {
    if (typeof fn !== 'function') {
      throw new Error('addUpdater() requires a function');
    }

    const priority = options.priority ?? 0;
    if (!Number.isFinite(priority)) {
      throw new Error('Updater priority must be a finite number');
    }

    const record: MobjectUpdaterRecord = {
      id: this.nextUpdaterId++,
      order: this.nextUpdaterOrder++,
      name: options.name,
      fn: fn as UpdaterFunction<Mobject>,
      priority,
      enabled: options.enabled ?? true,
    };

    this.updaters.push(record);
    return { id: record.id };
  }

  removeUpdater(handleOrFn: UpdaterHandle | UpdaterFunction<this>): this {
    if (typeof handleOrFn === 'function') {
      const fn = handleOrFn as UpdaterFunction<Mobject>;
      this.updaters = this.updaters.filter((u) => u.fn !== fn);
      return this;
    }

    this.updaters = this.updaters.filter((u) => u.id !== handleOrFn.id);
    return this;
  }

  clearUpdaters(): this {
    this.updaters = [];
    return this;
  }

  suspendUpdaters(): this {
    this.updatersEnabled = false;
    return this;
  }

  resumeUpdaters(): this {
    this.updatersEnabled = true;
    return this;
  }

  enableUpdater(handleOrFn: UpdaterHandle | UpdaterFunction<this>): this {
    this.setUpdaterEnabled(handleOrFn, true);
    return this;
  }

  disableUpdater(handleOrFn: UpdaterHandle | UpdaterFunction<this>): this {
    this.setUpdaterEnabled(handleOrFn, false);
    return this;
  }

  hasActiveUpdaters(recursive = false): boolean {
    if (this.updatersEnabled && this.updaters.some((u) => u.enabled)) {
      return true;
    }

    if (!recursive) {
      return false;
    }

    return this.submobjects.some((child) => child.hasActiveUpdaters(true));
  }

  /**
   * Internal API used by UpdaterEngine.
   * Returns a deterministic snapshot for current-frame execution.
   */
  getUpdaterRecordsSnapshot(): MobjectUpdaterRecord[] {
    if (!this.updatersEnabled) {
      return [];
    }

    const active = this.updaters.filter((u) => u.enabled);
    active.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      return a.order - b.order;
    });

    return active.map((u) => ({ ...u }));
  }

  private setUpdaterEnabled(
    handleOrFn: UpdaterHandle | UpdaterFunction<this>,
    enabled: boolean,
  ): void {
    if (typeof handleOrFn === 'function') {
      const fn = handleOrFn as UpdaterFunction<Mobject>;
      for (const updater of this.updaters) {
        if (updater.fn === fn) {
          updater.enabled = enabled;
        }
      }
      return;
    }

    for (const updater of this.updaters) {
      if (updater.id === handleOrFn.id) {
        updater.enabled = enabled;
      }
    }
  }

  protected setPointCloud(points: Array<Vector>): void {
    this.pointCloud = points.map((p) =>
      p instanceof Vector ? new Vector(p.x, p.y, p.z) : Vector.fromPlanar(p, 0),
    );
    this.syncLocalMatrixFromGeometry();
  }

  protected getPointCloud(): Vector[] {
    return this.pointCloud.map((p) => new Vector(p.x, p.y, p.z));
  }

  // ========== State Save/Restore ==========

  saveState(): this {
    const pos = this.position;
    const scl = this.scale;
    this.savedStates.push({
      position: new Vector(pos.x, pos.y, pos.z),
      scale: new Vector(scl.x, scl.y),
      rotation: this.rotation,
    });
    return this;
  }

  getSavedState(): MobjectState | undefined {
    return this.savedStates[this.savedStates.length - 1];
  }

  clearSavedStates(): this {
    this.savedStates = [];
    return this;
  }

  /**
   * Animates back to the last saved state.
   * Pops the saved state from the stack.
   * @throws Error if no state was previously saved
   */
  restore(durationSeconds?: number): this & { toAnimation(): Animation<Mobject> } {
    const state = this.savedStates.pop();
    if (!state) {
      throw new Error('restore() called but no state was saved. Call saveState() first.');
    }

    const moveAnim = createMoveTo(this, state.position, durationSeconds);
    const scaleAnim = createScale(this, state.scale.x, state.scale.y, durationSeconds);
    const rotateAnim = createRotate(this, state.rotation - this.rotation, durationSeconds);
    const parallelAnim = createParallel([moveAnim, scaleAnim, rotateAnim]);
    this.getQueue().enqueueAnimation(parallelAnim);
    return this;
  }

  // ========== Fluent Animation API ==========

  // ========== Unified Fluent Animation API ==========
  // These methods work for both sequential chaining AND parallel usage

  fadeIn(durationSeconds?: number): this & { toAnimation(): Animation<Mobject> } {
    const animation = createFadeIn(this, durationSeconds);
    this.getQueue().enqueueAnimation(animation);
    return this;
  }

  fadeOut(durationSeconds?: number): this & { toAnimation(): Animation<Mobject> } {
    const animation = createFadeOut(this, durationSeconds);
    this.getQueue().enqueueAnimation(animation);
    return this;
  }

  moveTo(destination: Vector, durationSeconds?: number): this & { toAnimation(): Animation<Mobject> };
  moveTo(x: number, y: number, durationSeconds?: number): this & { toAnimation(): Animation<Mobject> };
  moveTo(x: number, y: number, z: number, durationSeconds?: number): this & { toAnimation(): Animation<Mobject> };
  moveTo(
    xOrDestination: number | Vector,
    yOrDuration?: number,
    zOrDuration?: number,
    durationSeconds?: number
  ): this & { toAnimation(): Animation<Mobject> } {
    let animation: Animation<Mobject>;

    if (typeof xOrDestination !== 'number') {
      animation = createMoveTo(this, xOrDestination, yOrDuration);
    } else {
      const x = xOrDestination;
      const y = yOrDuration ?? 0;

      if (durationSeconds !== undefined) {
        const z = zOrDuration ?? this.position.z;
        animation = createMoveTo(this, new Vector(x, y, z), durationSeconds);
      } else {
        animation = createMoveTo(this, x, y, zOrDuration);
      }
    }

    this.getQueue().enqueueAnimation(animation);
    return this;
  }

  rotate(angle: number, durationSeconds?: number): this & { toAnimation(): Animation<Mobject> } {
    const animation = createRotate(this, angle, durationSeconds);
    this.getQueue().enqueueAnimation(animation);
    return this;
  }

  scaleTo(factor: number, durationSeconds?: number): this & { toAnimation(): Animation<Mobject> } {
    const animation = createScale(this, factor, factor, durationSeconds);
    this.getQueue().enqueueAnimation(animation);
    return this;
  }

  scaleToXY(
    factorX: number,
    factorY: number,
    durationSeconds?: number
  ): this & { toAnimation(): Animation<Mobject> } {
    const animation = createScale(this, factorX, factorY, durationSeconds);
    this.getQueue().enqueueAnimation(animation);
    return this;
  }

  duration(seconds: number): this {
    this.getQueue().setLastDuration(seconds);
    return this;
  }

  ease(easing: EasingFunction): this {
    this.getQueue().setLastEasing(easing);
    return this;
  }

  delay(seconds: number): this {
    this.getQueue().setLastDelay(seconds);
    return this;
  }

  toAnimation(): Animation<Mobject> {
    return this.getQueue().toAnimation();
  }

  getQueuedDuration(): number {
    return this.getQueue().getTotalDuration();
  }

  hasQueuedAnimations(): boolean {
    return !this.getQueue().isEmpty();
  }

  /**
   * Queues multiple animations to run in parallel (simultaneously).
   * Automatically handles both Animation objects and mobject method calls.
   * @example
   * circle.fadeIn(1).parallel(
   *     circle.moveTo(100, 50),
   *     circle.rotate(Math.PI)
   * ).fadeOut(1);
   */
  parallel(...items: (Animation<Mobject> | Mobject)[]): this {
    if (items.length === 0) {
      return this;
    }

    // Convert any mobjects to animations by extracting and removing their last queued animation
    const animations = items.map(item => {
      if (item instanceof Animation) {
        return item;
      } else {
        // item is a Mobject - pop its last queued animation (removes it to avoid double-counting)
        const anim = item.getQueue().popLastAnimation();
        if (!anim) {
          throw new Error('No animation found on mobject for parallel execution');
        }
        return anim;
      }
    });

    this.getQueue().enqueueAnimation(createParallel(animations));
    return this;
  }

  /**
   * Computes a CRC32 hash of this mobject's full state.
   * Used by the segment cache to detect changes.
   */
  computeHash(): number {
    const pointData = new Float32Array(this.pointCloud.length * 3);
    for (let i = 0; i < this.pointCloud.length; i++) {
      const p = this.pointCloud[i]!;
      pointData[i * 3] = p.x;
      pointData[i * 3 + 1] = p.y;
      pointData[i * 3 + 2] = p.z;
    }

    const childHashes = this.submobjects.map((child) => child.computeHash());

    return hashCompose(
      hashFloat32Array(this.localMatrix.values),
      hashNumber(this.opacityValue),
      hashFloat32Array(pointData),
      ...childHashes,
    );
  }

  protected applyMatrixToOwnGeometry(m: Matrix4x4): void {
    if (this.pointCloud.length === 0) return;
    this.pointCloud = this.pointCloud.map((point) => m.transformPoint(point));
  }

  protected usesGeometryTransforms(): boolean {
    return this.pointCloud.length > 0 || this.submobjects.length > 0;
  }

  private collectGeometryPoints(out: Vector[]): void {
    out.push(...this.pointCloud);
    for (const child of this.submobjects) {
      child.collectGeometryPoints(out);
    }
  }

  private getGeometryCenter(): Vector | null {
    const points: Vector[] = [];
    this.collectGeometryPoints(points);
    if (points.length === 0) {
      return null;
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    let minZ = Infinity;
    let maxZ = -Infinity;

    for (const p of points) {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
      if (p.z < minZ) minZ = p.z;
      if (p.z > maxZ) maxZ = p.z;
    }

    return new Vector((minX + maxX) / 2, (minY + maxY) / 2, (minZ + maxZ) / 2);
  }

  private syncLocalMatrixFromGeometry(): void {
    if (!this.usesGeometryTransforms()) {
      return;
    }

    const center = this.getGeometryCenter() ?? Vector.ZERO;
    const sx = this.logicalScale.x;
    const sy = this.logicalScale.y;
    const cos = Math.cos(this.logicalRotation);
    const sin = Math.sin(this.logicalRotation);
    const values = new Float32Array(16);

    values[0] = cos * sx;
    values[1] = -sin * sy;
    values[3] = center.x;
    values[4] = sin * sx;
    values[5] = cos * sy;
    values[7] = center.y;
    values[10] = 1;
    values[11] = center.z;
    values[15] = 1;

    this.setLocalMatrix(new Matrix4x4(values));
  }

  private updateLogicalStateFromMatrix(m: Matrix4x4): void {
    const values = m.values;
    const sx = Math.sqrt(values[0]! * values[0]! + values[4]! * values[4]!);
    const sy = Math.sqrt(values[1]! * values[1]! + values[5]! * values[5]!);
    const rot = Math.atan2(values[4]!, values[0]!);

    this.logicalScale = new Vector(this.logicalScale.x * sx, this.logicalScale.y * sy);
    this.logicalRotation += rot;
  }

  private setLocalMatrix(m4: Matrix4x4): void {
    this.localMatrix = m4;
  }

}

