import { parseTargets } from './animatables';
import { activeInstances } from './engine';
import { arrayContains } from './helpers';

export function removeInsFromActiveInstances(ins) {
  const tlIndex = activeInstances.indexOf(ins);
  if (tlIndex > -1) {
    activeInstances.splice(tlIndex, 1);
  }
}

export function removeInsFromParent(ins) {
  const parent = ins.parent;
  const parentChildren = parent.children;

  if ('reversedInTl' in ins) {
    delete ins.reversedInTl;
  }

  const insIndex = parentChildren.indexOf(ins);
  ~insIndex && parentChildren.splice(insIndex, 1);
}

// Remove targets from animation

export function removeTargetsFromAnimations(targetsArray, animations) {
  for (let a = animations.length; a--; ) {
    if (arrayContains(targetsArray, animations[a].animatable.target)) {
      animations.splice(a, 1);
    }
  }
}

export function removeTargetsFromInstance(targetsArray, instance) {
  const animations = instance.animations;
  const children = instance.children;
  removeTargetsFromAnimations(targetsArray, animations);
  for (let c = children.length; c--; ) {
    const child = children[c];
    const childAnimations = child.animations;
    removeTargetsFromAnimations(targetsArray, childAnimations);
    if (!childAnimations.length && !child.children.length) children.splice(c, 1);
  }
  if (!animations.length && !children.length) instance.pause();
}

export function removeTargetsFromActiveInstances(targets) {
  const targetsArray = parseTargets(targets);
  for (let i = activeInstances.length; i--; ) {
    const instance = activeInstances[i];
    removeTargetsFromInstance(targetsArray, instance);
  }
}
