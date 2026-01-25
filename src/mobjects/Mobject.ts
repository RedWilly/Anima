import { Matrix3x3 } from '../core/math/matrix/Matrix3x3';
import { Vector2 } from '../core/math/Vector2/Vector2';
import { Animation } from '../core/animations/Animation';
import type { EasingFunction } from '../core/animations/easing';
import { AnimationQueue } from '../fluent/AnimationQueue';
import { FadeIn, FadeOut } from '../core/animations/fade';
import { MoveTo, Rotate, Scale } from '../core/animations/transform';
import { Parallel } from '../core/animations/composition';

/**
 * Base class for all mathematical objects.
 * Manages position, rotation, scale, and opacity via a local transformation matrix.
 * Includes fluent animation API for chainable animations.
 */
export class Mobject {
  protected localMatrix: Matrix3x3;
  protected opacityValue: number;
  protected animQueue: AnimationQueue | null = null;

  parent: Mobject | null = null;

  constructor() {
    this.localMatrix = Matrix3x3.identity();
    this.opacityValue = 0;
  }

  protected getQueue(): AnimationQueue {
    if (!this.animQueue) {
      this.animQueue = new AnimationQueue(this);
    }
    return this.animQueue;
  }

  // ========== Transform Properties ==========

  get matrix(): Matrix3x3 {
    return this.localMatrix;
  }

  getWorldMatrix(): Matrix3x3 {
    if (this.parent === null) {
      return this.localMatrix;
    }
    return this.parent.getWorldMatrix().multiply(this.localMatrix);
  }

  get position(): Vector2 {
    const m = this.localMatrix.values;
    return new Vector2(m[2]!, m[5]!);
  }

  get rotation(): number {
    const m = this.localMatrix.values;
    return Math.atan2(m[3]!, m[0]!);
  }

  get scale(): Vector2 {
    const m = this.localMatrix.values;
    const sx = Math.sqrt(m[0]! * m[0]! + m[3]! * m[3]!);
    const sy = Math.sqrt(m[1]! * m[1]! + m[4]! * m[4]!);
    return new Vector2(sx, sy);
  }

  get opacity(): number {
    return this.opacityValue;
  }

  // ========== Immediate State Setters ==========

  pos(x: number, y: number): this {
    const newValues = new Float32Array(this.localMatrix.values);
    newValues[2] = x;
    newValues[5] = y;
    this.localMatrix = new Matrix3x3(newValues);
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
    const m = this.localMatrix.values;
    const posX = m[2]!;
    const posY = m[5]!;
    const currentScale = this.scale;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const newValues = new Float32Array(9);
    newValues[0] = cos * currentScale.x;
    newValues[1] = -sin * currentScale.y;
    newValues[2] = posX;
    newValues[3] = sin * currentScale.x;
    newValues[4] = cos * currentScale.y;
    newValues[5] = posY;
    newValues[8] = 1;
    this.localMatrix = new Matrix3x3(newValues);
    return this;
  }

  setScale(sx: number, sy: number): this {
    const m = this.localMatrix.values;
    const posX = m[2]!;
    const posY = m[5]!;
    const currentRotation = this.rotation;
    const cos = Math.cos(currentRotation);
    const sin = Math.sin(currentRotation);
    const newValues = new Float32Array(9);
    newValues[0] = cos * sx;
    newValues[1] = -sin * sy;
    newValues[2] = posX;
    newValues[3] = sin * sx;
    newValues[4] = cos * sy;
    newValues[5] = posY;
    newValues[8] = 1;
    this.localMatrix = new Matrix3x3(newValues);
    return this;
  }

  applyMatrix(m: Matrix3x3): this {
    this.localMatrix = m.multiply(this.localMatrix);
    return this;
  }

  // ========== Fluent Animation API ==========

  private createAnimation<T extends Animation<Mobject>>(animation: T, durationSeconds?: number): T {
    if (durationSeconds !== undefined) {
      animation.duration(durationSeconds);
    }
    return animation;
  }

  // ========== Unified Fluent Animation API ==========
  // These methods work for both sequential chaining AND parallel usage

  fadeIn(durationSeconds?: number): this & { toAnimation(): Animation<Mobject> } {
    const animation = this.createAnimation(new FadeIn(this), durationSeconds);
    this.getQueue().enqueueAnimation(animation);
    return this;
  }

  fadeOut(durationSeconds?: number): this & { toAnimation(): Animation<Mobject> } {
    const animation = this.createAnimation(new FadeOut(this), durationSeconds);
    this.getQueue().enqueueAnimation(animation);
    return this;
  }

  moveTo(x: number, y: number, durationSeconds?: number): this & { toAnimation(): Animation<Mobject> } {
    const animation = this.createAnimation(new MoveTo(this, x, y), durationSeconds);
    this.getQueue().enqueueAnimation(animation);
    return this;
  }

  rotate(angle: number, durationSeconds?: number): this & { toAnimation(): Animation<Mobject> } {
    const animation = this.createAnimation(new Rotate(this, angle), durationSeconds);
    this.getQueue().enqueueAnimation(animation);
    return this;
  }

  scaleTo(factor: number, durationSeconds?: number): this & { toAnimation(): Animation<Mobject> } {
    const animation = this.createAnimation(new Scale(this, factor), durationSeconds);
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
    
    this.getQueue().enqueueAnimation(new Parallel(animations));
    return this;
  }
}

