import { Animation } from './Animation';
import { Parallel } from './composition/Parallel';
import { Sequence } from './composition/Sequence';
import { Draw } from './draw/Draw';
import { Unwrite } from './draw/Unwrite';
import { Write } from './draw/Write';
import { FadeIn } from './fade/FadeIn';
import { FadeOut } from './fade/FadeOut';
import { MorphTo } from './morph/MorphTo';
import { MoveTo } from './transform/MoveTo';
import { Rotate } from './transform/Rotate';
import { Scale } from './transform/Scale';
import type { Mobject, VMobject } from '../mobjects';

function withDuration<T extends Animation<Mobject>>(animation: T, durationSeconds?: number): T {
  if (durationSeconds !== undefined) {
    animation.duration(durationSeconds);
  }
  return animation;
}

export function createFadeIn(target: Mobject, durationSeconds?: number): FadeIn<Mobject> {
  return withDuration(new FadeIn(target), durationSeconds);
}

export function createFadeOut(target: Mobject, durationSeconds?: number): FadeOut<Mobject> {
  return withDuration(new FadeOut(target), durationSeconds);
}

export function createMoveTo(
  target: Mobject,
  x: number,
  y: number,
  durationSeconds?: number
): MoveTo<Mobject> {
  return withDuration(new MoveTo(target, x, y), durationSeconds);
}

export function createRotate(target: Mobject, angle: number, durationSeconds?: number): Rotate<Mobject> {
  return withDuration(new Rotate(target, angle), durationSeconds);
}

export function createScale(
  target: Mobject,
  factorX: number,
  factorY: number = factorX,
  durationSeconds?: number
): Scale<Mobject> {
  return withDuration(new Scale(target, factorX, factorY), durationSeconds);
}

export function createMorphTo(
  source: VMobject,
  target: VMobject,
  durationSeconds?: number
): MorphTo<VMobject> {
  return withDuration(new MorphTo(source, target), durationSeconds);
}

export function createParallel(animations: Animation<Mobject>[]): Parallel {
  return new Parallel(animations);
}

export function createSequence(animations: Animation<Mobject>[]): Sequence {
  return new Sequence(animations);
}

export function createWrite(target: VMobject, durationSeconds?: number): Write<VMobject> {
  return withDuration(new Write(target), durationSeconds);
}

export function createUnwrite(target: VMobject, durationSeconds?: number): Unwrite<VMobject> {
  return withDuration(new Unwrite(target), durationSeconds);
}

export function createDraw(target: VMobject, durationSeconds?: number): Draw<VMobject> {
  return withDuration(new Draw(target), durationSeconds);
}
