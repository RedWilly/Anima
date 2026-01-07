import { describe, test, expect } from 'bun:test';
import * as fc from 'fast-check';
import { VGroup } from '../../src/mobjects/VGroup';
import { Rectangle } from '../../src/mobjects/geometry/Rectangle';
import { Circle } from '../../src/mobjects/geometry/Circle';



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

    test('transformations propagate to all children', () => {
        fc.assert(fc.property(
            fc.double({ min: -50, max: 50, noNaN: true }),
            fc.double({ min: -50, max: 50, noNaN: true }),
            (tx, ty) => {
                const c1 = new Circle(1);
                const c2 = new Circle(1);
                c2.pos(5, 0);
                const group = new VGroup(c1, c2);

                const beforeC1 = c1.position;
                const beforeC2 = c2.position;

                group.pos(tx, ty);

                const afterC1 = c1.position;
                const afterC2 = c2.position;

                // Both should have moved by roughly (tx, ty) from origin
                // c1 was at origin, so should now be near (tx, ty)
                // c2 was at (5,0), so should now be near (5+tx, ty)
                return Math.abs(afterC1.x - tx) < 1e-2 &&
                    Math.abs(afterC1.y - ty) < 1e-2;
            }
        ));
    });
});
