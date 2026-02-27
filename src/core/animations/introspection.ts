import { Animation } from './Animation';

type AnimationWithChildren = Animation & {
  getChildren(): readonly Animation[];
};

function hasAnimationChildren(animation: Animation): animation is AnimationWithChildren {
  return 'getChildren' in animation && typeof animation.getChildren === 'function';
}

export function getAnimationChildren(animation: Animation): readonly Animation[] {
  if (hasAnimationChildren(animation)) {
    return animation.getChildren();
  }
  return [];
}

export function getAnimationTotalTime(animation: Animation): number {
  return animation.getDuration() + animation.getDelay();
}

export function getLongestAnimationTotalTime(animations: readonly Animation[]): number {
  let longest = 0;
  for (const animation of animations) {
    const totalTime = getAnimationTotalTime(animation);
    if (totalTime > longest) {
      longest = totalTime;
    }
  }
  return longest;
}
