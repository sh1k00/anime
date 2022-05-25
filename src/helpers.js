import { defaultInstanceSettings, defaultTweenSettings, hexTestRgx, rgbTestRgx, hslTestRgx } from './consts.js';

// Strings functions

export function selectString(str) {
  try {
    let nodes = document.querySelectorAll(str);
    return nodes;
  } catch (e) {
    return;
  }
}

export function stringContains(str, text) {
  return str.indexOf(text) > -1;
}

// Numbers functions

export function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

export function round(val, base = 1) {
  return Math.round(val * base) / base;
}

export function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Types

export const is = {
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

export function filterArray(arr, callback) {
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

export function flattenArray(arr) {
  return arr.reduce((a, b) => a.concat(is.arr(b) ? flattenArray(b) : b), []);
}

export function toArray(o) {
  if (is.arr(o)) return o;
  if (is.str(o)) o = selectString(o) || o;
  if (o instanceof NodeList || o instanceof HTMLCollection) return [].slice.call(o);
  return [o];
}

export function arrayContains(arr, val) {
  return arr.some((a) => a === val);
}

// Objects

export function cloneObject(o) {
  const clone = {};
  for (let p in o) clone[p] = o[p];
  return clone;
}

export function replaceObjectProps(o1, o2) {
  const o = cloneObject(o1);
  for (let p in o1) o[p] = o2.hasOwnProperty(p) ? o2[p] : o1[p];
  return o;
}

export function mergeObjects(o1, o2) {
  const o = cloneObject(o1);
  for (let p in o2) o[p] = is.und(o1[p]) ? o2[p] : o1[p];
  return o;
}

// Functions

export function applyArguments(func, args) {
  return func.apply(null, args);
}

// Document

export const isBrowser = !is.und(window) && !is.und(window.document);

export function isDocumentHidden() {
  return isBrowser && document.hidden;
}
