import { Mobject } from '../../mobjects/Mobject';
import { Parallel } from '../animations/composition';
import type { Animation } from '../animations/Animation';

const MANIM_FRAME_HEIGHT = 8.0;

interface BoundsResult {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
}

/**
 * Configuration options for CameraFrame.
 */
interface CameraFrameConfig {
  /** Width of the viewport in pixels. Defaults to 1920. */
  pixelWidth?: number;
  /** Height of the viewport in pixels. Defaults to 1080. */
  pixelHeight?: number;
}

/**
 * Camera bounds that limit how far the camera can pan.
 */
interface Bounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

/**
 * CameraFrame represents the viewport window in world space.
 * Extends Mobject (not VMobject - no visual representation).
 * Its transform properties define what the camera shows:
 * - scale(2) = zoom OUT (larger frame = see more)
 * - scale(0.5) = zoom IN (smaller frame = see less)
 *
 * The CameraFrame is the primary way to control camera animations in Anima.
 * Access it via `scene.frame` or `scene.camera.frame`.
 *
 * @example
 * // Zoom in over 1 second
 * this.play(this.frame.zoomIn(2).duration(1));
 *
 * @example
 * // Pan to center on an object
 * this.play(this.frame.centerOn(circle).duration(0.5));
 *
 * @example
 * // Fit multiple objects in view
 * this.play(this.frame.fitTo([obj1, obj2, obj3]).duration(1));
 */
export class CameraFrame extends Mobject {
  private readonly baseWidth: number;
  private readonly baseHeight: number = MANIM_FRAME_HEIGHT;
  private bounds?: Bounds;

  /**
   * Creates a new CameraFrame with the specified viewport dimensions.
   *
   * @param config - Configuration options
   * @param config.pixelWidth - Width of the viewport in pixels (default: 1920)
   * @param config.pixelHeight - Height of the viewport in pixels (default: 1080)
   *
   * @example
   * const frame = new CameraFrame({ pixelWidth: 1920, pixelHeight: 1080 });
   */
  constructor(config: CameraFrameConfig = {}) {
    super();
    const pixelWidth = config.pixelWidth ?? 1920;
    const pixelHeight = config.pixelHeight ?? 1080;
    this.baseWidth = this.baseHeight * (pixelWidth / pixelHeight);
    this.setOpacity(1);
  }

  /**
   * The current width of the frame in world units, accounting for scale.
   * @returns The frame width multiplied by the current scale.x
   */
  get width(): number {
    return this.baseWidth * this.scale.x;
  }

  /**
   * The current height of the frame in world units, accounting for scale.
   * @returns The frame height multiplied by the current scale.y
   */
  get height(): number {
    return this.baseHeight * this.scale.y;
  }

  /**
   * Sets the scale of the camera frame.
   * Overrides Mobject.setScale to prevent zero or negative scales.
   *
   * @param sx - Scale factor for the x-axis (must be positive)
   * @param sy - Scale factor for the y-axis (must be positive)
   * @returns This CameraFrame for method chaining
   * @throws Error if sx or sy is zero or negative
   *
   * @example
   * frame.setScale(2, 2); // Zoom out 2x
   * frame.setScale(0.5, 0.5); // Zoom in 2x
   */
  override setScale(sx: number, sy: number): this {
    if (sx <= 0 || sy <= 0) {
      throw new Error('CameraFrame scale must be positive to prevent division by zero');
    }
    return super.setScale(sx, sy);
  }

  /**
   * Sets bounds that limit how far the camera can pan.
   * When bounds are set, the camera position is clamped to stay within them,
   * accounting for the frame size so edges don't go outside bounds.
   *
   * @param minX - Minimum x coordinate
   * @param minY - Minimum y coordinate
   * @param maxX - Maximum x coordinate
   * @param maxY - Maximum y coordinate
   * @returns This CameraFrame for method chaining
   *
   * @example
   * // Limit camera to a 100x100 world area
   * frame.setBounds(0, 0, 100, 100);
   */
  setBounds(minX: number, minY: number, maxX: number, maxY: number): this {
    this.bounds = { minX, maxX, minY, maxY };
    return this;
  }

  /**
   * Removes any bounds restrictions on camera movement.
   *
   * @returns This CameraFrame for method chaining
   *
   * @example
   * frame.clearBounds(); // Camera can now pan freely
   */
  clearBounds(): this {
    this.bounds = undefined;
    return this;
  }

  /**
   * Checks if the camera has bounds set.
   *
   * @returns True if bounds are set, false otherwise
   */
  hasBounds(): boolean {
    return this.bounds !== undefined;
  }

  /**
   * Gets the current bounds configuration.
   *
   * @returns The bounds object or undefined if no bounds are set
   */
  getBounds(): Bounds | undefined {
    return this.bounds;
  }

  /**
   * Sets the position of the camera frame.
   * Overrides Mobject.pos to clamp position within bounds if set.
   *
   * @param x - The x coordinate in world space
   * @param y - The y coordinate in world space
   * @returns This CameraFrame for method chaining
   *
   * @example
   * frame.pos(5, 3); // Move camera center to (5, 3)
   */
  override pos(x: number, y: number): this {
    if (this.bounds) {
      const halfWidth = this.width / 2;
      const halfHeight = this.height / 2;
      const clampedX = Math.max(this.bounds.minX + halfWidth, Math.min(this.bounds.maxX - halfWidth, x));
      const clampedY = Math.max(this.bounds.minY + halfHeight, Math.min(this.bounds.maxY - halfHeight, y));
      return super.pos(clampedX, clampedY);
    }
    return super.pos(x, y);
  }

  // ========== Camera-Specific FluentAPI Methods ==========

  /**
   * Smoothly zoom the camera in by the given factor.
   * Internally scales the frame down, which makes objects appear larger.
   *
   * @param factor - Zoom multiplier. 2 = objects appear 2x larger (default: 2)
   * @returns FluentAnimation that can be chained with .duration() and .ease()
   * @throws Error if factor is zero or negative
   *
   * @example
   * // Zoom in 2x over 1 second
   * this.play(this.frame.zoomIn(2).duration(1));
   *
   * @example
   * // Zoom in 3x with easing
   * this.play(this.frame.zoomIn(3).duration(1.5).ease(easeInOutQuad));
   */
  zoomIn(factor: number = 2): this & { toAnimation(): Animation<Mobject> } {
    if (factor <= 0) {
      throw new Error('zoom factor must be positive');
    }
    return this.scaleTo(1 / factor);
  }

  /**
   * Smoothly zoom the camera out by the given factor.
   * Internally scales the frame up, which makes objects appear smaller.
   *
   * @param factor - Zoom multiplier. 2 = objects appear 2x smaller (default: 2)
   * @returns FluentAnimation that can be chained with .duration() and .ease()
   * @throws Error if factor is zero or negative
   *
   * @example
   * // Zoom out 2x over 1 second
   * this.play(this.frame.zoomOut(2).duration(1));
   *
   * @example
   * // Zoom out to show more of the scene
   * this.play(this.frame.zoomOut(4).duration(2).ease(easeOutCubic));
   */
  zoomOut(factor: number = 2): this & { toAnimation(): Animation<Mobject> } {
    if (factor <= 0) {
      throw new Error('zoom factor must be positive');
    }
    return this.scaleTo(factor);
  }

  /**
   * Move the camera to center on a target Mobject.
   * The camera will smoothly pan so the target is at the center of the frame.
   *
   * @param target - The Mobject to center on
   * @returns FluentAnimation that can be chained with .duration() and .ease()
   * @throws Error if target is null or undefined
   *
   * @example
   * // Center on a circle over 0.5 seconds
   * this.play(this.frame.centerOn(circle).duration(0.5));
   *
   * @example
   * // Pan to focus on different objects in sequence
   * await this.play(this.frame.centerOn(obj1).duration(1));
   * await this.play(this.frame.centerOn(obj2).duration(1));
   */
  centerOn(target: Mobject): this & { toAnimation(): Animation<Mobject> } {
    if (!target) {
      throw new Error('centerOn() requires a Mobject target, but received null or undefined');
    }
    return this.moveTo(target.position.x, target.position.y);
  }

  /**
   * Zoom in/out while keeping a specific world point fixed on screen.
   * Like pinch-to-zoom behavior where the pinch point stays stationary.
   *
   * Uses the formula: C' = P * (1 - factor) + C * factor
   * Where P = point, C = current center, factor = zoom factor.
   *
   * @param factor - Scale multiplier. Less than 1 for zoom in, greater than 1 for zoom out
   * @param point - World coordinates to keep fixed on screen
   * @returns Parallel animation combining move and scale
   * @throws Error if factor is zero or negative
   *
   * @example
   * // Zoom in 2x on a specific point
   * this.play(frame.zoomToPoint(0.5, { x: 5, y: 5 }).duration(1));
   *
   * @example
   * // Zoom out while keeping an object's position fixed
   * this.play(frame.zoomToPoint(2, circle.position).duration(1));
   */
  zoomToPoint(factor: number, point: { x: number; y: number }): Parallel {
    if (factor <= 0) {
      throw new Error('zoom factor must be positive');
    }

    const currentX = this.position.x;
    const currentY = this.position.y;
    const currentScale = this.scale.x;

    const newX = point.x * (1 - factor) + currentX * factor;
    const newY = point.y * (1 - factor) + currentY * factor;
    const newScale = currentScale * factor;

    const moveAnim = this.moveTo(newX, newY).toAnimation();
    const scaleAnim = this.scaleTo(newScale).toAnimation();

    return new Parallel([moveAnim, scaleAnim]);
  }

  /**
   * Automatically frame one or more objects with optional margin.
   * Calculates the bounding box of all targets and animates the camera
   * to show them all with the specified margin around them.
   *
   * @param targets - Single Mobject or array of Mobjects to frame
   * @param margin - Padding around the objects in world units (default: 0.5)
   * @returns FluentAnimation that can be chained with .duration() and .ease()
   * @throws Error if targets array is empty
   *
   * @example
   * // Fit a single object with default margin
   * this.play(this.frame.fitTo(circle).duration(1));
   *
   * @example
   * // Fit multiple objects with custom margin
   * this.play(this.frame.fitTo([obj1, obj2, obj3], 1.0).duration(1.5));
   *
   * @example
   * // Show all objects in the scene
   * this.play(this.frame.fitTo(allObjects, 0).duration(2));
   */
  fitTo(targets: Mobject | Mobject[], margin: number = 0.5): this & { toAnimation(): Animation<Mobject> } {
    const targetArray = Array.isArray(targets) ? targets : [targets];
    if (targetArray.length === 0) {
      throw new Error('fitTo() requires at least one target');
    }

    const bounds = this.calculateBounds(targetArray);
    
    const requiredWidth = bounds.width + margin * 2;
    const requiredHeight = bounds.height + margin * 2;
    
    const scaleX = requiredWidth / this.baseWidth;
    const scaleY = requiredHeight / this.baseHeight;
    
    let targetScale = Math.max(scaleX, scaleY);
    if (targetScale < 1) {
      targetScale = 1;
    }

    const moveAnim = this.moveTo(bounds.centerX, bounds.centerY).toAnimation();
    const scaleAnim = this.scaleTo(targetScale).toAnimation();

    const parallelAnim = new Parallel([moveAnim, scaleAnim]);
    this.getQueue().enqueueAnimation(parallelAnim);

    return this;
  }

  private calculateBounds(targets: Mobject[]): BoundsResult {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    for (const target of targets) {
      if (this.hasGetBoundingBox(target)) {
        const box = target.getBoundingBox();
        minX = Math.min(minX, box.minX);
        maxX = Math.max(maxX, box.maxX);
        minY = Math.min(minY, box.minY);
        maxY = Math.max(maxY, box.maxY);
      } else {
        const pos = target.position;
        minX = Math.min(minX, pos.x);
        maxX = Math.max(maxX, pos.x);
        minY = Math.min(minY, pos.y);
        maxY = Math.max(maxY, pos.y);
      }
    }

    const width = maxX - minX;
    const height = maxY - minY;
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    return { minX, maxX, minY, maxY, width, height, centerX, centerY };
  }

  private hasGetBoundingBox(obj: Mobject): obj is Mobject & { getBoundingBox(): { minX: number; maxX: number; minY: number; maxY: number } } {
    return typeof (obj as { getBoundingBox?: unknown }).getBoundingBox === 'function';
  }
}
