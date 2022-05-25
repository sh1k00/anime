import { defaultInstanceSettings, defaultTweenSettings } from './consts.js';

import {
  clamp,
  random,
  is,
  filterArray,
  flattenArray,
  toArray,
  arrayContains,
  cloneObject,
  replaceObjectProps,
  mergeObjects,
} from './helpers.js';

import { parseEasings, penner, spring } from './easings.js';
import { getUnit, convertPxToUnit } from './units.js';

import {
  getOriginalTargetValue,
  getElementTransforms,
  getAnimationType,
  getFunctionValue,
  getRelativeValue,
  setValueByType,
  validateValue,
  decomposeValue,
} from './values.js';
import { setDashoffset, getPath, getPathProgress } from './svg.js';
import { parseTargets, getAnimatables } from './animatables.js';
import { getTimingsFromAnimations } from './timings.js';
import { createTimeline } from './timelines.js';
import { startEngine, activeInstances } from './engine.js';
import { animate } from './animate.js';

// Remove targets from animation

function removeTargetsFromAnimations(targetsArray, animations) {
  for (let a = animations.length; a--; ) {
    if (arrayContains(targetsArray, animations[a].animatable.target)) {
      animations.splice(a, 1);
    }
  }
}

function removeTargetsFromInstance(targetsArray, instance) {
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

function removeTargetsFromActiveInstances(targets) {
  const targetsArray = parseTargets(targets);
  for (let i = activeInstances.length; i--; ) {
    const instance = activeInstances[i];
    removeTargetsFromInstance(targetsArray, instance);
  }
}

// Stagger helpers

function stagger(val, params = {}) {
  const direction = params.direction || 'normal';
  const easing = params.easing ? parseEasings(params.easing) : null;
  const grid = params.grid;
  const axis = params.axis;
  let fromIndex = params.from || 0;
  const fromFirst = fromIndex === 'first';
  const fromCenter = fromIndex === 'center';
  const fromLast = fromIndex === 'last';
  const isRange = is.arr(val);
  const val1 = isRange ? parseFloat(val[0]) : parseFloat(val);
  const val2 = isRange ? parseFloat(val[1]) : 0;
  const unit = getUnit(isRange ? val[1] : val) || 0;
  const start = params.start || 0 + (isRange ? val1 : 0);
  let values = [];
  let maxValue = 0;
  return (el, i, t) => {
    if (fromFirst) fromIndex = 0;
    if (fromCenter) fromIndex = (t - 1) / 2;
    if (fromLast) fromIndex = t - 1;
    if (!values.length) {
      for (let index = 0; index < t; index++) {
        if (!grid) {
          values.push(Math.abs(fromIndex - index));
        } else {
          const fromX = !fromCenter ? fromIndex % grid[0] : (grid[0] - 1) / 2;
          const fromY = !fromCenter ? Math.floor(fromIndex / grid[0]) : (grid[1] - 1) / 2;
          const toX = index % grid[0];
          const toY = Math.floor(index / grid[0]);
          const distanceX = fromX - toX;
          const distanceY = fromY - toY;
          let value = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
          if (axis === 'x') value = -distanceX;
          if (axis === 'y') value = -distanceY;
          values.push(value);
        }
        maxValue = Math.max(...values);
      }
      if (easing) values = values.map((val) => easing(val / maxValue) * maxValue);
      if (direction === 'reverse') values = values.map((val) => (axis ? (val < 0 ? val * -1 : -val) : Math.abs(maxValue - val)));
    }
    const spacing = isRange ? (val2 - val1) / maxValue : val1;
    return start + spacing * (Math.round(values[i] * 100) / 100) + unit;
  };
}

// Timeline

function timeline(params = {}) {
  let tl = animate(params);
  tl.duration = 0;
  tl.add = function (instanceParams, timelineOffset) {
    const tlIndex = activeInstances.indexOf(tl);
    const children = tl.children;
    if (tlIndex > -1) activeInstances.splice(tlIndex, 1);
    let insParams = mergeObjects(instanceParams, replaceObjectProps(defaultTweenSettings, params));
    insParams.targets = insParams.targets || params.targets;
    const tlDuration = tl.duration;
    insParams.autoplay = false;
    insParams.direction = tl.direction;
    insParams.timelineOffset = is.und(timelineOffset) ? tlDuration : getRelativeValue(timelineOffset, tlDuration);
    tl.seekSilently(insParams.timelineOffset);
    const ins = animate(insParams);
    const totalDuration = ins.duration + insParams.timelineOffset;
    children.push(ins);
    const timings = getTimingsFromAnimations(children, params);
    tl.delay = timings.delay;
    tl.endDelay = timings.endDelay;
    tl.duration = timings.duration;
    tl.seekSilently(0);
    tl.reset();
    if (tl.autoplay) tl.play();
    return tl;
  };
  return tl;
}

// Set Value helper

function setTargetsValue(targets, properties) {
  const animatables = getAnimatables(targets);
  animatables.forEach((animatable) => {
    for (let property in properties) {
      const value = getFunctionValue(properties[property], animatable);
      const target = animatable.target;
      const valueUnit = getUnit(value);
      const originalValue = getOriginalTargetValue(target, property, valueUnit, animatable);
      const unit = valueUnit || getUnit(originalValue);
      const to = getRelativeValue(validateValue(value, unit), originalValue);
      const animType = getAnimationType(target, property);
      setValueByType[animType](target, property, to, animatable.transforms, true);
    }
  });
}

const anime = animate;

anime.version = '__packageVersion__';
anime.speed = 1;
anime.suspendWhenDocumentHidden = true;
anime.running = activeInstances;
anime.remove = removeTargetsFromActiveInstances;
anime.get = getOriginalTargetValue;
anime.set = setTargetsValue;
anime.convertPx = convertPxToUnit;
anime.path = getPath;
anime.setDashoffset = setDashoffset;
anime.stagger = stagger;
anime.timeline = timeline;
anime.easing = parseEasings;
anime.penner = penner;
anime.clamp = clamp;
anime.random = random;

export default anime;
