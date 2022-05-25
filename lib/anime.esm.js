/*
  * anime.js v3.3.0 - ES6 Module
  * (c) 2022 Julian Garnier
  * Released under the MIT license
  * animejs.com
*/

// Misc

const noop = () => {};
const emptyString = '';
const pi = Math.PI;

// Default animation parameters

const defaultInstanceSettings = {
  update: noop,
  begin: noop,
  loopBegin: noop,
  changeBegin: noop,
  change: noop,
  changeComplete: noop,
  loopComplete: noop,
  complete: noop,
  loop: 1,
  direction: 'normal',
  autoplay: true,
  timelineOffset: 0,
  parent: null,
  timeScale: 1,
};

const defaultTweenSettings = {
  duration: 1000,
  delay: 0,
  endDelay: 0,
  easing: 'easeOutElastic(1, .5)',
  round: 0,
};

// Global settings

const settings = {
  speed: 1,
  suspendWhenDocumentHidden: true,
  timeBtwnEachFrame: 16.7,
};

// Transforms

const validTransforms = [
  'translateX',
  'translateY',
  'translateZ',
  'rotate',
  'rotateX',
  'rotateY',
  'rotateZ',
  'scale',
  'scaleX',
  'scaleY',
  'scaleZ',
  'skew',
  'skewX',
  'skewY',
  'perspective',
  'matrix',
  'matrix3d',
];

// Regex

const hexTestRgx = /(^#([\da-f]{3}){1,2}$)|(^#([\da-f]{4}){1,2}$)/i;
const rgbTestRgx = /^rgb/i;
const hslTestRgx = /^hsl/i;
const rgbExecRgx = /rgb\((\d+,\s*[\d]+,\s*[\d]+)\)/i;
const hslExecRgx = /hsl\(\s*(-?\d+|-?\d*.\d+)\s*,\s*(-?\d+|-?\d*.\d+)%\s*,\s*(-?\d+|-?\d*.\d+)%\s*\)/i;
const hslaExecRgx = /hsla\(\s*(-?\d+|-?\d*.\d+)\s*,\s*(-?\d+|-?\d*.\d+)%\s*,\s*(-?\d+|-?\d*.\d+)%\s*,\s*(-?\d+|-?\d*.\d+)\s*\)/i;
const springTestRgx = /^spring/;
const easingsExecRgx = /\(([^)]+)\)/;
const unitsExecRgx = /[+-]?\d*\.?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?(%|px|pt|em|rem|in|cm|mm|ex|ch|pc|vw|vh|vmin|vmax|deg|rad|turn)?$/;
const digitWithExponentRgx = /[+-]?\d*\.?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g;
const lowerCaseRgx = /([a-z])([A-Z])/g;
const transformsExecRgx = /(\w+)\(([^)]*)\)/g;
const relativeValuesExecRgx = /^(\*=|\+=|-=)/;
const whiteSpaceTestRgx = /\s/g;

// Strings functions

function selectString(str) {
  try {
    let nodes = document.querySelectorAll(str);
    return nodes;
  } catch (e) {
    return;
  }
}

function stringContains(str, text) {
  return str.indexOf(text) > -1;
}

// Numbers functions

function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

function round(val, base = 1) {
  return Math.round(val * base) / base;
}

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Types

const is = {
  arr: (a) => Array.isArray(a),
  obj: (a) => stringContains(Object.prototype.toString.call(a), 'Object'),
  pth: (a) => is.obj(a) && a.hasOwnProperty('totalLength'),
  svg: (a) => a instanceof SVGElement,
  inp: (a) => a instanceof HTMLInputElement,
  dom: (a) => a.nodeType || is.svg(a),
  str: (a) => typeof a === 'string',
  fnc: (a) => typeof a === 'function',
  und: (a) => typeof a === 'undefined',
  nil: (a) => is.und(a) || a === null,
  hex: (a) => hexTestRgx.test(a),
  rgb: (a) => rgbTestRgx.test(a),
  hsl: (a) => hslTestRgx.test(a),
  col: (a) => is.hex(a) || is.rgb(a) || is.hsl(a),
  key: (a) => !defaultInstanceSettings.hasOwnProperty(a) && !defaultTweenSettings.hasOwnProperty(a) && a !== 'targets' && a !== 'keyframes',
  anime: (a) => is.obj(a) && a.hasOwnProperty('animatables') && !a.hasOwnProperty('add'),
  tl: (a) => is.obj(a) && a.hasOwnProperty('add') && is.fnc(a.add),
};

// Arrays

function filterArray(arr, callback) {
  const len = arr.length;
  const thisArg = arguments.length >= 2 ? arguments[1] : void 0;
  const result = [];
  for (let i = 0; i < len; i++) {
    if (i in arr) {
      const val = arr[i];
      if (callback.call(thisArg, val, i, arr)) {
        result.push(val);
      }
    }
  }
  return result;
}

function flattenArray(arr) {
  return arr.reduce((a, b) => a.concat(is.arr(b) ? flattenArray(b) : b), []);
}

function toArray(o) {
  if (is.arr(o)) return o;
  if (is.str(o)) o = selectString(o) || o;
  if (o instanceof NodeList || o instanceof HTMLCollection) return [].slice.call(o);
  return [o];
}

function arrayContains(arr, val) {
  return arr.some((a) => a === val);
}

// Objects

function cloneObject(o) {
  const clone = {};
  for (let p in o) clone[p] = o[p];
  return clone;
}

function replaceObjectProps(o1, o2) {
  const o = cloneObject(o1);
  for (let p in o1) o[p] = o2.hasOwnProperty(p) ? o2[p] : o1[p];
  return o;
}

function mergeObjects(o1, o2) {
  const o = cloneObject(o1);
  for (let p in o2) o[p] = is.und(o1[p]) ? o2[p] : o1[p];
  return o;
}

// Functions

function applyArguments(func, args) {
  return func.apply(null, args);
}

// Document

const isBrowser = !is.und(window) && !is.und(window.document);

function isDocumentHidden() {
  return isBrowser && document.hidden;
}

// Cache

const cache = {
  CSS: {},
  springs: {}
};

// Easings

function parseEasingParameters(string) {
  const match = easingsExecRgx.exec(string);
  return match ? match[1].split(',').map(p => parseFloat(p)) : [];
}

// Spring solver inspired by Webkit Copyright © 2016 Apple Inc. All rights reserved. https://webkit.org/demos/spring/spring.js

function spring(string, duration) {
  const params = parseEasingParameters(string);
  const mass = clamp(is.und(params[0]) ? 1 : params[0], .1, 100);
  const stiffness = clamp(is.und(params[1]) ? 100 : params[1], .1, 100);
  const damping = clamp(is.und(params[2]) ? 10 : params[2], .1, 100);
  const velocity =  clamp(is.und(params[3]) ? 0 : params[3], .1, 100);

  const w0 = Math.sqrt(stiffness / mass);
  const zeta = damping / (2 * Math.sqrt(stiffness * mass));
  const wd = zeta < 1 ? w0 * Math.sqrt(1 - zeta * zeta) : 0;
  const a = 1;
  const b = zeta < 1 ? (zeta * w0 + -velocity) / wd : -velocity + w0;

  function solver(t) {
    let progress = duration ? (duration * t) / 1000 : t;
    if (zeta < 1) {
      progress = Math.exp(-progress * zeta * w0) * (a * Math.cos(wd * progress) + b * Math.sin(wd * progress));
    } else {
      progress = (a + b * progress) * Math.exp(-progress * w0);
    }
    if (t === 0 || t === 1) return t;
    return 1 - progress;
  }

  function getDuration() {
    const cached = cache.springs[string];
    if (cached) return cached;
    const frame = 1/6;
    let elapsed = 0;
    let rest = 0;
    while(true) {
      elapsed += frame;
      if (solver(elapsed) === 1) {
        rest++;
        if (rest >= 16) break;
      } else {
        rest = 0;
      }
    }
    const duration = elapsed * frame * 1000;
    cache.springs[string] = duration;
    return duration;
  }

  return duration ? solver : getDuration;
}

// Basic steps easing implementation https://developer.mozilla.org/fr/docs/Web/CSS/transition-timing-function

function steps(steps = 10) {
  return t => Math.ceil((clamp(t, 0.000001, 1)) * steps) * (1 / steps);
}

// BezierEasing https://github.com/gre/bezier-easing

const bezier = (() => {
  const kSplineTableSize = 11;
  const kSampleStepSize = 1.0 / (kSplineTableSize - 1.0);

  function A(aA1, aA2) { return 1.0 - 3.0 * aA2 + 3.0 * aA1 }  function B(aA1, aA2) { return 3.0 * aA2 - 6.0 * aA1 }  function C(aA1)      { return 3.0 * aA1 }
  function calcBezier(aT, aA1, aA2) { return ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT }  function getSlope(aT, aA1, aA2) { return 3.0 * A(aA1, aA2) * aT * aT + 2.0 * B(aA1, aA2) * aT + C(aA1) }
  function binarySubdivide(aX, aA, aB, mX1, mX2) {
    let currentX, currentT, i = 0;
    do {
      currentT = aA + (aB - aA) / 2.0;
      currentX = calcBezier(currentT, mX1, mX2) - aX;
      if (currentX > 0.0) { aB = currentT; } else { aA = currentT; }    } while (Math.abs(currentX) > 0.0000001 && ++i < 10);
    return currentT;
  }

  function newtonRaphsonIterate(aX, aGuessT, mX1, mX2) {
    for (let i = 0; i < 4; ++i) {
      const currentSlope = getSlope(aGuessT, mX1, mX2);
      if (currentSlope === 0.0) return aGuessT;
      const currentX = calcBezier(aGuessT, mX1, mX2) - aX;
      aGuessT -= currentX / currentSlope;
    }
    return aGuessT;
  }

  function bezier(mX1, mY1, mX2, mY2) {
    if (!(0 <= mX1 && mX1 <= 1 && 0 <= mX2 && mX2 <= 1)) return;
    let sampleValues = new Float32Array(kSplineTableSize);

    if (mX1 !== mY1 || mX2 !== mY2) {
      for (let i = 0; i < kSplineTableSize; ++i) {
        sampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
      }
    }

    function getTForX(aX) {
      let intervalStart = 0;
      let currentSample = 1;
      const lastSample = kSplineTableSize - 1;

      for (; currentSample !== lastSample && sampleValues[currentSample] <= aX; ++currentSample) {
        intervalStart += kSampleStepSize;
      }

      --currentSample;

      const dist = (aX - sampleValues[currentSample]) / (sampleValues[currentSample + 1] - sampleValues[currentSample]);
      const guessForT = intervalStart + dist * kSampleStepSize;
      const initialSlope = getSlope(guessForT, mX1, mX2);

      if (initialSlope >= 0.001) {
        return newtonRaphsonIterate(aX, guessForT, mX1, mX2);
      } else if (initialSlope === 0.0) {
        return guessForT;
      } else {
        return binarySubdivide(aX, intervalStart, intervalStart + kSampleStepSize, mX1, mX2);
      }
    }

    return x => {
      if (mX1 === mY1 && mX2 === mY2) return x;
      if (x === 0 || x === 1) return x;
      return calcBezier(getTForX(x), mY1, mY2);
    }
  }

  return bezier;
})();

const penner = (() => {
  // Based on jQuery UI's implemenation of easing equations from Robert Penner (http://www.robertpenner.com/easing)
  const eases = { linear: () => t => t };

  const functionEasings = {
    Sine: () => t => 1 - Math.cos(t * Math.PI / 2),
    Circ: () => t => 1 - Math.sqrt(1 - t * t),
    Back: () => t => t * t * (3 * t - 2),
    Bounce: () => t => {
      let pow2, b = 4;
      while (t < (( pow2 = Math.pow(2, --b)) - 1) / 11) {}      return 1 / Math.pow(4, 3 - b) - 7.5625 * Math.pow(( pow2 * 3 - 2 ) / 22 - t, 2)
    },
    Elastic: (amplitude = 1, period = .5) => {
      const a = clamp(amplitude, 1, 10);
      const p = clamp(period, .1, 2);
      return t => {
        return (t === 0 || t === 1) ? t : 
          -a * Math.pow(2, 10 * (t - 1)) * Math.sin((((t - 1) - (p / (Math.PI * 2) * Math.asin(1 / a))) * (Math.PI * 2)) / p);
      }
    }
  };

  const baseEasings = ['Quad', 'Cubic', 'Quart', 'Quint', 'Expo'];

  baseEasings.forEach((name, i) => {
    functionEasings[name] = () => t => Math.pow(t, i + 2);
  });

  Object.keys(functionEasings).forEach(name => {
    const easeIn = functionEasings[name];
    eases['easeIn' + name] = easeIn;
    eases['easeOut' + name] = (a, b) => t => 1 - easeIn(a, b)(1 - t);
    eases['easeInOut' + name] = (a, b) => t => t < 0.5 ? easeIn(a, b)(t * 2) / 2 : 1 - easeIn(a, b)(t * -2 + 2) / 2;
    eases['easeOutIn' + name] = (a, b) => t => t < 0.5 ? (1 - easeIn(a, b)(1 - t * 2)) / 2 : (easeIn(a, b)(t * 2 - 1) + 1) / 2;
  });

  return eases;
})();

function parseEasings(easing, duration) {
  if (is.fnc(easing)) return easing;
  const name = easing.split('(')[0];
  const ease = penner[name];
  const args = parseEasingParameters(easing);
  switch (name) {
    case 'spring' : return spring(easing, duration);
    case 'cubicBezier' : return applyArguments(bezier, args);
    case 'steps' : return applyArguments(steps, args);
    default : return applyArguments(ease, args);
  }
}

function getUnit(val) {
  const split = unitsExecRgx.exec(val);
  if (split) return split[1];
}

function getTransformUnit(propName) {
  if (stringContains(propName, 'translate') || propName === 'perspective') return 'px';
  if (stringContains(propName, 'rotate') || stringContains(propName, 'skew')) return 'deg';
}

function convertPxToUnit(el, value, unit) {
  const valueUnit = getUnit(value);
  if (arrayContains([unit, 'deg', 'rad', 'turn'], valueUnit)) return value;
  const cached = cache.CSS[value + unit];
  if (!is.und(cached)) return cached;
  const baseline = 100;
  const tempEl = document.createElement(el.tagName);
  const parentNode = el.parentNode;
  const parentEl = (parentNode && (parentNode !== document)) ? parentNode : document.body;
  parentEl.appendChild(tempEl);
  tempEl.style.position = 'absolute';
  tempEl.style.width = baseline + unit;
  const factor = baseline / tempEl.offsetWidth;
  parentEl.removeChild(tempEl);
  const convertedUnit = factor * parseFloat(value);
  cache.CSS[value + unit] = convertedUnit;
  return convertedUnit;
}

// RGB / RGBA -> RGBA

function rgbToRgba(rgbValue) {
  const rgb = rgbExecRgx.exec(rgbValue);
  return rgb ? `rgba(${rgb[1]},1)` : rgbValue;
}

// HEX3 / HEX3A / HEX6 / HEX6A -> RGBA

function hexToRgba(hexValue) {
  const hexLength = hexValue.length;
  const isShort = hexLength === 4 || hexLength === 5;
  const isAlpha = hexLength === 5 || hexLength === 9;
  const hexPrefix = '0x';
  const r = +(hexPrefix + hexValue[1] + hexValue[isShort ? 1 : 2]);
  const g = +(hexPrefix + hexValue[isShort ? 2 : 3] + hexValue[isShort ? 2 : 4]);
  const b = +(hexPrefix + hexValue[isShort ? 3 : 5] + hexValue[isShort ? 3 : 6]);
  const a = isAlpha ? +((hexPrefix + hexValue[isShort ? 4 : 7] + hexValue[isShort ? 4 : 8]) / 255).toFixed(3) : 1;
  return `rgba(${r},${g},${b},${a})`;
}

// HSL / HSLA -> RGBA

function hueToRgb(p, q, t) {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}

function hslToRgba(hslValue) {
  const hsl = hslExecRgx.exec(hslValue) || hslaExecRgx.exec(hslValue);
  const h = hsl[1] / 360;
  const s = hsl[2] / 100;
  const l = hsl[3] / 100;
  const a = hsl[4] || 1;
  let r, g, b;
  if (s == 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hueToRgb(p, q, h + 1 / 3);
    g = hueToRgb(p, q, h);
    b = hueToRgb(p, q, h - 1 / 3);
  }
  return `rgba(${round(r * 255)},${round(g * 255)},${round(b * 255)},${a})`;
}

// All in one color converter to make sure we always work with RGBA values

function normalizeColorToRgba(colorValue) {
  if (is.rgb(colorValue)) return rgbToRgba(colorValue);
  if (is.hex(colorValue)) return hexToRgba(colorValue);
  if (is.hsl(colorValue)) return hslToRgba(colorValue);
}

function getFunctionValue(val, animatable) {
  if (!is.fnc(val)) return val;
  return val(animatable.target, animatable.id, animatable.total);
}

function getCSSValue(el, prop, unit) {
  if (prop in el.style) {
    const uppercasePropName = prop.replace(lowerCaseRgx, '$1-$2').toLowerCase();
    const value = el.style[prop] || getComputedStyle(el).getPropertyValue(uppercasePropName) || '0';
    return unit ? convertPxToUnit(el, value, unit) : value;
  }
}

function getAnimationType(el, prop) {
  if (is.dom(el) && !is.inp(el) && (!is.nil(el.getAttribute(prop)) || (is.svg(el) && el[prop]))) return 'attribute';
  if (is.dom(el) && arrayContains(validTransforms, prop)) return 'transform';
  if (is.dom(el) && (prop !== 'transform' && getCSSValue(el, prop))) return 'css';
  if (!is.nil(el[prop])) return 'object';
}

function getElementTransforms(el) {
  if (!is.dom(el)) return;
  const str = el.style.transform;
  const transforms = new Map();
  if (!str) return transforms;
  let t;
  while (t = transformsExecRgx.exec(str)) {
    transforms.set(t[1], t[2]);
  }
  return transforms;
}

function getTransformValue(el, propName, animatable, unit) {
  const defaultVal = stringContains(propName, 'scale') ? 1 : 0 + getTransformUnit(propName);
  const value = getElementTransforms(el).get(propName) || defaultVal;
  if (animatable) {
    animatable.transforms.list.set(propName, value);
    animatable.transforms.last = propName;
  }
  return unit ? convertPxToUnit(el, value, unit) : value;
}

function getOriginalTargetValue(target, propName, unit, animatable) {
  switch (getAnimationType(target, propName)) {
    case 'transform': return getTransformValue(target, propName, animatable, unit);
    case 'css': return getCSSValue(target, propName, unit);
    case 'attribute': return target.getAttribute(propName);
    default: return target[propName] || 0;
  }
}

function getRelativeValue(to, from) {
  const operator = relativeValuesExecRgx.exec(to);
  if (!operator) return to;
  const u = getUnit(to) || 0;
  const x = parseFloat(from);
  const y = parseFloat(to.replace(operator[0], emptyString));
  switch (operator[0][0]) {
    case '+': return x + y + u;
    case '-': return x - y + u;
    case '*': return x * y + u;
  }
}

function validateValue(val, unit) {
  if (is.col(val)) return normalizeColorToRgba(val);
  if (whiteSpaceTestRgx.test(val)) return val;
  const originalUnit = getUnit(val);
  const unitLess = originalUnit ? val.substr(0, val.length - originalUnit.length) : val;
  if (unit) return unitLess + unit;
  return unitLess;
}

function decomposeValue(val, unit) {
  const value = validateValue((is.pth(val) ? val.totalLength : val), unit) + emptyString;
  return {
    original: value,
    numbers: value.match(digitWithExponentRgx) ? value.match(digitWithExponentRgx).map(Number) : [0],
    strings: (is.str(val) || unit) ? value.split(digitWithExponentRgx) : []
  }
}

const setValueByType = {
  css: (t, p, v) => t.style[p] = v,
  attribute: (t, p, v) => t.setAttribute(p, v),
  object: (t, p, v) => t[p] = v,
  transform: (t, p, v, transforms, manual) => {
    transforms.list.set(p, v);
    if (p === transforms.last || manual) {
      transforms.string = emptyString;
      transforms.list.forEach((value, prop) => {
        transforms.string += `${prop}(${value})${emptyString}`;
      });
      t.style.transform = transforms.string;
    }
  }
};

// getTotalLength() equivalent for circle, rect, polyline, polygon and line shapes
// adapted from https://gist.github.com/SebLambla/3e0550c496c236709744

function getDistance(p1, p2) {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

function getCircleLength(el) {
  return pi * 2 * el.getAttribute('r');
}

function getRectLength(el) {
  return (el.getAttribute('width') * 2) + (el.getAttribute('height') * 2);
}

function getLineLength(el) {
  return getDistance(
    {x: el.getAttribute('x1'), y: el.getAttribute('y1')}, 
    {x: el.getAttribute('x2'), y: el.getAttribute('y2')}
  );
}

function getPolylineLength(el) {
  const points = el.points;
  if (is.und(points)) return;
  let totalLength = 0;
  let previousPos;
  for (let i = 0 ; i < points.numberOfItems; i++) {
    const currentPos = points.getItem(i);
    if (i > 0) totalLength += getDistance(previousPos, currentPos);
    previousPos = currentPos;
  }
  return totalLength;
}

function getPolygonLength(el) {
  const points = el.points;
  if (is.und(points)) return;
  return getPolylineLength(el) + getDistance(points.getItem(points.numberOfItems - 1), points.getItem(0));
}

function getTotalLength(el) {
  if (el.getTotalLength) return el.getTotalLength();
  switch(el.tagName.toLowerCase()) {
    case 'circle': return getCircleLength(el);
    case 'rect': return getRectLength(el);
    case 'line': return getLineLength(el);
    case 'polyline': return getPolylineLength(el);
    case 'polygon': return getPolygonLength(el);
  }
}

function setDashoffset(el) {
  const pathLength = getTotalLength(el);
  el.setAttribute('stroke-dasharray', pathLength);
  return pathLength;
}

function getParentSvgEl(el) {
  let parentEl = el.parentNode;
  while (is.svg(parentEl)) {
    const parentNode = parentEl.parentNode;
    if (!is.svg(parentNode)) break;
    parentEl = parentNode;
  }
  return parentEl;
}

// SVG Responsive utils

function getParentSvg(pathEl, svgData) {
  const svg = svgData || {};
  const parentSvgEl = svg.el || getParentSvgEl(pathEl);
  const rect = parentSvgEl.getBoundingClientRect();
  const viewBoxAttr = parentSvgEl.getAttribute('viewBox');
  const width = rect.width;
  const height = rect.height;
  const viewBox = svg.viewBox || (viewBoxAttr ? viewBoxAttr.split(' ') : [0, 0, width, height]);
  return {
    el: parentSvgEl,
    viewBox: viewBox,
    x: viewBox[0] / 1,
    y: viewBox[1] / 1,
    w: width,
    h: height,
    vW: viewBox[2],
    vH: viewBox[3]
  }
}

// Path animation

function getPath(path, percent) {
  const pathEl = is.str(path) ? selectString(path)[0] : path;
  const p = percent || 100;
  return function(property) {
    return {
      property,
      el: pathEl,
      svg: getParentSvg(pathEl),
      totalLength: getTotalLength(pathEl) * (p / 100)
    }
  }
}

function getPathPoint(pathEl, progress, offset = 0) {
  const length = progress + offset >= 1 ? progress + offset : 0;
  return pathEl.getPointAtLength(length);
}

function getPathProgress(pathObject, progress, isPathTargetInsideSVG) {
  const pathEl = pathObject.el;
  const parentSvg = getParentSvg(pathEl, pathObject.svg);
  const p = getPathPoint(pathEl, progress, 0);
  const p0 = getPathPoint(pathEl, progress, -1);
  const p1 = getPathPoint(pathEl, progress, +1);
  const scaleX = isPathTargetInsideSVG ? 1 : parentSvg.w / parentSvg.vW;
  const scaleY = isPathTargetInsideSVG ? 1 : parentSvg.h / parentSvg.vH;
  switch (pathObject.property) {
    case 'x': return (p.x - parentSvg.x) * scaleX;
    case 'y': return (p.y - parentSvg.y) * scaleY;
    case 'angle': return Math.atan2(p1.y - p0.y, p1.x - p0.x) * 180 / pi;
  }
}

function parseTargets$1(targets) {
  const targetsArray = targets ? (flattenArray(is.arr(targets) ? targets.map(toArray) : toArray(targets))) : [];
  return filterArray(targetsArray, (item, pos, self) => self.indexOf(item) === pos);
}

function getAnimatables(targets) {
  const parsed = parseTargets$1(targets);
  return parsed.map((t, i) => {
    return {
      target: t,
      id: i,
      total: parsed.length,
      transforms: {
        list: getElementTransforms(t),
        last: null,
        string: emptyString
      }
    }
  });
}

function getTimingsFromAnimations(animations, tweenSettings) {
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
function setTimeBtwnEachFrame(time = 0) {
  let now = time;
  let diff = now - prevTime;
  prevTime = now;
  count++;
  if (diff > 0 && count > 30) {
    settings.timeBtwnEachFrame = diff;
  }
  requestAnimationFrame(setTimeBtwnEachFrame);
}

function convertPropertyValueToTweens(propertyValue, tweenSettings) {
  let value = propertyValue;
  let settings = cloneObject(tweenSettings);
  // Override duration if easing is a spring
  if (springTestRgx.test(settings.easing)) {
    settings.duration = spring(settings.easing);
  }
  if (is.arr(value)) {
    const l = value.length;
    const isFromTo = (l === 2 && !is.obj(value[0]));
    if (!isFromTo) {
      // In case of a keyframes array, duration is divided by the number of tweens
      if (!is.fnc(tweenSettings.duration)) {
        settings.duration = tweenSettings.duration / l;
      }
    } else {
      // Transform [from, to] values shorthand to a valid tween value
      value = { value: value };
    }
  }
  const valuesArray = is.arr(value) ? value : [value];
  return valuesArray.map((v, i) => {
    const obj = (is.obj(v) && !is.pth(v)) ? v : { value: v };
    // Default delay value should only be applied to the first tween
    if (is.und(obj.delay)) {
      obj.delay = !i ? tweenSettings.delay : 0;
    }
    // Default endDelay value should only be applied to the last tween
    if (is.und(obj.endDelay)) {
      obj.endDelay = i === valuesArray.length - 1 ? tweenSettings.endDelay : 0;
    }
    return obj;
  }).map(k => mergeObjects(k, settings));
}


function flattenParamsKeyframes(keyframes) {
  const properties = {};
  const propertyNames = filterArray(flattenArray(keyframes.map(key => Object.keys(key))), p => is.key(p))
  .reduce((a,b) => {
    if (a.indexOf(b) < 0) {
      a.push(b);
    }
    return a;
  }, []);
  for (let i = 0; i < propertyNames.length; i++) {
    const propName = propertyNames[i];
    properties[propName] = keyframes.map(key => {
      const newKey = {};
      for (let p in key) {
        if (is.key(p)) {
          if (p == propName) {
            newKey.value = key[p];
          }
        } else {
          newKey[p] = key[p];
        }
      }
      return newKey;
    });
  }
  return properties;
}

function getKeyframesFromProperties(tweenSettings, params) {
  const keyframes = [];
  const paramsKeyframes = params.keyframes;
  if (paramsKeyframes) {
    params = mergeObjects(flattenParamsKeyframes(paramsKeyframes), params);  }
  for (let p in params) {
    if (is.key(p)) {
      keyframes.push({
        name: p,
        tweens: convertPropertyValueToTweens(params[p], tweenSettings)
      });
    }
  }
  return keyframes;
}

// Tweens

function normalizeTweenValues(tween, animatable) {
  const t = {};
  for (let p in tween) {
    let value = getFunctionValue(tween[p], animatable);
    if (is.arr(value)) {
      value = value.map(v => getFunctionValue(v, animatable));
      if (value.length === 1) {
        value = value[0];
      }
    }
    t[p] = value;
  }
  t.duration = parseFloat(t.duration);
  t.delay = parseFloat(t.delay);
  return t;
}

function normalizeTweens(prop, animatable) {
  let previousTween;
  return prop.tweens.map(t => {
    const tween = normalizeTweenValues(t, animatable);
    const tweenValue = tween.value;
    let to = is.arr(tweenValue) ? tweenValue[1] : tweenValue;
    const toUnit = getUnit(to);
    const originalValue = getOriginalTargetValue(animatable.target, prop.name, toUnit, animatable);
    const previousValue = previousTween ? previousTween.to.original : originalValue;
    const from = is.arr(tweenValue) ? tweenValue[0] : previousValue;
    const fromUnit = getUnit(from) || getUnit(originalValue);
    const unit = toUnit || fromUnit;
    if (is.und(to)) to = previousValue;
    tween.from = decomposeValue(from, unit);
    tween.to = decomposeValue(getRelativeValue(to, from), unit);
    tween.start = previousTween ? previousTween.end : 0;
    tween.end = tween.start + tween.delay + tween.duration + tween.endDelay;
    // TODO use a map for easings instead of 
    tween.easing = parseEasings(tween.easing, tween.duration);
    tween.isPath = is.pth(tweenValue);
    tween.isPathTargetInsideSVG = tween.isPath && is.svg(animatable.target);
    tween.isColor = is.col(tween.from.original);
    if (tween.isColor) {
      tween.round = 1;
    }
    previousTween = tween;
    return tween;
  });
}

function createAnimation(animatable, prop) {
  const animType = getAnimationType(animatable.target, prop.name);
  if (animType) {
    const tweens = normalizeTweens(prop, animatable);
    const firstTween = tweens[0];
    const lastTween = tweens[tweens.length - 1];
    return {
      type: animType,
      property: prop.name,
      animatable: animatable,
      tweens: tweens,
      delay: firstTween.delay,
      duration: lastTween.end,
      endDelay: lastTween.endDelay,
      timelineOffset: 0
    }
  }
}

function getAnimations(animatables, properties) {
  const animations = [];
  for (let a = 0, aLength = animatables.length; a < aLength; a++) {
    const animatable = animatables[a];
    if (animatable) {
      for (let p = 0, pLength = properties.length; p < pLength; p++) {
        const animation = createAnimation(animatable, properties[p]);
        // Make sure the animation is not undefined
        if (animation) {
          animations.push(createAnimation(animatable, properties[p]));
        }
      }
    }
  }
  return animations;
}

let instancesId = 0;

function createTimeline(params) {
  const instanceSettings = replaceObjectProps(defaultInstanceSettings, params);
  const tweenSettings = replaceObjectProps(defaultTweenSettings, params);
  const properties = getKeyframesFromProperties(tweenSettings, params);
  const animatables = getAnimatables(params.targets);
  const animations = getAnimations(animatables, properties);
  const timings = getTimingsFromAnimations(animations, tweenSettings);
  return mergeObjects(instanceSettings, {
    id: instancesId++,
    children: [],
    animatables: animatables,
    animations: animations,
    delay: timings.delay,
    duration: timings.duration,
    endDelay: timings.endDelay,
  });
}

const activeInstances = [];

let raf;

function tick(t) {
  // memo on algorithm issue:
  // dangerous iteration over mutable `activeInstances`
  // (that collection may be updated from within callbacks of `tick`-ed animation instances)
  let activeInstancesLength = activeInstances.length;
  let i = 0;
  while (i < activeInstancesLength) {
    const activeInstance = activeInstances[i];
    if (!activeInstance.paused) {
      activeInstance.tick(t);
      i++;
    } else {
      activeInstances.splice(i, 1);
      activeInstancesLength--;
    }
  }
  raf = i > 0 ? requestAnimationFrame(tick) : undefined;
}

function startEngine() {
  if (!raf && (!isDocumentHidden() || !settings.suspendWhenDocumentHidden) && activeInstances.length > 0) {
    raf = requestAnimationFrame(tick);
  }
}


function handleVisibilityChange() {

  if (isDocumentHidden()) {
    // suspend ticks
    raf = cancelAnimationFrame(raf);
  } else {
    // is back to active tab
    // first adjust animations to consider the time that ticks were suspended
    activeInstances.forEach(
      instance => instance ._onDocumentVisibility()
    );
    startEngine();
  }
}

if (isBrowser) {
  document.addEventListener('visibilitychange', handleVisibilityChange);
}

function animate(params = {}) {
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
    children = instance.children;
    childrenLength = children.length;
    for (let i = childrenLength; i--; ) instance.children[i].reset();
    if ((instance.reversed && instance.loop !== true) || (direction === 'alternate' && instance.loop === 1)) instance.remainingLoops++;
    setAnimationsProgress(instance.reversed ? instance.duration : 0);
  };

  // internal method (for engine) to adjust animation timings before restoring engine ticks (rAF)
  instance._onDocumentVisibility = resetTime;

  instance.tick = function (t) {
    now = t;
    if (!startTime) startTime = now;
    setInstanceProgress((now + (lastTime - startTime)) * settings.speed);
  };

  instance.seek = function (time) {
    setInstanceProgress(adjustTime(time));
  };

  instance.seekSilently = function (time) {
    // const insTime = adjustTime(time);
    if (children) {
      syncInstanceChildren(time, true);
    }
    setAnimationsProgress(time);
  };

  instance.pause = function () {
    instance.paused = true;
    resetTime();
  };

  instance.play = function () {
    if (!instance.paused) return;
    if (instance.completed) instance.reset();
    instance.paused = false;
    activeInstances.push(instance);
    resetTime();
    startEngine();
  };

  instance.reverse = function () {
    toggleInstanceDirection();
    instance.completed = instance.reversed ? false : true;
    resetTime();
  };

  instance.restart = function () {
    instance.reset();
    instance.play();
  };

  instance.remove = function (targets) {
    const targetsArray = parseTargets(targets);
    removeTargetsFromInstance(targetsArray, instance);
  };

  instance.reset();

  if (instance.autoplay) {
    instance.play();
  }

  return instance;
}

// Remove targets from animation

function removeTargetsFromAnimations(targetsArray, animations) {
  for (let a = animations.length; a--; ) {
    if (arrayContains(targetsArray, animations[a].animatable.target)) {
      animations.splice(a, 1);
    }
  }
}

function removeTargetsFromInstance$1(targetsArray, instance) {
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
  const targetsArray = parseTargets$1(targets);
  for (let i = activeInstances.length; i--; ) {
    const instance = activeInstances[i];
    removeTargetsFromInstance$1(targetsArray, instance);
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

setTimeBtwnEachFrame();

const anime = animate;

anime.version = '3.3.0';
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
