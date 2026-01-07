import { describe, it, expect } from 'bun:test';
import { BezierPath } from '../../../src/core/math/bezier/BezierPath';
import { Vector2 } from '../../../src/core/math/Vector2/Vector2';

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

  describe('Morphing Support', () => {
    it('should clone the path correctly', () => {
      const path = new BezierPath();
      path.moveTo(new Vector2(0, 0));
      path.lineTo(new Vector2(10, 10));

      const clone = path.clone();
      const cmds = clone.getCommands();

      expect(cmds.length).toBe(2);
      expect(cmds[0]?.end).toEqual(new Vector2(0, 0));
      expect(cmds[1]?.end).toEqual(new Vector2(10, 10));

      // Verify deep copy (modifying original shouldn't affect clone)
      path.lineTo(new Vector2(20, 20));
      expect(clone.getCommands().length).toBe(2);
      expect(path.getCommands().length).toBe(3);
    });

    it('should return n evenly spaced points', () => {
      const path = new BezierPath();
      path.moveTo(new Vector2(0, 0));
      path.lineTo(new Vector2(10, 0));

      const points = path.getPoints(3);
      expect(points.length).toBe(3);
      expect(points[0]).toEqual(new Vector2(0, 0));
      expect(points[1]).toEqual(new Vector2(5, 0));
      expect(points[2]).toEqual(new Vector2(10, 0));
    });

    it('should return correct point count', () => {
      const path = new BezierPath();
      path.moveTo(new Vector2(0, 0)); // 1
      path.lineTo(new Vector2(10, 0)); // 2
      expect(path.getPointCount()).toBe(2);
    });

    it('should convert to cubic commands', () => {
      const path = new BezierPath();
      path.moveTo(new Vector2(0, 0));
      path.lineTo(new Vector2(10, 10)); // Should become Cubic

      const cubicPath = path.toCubic();
      const cmds = cubicPath.getCommands();

      expect(cmds.length).toBe(2);
      expect(cmds[0]?.type).toBe('Move');
      expect(cmds[1]?.type).toBe('Cubic');
      // Cubic representation of line (0,0)->(10,10)
      // C1 = (3.33, 3.33), C2 = (6.66, 6.66)
      expect(cmds[1]?.control1?.x).toBeCloseTo(3.333, 2);
      expect(cmds[1]?.control1?.y).toBeCloseTo(3.333, 2);
      expect(cmds[1]?.control2?.x).toBeCloseTo(6.666, 2);
      expect(cmds[1]?.control2?.y).toBeCloseTo(6.666, 2);
      expect(cmds[1]?.end).toEqual(new Vector2(10, 10));
    });

    it('should match point counts between paths', () => {
      const p1 = new BezierPath();
      p1.moveTo(new Vector2(0, 0));
      p1.lineTo(new Vector2(10, 0));
      // p1 has 2 commands (Move, Line) -> (Move, Cubic)

      const p2 = new BezierPath();
      p2.moveTo(new Vector2(0, 0));
      p2.lineTo(new Vector2(5, 0));
      p2.lineTo(new Vector2(10, 0));
      // p2 has 3 commands (Move, Line, Line) -> (Move, Cubic, Cubic)

      const [m1, m2] = BezierPath.matchPoints(p1, p2);

      expect(m1.getPointCount()).toBe(m2.getPointCount());
      expect(m1.getPointCount()).toBe(3); // p1 should be subdivided
    });

    it('should interpolate between paths', () => {
      const p1 = new BezierPath();
      p1.moveTo(new Vector2(0, 0));
      p1.lineTo(new Vector2(10, 0));

      const p2 = new BezierPath();
      p2.moveTo(new Vector2(0, 10));
      p2.lineTo(new Vector2(10, 10));

      // Interpolate at t=0.5
      const mid = BezierPath.interpolate(p1, p2, 0.5);
      const cmds = mid.getCommands();

      expect(cmds[0]?.end.y).toBeCloseTo(5); // Move y
      expect(cmds[1]?.end.y).toBeCloseTo(5); // Line end y
      expect(cmds[1]?.type).toBe('Cubic'); // Result is always cubic
    });

    it('interpolate(0) equals p1 and interpolate(1) equals p2 (structurally)', () => {
      const p1 = new BezierPath();
      p1.moveTo(Vector2.ZERO);
      p1.lineTo(new Vector2(10, 0));

      const p2 = new BezierPath();
      p2.moveTo(new Vector2(0, 10));
      p2.lineTo(new Vector2(10, 10));

      const i0 = BezierPath.interpolate(p1, p2, 0);
      const i1 = BezierPath.interpolate(p1, p2, 1);

      // Check end points
      expect(i0.getPointAt(0)).toEqual(p1.getPointAt(0));
      expect(i0.getPointAt(1)).toEqual(p1.getPointAt(1));

      expect(i1.getPointAt(0)).toEqual(p2.getPointAt(0));
      expect(i1.getPointAt(1)).toEqual(p2.getPointAt(1));
    });
  });
});