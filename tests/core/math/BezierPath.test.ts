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
});
