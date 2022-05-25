import { settings } from './consts.js';
import { clamp, filterArray } from './helpers.js';
import { createTimeline } from './timelines.js';
import { setValueByType } from './values.js';
import { startEngine, activeInstances } from './engine.js';
import { getPathProgress } from './svg.js';
import { removeInsFromActiveInstances } from './utils.js';

export function animate(params = {}) {
  let startTime = 0,
    lastTime = 0,
    now = 0;
  let children,
    childrenLength = 0;
  let resolve = null;

  function makePromise(instance) {
    const promise = window.Promise && new Promise((_resolve) => (resolve = _resolve));
    instance.finished = promise;
    return promise;
  }

  let instance = createTimeline(params);
  let promise = makePromise(instance);

  function toggleInstanceDirection() {
    const direction = instance.direction;
    if (direction !== 'alternate') {
      instance.direction = direction !== 'normal' ? 'normal' : 'reverse';
    }
    instance.reversed = !instance.reversed;

    const deepReverseChildren = (ins) => {
      const children = ins.children;
      children.forEach((child) => {
        child.reversed = !child.reversed;
        child.direction = child.reversed ? 'reverse' : 'normal';
        if (child.children.length) deepReverseChildren(child);
      });
    };
    deepReverseChildren(instance);
  }

  function adjustTime(time) {
    return instance.reversed ? instance.duration - time : time;
  }

  function resetTime() {
    startTime = 0;
    lastTime = adjustTime(instance.currentTime) * (1 / instance.timeScale) * (1 / settings.speed);
  }

  function seekChild(time, child, muteCallbacks) {
    if (child && !child.killed) {
      const t =
        'reversedInTl' in child && child.reversedInTl ? child.duration - (time - child.timelineOffset) : time - child.timelineOffset;
      if (!muteCallbacks) {
        child.seek(t);
      } else {
        child.seekSilently(t);
      }
    }
  }

  function syncInstanceChildren(time, muteCallbacks) {
    //Remove killed children
    if (instance.updateChildren) {
      instance.children = filterArray(instance.children, (child) => !child.killed);
      delete instance.updateChildren;
    }
    if (!instance.reversePlayback) {
      for (let i = 0; i < childrenLength; i++) seekChild(time, children[i], muteCallbacks);
    } else {
      for (let i = childrenLength; i--; ) seekChild(time, children[i], muteCallbacks);
    }
  }

  function setAnimationsProgress(insTime) {
    let i = 0;
    const animations = instance.animations;
    const animationsLength = animations.length;
    while (i < animationsLength) {
      const anim = animations[i];
      const animatable = anim.animatable;
      const tweens = anim.tweens;
      const tweenLength = tweens.length - 1;
      let tween = tweens[tweenLength];
      // Only check for keyframes if there is more than one tween
      if (tweenLength) tween = filterArray(tweens, (t) => insTime < t.end)[0] || tween;
      const elapsed = clamp(insTime - tween.start - tween.delay, 0, tween.duration) / tween.duration;
      const eased = isNaN(elapsed) ? 1 : tween.easing(elapsed);
      const strings = tween.to.strings;
      const round = tween.round;
      const numbers = [];
      const toNumbersLength = tween.to.numbers.length;
      let progress;
      for (let n = 0; n < toNumbersLength; n++) {
        let value;
        const toNumber = tween.to.numbers[n];
        const fromNumber = tween.from.numbers[n] || 0;
        if (!tween.isPath) {
          value = fromNumber + eased * (toNumber - fromNumber);
        } else {
          value = getPathProgress(tween.value, eased * toNumber, tween.isPathTargetInsideSVG);
        }
        if (round) {
          if (!(tween.isColor && n > 2)) {
            value = Math.round(value * round) / round;
          }
        }
        numbers.push(value);
      }
      // Manual Array.reduce for better performances
      const stringsLength = strings.length;
      if (!stringsLength) {
        progress = numbers[0];
      } else {
        progress = strings[0];
        for (let s = 0; s < stringsLength; s++) {
          const a = strings[s];
          const b = strings[s + 1];
          const n = numbers[s];
          if (!isNaN(n)) {
            if (!b) {
              progress += n + ' ';
            } else {
              progress += n + b;
            }
          }
        }
      }
      setValueByType[anim.type](animatable.target, anim.property, progress, animatable.transforms);
      anim.currentValue = progress;
      i++;
    }
  }

  function countIteration() {
    if (instance.remainingLoops && instance.remainingLoops !== true) {
      instance.remainingLoops--;
    }
  }

  function beginInstance(fnc, insTime, insDuration, prop = 'began') {
    const begin = () => {
      const beginInFirstCall = insDuration < settings.timeBtwnEachFrame && insDuration > 0;
      if (
        (!instance.reversed && (instance.currentTime > 0 || (beginInFirstCall && insTime > 0))) ||
        (instance.reversed &&
          ((instance.currentTime > 0 && instance.currentTime < insDuration) || (beginInFirstCall && insTime < insDuration)))
      ) {
        instance[prop] = true;
        fnc(instance);
      }
    };

    if (!instance[prop]) {
      if (instance.parent) {
        if (instance.parent[prop]) {
          begin();
        }
      } else {
        begin();
      }
    }
  }

  function setInstanceProgress(engineTime) {
    const insDuration = instance.duration;
    const insDelay = instance.delay;
    const insEndDelay = insDuration - instance.endDelay;
    const insTime = adjustTime(engineTime);
    instance.progress = clamp(insTime / insDuration, 0, 1);
    instance.reversePlayback = insTime < instance.currentTime;

    beginInstance(instance.begin, insTime, insDuration);
    beginInstance(instance.loopBegin, insTime, insDuration, 'loopBegan');

    if (childrenLength) {
      syncInstanceChildren(insTime);
    }
    if (insTime <= insDelay && instance.currentTime !== 0) {
      setAnimationsProgress(0);
    }
    if ((insTime >= insEndDelay && instance.currentTime !== insDuration) || !insDuration) {
      setAnimationsProgress(insDuration);
    }
    if (insTime > insDelay && insTime < insEndDelay) {
      if (!instance.changeBegan) {
        instance.changeBegan = true;
        instance.changeCompleted = false;
        instance.changeBegin(instance);
      }
      instance.change(instance);
      setAnimationsProgress(insTime);
    } else {
      if (instance.changeBegan) {
        instance.changeCompleted = true;
        instance.changeBegan = false;
        instance.changeComplete(instance);
      }
    }
    instance.currentTime = clamp(insTime, 0, insDuration);
    if (instance.began) instance.update(instance);
    if (engineTime >= insDuration && instance.began) {
      lastTime = 0;
      countIteration();
      if (!instance.remainingLoops) {
        instance.paused = true;
        if (!instance.completed) {
          instance.completed = true;
          instance.loopComplete(instance);
          instance.complete(instance);
          resolve();
          promise = makePromise(instance);
        }
      } else {
        startTime = now;
        instance.loopComplete(instance);
        instance.loopBegan = false;
        if (instance.direction === 'alternate') {
          toggleInstanceDirection();
        }
      }
    }
    if (!instance.parent && instance.killed) instance = null;
  }

  instance.reset = function () {
    const direction = instance.direction;
    instance.currentTime = 0;
    instance.progress = 0;
    instance.paused = true;
    instance.began = false;
    instance.loopBegan = false;
    instance.changeBegan = false;
    instance.completed = false;
    instance.changeCompleted = false;
    instance.reversePlayback = false;
    instance.reversed = direction === 'reverse';
    instance.remainingLoops = instance.loop;
    childrenLength = instance.children.length;
    for (let i = childrenLength; i--; ) instance.children[i].reset();
    if ((instance.reversed && instance.loop !== true) || (direction === 'alternate' && instance.loop === 1)) instance.remainingLoops++;
    setAnimationsProgress(instance.reversed ? instance.duration : 0);
    return instance;
  };

  // internal method (for engine) to adjust animation timings before restoring engine ticks (rAF)
  instance._onDocumentVisibility = resetTime;

  instance.tick = function (t) {
    now = t;
    if (!startTime) startTime = now;
    setInstanceProgress((now + (lastTime - startTime)) * instance.timeScale * settings.speed);
  };

  instance.seek = function (time) {
    setInstanceProgress(adjustTime(time));
    return instance;
  };

  instance.seekSilently = function (time) {
    // const insTime = adjustTime(time);
    if (instance.children) {
      syncInstanceChildren(time, true);
    }
    setAnimationsProgress(time);
  };

  instance.pause = function () {
    instance.paused = true;
    resetTime();
    return instance;
  };

  instance.play = function () {
    if (!instance.paused) return;
    if (instance.completed) instance.reset();
    instance.paused = false;
    activeInstances.push(instance);
    resetTime();
    startEngine();
    return instance;
  };

  instance.reverse = function () {
    toggleInstanceDirection();
    resetTime();
    const resetCallbacks = (instance) => {
      const reset = (ins) => {
        if (ins.completed) {
          ins.began = false;
          ins.completed = false;
          ins.loopBegan = false;
        } else if (ins.began) {
          ins.began = false;
          ins.loopBegan = false;
        }
      };
      const resetChildrenCallbacks = (parent) => {
        const children = parent.children;
        children.forEach((child) => {
          reset(child);
          if (child.children.length) resetChildrenCallbacks(child);
        });
      };

      reset(instance);
      resetChildrenCallbacks(instance);
    };
    resetCallbacks(instance);
    return instance;
  };

  instance.restart = function () {
    instance.reset();
    instance.play();
    return instance;
  };

  instance.remove = function (targets) {
    const targetsArray = parseTargets(targets);
    removeTargetsFromInstance(targetsArray, instance);
    return instance;
  };

  instance.kill = function () {
    //Remove from activeInstances
    removeInsFromActiveInstances(instance);

    instance.children.forEach((child) => child.parent === instance && (child.parent = null));
    instance.children = [];
    instance.killed = true;
    instance.parent && (instance.parent.updateChildren = true);
    return null;
  };
  instance.speed = function (value) {
    instance.timeScale = value;
    return instance;
  };

  instance.reset();

  if (instance.autoplay) {
    instance.play();
  }

  return instance;
}
