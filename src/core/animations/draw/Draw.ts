import { IntroductoryAnimation } from '../categories';
import { VMobject } from '../../../mobjects/VMobject';
import { BezierPath } from '../../math/bezier/BezierPath';
import { Color } from '../../math/color/Color';
import { getPartialPath } from './partialPath';

/** Duck-typing check for VGroup (has getChildren method). */
function isVGroup(target: VMobject): target is VMobject & { getChildren(): VMobject[] } {
    return typeof (target as { getChildren?: unknown }).getChildren === 'function';
}

/** Duck-typing check for Glyph (has character property). */
function isGlyph(target: VMobject): target is VMobject & { character: string } {
    return typeof (target as { character?: unknown }).character === 'string';
}

/** Returns true if VMobject is a VGroup containing only Glyphs (i.e., Text). */
function isText(target: VMobject): boolean {
    if (!isVGroup(target)) return false;
    const children = target.getChildren();
    return children.length > 0 && children.every(isGlyph);
}

/** Original state snapshot for a single VMobject. */
interface ChildState {
    child: VMobject;
    paths: BezierPath[];
    opacity: number;
    strokeColor: Color;
    strokeWidth: number;
    fillColor: Color;
    fillOpacity: number;
}

/**
 * Animation that first draws the stroke progressively, then fades in the fill.
 * - First 50%: stroke draws progressively
 * - Second 50%: fill fades in
 *
 * - Single VMobject: stroke then fill
 * - VGroup: all children animate together
 * - Text (VGroup of Glyphs): Glyphs animate sequentially for handwriting effect
 *
 * This is an introductory animation - it auto-registers the target with the scene.
 */
export class Draw<T extends VMobject = VMobject> extends IntroductoryAnimation<T> {
    private readonly originalPaths: BezierPath[];
    private readonly originalOpacity: number;
    private readonly originalStrokeColor: Color;
    private readonly originalStrokeWidth: number;
    private readonly originalFillColor: Color;
    private readonly originalFillOpacity: number;
    private readonly childStates: ChildState[];
    /** Glyph states for Text children, keyed by the Text VMobject reference. */
    private readonly glyphStates: Map<VMobject, ChildState[]> = new Map();

    constructor(target: T) {
        super(target);
        this.originalOpacity = target.opacity;
        this.originalStrokeColor = target.getStrokeColor();
        this.originalStrokeWidth = target.getStrokeWidth();
        this.originalFillColor = target.getFillColor();
        this.originalFillOpacity = target.getFillOpacity();

        if (isVGroup(target)) {
            this.originalPaths = [];
            this.childStates = target.getChildren().map(child => this.createState(child));
        } else {
            this.originalPaths = target.paths.map(p => p.clone());
            this.childStates = [];
        }
    }

    private createState(child: VMobject): ChildState {
        const state: ChildState = {
            child,
            paths: child.paths.map(p => p.clone()),
            opacity: child.opacity,
            strokeColor: child.getStrokeColor(),
            strokeWidth: child.getStrokeWidth(),
            fillColor: child.getFillColor(),
            fillOpacity: child.getFillOpacity(),
        };

        // If child is Text, store Glyph states for staggered animation
        if (isText(child)) {
            this.glyphStates.set(child, (child as VMobject & { getChildren(): VMobject[] }).getChildren().map((g: VMobject) => this.createState(g)));
        }

        return state;
    }

    interpolate(progress: number): void {
        if (this.childStates.length === 0) {
            this.interpolateVMobject(this.target, this.originalPaths, this.originalOpacity, this.originalStrokeColor, this.originalStrokeWidth, this.originalFillColor, this.originalFillOpacity, progress);
        } else {
            this.interpolateVGroup(progress);
        }
    }

    private interpolateVGroup(progress: number): void {
        const targetOpacity = this.originalOpacity === 0 ? 1 : this.originalOpacity;
        this.target.setOpacity(progress <= 0 ? 0 : targetOpacity);

        for (const state of this.childStates) {
            const glyphStates = this.glyphStates.get(state.child);

            if (glyphStates) {
                // Text: stagger Glyph animation
                state.child.setOpacity(progress <= 0 ? 0 : state.opacity || 1);
                this.interpolateGlyphs(glyphStates, progress);
            } else {
                // Regular child: same progress as siblings
                this.interpolateVMobject(state.child, state.paths, state.opacity, state.strokeColor, state.strokeWidth, state.fillColor, state.fillOpacity, progress);
            }
        }
    }

    private interpolateGlyphs(glyphs: ChildState[], progress: number): void {
        const lagRatio = 0.2;
        const totalSpan = 1 + (glyphs.length - 1) * lagRatio;

        glyphs.forEach((state, i) => {
            const start = (i * lagRatio) / totalSpan;
            const end = (i * lagRatio + 1) / totalSpan;
            const p = Math.max(0, Math.min(1, (progress - start) / (end - start)));
            this.interpolateVMobject(state.child, state.paths, state.opacity, state.strokeColor, state.strokeWidth, state.fillColor, state.fillOpacity, p);
        });
    }

    /** Interpolates a single VMobject: stroke (0-0.5), then fill (0.5-1). */
    private interpolateVMobject(
        target: VMobject,
        originalPaths: BezierPath[],
        originalOpacity: number,
        originalStrokeColor: Color,
        originalStrokeWidth: number,
        originalFillColor: Color,
        originalFillOpacity: number,
        progress: number
    ): void {
        if (progress <= 0) {
            target.paths = [];
            target.setOpacity(0);
            return;
        }

        const opacity = originalOpacity === 0 ? 1 : originalOpacity;
        target.setOpacity(opacity);

        if (progress < 0.5) {
            // First half: draw stroke progressively, no fill
            const strokeProgress = progress * 2;
            target.paths = originalPaths.map(p => getPartialPath(p, strokeProgress));
            target.stroke(originalStrokeColor, originalStrokeWidth);
            target.fill(originalFillColor, 0);
        } else {
            // Second half: full stroke, fade in fill
            const fillProgress = (progress - 0.5) * 2;
            target.paths = originalPaths.map(p => p.clone());
            target.stroke(originalStrokeColor, originalStrokeWidth);
            target.fill(originalFillColor, originalFillOpacity * fillProgress);
        }
    }
}
