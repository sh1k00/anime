import { settings } from './consts';

export function getTimingsFromAnimations(animations, tweenSettings) {
  const animationsLength = animations.length;
  const { delay, duration, endDelay } = tweenSettings;

  if (!animationsLength) {
    return {
      delay,
      duration: delay + duration + endDelay,
      endDelay,
    };
  }

  const timings = {};

  for (let i = 0; i < animationsLength; i++) {
    const anim = animations[i];
    const animTlOffset = anim.timelineOffset;
    const delay = animTlOffset + anim.delay;
    if (!timings.delay || delay < timings.delay) {
      timings.delay = delay;
    }
    const duration = animTlOffset + anim.duration;
    if (!timings.duration || duration > timings.duration) {
      timings.duration = duration;
    }
    const endDelay = animTlOffset + anim.duration - anim.endDelay;
    if (!timings.endDelay || endDelay > timings.endDelay) {
      timings.endDelay = endDelay;
    }
  }

  timings.endDelay = timings.duration - timings.endDelay;

  return timings;
}

//Calculate time between two frames
let count = 0;
let prevTime = 0;
export function setTimeBtwnEachFrame(time = 0) {
  let now = time;
  let diff = now - prevTime;
  prevTime = now;
  count++;
  if (diff > 0 && count >= 30) {
    settings.timeBtwnEachFrame = diff;
    return;
  }
  requestAnimationFrame(setTimeBtwnEachFrame);
}
