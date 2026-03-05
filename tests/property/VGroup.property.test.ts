import { describe, test, expect } from 'bun:test';
import * as fc from 'fast-check';
import { VGroup } from '../../src/core/mobjects/VGroup';
import { Rectangle } from '../../src/core/mobjects/geometry/Rectangle';
import { Circle } from '../../src/core/mobjects/geometry/Circle';



describe('VGroup Property Tests', () => {
    test('getBoundingBox minX <= maxX and minY <= maxY', () => {
        fc.assert(fc.property(
            fc.array(fc.tuple(
                fc.double({ min: -100, max: 100, noNaN: true }),
                fc.double({ min: -100, max: 100, noNaN: true })
            ), { minLength: 1, maxLength: 5 }),
            (positions) => {
                const children = positions.map(([x, y]) => {
                    const r = new Rectangle(1, 1);
                    r.pos(x, y);
                    return r;
                });
                const group = new VGroup(...children);
                const bounds = group.getBoundingBox();
                return bounds.minX <= bounds.maxX && bounds.minY <= bounds.maxY;
            }
        ));
    });

    test('getBoundingBox contains all children bounds', () => {
        fc.assert(fc.property(
            fc.array(fc.tuple(
                fc.double({ min: -50, max: 50, noNaN: true }),
                fc.double({ min: -50, max: 50, noNaN: true })
            ), { minLength: 1, maxLength: 5 }),
            (positions) => {
                const children = positions.map(([x, y]) => {
                    const r = new Rectangle(2, 2);
                    r.pos(x, y);
                    return r;
                });
                const group = new VGroup(...children);
                const groupBounds = group.getBoundingBox();

                for (const child of children) {
                    const childBounds = child.getBoundingBox();
                    if (childBounds.minX < groupBounds.minX - 1e-3) return false;
                    if (childBounds.maxX > groupBounds.maxX + 1e-3) return false;
                    if (childBounds.minY < groupBounds.minY - 1e-3) return false;
                    if (childBounds.maxY > groupBounds.maxY + 1e-3) return false;
                }
                return true;
            }
        ));
    });

    test('center() moves group center to origin', () => {
        fc.assert(fc.property(
            fc.double({ min: -50, max: 50, noNaN: true }),
            fc.double({ min: -50, max: 50, noNaN: true }),
            (x, y) => {
                const r = new Rectangle(2, 2);
                r.pos(x, y);
                const group = new VGroup(r);
                group.center();
                const bounds = group.getBoundingBox();
                const centerX = (bounds.minX + bounds.maxX) / 2;
                const centerY = (bounds.minY + bounds.maxY) / 2;
                return Math.abs(centerX) < 1e-3 && Math.abs(centerY) < 1e-3;
            }
        ));
    });

    test('Geometry transforms: moving group updates descendant geometry positions', () => {
        fc.assert(fc.property(
            fc.double({ min: -50, max: 50, noNaN: true }),
            fc.double({ min: -50, max: 50, noNaN: true }),
            (tx, ty) => {
                const c1 = new Circle(1);
                const c2 = new Circle(1);
                c2.pos(5, 0);
                const group = new VGroup(c1, c2);

                const beforeGroupPos = group.position;
                const beforeC1Local = c1.position;
                const beforeC2Local = c2.position;

                group.pos(tx, ty);

                // Geometry is transformed in-place.
                const afterC1Local = c1.position;
                const afterC2Local = c2.position;
                const dx = tx - beforeGroupPos.x;
                const dy = ty - beforeGroupPos.y;
                const localShifted =
                    Math.abs(afterC1Local.x - (beforeC1Local.x + dx)) < 1e-2 &&
                    Math.abs(afterC1Local.y - (beforeC1Local.y + dy)) < 1e-2 &&
                    Math.abs(afterC2Local.x - (beforeC2Local.x + dx)) < 1e-2 &&
                    Math.abs(afterC2Local.y - (beforeC2Local.y + dy)) < 1e-2;

                // World matrix should match effective geometry transform.
                const c1World = c1.getWorldMatrix();
                const c2World = c2.getWorldMatrix();
                const c1WorldPos = { x: c1World.values[3]!, y: c1World.values[7]! };
                const c2WorldPos = { x: c2World.values[3]!, y: c2World.values[7]! };

                const worldCorrect =
                    Math.abs(c1WorldPos.x - afterC1Local.x) < 1e-3 &&
                    Math.abs(c1WorldPos.y - afterC1Local.y) < 1e-3 &&
                    Math.abs(c2WorldPos.x - afterC2Local.x) < 1e-3 &&
                    Math.abs(c2WorldPos.y - afterC2Local.y) < 1e-3;

                return localShifted && worldCorrect;
            }
        ));
    });
});
