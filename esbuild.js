#!/usr/bin/env node
const { build } = require('estrella');

const babelConfig = {
  filter: /.*/,
  namespace: '',
  config: {
    presets: [
      [
        '@babel/preset-env',
        {
          useBuiltIns: 'entry',
          corejs: 3.22,
          modules: false,
          targets: {
            browsers: ['IE 11'],
          },
        },
      ],
    ],
  },
};

const date = new Date();

const banner = `/*
 * anime.js v${process.env.npm_package_version}
 * (c) ${date.getFullYear()} Sherif Magdy
 * Released under the MIT license
 * animejs.com
 */
`;

import('esbuild-plugin-babel').then(({ default: babel }) => {
  const buildConfig = (format, target, minify) => {
    const fileNameFormat = format === 'iife' ? 'es5' : format;
    const fileNameMinify = minify ? '.min' : '';
    const plugins = target === 'es5' ? [babel(babelConfig)] : [];
    const outfileName = `lib/anime.${fileNameFormat}${fileNameMinify}.js`;
    return {
      globalName: `anime`,
      entryPoints: [`src/anime.js`],
      outfile: outfileName,
      format: format,
      minify: minify,
      bundle: true,
      banner: { js: banner },
      target: [target],
      plugins: plugins,
    };
  };

  build(buildConfig('iife', 'es5', false));
  build(buildConfig('iife', 'es5', true));
  build(buildConfig('esm', 'esnext', false));
  build(buildConfig('esm', 'esnext', true));
  build(buildConfig('cjs', 'esnext', false));
  build(buildConfig('cjs', 'esnext', true));
});
