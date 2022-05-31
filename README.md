<h1 align="center">
  <a href="https://animejs.com"><img src="https://animejs.com/documentation/assets/img/animejs-v3-header-animation.gif" width="250"/></a>
  <br>
  anime.js
</h1>

<h4 align="center">JavaScript animation engine | <a href="https://animejs.com" target="_blank">animejs.com</a></h4>

<p align="center">
  <a href="https://www.npmjs.com/package/@sherifmagdy/animejs" rel="nofollow"><img src="https://img.shields.io/badge/npm-v3.3.0-blue" alt="npm version" data-canonical-src="https://img.shields.io/badge/npm-v3.3.0-blue" style="max-width:100%;"></a>
  <img src="https://img.shields.io/github/license/sherif-magdy/anime" alt="npm license" style="max-width:100%;">
</p>

<blockquote align="center">
  <em>Anime.js</em> (<code>/ˈæn.ə.meɪ/</code>) is a lightweight JavaScript animation library with a simple, yet powerful API.<br>
  It works with CSS properties, SVG, DOM attributes and JavaScript Objects.
</blockquote>

<p align="center">
  <a href="#getting-started">Getting started</a>&nbsp;|&nbsp;<a href="#documentation">Documentation</a>&nbsp;|&nbsp;<a href="#demos-and-examples">Demos and examples</a>&nbsp;|&nbsp;<a href="#browser-support">Browser support</a>
</p>

## Getting started

### Download

Via npm

```bash
$ npm install @sherifmagdy/animejs --save
```

or manual [download](https://github.com/sherif-magdy/anime/archive/master.zip).

### Usage

#### ES6 modules

```javascript
import anime from 'animejs/lib/anime.esm.js';
```

#### CommonJS

```javascript
const anime = require('anime');
```

#### Classic ES5 file include

Link `anime.es5.min.js` in your HTML :

```html
<script src="anime.es5.min.js"></script>
```

### New Features

- Improving timeline's add method to accept anime instance, timeline, function and instance parameters.
- Add call method to the timeline.
- Add kill method to anime instance and timeline.
- Add speed method to anime instance and timeline.
- restart, seek, play, pause, reverse, remove methods are now chainable in addition to speed and call methods.
- Add a reversed instance or timeline to a normal timeline.

##### Sandbox demo to demonstrate the powerful of new features [here](https://codesandbox.io/s/threejs-with-anime-l0munm)

### Hello world

```javascript
anime({
  targets: 'div',
  translateX: 250,
  rotate: '1turn',
  backgroundColor: '#FFF',
  duration: 800,
});
```

## [Documentation](https://animejs.com/documentation/)

- [Targets](https://animejs.com/documentation/#cssSelector)
- [Properties](https://animejs.com/documentation/#cssProperties)
- [Property parameters](https://animejs.com/documentation/#duration)
- [Animation parameters](https://animejs.com/documentation/#direction)
- [Values](https://animejs.com/documentation/#unitlessValue)
- [Keyframes](https://animejs.com/documentation/#animationKeyframes)
- [Staggering](https://animejs.com/documentation/#staggeringBasics)
- [Timeline](https://animejs.com/documentation/#timelineBasics)
- [Controls](https://animejs.com/documentation/#playPause)
- [Callbacks and promises](https://animejs.com/documentation/#update)
- [SVG Animations](https://animejs.com/documentation/#motionPath)
- [Easing functions](https://animejs.com/documentation/#linearEasing)
- [Helpers](https://animejs.com/documentation/#remove)

## [Demos and examples](http://codepen.io/collection/b392d3a52d6abf5b8d9fda4e4cab61ab/)

- [CodePen demos and examples](http://codepen.io/collection/b392d3a52d6abf5b8d9fda4e4cab61ab/)
- [Sandbox demo](https://codesandbox.io/s/threejs-with-anime-l0munm)
- [juliangarnier.com](http://juliangarnier.com)
- [animejs.com](https://animejs.com)
- [Moving letters](http://tobiasahlin.com/moving-letters/) by [@tobiasahlin](https://twitter.com/tobiasahlin)
- [Gradient topography animation](https://tympanus.net/Development/GradientTopographyAnimation/) by [@crnacura](https://twitter.com/crnacura)
- [Organic shape animations](https://tympanus.net/Development/OrganicShapeAnimations/) by [@crnacura](https://twitter.com/crnacura)
- [Pieces slider](https://tympanus.net/Tutorials/PiecesSlider/) by [@lmgonzalves](https://twitter.com/lmgonzalves)
- [Staggering animations](https://codepen.io/juliangarnier/pen/4fe31bbe8579a256e828cd4d48c86182?editors=0100)
- [Easings animations](https://codepen.io/juliangarnier/pen/444ed909fd5de38e3a77cc6e95fc1884)
- [Sphere animation](https://codepen.io/juliangarnier/pen/b3bb8ca599ad0f9d00dd044e56cbdea5?editors=0010)
- [Layered animations](https://codepen.io/juliangarnier/pen/6ca836535cbea42157d1b8d56d00be84?editors=0010)
- [anime.js logo animation](https://codepen.io/juliangarnier/pen/d43e8ec355c30871cbe775193255d6f6?editors=0010)

## Browser support

| Chrome | Safari | IE / Edge | Firefox | Opera |
| ------ | ------ | --------- | ------- | ----- |
| 24+    | 8+     | 11+       | 32+     | 15+   |

## <a href="https://animejs.com"><img src="https://animejs.com/documentation/assets/img/animejs-v3-logo-animation.gif" width="150" alt="anime-js-v3-logo"/></a>

[Website](https://animejs.com/) | [Documentation](https://animejs.com/documentation/) | [Demos and examples](http://codepen.io/collection/b392d3a52d6abf5b8d9fda4e4cab61ab/) | [MIT License](LICENSE.md) | © 2022 [Sherif Magdy](https://sunshine-themes.com).
