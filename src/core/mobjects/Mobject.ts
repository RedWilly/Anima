import { hashFloat32Array, hashNumber, hashCompose } from '../cache';
import { Matrix4x4, Vector2, Vector3 } from '../math';
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
  position: Vector2;
  scale: Vector2;
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
  protected pointCloud: Vector3[] = [];
  protected submobjects: Mobject[] = [];
  private savedStates: MobjectState[] = [];
  private logicalRotation = 0;
  private logicalScale = new Vector2(1, 1);

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

  get position(): Vector2 {
    if (this.usesGeometryTransforms()) {
      const center = this.getGeometryCenter();
      if (center) {
        return center.toVector2();
      }
    }
    const m = this.localMatrix.values;
    return new Vector2(m[3]!, m[7]!);
  }

  get rotation(): number {
    if (this.usesGeometryTransforms()) {
      return this.logicalRotation;
    }
    const m = this.localMatrix.values;
    return Math.atan2(m[4]!, m[0]!);
  }

  get scale(): Vector2 {
    if (this.usesGeometryTransforms()) {
      return this.logicalScale;
    }
    const m = this.localMatrix.values;
    const sx = Math.sqrt(m[0]! * m[0]! + m[4]! * m[4]!);
    const sy = Math.sqrt(m[1]! * m[1]! + m[5]! * m[5]!);
    return new Vector2(sx, sy);
  }

  get opacity(): number {
    return this.opacityValue;
  }

  // ========== Immediate State Setters ==========

  pos(x: number, y: number): this {
    if (this.usesGeometryTransforms()) {
      const current = this.position;
      const dx = x - current.x;
      const dy = y - current.y;
      if (Math.abs(dx) > 1e-12 || Math.abs(dy) > 1e-12) {
        this.applyMatrix(Matrix4x4.translation(dx, dy, 0));
      }
      return this;
    }

    const newValues = new Float32Array(this.localMatrix.values);
    newValues[3] = x;
    newValues[7] = y;
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
      const transform = Matrix4x4.translation(pivot.x, pivot.y, 0)
        .multiply(Matrix4x4.rotationZ(delta))
        .multiply(Matrix4x4.translation(-pivot.x, -pivot.y, 0));

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
      const transform = Matrix4x4.translation(pivot.x, pivot.y, 0)
        .multiply(Matrix4x4.scale(deltaX, deltaY, 1))
        .multiply(Matrix4x4.translation(-pivot.x, -pivot.y, 0));

      this.applyMatrix(transform);
      this.logicalScale = new Vector2(sx, sy);
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

  protected setPointCloud(points: Array<Vector2 | Vector3>): void {
    this.pointCloud = points.map((p) =>
      p instanceof Vector3 ? new Vector3(p.x, p.y, p.z) : Vector3.fromVector2(p, 0),
    );
    this.syncLocalMatrixFromGeometry();
  }

  protected getPointCloud(): Vector3[] {
    return this.pointCloud.map((p) => new Vector3(p.x, p.y, p.z));
  }

  // ========== State Save/Restore ==========

  saveState(): this {
    const pos = this.position;
    const scl = this.scale;
    this.savedStates.push({
      position: new Vector2(pos.x, pos.y),
      scale: new Vector2(scl.x, scl.y),
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

    const moveAnim = createMoveTo(this, state.position.x, state.position.y, durationSeconds);
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

  moveTo(x: number, y: number, durationSeconds?: number): this & { toAnimation(): Animation<Mobject> } {
    const animation = createMoveTo(this, x, y, durationSeconds);
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

  private collectGeometryPoints(out: Vector3[]): void {
    out.push(...this.pointCloud);
    for (const child of this.submobjects) {
      child.collectGeometryPoints(out);
    }
  }

  private getGeometryCenter(): Vector3 | null {
    const points: Vector3[] = [];
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

    return new Vector3((minX + maxX) / 2, (minY + maxY) / 2, (minZ + maxZ) / 2);
  }

  private syncLocalMatrixFromGeometry(): void {
    if (!this.usesGeometryTransforms()) {
      return;
    }

    const center = this.getGeometryCenter() ?? Vector3.ZERO;
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

    this.logicalScale = new Vector2(this.logicalScale.x * sx, this.logicalScale.y * sy);
    this.logicalRotation += rot;
  }

  private setLocalMatrix(m4: Matrix4x4): void {
    this.localMatrix = m4;
  }

}
