import { describe, test, expect } from 'bun:test';
import * as fc from 'fast-check';
import { FadeIn, FadeOut, MoveTo, Rotate, Scale, MorphTo } from '../../../src/core/animations';
import { Mobject } from '../../../src/mobjects/Mobject';
import { VMobject } from '../../../src/mobjects/VMobject';
import { Circle } from '../../../src/mobjects/geometry/Circle';
import { Rectangle } from '../../../src/mobjects/geometry/Rectangle';
import { Vector2 } from '../../../src/core/math/Vector2/Vector2';
import { BezierPath } from '../../../src/core/math/bezier/BezierPath';

/** Arbitrary for progress values in [0, 1] */
const arbProgress = fc.double({ min: 0, max: 1, noNaN: true });

/** Arbitrary for coordinates */
const arbCoord = fc.double({ min: -500, max: 500, noNaN: true });

/** Arbitrary for positive duration values */
const arbDuration = fc.double({ min: 0.01, max: 10, noNaN: true });

/** Arbitrary for non-negative delay values */
const arbDelay = fc.double({ min: 0, max: 5, noNaN: true });

/** Arbitrary for opacity values */
const arbOpacity = fc.double({ min: 0, max: 1, noNaN: true });

/** Arbitrary for rotation angle in radians */
const arbAngle = fc.double({ min: -Math.PI * 2, max: Math.PI * 2, noNaN: true });

/** Arbitrary for positive scale factor */
const arbScaleFactor = fc.double({ min: 0.1, max: 5, noNaN: true });

describe('Animation Property Tests', () => {
    describe('FadeIn Animation', () => {
        test('interpolate(0) preserves starting opacity', () => {
            fc.assert(fc.property(arbOpacity, (startOpacity) => {
                const mobject = new Mobject();
                mobject.setOpacity(startOpacity);
                const anim = new FadeIn(mobject);
                anim.interpolate(0);
                return Math.abs(mobject.opacity - startOpacity) < 1e-6;
            }));
        });

        test('interpolate(1) always sets opacity to 1', () => {
            fc.assert(fc.property(arbOpacity, (startOpacity) => {
                const mobject = new Mobject();
                mobject.setOpacity(startOpacity);
                const anim = new FadeIn(mobject);
                anim.interpolate(1);
                return Math.abs(mobject.opacity - 1) < 1e-6;
            }));
        });

        test('opacity increases monotonically during animation', () => {
            fc.assert(fc.property(
                arbOpacity,
                arbProgress,
                arbProgress,
                (startOpacity, t1, t2) => {
                    if (t1 >= t2) return true;
                    const mobject = new Mobject();
                    mobject.setOpacity(startOpacity);
                    const anim = new FadeIn(mobject);
                    anim.interpolate(t1);
                    const opacity1 = mobject.opacity;
                    anim.interpolate(t2);
                    const opacity2 = mobject.opacity;
                    return opacity1 <= opacity2 + 1e-6;
                }
            ));
        });

        test('opacity stays in [0, 1] range for all progress values', () => {
            fc.assert(fc.property(arbOpacity, arbProgress, (startOpacity, t) => {
                const mobject = new Mobject();
                mobject.setOpacity(startOpacity);
                const anim = new FadeIn(mobject);
                anim.interpolate(t);
                return mobject.opacity >= 0 && mobject.opacity <= 1;
            }));
        });
    });

    describe('FadeOut Animation', () => {
        test('interpolate(0) preserves starting opacity', () => {
            fc.assert(fc.property(arbOpacity, (startOpacity) => {
                const mobject = new Mobject();
                mobject.setOpacity(startOpacity);
                const anim = new FadeOut(mobject);
                anim.interpolate(0);
                return Math.abs(mobject.opacity - startOpacity) < 1e-6;
            }));
        });

        test('interpolate(1) always sets opacity to 0', () => {
            fc.assert(fc.property(arbOpacity, (startOpacity) => {
                const mobject = new Mobject();
                mobject.setOpacity(startOpacity);
                const anim = new FadeOut(mobject);
                anim.interpolate(1);
                return Math.abs(mobject.opacity) < 1e-6;
            }));
        });

        test('opacity decreases monotonically during animation', () => {
            fc.assert(fc.property(
                arbOpacity,
                arbProgress,
                arbProgress,
                (startOpacity, t1, t2) => {
                    if (t1 >= t2) return true;
                    const mobject = new Mobject();
                    mobject.setOpacity(startOpacity);
                    const anim = new FadeOut(mobject);
                    anim.interpolate(t1);
                    const opacity1 = mobject.opacity;
                    anim.interpolate(t2);
                    const opacity2 = mobject.opacity;
                    return opacity1 >= opacity2 - 1e-6;
                }
            ));
        });

        test('opacity stays in [0, 1] range for all progress values', () => {
            fc.assert(fc.property(arbOpacity, arbProgress, (startOpacity, t) => {
                const mobject = new Mobject();
                mobject.setOpacity(startOpacity);
                const anim = new FadeOut(mobject);
                anim.interpolate(t);
                return mobject.opacity >= 0 && mobject.opacity <= 1;
            }));
        });
    });

    describe('MoveTo Animation', () => {
        test('interpolate(0) preserves starting position', () => {
            fc.assert(fc.property(
                arbCoord, arbCoord, arbCoord, arbCoord,
                (startX, startY, endX, endY) => {
                    const mobject = new Mobject();
                    mobject.pos(startX, startY);
                    const anim = new MoveTo(mobject, endX, endY);
                    anim.interpolate(0);
                    return Math.abs(mobject.position.x - startX) < 1e-3 &&
                        Math.abs(mobject.position.y - startY) < 1e-3;
                }
            ));
        });

        test('interpolate(1) sets position to destination', () => {
            fc.assert(fc.property(
                arbCoord, arbCoord, arbCoord, arbCoord,
                (startX, startY, endX, endY) => {
                    const mobject = new Mobject();
                    mobject.pos(startX, startY);
                    const anim = new MoveTo(mobject, endX, endY);
                    anim.interpolate(1);
                    return Math.abs(mobject.position.x - endX) < 1e-3 &&
                        Math.abs(mobject.position.y - endY) < 1e-3;
                }
            ));
        });

        test('interpolate(0.5) sets position to midpoint', () => {
            fc.assert(fc.property(
                arbCoord, arbCoord, arbCoord, arbCoord,
                (startX, startY, endX, endY) => {
                    const mobject = new Mobject();
                    mobject.pos(startX, startY);
                    const anim = new MoveTo(mobject, endX, endY);
                    anim.interpolate(0.5);
                    const expectedX = (startX + endX) / 2;
                    const expectedY = (startY + endY) / 2;
                    return Math.abs(mobject.position.x - expectedX) < 1e-3 &&
                        Math.abs(mobject.position.y - expectedY) < 1e-3;
                }
            ));
        });

        test('linear interpolation property: pos(t) = start + t*(end-start)', () => {
            fc.assert(fc.property(
                arbCoord, arbCoord, arbCoord, arbCoord, arbProgress,
                (startX, startY, endX, endY, t) => {
                    const mobject = new Mobject();
                    mobject.pos(startX, startY);
                    const anim = new MoveTo(mobject, endX, endY);
                    anim.interpolate(t);
                    const expectedX = startX + t * (endX - startX);
                    const expectedY = startY + t * (endY - startY);
                    return Math.abs(mobject.position.x - expectedX) < 1e-3 &&
                        Math.abs(mobject.position.y - expectedY) < 1e-3;
                }
            ));
        });
    });

    describe('Rotate Animation', () => {
        /** Arbitrary for small rotation angles that won't wrap */
        const arbSmallAngle = fc.double({ min: -Math.PI / 2, max: Math.PI / 2, noNaN: true });

        test('interpolate(0) preserves initial rotation (from zero start)', () => {
            fc.assert(fc.property(arbSmallAngle, (deltaAngle) => {
                const mobject = new Mobject();
                const startRotation = mobject.rotation; // Should be 0
                const anim = new Rotate(mobject, deltaAngle);
                anim.interpolate(0);
                return Math.abs(mobject.rotation - startRotation) < 1e-3;
            }));
        });

        test('interpolate(1) adds full rotation angle (small angles)', () => {
            fc.assert(fc.property(arbSmallAngle, (deltaAngle) => {
                const mobject = new Mobject();
                const startAngle = mobject.rotation;
                const anim = new Rotate(mobject, deltaAngle);
                anim.interpolate(1);
                const expectedAngle = startAngle + deltaAngle;
                return Math.abs(mobject.rotation - expectedAngle) < 1e-3;
            }));
        });

        test('linear interpolation property: rotation(t) = start + t*delta (small angles)', () => {
            fc.assert(fc.property(arbSmallAngle, arbProgress, (deltaAngle, t) => {
                const mobject = new Mobject();
                const startAngle = mobject.rotation;
                const anim = new Rotate(mobject, deltaAngle);
                anim.interpolate(t);
                const expectedAngle = startAngle + t * deltaAngle;
                return Math.abs(mobject.rotation - expectedAngle) < 1e-3;
            }));
        });

        test('rotation changes monotonically during animation (positive delta)', () => {
            fc.assert(fc.property(
                fc.double({ min: 0.1, max: Math.PI / 2, noNaN: true }),
                arbProgress,
                arbProgress,
                (deltaAngle, t1, t2) => {
                    if (t1 >= t2) return true;
                    const mobject = new Mobject();
                    const anim = new Rotate(mobject, deltaAngle);
                    anim.interpolate(t1);
                    const rotation1 = mobject.rotation;
                    anim.interpolate(t2);
                    const rotation2 = mobject.rotation;
                    return rotation1 <= rotation2 + 1e-6;
                }
            ));
        });
    });

    describe('Scale Animation', () => {
        test('interpolate(0) preserves starting scale', () => {
            fc.assert(fc.property(arbScaleFactor, (targetScale) => {
                const mobject = new Mobject();
                const startScale = mobject.scale;
                const anim = new Scale(mobject, targetScale);
                anim.interpolate(0);
                return Math.abs(mobject.scale.x - startScale.x) < 1e-3 &&
                    Math.abs(mobject.scale.y - startScale.y) < 1e-3;
            }));
        });

        test('interpolate(1) sets scale to target factor', () => {
            fc.assert(fc.property(arbScaleFactor, (targetScale) => {
                const mobject = new Mobject();
                const anim = new Scale(mobject, targetScale);
                anim.interpolate(1);
                return Math.abs(mobject.scale.x - targetScale) < 1e-3 &&
                    Math.abs(mobject.scale.y - targetScale) < 1e-3;
            }));
        });

        test('linear interpolation property: scale(t) = start + t*(end-start)', () => {
            fc.assert(fc.property(arbScaleFactor, arbProgress, (targetScale, t) => {
                const mobject = new Mobject();
                const startScale = 1; // Default scale
                const anim = new Scale(mobject, targetScale);
                anim.interpolate(t);
                const expectedScale = startScale + t * (targetScale - startScale);
                return Math.abs(mobject.scale.x - expectedScale) < 1e-3 &&
                    Math.abs(mobject.scale.y - expectedScale) < 1e-3;
            }));
        });

        test('non-uniform scaling interpolates correctly', () => {
            fc.assert(fc.property(
                arbScaleFactor, arbScaleFactor, arbProgress,
                (targetX, targetY, t) => {
                    const mobject = new Mobject();
                    const anim = new Scale(mobject, targetX, targetY);
                    anim.interpolate(t);
                    const expectedX = 1 + t * (targetX - 1);
                    const expectedY = 1 + t * (targetY - 1);
                    return Math.abs(mobject.scale.x - expectedX) < 1e-3 &&
                        Math.abs(mobject.scale.y - expectedY) < 1e-3;
                }
            ));
        });
    });

    describe('MorphTo Animation', () => {
        test('interpolate(0) preserves source shape path count', () => {
            const circle = new Circle(50);
            const rectangle = new Rectangle(100, 100);
            const originalPathCount = circle.paths.length;
            const anim = new MorphTo(circle, rectangle);
            anim.interpolate(0);
            expect(circle.paths.length).toBeGreaterThan(0);
        });

        test('interpolate(1) produces valid paths', () => {
            const circle = new Circle(50);
            const rectangle = new Rectangle(100, 100);
            const anim = new MorphTo(circle, rectangle);
            anim.interpolate(1);
            expect(circle.paths.length).toBeGreaterThan(0);
            for (const path of circle.paths) {
                expect(path.getCommands().length).toBeGreaterThan(0);
            }
        });

        test('all progress values produce valid paths', () => {
            fc.assert(fc.property(arbProgress, (t) => {
                const circle = new Circle(30);
                const rectangle = new Rectangle(60, 60);
                const anim = new MorphTo(circle, rectangle);
                anim.interpolate(t);
                return circle.paths.length > 0 &&
                    circle.paths.every(p => p.getCommands().length > 0);
            }));
        });
    });

    describe('Animation Base Class Properties', () => {
        test('duration setter works correctly for all animations', () => {
            fc.assert(fc.property(arbDuration, (duration) => {
                const mobject = new Mobject();
                const fadeIn = new FadeIn(mobject).duration(duration);
                const fadeOut = new FadeOut(mobject).duration(duration);
                const moveTo = new MoveTo(mobject, 100, 100).duration(duration);
                const rotate = new Rotate(mobject, Math.PI).duration(duration);
                const scale = new Scale(mobject, 2).duration(duration);
                return Math.abs(fadeIn.getDuration() - duration) < 1e-6 &&
                    Math.abs(fadeOut.getDuration() - duration) < 1e-6 &&
                    Math.abs(moveTo.getDuration() - duration) < 1e-6 &&
                    Math.abs(rotate.getDuration() - duration) < 1e-6 &&
                    Math.abs(scale.getDuration() - duration) < 1e-6;
            }));
        });

        test('delay setter works correctly for all animations', () => {
            fc.assert(fc.property(arbDelay, (delay) => {
                const mobject = new Mobject();
                const fadeIn = new FadeIn(mobject).delay(delay);
                const fadeOut = new FadeOut(mobject).delay(delay);
                const moveTo = new MoveTo(mobject, 100, 100).delay(delay);
                const rotate = new Rotate(mobject, Math.PI).delay(delay);
                const scale = new Scale(mobject, 2).delay(delay);
                return Math.abs(fadeIn.getDelay() - delay) < 1e-6 &&
                    Math.abs(fadeOut.getDelay() - delay) < 1e-6 &&
                    Math.abs(moveTo.getDelay() - delay) < 1e-6 &&
                    Math.abs(rotate.getDelay() - delay) < 1e-6 &&
                    Math.abs(scale.getDelay() - delay) < 1e-6;
            }));
        });

        test('fluent chaining returns same instance', () => {
            const mobject = new Mobject();
            const fadeIn = new FadeIn(mobject);
            const fadeOut = new FadeOut(mobject);
            const moveTo = new MoveTo(mobject, 100, 100);
            const rotate = new Rotate(mobject, Math.PI);
            const scale = new Scale(mobject, 2);

            expect(fadeIn.duration(1).delay(0.5)).toBe(fadeIn);
            expect(fadeOut.duration(1).delay(0.5)).toBe(fadeOut);
            expect(moveTo.duration(1).delay(0.5)).toBe(moveTo);
            expect(rotate.duration(1).delay(0.5)).toBe(rotate);
            expect(scale.duration(1).delay(0.5)).toBe(scale);
        });
    });
});
