/*
  * anime.js v3.3.0 - ES5 IIFE
  * (c) 2022 Julian Garnier
  * Released under the MIT license
  * animejs.com
*/

var anime = (function () {
  'use strict';

  // Misc

  var noop = function () {};
  var emptyString = '';
  var pi = Math.PI;

  // Default animation parameters

  var defaultInstanceSettings = {
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

  var defaultTweenSettings = {
    duration: 1000,
    delay: 0,
    endDelay: 0,
    easing: 'easeOutElastic(1, .5)',
    round: 0,
  };

  // Global settings

  var settings = {
    speed: 1,
    suspendWhenDocumentHidden: true,
    timeBtwnEachFrame: 16.7,
  };

  // Transforms

  var validTransforms = [
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
    'matrix3d' ];

  // Regex

  var hexTestRgx = /(^#([\da-f]{3}){1,2}$)|(^#([\da-f]{4}){1,2}$)/i;
  var rgbTestRgx = /^rgb/i;
  var hslTestRgx = /^hsl/i;
  var rgbExecRgx = /rgb\((\d+,\s*[\d]+,\s*[\d]+)\)/i;
  var hslExecRgx = /hsl\(\s*(-?\d+|-?\d*.\d+)\s*,\s*(-?\d+|-?\d*.\d+)%\s*,\s*(-?\d+|-?\d*.\d+)%\s*\)/i;
  var hslaExecRgx = /hsla\(\s*(-?\d+|-?\d*.\d+)\s*,\s*(-?\d+|-?\d*.\d+)%\s*,\s*(-?\d+|-?\d*.\d+)%\s*,\s*(-?\d+|-?\d*.\d+)\s*\)/i;
  var springTestRgx = /^spring/;
  var easingsExecRgx = /\(([^)]+)\)/;
  var unitsExecRgx = /[+-]?\d*\.?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?(%|px|pt|em|rem|in|cm|mm|ex|ch|pc|vw|vh|vmin|vmax|deg|rad|turn)?$/;
  var digitWithExponentRgx = /[+-]?\d*\.?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g;
  var lowerCaseRgx = /([a-z])([A-Z])/g;
  var transformsExecRgx = /(\w+)\(([^)]*)\)/g;
  var relativeValuesExecRgx = /^(\*=|\+=|-=)/;
  var whiteSpaceTestRgx = /\s/g;

  // Strings functions

  function selectString(str) {
    try {
      var nodes = document.querySelectorAll(str);
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

  function round(val, base) {
    if ( base === void 0 ) base = 1;

    return Math.round(val * base) / base;
  }

  function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Types

  var is = {
    arr: function (a) { return Array.isArray(a); },
    obj: function (a) { return stringContains(Object.prototype.toString.call(a), 'Object'); },
    pth: function (a) { return is.obj(a) && a.hasOwnProperty('totalLength'); },
    svg: function (a) { return a instanceof SVGElement; },
    inp: function (a) { return a instanceof HTMLInputElement; },
    dom: function (a) { return a.nodeType || is.svg(a); },
    str: function (a) { return typeof a === 'string'; },
    fnc: function (a) { return typeof a === 'function'; },
    und: function (a) { return typeof a === 'undefined'; },
    nil: function (a) { return is.und(a) || a === null; },
    hex: function (a) { return hexTestRgx.test(a); },
    rgb: function (a) { return rgbTestRgx.test(a); },
    hsl: function (a) { return hslTestRgx.test(a); },
    col: function (a) { return is.hex(a) || is.rgb(a) || is.hsl(a); },
    key: function (a) { return !defaultInstanceSettings.hasOwnProperty(a) && !defaultTweenSettings.hasOwnProperty(a) && a !== 'targets' && a !== 'keyframes'; },
    anime: function (a) { return is.obj(a) && a.hasOwnProperty('animatables') && !a.hasOwnProperty('add'); },
    tl: function (a) { return is.obj(a) && a.hasOwnProperty('add') && is.fnc(a.add); },
  };

  // Arrays

  function filterArray(arr, callback) {
    var len = arr.length;
    var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
    var result = [];
    for (var i = 0; i < len; i++) {
      if (i in arr) {
        var val = arr[i];
        if (callback.call(thisArg, val, i, arr)) {
          result.push(val);
        }
      }
    }
    return result;
  }

  function flattenArray(arr) {
    return arr.reduce(function (a, b) { return a.concat(is.arr(b) ? flattenArray(b) : b); }, []);
  }

  function toArray(o) {
    if (is.arr(o)) { return o; }
    if (is.str(o)) { o = selectString(o) || o; }
    if (o instanceof NodeList || o instanceof HTMLCollection) { return [].slice.call(o); }
    return [o];
  }

  function arrayContains(arr, val) {
    return arr.some(function (a) { return a === val; });
  }

  // Objects

  function cloneObject(o) {
    var clone = {};
    for (var p in o) { clone[p] = o[p]; }
    return clone;
  }

  function replaceObjectProps(o1, o2) {
    var o = cloneObject(o1);
    for (var p in o1) { o[p] = o2.hasOwnProperty(p) ? o2[p] : o1[p]; }
    return o;
  }

  function mergeObjects(o1, o2) {
    var o = cloneObject(o1);
    for (var p in o2) { o[p] = is.und(o1[p]) ? o2[p] : o1[p]; }
    return o;
  }

  // Functions

  function applyArguments(func, args) {
    return func.apply(null, args);
  }

  // Document

  var isBrowser = !is.und(window) && !is.und(window.document);

  function isDocumentHidden() {
    return isBrowser && document.hidden;
  }

  // Cache

  var cache = {
    CSS: {},
    springs: {}
  };

  // Easings

  function parseEasingParameters(string) {
    var match = easingsExecRgx.exec(string);
    return match ? match[1].split(',').map(function (p) { return parseFloat(p); }) : [];
  }

  // Spring solver inspired by Webkit Copyright © 2016 Apple Inc. All rights reserved. https://webkit.org/demos/spring/spring.js

  function spring(string, duration) {
    var params = parseEasingParameters(string);
    var mass = clamp(is.und(params[0]) ? 1 : params[0], .1, 100);
    var stiffness = clamp(is.und(params[1]) ? 100 : params[1], .1, 100);
    var damping = clamp(is.und(params[2]) ? 10 : params[2], .1, 100);
    var velocity =  clamp(is.und(params[3]) ? 0 : params[3], .1, 100);

    var w0 = Math.sqrt(stiffness / mass);
    var zeta = damping / (2 * Math.sqrt(stiffness * mass));
    var wd = zeta < 1 ? w0 * Math.sqrt(1 - zeta * zeta) : 0;
    var a = 1;
    var b = zeta < 1 ? (zeta * w0 + -velocity) / wd : -velocity + w0;

    function solver(t) {
      var progress = duration ? (duration * t) / 1000 : t;
      if (zeta < 1) {
        progress = Math.exp(-progress * zeta * w0) * (a * Math.cos(wd * progress) + b * Math.sin(wd * progress));
      } else {
        progress = (a + b * progress) * Math.exp(-progress * w0);
      }
      if (t === 0 || t === 1) { return t; }
      return 1 - progress;
    }

    function getDuration() {
      var cached = cache.springs[string];
      if (cached) { return cached; }
      var frame = 1/6;
      var elapsed = 0;
      var rest = 0;
      while(true) {
        elapsed += frame;
        if (solver(elapsed) === 1) {
          rest++;
          if (rest >= 16) { break; }
        } else {
          rest = 0;
        }
      }
      var duration = elapsed * frame * 1000;
      cache.springs[string] = duration;
      return duration;
    }

    return duration ? solver : getDuration;
  }

  // Basic steps easing implementation https://developer.mozilla.org/fr/docs/Web/CSS/transition-timing-function

  function steps(steps) {
    if ( steps === void 0 ) steps = 10;

    return function (t) { return Math.ceil((clamp(t, 0.000001, 1)) * steps) * (1 / steps); };
  }

  // BezierEasing https://github.com/gre/bezier-easing

  var bezier = (function () {
    var kSplineTableSize = 11;
    var kSampleStepSize = 1.0 / (kSplineTableSize - 1.0);

    function A(aA1, aA2) { return 1.0 - 3.0 * aA2 + 3.0 * aA1 }  function B(aA1, aA2) { return 3.0 * aA2 - 6.0 * aA1 }  function C(aA1)      { return 3.0 * aA1 }
    function calcBezier(aT, aA1, aA2) { return ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT }  function getSlope(aT, aA1, aA2) { return 3.0 * A(aA1, aA2) * aT * aT + 2.0 * B(aA1, aA2) * aT + C(aA1) }
    function binarySubdivide(aX, aA, aB, mX1, mX2) {
      var currentX, currentT, i = 0;
      do {
        currentT = aA + (aB - aA) / 2.0;
        currentX = calcBezier(currentT, mX1, mX2) - aX;
        if (currentX > 0.0) { aB = currentT; } else { aA = currentT; }    } while (Math.abs(currentX) > 0.0000001 && ++i < 10);
      return currentT;
    }

    function newtonRaphsonIterate(aX, aGuessT, mX1, mX2) {
      for (var i = 0; i < 4; ++i) {
        var currentSlope = getSlope(aGuessT, mX1, mX2);
        if (currentSlope === 0.0) { return aGuessT; }
        var currentX = calcBezier(aGuessT, mX1, mX2) - aX;
        aGuessT -= currentX / currentSlope;
      }
      return aGuessT;
    }

    function bezier(mX1, mY1, mX2, mY2) {
      if (!(0 <= mX1 && mX1 <= 1 && 0 <= mX2 && mX2 <= 1)) { return; }
      var sampleValues = new Float32Array(kSplineTableSize);

      if (mX1 !== mY1 || mX2 !== mY2) {
        for (var i = 0; i < kSplineTableSize; ++i) {
          sampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
        }
      }

      function getTForX(aX) {
        var intervalStart = 0;
        var currentSample = 1;
        var lastSample = kSplineTableSize - 1;

        for (; currentSample !== lastSample && sampleValues[currentSample] <= aX; ++currentSample) {
          intervalStart += kSampleStepSize;
        }

        --currentSample;

        var dist = (aX - sampleValues[currentSample]) / (sampleValues[currentSample + 1] - sampleValues[currentSample]);
        var guessForT = intervalStart + dist * kSampleStepSize;
        var initialSlope = getSlope(guessForT, mX1, mX2);

        if (initialSlope >= 0.001) {
          return newtonRaphsonIterate(aX, guessForT, mX1, mX2);
        } else if (initialSlope === 0.0) {
          return guessForT;
        } else {
          return binarySubdivide(aX, intervalStart, intervalStart + kSampleStepSize, mX1, mX2);
        }
      }

      return function (x) {
        if (mX1 === mY1 && mX2 === mY2) { return x; }
        if (x === 0 || x === 1) { return x; }
        return calcBezier(getTForX(x), mY1, mY2);
      }
    }

    return bezier;
  })();

  var penner = (function () {
    // Based on jQuery UI's implemenation of easing equations from Robert Penner (http://www.robertpenner.com/easing)
    var eases = { linear: function () { return function (t) { return t; }; } };

    var functionEasings = {
      Sine: function () { return function (t) { return 1 - Math.cos(t * Math.PI / 2); }; },
      Circ: function () { return function (t) { return 1 - Math.sqrt(1 - t * t); }; },
      Back: function () { return function (t) { return t * t * (3 * t - 2); }; },
      Bounce: function () { return function (t) {
        var pow2, b = 4;
        while (t < (( pow2 = Math.pow(2, --b)) - 1) / 11) {}      return 1 / Math.pow(4, 3 - b) - 7.5625 * Math.pow(( pow2 * 3 - 2 ) / 22 - t, 2)
      }; },
      Elastic: function (amplitude, period) {
        if ( amplitude === void 0 ) amplitude = 1;
        if ( period === void 0 ) period = .5;

        var a = clamp(amplitude, 1, 10);
        var p = clamp(period, .1, 2);
        return function (t) {
          return (t === 0 || t === 1) ? t : 
            -a * Math.pow(2, 10 * (t - 1)) * Math.sin((((t - 1) - (p / (Math.PI * 2) * Math.asin(1 / a))) * (Math.PI * 2)) / p);
        }
      }
    };

    var baseEasings = ['Quad', 'Cubic', 'Quart', 'Quint', 'Expo'];

    baseEasings.forEach(function (name, i) {
      functionEasings[name] = function () { return function (t) { return Math.pow(t, i + 2); }; };
    });

    Object.keys(functionEasings).forEach(function (name) {
      var easeIn = functionEasings[name];
      eases['easeIn' + name] = easeIn;
      eases['easeOut' + name] = function (a, b) { return function (t) { return 1 - easeIn(a, b)(1 - t); }; };
      eases['easeInOut' + name] = function (a, b) { return function (t) { return t < 0.5 ? easeIn(a, b)(t * 2) / 2 : 1 - easeIn(a, b)(t * -2 + 2) / 2; }; };
      eases['easeOutIn' + name] = function (a, b) { return function (t) { return t < 0.5 ? (1 - easeIn(a, b)(1 - t * 2)) / 2 : (easeIn(a, b)(t * 2 - 1) + 1) / 2; }; };
    });

    return eases;
  })();

  function parseEasings(easing, duration) {
    if (is.fnc(easing)) { return easing; }
    var name = easing.split('(')[0];
    var ease = penner[name];
    var args = parseEasingParameters(easing);
    switch (name) {
      case 'spring' : return spring(easing, duration);
      case 'cubicBezier' : return applyArguments(bezier, args);
      case 'steps' : return applyArguments(steps, args);
      default : return applyArguments(ease, args);
    }
  }

  function getUnit(val) {
    var split = unitsExecRgx.exec(val);
    if (split) { return split[1]; }
  }

  function getTransformUnit(propName) {
    if (stringContains(propName, 'translate') || propName === 'perspective') { return 'px'; }
    if (stringContains(propName, 'rotate') || stringContains(propName, 'skew')) { return 'deg'; }
  }

  function convertPxToUnit(el, value, unit) {
    var valueUnit = getUnit(value);
    if (arrayContains([unit, 'deg', 'rad', 'turn'], valueUnit)) { return value; }
    var cached = cache.CSS[value + unit];
    if (!is.und(cached)) { return cached; }
    var baseline = 100;
    var tempEl = document.createElement(el.tagName);
    var parentNode = el.parentNode;
    var parentEl = (parentNode && (parentNode !== document)) ? parentNode : document.body;
    parentEl.appendChild(tempEl);
    tempEl.style.position = 'absolute';
    tempEl.style.width = baseline + unit;
    var factor = baseline / tempEl.offsetWidth;
    parentEl.removeChild(tempEl);
    var convertedUnit = factor * parseFloat(value);
    cache.CSS[value + unit] = convertedUnit;
    return convertedUnit;
  }

  // RGB / RGBA -> RGBA

  function rgbToRgba(rgbValue) {
    var rgb = rgbExecRgx.exec(rgbValue);
    return rgb ? ("rgba(" + (rgb[1]) + ",1)") : rgbValue;
  }

  // HEX3 / HEX3A / HEX6 / HEX6A -> RGBA

  function hexToRgba(hexValue) {
    var hexLength = hexValue.length;
    var isShort = hexLength === 4 || hexLength === 5;
    var isAlpha = hexLength === 5 || hexLength === 9;
    var hexPrefix = '0x';
    var r = +(hexPrefix + hexValue[1] + hexValue[isShort ? 1 : 2]);
    var g = +(hexPrefix + hexValue[isShort ? 2 : 3] + hexValue[isShort ? 2 : 4]);
    var b = +(hexPrefix + hexValue[isShort ? 3 : 5] + hexValue[isShort ? 3 : 6]);
    var a = isAlpha ? +((hexPrefix + hexValue[isShort ? 4 : 7] + hexValue[isShort ? 4 : 8]) / 255).toFixed(3) : 1;
    return ("rgba(" + r + "," + g + "," + b + "," + a + ")");
  }

  // HSL / HSLA -> RGBA

  function hueToRgb(p, q, t) {
    if (t < 0) { t += 1; }
    if (t > 1) { t -= 1; }
    if (t < 1 / 6) { return p + (q - p) * 6 * t; }
    if (t < 1 / 2) { return q; }
    if (t < 2 / 3) { return p + (q - p) * (2 / 3 - t) * 6; }
    return p;
  }

  function hslToRgba(hslValue) {
    var hsl = hslExecRgx.exec(hslValue) || hslaExecRgx.exec(hslValue);
    var h = hsl[1] / 360;
    var s = hsl[2] / 100;
    var l = hsl[3] / 100;
    var a = hsl[4] || 1;
    var r, g, b;
    if (s == 0) {
      r = g = b = l;
    } else {
      var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      var p = 2 * l - q;
      r = hueToRgb(p, q, h + 1 / 3);
      g = hueToRgb(p, q, h);
      b = hueToRgb(p, q, h - 1 / 3);
    }
    return ("rgba(" + (round(r * 255)) + "," + (round(g * 255)) + "," + (round(b * 255)) + "," + a + ")");
  }

  // All in one color converter to make sure we always work with RGBA values

  function normalizeColorToRgba(colorValue) {
    if (is.rgb(colorValue)) { return rgbToRgba(colorValue); }
    if (is.hex(colorValue)) { return hexToRgba(colorValue); }
    if (is.hsl(colorValue)) { return hslToRgba(colorValue); }
  }

  function getFunctionValue(val, animatable) {
    if (!is.fnc(val)) { return val; }
    return val(animatable.target, animatable.id, animatable.total);
  }

  function getCSSValue(el, prop, unit) {
    if (prop in el.style) {
      var uppercasePropName = prop.replace(lowerCaseRgx, '$1-$2').toLowerCase();
      var value = el.style[prop] || getComputedStyle(el).getPropertyValue(uppercasePropName) || '0';
      return unit ? convertPxToUnit(el, value, unit) : value;
    }
  }

  function getAnimationType(el, prop) {
    if (is.dom(el) && !is.inp(el) && (!is.nil(el.getAttribute(prop)) || (is.svg(el) && el[prop]))) { return 'attribute'; }
    if (is.dom(el) && arrayContains(validTransforms, prop)) { return 'transform'; }
    if (is.dom(el) && (prop !== 'transform' && getCSSValue(el, prop))) { return 'css'; }
    if (!is.nil(el[prop])) { return 'object'; }
  }

  function getElementTransforms(el) {
    if (!is.dom(el)) { return; }
    var str = el.style.transform;
    var transforms = new Map();
    if (!str) { return transforms; }
    var t;
    while (t = transformsExecRgx.exec(str)) {
      transforms.set(t[1], t[2]);
    }
    return transforms;
  }

  function getTransformValue(el, propName, animatable, unit) {
    var defaultVal = stringContains(propName, 'scale') ? 1 : 0 + getTransformUnit(propName);
    var value = getElementTransforms(el).get(propName) || defaultVal;
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
    var operator = relativeValuesExecRgx.exec(to);
    if (!operator) { return to; }
    var u = getUnit(to) || 0;
    var x = parseFloat(from);
    var y = parseFloat(to.replace(operator[0], emptyString));
    switch (operator[0][0]) {
      case '+': return x + y + u;
      case '-': return x - y + u;
      case '*': return x * y + u;
    }
  }

  function validateValue(val, unit) {
    if (is.col(val)) { return normalizeColorToRgba(val); }
    if (whiteSpaceTestRgx.test(val)) { return val; }
    var originalUnit = getUnit(val);
    var unitLess = originalUnit ? val.substr(0, val.length - originalUnit.length) : val;
    if (unit) { return unitLess + unit; }
    return unitLess;
  }

  function decomposeValue(val, unit) {
    var value = validateValue((is.pth(val) ? val.totalLength : val), unit) + emptyString;
    return {
      original: value,
      numbers: value.match(digitWithExponentRgx) ? value.match(digitWithExponentRgx).map(Number) : [0],
      strings: (is.str(val) || unit) ? value.split(digitWithExponentRgx) : []
    }
  }

  var setValueByType = {
    css: function (t, p, v) { return t.style[p] = v; },
    attribute: function (t, p, v) { return t.setAttribute(p, v); },
    object: function (t, p, v) { return t[p] = v; },
    transform: function (t, p, v, transforms, manual) {
      transforms.list.set(p, v);
      if (p === transforms.last || manual) {
        transforms.string = emptyString;
        transforms.list.forEach(function (value, prop) {
          transforms.string += prop + "(" + value + ")" + emptyString;
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
    var points = el.points;
    if (is.und(points)) { return; }
    var totalLength = 0;
    var previousPos;
    for (var i = 0 ; i < points.numberOfItems; i++) {
      var currentPos = points.getItem(i);
      if (i > 0) { totalLength += getDistance(previousPos, currentPos); }
      previousPos = currentPos;
    }
    return totalLength;
  }

  function getPolygonLength(el) {
    var points = el.points;
    if (is.und(points)) { return; }
    return getPolylineLength(el) + getDistance(points.getItem(points.numberOfItems - 1), points.getItem(0));
  }

  function getTotalLength(el) {
    if (el.getTotalLength) { return el.getTotalLength(); }
    switch(el.tagName.toLowerCase()) {
      case 'circle': return getCircleLength(el);
      case 'rect': return getRectLength(el);
      case 'line': return getLineLength(el);
      case 'polyline': return getPolylineLength(el);
      case 'polygon': return getPolygonLength(el);
    }
  }

  function setDashoffset(el) {
    var pathLength = getTotalLength(el);
    el.setAttribute('stroke-dasharray', pathLength);
    return pathLength;
  }

  function getParentSvgEl(el) {
    var parentEl = el.parentNode;
    while (is.svg(parentEl)) {
      var parentNode = parentEl.parentNode;
      if (!is.svg(parentNode)) { break; }
      parentEl = parentNode;
    }
    return parentEl;
  }

  // SVG Responsive utils

  function getParentSvg(pathEl, svgData) {
    var svg = svgData || {};
    var parentSvgEl = svg.el || getParentSvgEl(pathEl);
    var rect = parentSvgEl.getBoundingClientRect();
    var viewBoxAttr = parentSvgEl.getAttribute('viewBox');
    var width = rect.width;
    var height = rect.height;
    var viewBox = svg.viewBox || (viewBoxAttr ? viewBoxAttr.split(' ') : [0, 0, width, height]);
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
    var pathEl = is.str(path) ? selectString(path)[0] : path;
    var p = percent || 100;
    return function(property) {
      return {
        property: property,
        el: pathEl,
        svg: getParentSvg(pathEl),
        totalLength: getTotalLength(pathEl) * (p / 100)
      }
    }
  }

  function getPathPoint(pathEl, progress, offset) {
    if ( offset === void 0 ) offset = 0;

    var length = progress + offset >= 1 ? progress + offset : 0;
    return pathEl.getPointAtLength(length);
  }

  function getPathProgress(pathObject, progress, isPathTargetInsideSVG) {
    var pathEl = pathObject.el;
    var parentSvg = getParentSvg(pathEl, pathObject.svg);
    var p = getPathPoint(pathEl, progress, 0);
    var p0 = getPathPoint(pathEl, progress, -1);
    var p1 = getPathPoint(pathEl, progress, +1);
    var scaleX = isPathTargetInsideSVG ? 1 : parentSvg.w / parentSvg.vW;
    var scaleY = isPathTargetInsideSVG ? 1 : parentSvg.h / parentSvg.vH;
    switch (pathObject.property) {
      case 'x': return (p.x - parentSvg.x) * scaleX;
      case 'y': return (p.y - parentSvg.y) * scaleY;
      case 'angle': return Math.atan2(p1.y - p0.y, p1.x - p0.x) * 180 / pi;
    }
  }

  function parseTargets$1(targets) {
    var targetsArray = targets ? (flattenArray(is.arr(targets) ? targets.map(toArray) : toArray(targets))) : [];
    return filterArray(targetsArray, function (item, pos, self) { return self.indexOf(item) === pos; });
  }

  function getAnimatables(targets) {
    var parsed = parseTargets$1(targets);
    return parsed.map(function (t, i) {
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
    var animationsLength = animations.length;
    var delay = tweenSettings.delay;
    var duration = tweenSettings.duration;
    var endDelay = tweenSettings.endDelay;

    if (!animationsLength) {
      return {
        delay: delay,
        duration: delay + duration + endDelay,
        endDelay: endDelay,
      };
    }

    var timings = {};

    for (var i = 0; i < animationsLength; i++) {
      var anim = animations[i];
      var animTlOffset = anim.timelineOffset;
      var delay$1 = animTlOffset + anim.delay;
      if (!timings.delay || delay$1 < timings.delay) {
        timings.delay = delay$1;
      }
      var duration$1 = animTlOffset + anim.duration;
      if (!timings.duration || duration$1 > timings.duration) {
        timings.duration = duration$1;
      }
      var endDelay$1 = animTlOffset + anim.duration - anim.endDelay;
      if (!timings.endDelay || endDelay$1 > timings.endDelay) {
        timings.endDelay = endDelay$1;
      }
    }

    timings.endDelay = timings.duration - timings.endDelay;

    return timings;
  }

  //Calculate time between two frames
  var count = 0;
  var prevTime = 0;
  function setTimeBtwnEachFrame(time) {
    if ( time === void 0 ) time = 0;

    var now = time;
    var diff = now - prevTime;
    prevTime = now;
    count++;
    if (diff > 0 && count > 30) {
      settings.timeBtwnEachFrame = diff;
    }
    requestAnimationFrame(setTimeBtwnEachFrame);
  }
  setTimeBtwnEachFrame();

  function convertPropertyValueToTweens(propertyValue, tweenSettings) {
    var value = propertyValue;
    var settings = cloneObject(tweenSettings);
    // Override duration if easing is a spring
    if (springTestRgx.test(settings.easing)) {
      settings.duration = spring(settings.easing);
    }
    if (is.arr(value)) {
      var l = value.length;
      var isFromTo = (l === 2 && !is.obj(value[0]));
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
    var valuesArray = is.arr(value) ? value : [value];
    return valuesArray.map(function (v, i) {
      var obj = (is.obj(v) && !is.pth(v)) ? v : { value: v };
      // Default delay value should only be applied to the first tween
      if (is.und(obj.delay)) {
        obj.delay = !i ? tweenSettings.delay : 0;
      }
      // Default endDelay value should only be applied to the last tween
      if (is.und(obj.endDelay)) {
        obj.endDelay = i === valuesArray.length - 1 ? tweenSettings.endDelay : 0;
      }
      return obj;
    }).map(function (k) { return mergeObjects(k, settings); });
  }


  function flattenParamsKeyframes(keyframes) {
    var properties = {};
    var propertyNames = filterArray(flattenArray(keyframes.map(function (key) { return Object.keys(key); })), function (p) { return is.key(p); })
    .reduce(function (a,b) {
      if (a.indexOf(b) < 0) {
        a.push(b);
      }
      return a;
    }, []);
    var loop = function ( i ) {
      var propName = propertyNames[i];
      properties[propName] = keyframes.map(function (key) {
        var newKey = {};
        for (var p in key) {
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
    };

    for (var i = 0; i < propertyNames.length; i++) loop( i );
    return properties;
  }

  function getKeyframesFromProperties(tweenSettings, params) {
    var keyframes = [];
    var paramsKeyframes = params.keyframes;
    if (paramsKeyframes) {
      params = mergeObjects(flattenParamsKeyframes(paramsKeyframes), params);  }
    for (var p in params) {
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
    var t = {};
    for (var p in tween) {
      var value = getFunctionValue(tween[p], animatable);
      if (is.arr(value)) {
        value = value.map(function (v) { return getFunctionValue(v, animatable); });
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
    var previousTween;
    return prop.tweens.map(function (t) {
      var tween = normalizeTweenValues(t, animatable);
      var tweenValue = tween.value;
      var to = is.arr(tweenValue) ? tweenValue[1] : tweenValue;
      var toUnit = getUnit(to);
      var originalValue = getOriginalTargetValue(animatable.target, prop.name, toUnit, animatable);
      var previousValue = previousTween ? previousTween.to.original : originalValue;
      var from = is.arr(tweenValue) ? tweenValue[0] : previousValue;
      var fromUnit = getUnit(from) || getUnit(originalValue);
      var unit = toUnit || fromUnit;
      if (is.und(to)) { to = previousValue; }
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
    var animType = getAnimationType(animatable.target, prop.name);
    if (animType) {
      var tweens = normalizeTweens(prop, animatable);
      var firstTween = tweens[0];
      var lastTween = tweens[tweens.length - 1];
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
    var animations = [];
    for (var a = 0, aLength = animatables.length; a < aLength; a++) {
      var animatable = animatables[a];
      if (animatable) {
        for (var p = 0, pLength = properties.length; p < pLength; p++) {
          var animation = createAnimation(animatable, properties[p]);
          // Make sure the animation is not undefined
          if (animation) {
            animations.push(createAnimation(animatable, properties[p]));
          }
        }
      }
    }
    return animations;
  }

  var instancesId = 0;

  function createTimeline(params) {
    var instanceSettings = replaceObjectProps(defaultInstanceSettings, params);
    var tweenSettings = replaceObjectProps(defaultTweenSettings, params);
    var properties = getKeyframesFromProperties(tweenSettings, params);
    var animatables = getAnimatables(params.targets);
    var animations = getAnimations(animatables, properties);
    var timings = getTimingsFromAnimations(animations, tweenSettings);
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

  var activeInstances = [];

  var raf;

  function tick(t) {
    // memo on algorithm issue:
    // dangerous iteration over mutable `activeInstances`
    // (that collection may be updated from within callbacks of `tick`-ed animation instances)
    var activeInstancesLength = activeInstances.length;
    var i = 0;
    while (i < activeInstancesLength) {
      var activeInstance = activeInstances[i];
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
        function (instance) { return instance ._onDocumentVisibility(); }
      );
      startEngine();
    }
  }

  if (isBrowser) {
    document.addEventListener('visibilitychange', handleVisibilityChange);
  }

  function removeInsFromActiveInstances(ins) {
    var tlIndex = activeInstances.indexOf(ins);
    if (tlIndex > -1) {
      activeInstances.splice(tlIndex, 1);
    }
  }

  function animate(params) {
    if ( params === void 0 ) params = {};

    var startTime = 0,
      lastTime = 0,
      now = 0;
    var children,
      childrenLength = 0;
    var resolve = null;

    function makePromise(instance) {
      var promise = window.Promise && new Promise(function (_resolve) { return (resolve = _resolve); });
      instance.finished = promise;
      return promise;
    }

    var instance = createTimeline(params);
    var promise = makePromise(instance);

    function toggleInstanceDirection() {
      var direction = instance.direction;
      if (direction !== 'alternate') {
        instance.direction = direction !== 'normal' ? 'normal' : 'reverse';
      }
      instance.reversed = !instance.reversed;

      var deepReverseChildren = function (ins) {
        var children = ins.children;
        children.forEach(function (child) {
          child.reversed = !child.reversed;
          child.direction = child.reversed ? 'reverse' : 'normal';
          if (child.children.length) { deepReverseChildren(child); }
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
        var t =
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
        instance.children = filterArray(instance.children, function (child) { return !child.killed; });
        delete instance.updateChildren;
      }
      if (!instance.reversePlayback) {
        for (var i = 0; i < childrenLength; i++) { seekChild(time, children[i], muteCallbacks); }
      } else {
        for (var i$1 = childrenLength; i$1--; ) { seekChild(time, children[i$1], muteCallbacks); }
      }
    }

    function setAnimationsProgress(insTime) {
      var i = 0;
      var animations = instance.animations;
      var animationsLength = animations.length;
      while (i < animationsLength) {
        var anim = animations[i];
        var animatable = anim.animatable;
        var tweens = anim.tweens;
        var tweenLength = tweens.length - 1;
        var tween = tweens[tweenLength];
        // Only check for keyframes if there is more than one tween
        if (tweenLength) { tween = filterArray(tweens, function (t) { return insTime < t.end; })[0] || tween; }
        var elapsed = clamp(insTime - tween.start - tween.delay, 0, tween.duration) / tween.duration;
        var eased = isNaN(elapsed) ? 1 : tween.easing(elapsed);
        var strings = tween.to.strings;
        var round = tween.round;
        var numbers = [];
        var toNumbersLength = tween.to.numbers.length;
        var progress = (void 0);
        for (var n = 0; n < toNumbersLength; n++) {
          var value = (void 0);
          var toNumber = tween.to.numbers[n];
          var fromNumber = tween.from.numbers[n] || 0;
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
        var stringsLength = strings.length;
        if (!stringsLength) {
          progress = numbers[0];
        } else {
          progress = strings[0];
          for (var s = 0; s < stringsLength; s++) {
            var a = strings[s];
            var b = strings[s + 1];
            var n$1 = numbers[s];
            if (!isNaN(n$1)) {
              if (!b) {
                progress += n$1 + ' ';
              } else {
                progress += n$1 + b;
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

    function beginInstance(fnc, insTime, insDuration, prop) {
      if ( prop === void 0 ) prop = 'began';

      var begin = function () {
        var beginInFirstCall = insDuration < settings.timeBtwnEachFrame && insDuration > 0;
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
      var insDuration = instance.duration;
      var insDelay = instance.delay;
      var insEndDelay = insDuration - instance.endDelay;
      var insTime = adjustTime(engineTime);
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
      if (instance.began) { instance.update(instance); }
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
      if (!instance.parent && instance.killed) { instance = null; }
    }

    instance.reset = function () {
      var direction = instance.direction;
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
      for (var i = childrenLength; i--; ) { instance.children[i].reset(); }
      if ((instance.reversed && instance.loop !== true) || (direction === 'alternate' && instance.loop === 1)) { instance.remainingLoops++; }
      setAnimationsProgress(instance.reversed ? instance.duration : 0);
      return instance;
    };

    // internal method (for engine) to adjust animation timings before restoring engine ticks (rAF)
    instance._onDocumentVisibility = resetTime;

    instance.tick = function (t) {
      now = t;
      if (!startTime) { startTime = now; }
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
      if (!instance.paused) { return; }
      if (instance.completed) { instance.reset(); }
      instance.paused = false;
      activeInstances.push(instance);
      resetTime();
      startEngine();
      return instance;
    };

    instance.reverse = function () {
      toggleInstanceDirection();
      resetTime();
      var resetCallbacks = function (instance) {
        var reset = function (ins) {
          if (ins.completed) {
            ins.began = false;
            ins.completed = false;
            ins.loopBegan = false;
          } else if (ins.began) {
            ins.began = false;
            ins.loopBegan = false;
          }
        };
        var resetChildrenCallbacks = function (parent) {
          var children = parent.children;
          children.forEach(function (child) {
            reset(child);
            if (child.children.length) { resetChildrenCallbacks(child); }
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
      var targetsArray = parseTargets(targets);
      removeTargetsFromInstance(targetsArray, instance);
      return instance;
    };

    instance.kill = function () {
      //Remove from activeInstances
      removeInsFromActiveInstances(instance);

      instance.children.forEach(function (child) { return child.parent === instance && (child.parent = null); });
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

  // Remove targets from animation

  function removeTargetsFromAnimations(targetsArray, animations) {
    for (var a = animations.length; a--; ) {
      if (arrayContains(targetsArray, animations[a].animatable.target)) {
        animations.splice(a, 1);
      }
    }
  }

  function removeTargetsFromInstance$1(targetsArray, instance) {
    var animations = instance.animations;
    var children = instance.children;
    removeTargetsFromAnimations(targetsArray, animations);
    for (var c = children.length; c--; ) {
      var child = children[c];
      var childAnimations = child.animations;
      removeTargetsFromAnimations(targetsArray, childAnimations);
      if (!childAnimations.length && !child.children.length) { children.splice(c, 1); }
    }
    if (!animations.length && !children.length) { instance.pause(); }
  }

  function removeTargetsFromActiveInstances(targets) {
    var targetsArray = parseTargets$1(targets);
    for (var i = activeInstances.length; i--; ) {
      var instance = activeInstances[i];
      removeTargetsFromInstance$1(targetsArray, instance);
    }
  }

  // Stagger helpers

  function stagger(val, params) {
    if ( params === void 0 ) params = {};

    var direction = params.direction || 'normal';
    var easing = params.easing ? parseEasings(params.easing) : null;
    var grid = params.grid;
    var axis = params.axis;
    var fromIndex = params.from || 0;
    var fromFirst = fromIndex === 'first';
    var fromCenter = fromIndex === 'center';
    var fromLast = fromIndex === 'last';
    var isRange = is.arr(val);
    var val1 = isRange ? parseFloat(val[0]) : parseFloat(val);
    var val2 = isRange ? parseFloat(val[1]) : 0;
    var unit = getUnit(isRange ? val[1] : val) || 0;
    var start = params.start || 0 + (isRange ? val1 : 0);
    var values = [];
    var maxValue = 0;
    return function (el, i, t) {
      if (fromFirst) { fromIndex = 0; }
      if (fromCenter) { fromIndex = (t - 1) / 2; }
      if (fromLast) { fromIndex = t - 1; }
      if (!values.length) {
        for (var index = 0; index < t; index++) {
          if (!grid) {
            values.push(Math.abs(fromIndex - index));
          } else {
            var fromX = !fromCenter ? fromIndex % grid[0] : (grid[0] - 1) / 2;
            var fromY = !fromCenter ? Math.floor(fromIndex / grid[0]) : (grid[1] - 1) / 2;
            var toX = index % grid[0];
            var toY = Math.floor(index / grid[0]);
            var distanceX = fromX - toX;
            var distanceY = fromY - toY;
            var value = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
            if (axis === 'x') { value = -distanceX; }
            if (axis === 'y') { value = -distanceY; }
            values.push(value);
          }
          maxValue = Math.max.apply(Math, values);
        }
        if (easing) { values = values.map(function (val) { return easing(val / maxValue) * maxValue; }); }
        if (direction === 'reverse') { values = values.map(function (val) { return (axis ? (val < 0 ? val * -1 : -val) : Math.abs(maxValue - val)); }); }
      }
      var spacing = isRange ? (val2 - val1) / maxValue : val1;
      return start + spacing * (Math.round(values[i] * 100) / 100) + unit;
    };
  }

  // Timeline

  function timeline(params) {
    if ( params === void 0 ) params = {};

    var tl = animate(params);
    tl.duration = 0;
    tl.add = function (instanceParams, timelineOffset) {
      var tlIndex = activeInstances.indexOf(tl);
      var children = tl.children;
      if (tlIndex > -1) { activeInstances.splice(tlIndex, 1); }
      var insParams = mergeObjects(instanceParams, replaceObjectProps(defaultTweenSettings, params));
      insParams.targets = insParams.targets || params.targets;
      var tlDuration = tl.duration;
      insParams.autoplay = false;
      insParams.direction = tl.direction;
      insParams.timelineOffset = is.und(timelineOffset) ? tlDuration : getRelativeValue(timelineOffset, tlDuration);
      tl.seekSilently(insParams.timelineOffset);
      var ins = animate(insParams);
      var totalDuration = ins.duration + insParams.timelineOffset;
      children.push(ins);
      var timings = getTimingsFromAnimations(children, params);
      tl.delay = timings.delay;
      tl.endDelay = timings.endDelay;
      tl.duration = timings.duration;
      tl.seekSilently(0);
      tl.reset();
      if (tl.autoplay) { tl.play(); }
      return tl;
    };
    return tl;
  }

  // Set Value helper

  function setTargetsValue(targets, properties) {
    var animatables = getAnimatables(targets);
    animatables.forEach(function (animatable) {
      for (var property in properties) {
        var value = getFunctionValue(properties[property], animatable);
        var target = animatable.target;
        var valueUnit = getUnit(value);
        var originalValue = getOriginalTargetValue(target, property, valueUnit, animatable);
        var unit = valueUnit || getUnit(originalValue);
        var to = getRelativeValue(validateValue(value, unit), originalValue);
        var animType = getAnimationType(target, property);
        setValueByType[animType](target, property, to, animatable.transforms, true);
      }
    });
  }

  var anime = animate;

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

  return anime;

}());
