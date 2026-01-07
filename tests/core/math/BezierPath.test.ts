import { describe, it, expect } from 'bun:test';
import { BezierPath } from '../../../src/core/math/BezierPath';
import { Vector2 } from '../../../src/core/math/Vector2';

describe('BezierPath', () => {
  it('should create a path and add a move command', () => {
    const path = new BezierPath();
    const point = new Vector2(10, 20);
    path.moveTo(point);

    const commands = path.getCommands();
    expect(commands.length).toBe(1);
    expect(commands[0]?.type).toBe('Move');
    expect(commands[0]?.end).toEqual(point);
  });

  it('should add a line segment', () => {
    const path = new BezierPath();
    path.moveTo(new Vector2(0, 0));
    const end = new Vector2(10, 10);
    path.lineTo(end);

    const commands = path.getCommands();
    expect(commands.length).toBe(2);
    expect(commands[1]?.type).toBe('Line');
    expect(commands[1]?.end).toEqual(end);
  });

  it('should add a quadratic curve', () => {
    const path = new BezierPath();
    path.moveTo(new Vector2(0, 0));
    const control = new Vector2(5, 0);
    const end = new Vector2(10, 10);
    path.quadraticTo(control, end);

    const commands = path.getCommands();
    expect(commands.length).toBe(2);
    expect(commands[1]?.type).toBe('Quadratic');
    expect(commands[1]?.control1).toEqual(control);
    expect(commands[1]?.end).toEqual(end);
  });

  it('should add a cubic curve', () => {
    const path = new BezierPath();
    path.moveTo(new Vector2(0, 0));
    const c1 = new Vector2(0, 5);
    const c2 = new Vector2(10, 5);
    const end = new Vector2(10, 10);
    path.cubicTo(c1, c2, end);

    const commands = path.getCommands();
    expect(commands.length).toBe(2);
    expect(commands[1]?.type).toBe('Cubic');
    expect(commands[1]?.control1).toEqual(c1);
    expect(commands[1]?.control2).toEqual(c2);
    expect(commands[1]?.end).toEqual(end);
  });

  it('should close the path', () => {
    const path = new BezierPath();
    const start = new Vector2(0, 0);
    path.moveTo(start);
    path.lineTo(new Vector2(10, 10));
    path.lineTo(new Vector2(0, 10));
    path.closePath();

    const commands = path.getCommands();
    expect(commands.length).toBe(4);
    expect(commands[3]?.type).toBe('Close');
    expect(commands[3]?.end).toEqual(start);
  });

  describe('Path Analysis', () => {
    it('should calculate length of straight line path', () => {
      const path = new BezierPath();
      path.moveTo(new Vector2(0, 0));
      path.lineTo(new Vector2(10, 0));
      expect(path.getLength()).toBeCloseTo(10);
    });

    it('should calculate length of multi-segment path', () => {
      const path = new BezierPath();
      path.moveTo(new Vector2(0, 0));
      path.lineTo(new Vector2(10, 0)); // 10
      path.lineTo(new Vector2(10, 10)); // 10
      expect(path.getLength()).toBeCloseTo(20);
    });

    it('should return correct point at t for lines', () => {
      const path = new BezierPath();
      path.moveTo(new Vector2(0, 0));
      path.lineTo(new Vector2(10, 0));
      path.lineTo(new Vector2(20, 0));

      const pStart = path.getPointAt(0);
      const pMid = path.getPointAt(0.5);
      const pEnd = path.getPointAt(1);

      expect(pStart.x).toBeCloseTo(0);
      expect(pStart.y).toBeCloseTo(0);
      expect(pMid.x).toBeCloseTo(10);
      expect(pMid.y).toBeCloseTo(0);
      expect(pEnd.x).toBeCloseTo(20);
      expect(pEnd.y).toBeCloseTo(0);
    });

    it('should return correct tangent at t for lines', () => {
      const path = new BezierPath();
      path.moveTo(new Vector2(0, 0));
      path.lineTo(new Vector2(10, 0));
      path.lineTo(new Vector2(10, 10));

      const t1 = path.getTangentAt(0.25); // On first segment (horizontal)
      expect(t1.x).toBeCloseTo(1);
      expect(t1.y).toBeCloseTo(0);

      const t2 = path.getTangentAt(0.75); // On second segment (vertical up)
      expect(t2.x).toBeCloseTo(0);
      expect(t2.y).toBeCloseTo(1);
    });

    it('should approximate length of curves reasonably well', () => {
        // Quarter circle approximation with cubic bezier
        // Control points for quarter circle: (1, k) and (k, 1) where k = 0.55228475
        const k = 0.55228475;
        const r = 100;
        const path = new BezierPath();
        path.moveTo(new Vector2(r, 0));
        path.cubicTo(
            new Vector2(r, r * k),
            new Vector2(r * k, r),
            new Vector2(0, r)
        );

        const expectedLength = 0.5 * Math.PI * r; // ~157.08
        expect(path.getLength()).toBeGreaterThan(expectedLength * 0.99);
        expect(path.getLength()).toBeLessThan(expectedLength * 1.01);
    });
  });
});