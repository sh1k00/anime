import buble from '@rollup/plugin-buble';
import replace from '@rollup/plugin-replace';
import { uglify } from 'rollup-plugin-uglify';
import notify from 'rollup-plugin-notify';
import pkg from './package.json';

const inputPath = 'src/anime.js';
const outputName = 'anime';

const banner = (format) => {
  const date = new Date();
  return `/*
  * anime.js v${pkg.version} - ${format}
  * (c) ${date.getFullYear()} Sherif Magdy
  * Released under the MIT license
  * animejs.com
*/
`;
};

const replaceOptions = {
  __packageVersion__: pkg.version,
};

const bubleOptions = {
  exclude: ['node_modules/**'],
  transforms: {
    dangerousForOf: true,
  },
  targets: {
    firefox: 32,
    chrome: 24,
    safari: 6,
    opera: 15,
    edge: 10,
  },
};

export default [
  // ES6 UMD & Module
  {
    input: inputPath,
    output: [
      { file: pkg.main, format: 'umd', name: outputName, banner: banner('ES6 UMD') },
      { file: pkg.module, format: 'es', banner: banner('ES6 Module') },
    ],
    plugins: [replace(replaceOptions), notify()],
  },
  // ES5 Minified
  {
    input: inputPath,
    output: { file: pkg.files + '/anime.es5.min.js', format: 'iife', name: outputName },
    plugins: [
      replace(replaceOptions),
      buble(bubleOptions),
      uglify({
        output: {
          preamble: banner('ES5 IIFE minified'),
        },
      }),
      notify(),
    ],
  },
  // ES5
  {
    input: inputPath,
    output: { file: pkg.files + '/anime.es5.js', format: 'iife', name: outputName, banner: banner('ES5 IIFE') },
    plugins: [replace(replaceOptions), buble(bubleOptions), notify()],
  },
];
