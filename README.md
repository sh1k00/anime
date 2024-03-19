<h1 align="center">
  <a href="https://animejs.com"><img src="https://animejs.com/documentation/assets/img/animejs-v3-header-animation.gif" width="250"/></a>
  <br>
  anime.js
</h1>

<h4 align="center">JavaScript animation engine | <a href="https://animejs.com" target="_blank">animejs.com</a></h4>

<p align="center">
  <a href="https://www.npmjs.com/package/@sherifmagdy/animejs" rel="nofollow">
    <img alt="npm version" src="https://img.shields.io/npm/v/@sherifmagdy/animejs?style=plastic">
  </a>
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

Via yarn

```bash
$ yarn add @sherifmagdy/animejs
```

or manual [download](https://www.jsdelivr.com/package/npm/@sherifmagdy/animejs).

### Usage

#### ES6 modules

```javascript
import anime from '@sherifmagdy/animejs';
```

#### CommonJS

```javascript
const { default: anime } = require('@sherifmagdy/animejs');
```

#### Classic ES5 file include

Link `anime.browser.min.js` in your HTML :

```html
<script src="anime.browser.min.js"></script>
<script>
  const { default: anime } = anime;
</script>
```

#### Using a CDN

```html
<script src="https://cdn.jsdelivr.net/npm/@sherifmagdy/animejs@3.3.3/lib/anime.browser.min.js"></script>
<script>
  const { default: anime } = anime;
</script>
```

In case you are using modules in the browser:

```html
<script type="module">
  import anime from 'https://cdn.jsdelivr.net/npm/@sherifmagdy/animejs@3.3.3/lib/anime.esm.browser.min.js';

  //init
  const animeInstance = anime(...);
</script>
```

### New Features (v3.3)

- Improving timeline's add method to accept anime instance, timeline, function and instance parameters.
- Add call method to the timeline.
- Add kill method to anime instance and timeline.
- Add speed method to anime instance and timeline.
- restart, seek, play, pause, reverse, remove methods are now chainable in addition to speed and call methods.
- Add a reversed instance or timeline to a normal timeline.
- Add addMark() and removeMark() methods to the timeline.
- seek() method and [time offset parameter](https://animejs.com/documentation/#timelineOffsets) are now supporting adding a mark's name or a percentage of the duration as a string.

##### Sandbox demo to highlight the powerful of the new features [here](https://codesandbox.io/s/threejs-with-anime-l0munm)

### new Methods (v3.3)

#### call ( callback :Function ) : self

Adds a callback to the timeline which gets executed at creation.

```javascript
//simple example to show a 3d object in 3d space follows an empty helper

const 3dObject = { x: 1 , ...};
const 3dHelper = { x: 3 , ...};

const tl = anime
  .timeline({
    targets: 3dObject
  })
  .add({
    x: 3dHelper.x, // translate the 3dObject's x position to 3
  })
  .call(() => {
    3dHelper.x = 5; // then change the helper's x position to 5
  })
  .add({
    x: 3dHelper.x // translate the 3dObject's x position to 5
  });

  // we could NOT use begin or complete properties because the callback appended to them won't execute at creation of the timeline.
```

#### kill () :undefined

Kills the anime instance (or timeline), so that the instance is eligible for garbage collection.

```javascript
const instance = anime({
  targets: '.class',
  translateX: '+=100',
  complete: (ins) => ins.kill(),
});
```

#### speed (multiplier :Number) :self

Controls the animation speed, where ( multiplier= 0.5 ) means half speed, ( multiplier= 2 ) double speed.

```javascript
const instance = anime(...);

//Adjust the animation speed
instance.speed(2.5);
```

#### addMark (name :String) :self

Adds a mark at particular position in the timeline.

```javascript
const instance = anime
  .timeline({
    targets: '#elementID',
  })
  .add({ translateY: 200 })
  .addMark('startScale')
  .add({ scaleX: 0.5 }, 'startScale')
  .add({ scaleY: 0.7 }, 'startScale');
```

#### removeMark (name :String) :self

Removes a predefined mark from the timeline.

```javascript
const instance = anime
  .timeline({
    targets: '#elementID',
    complete: (tl) => tl.removeMark('startRotate'), // removes the mark after the animation complete
  })
  .add({ translateY: 200 })
  .addMark('startScale')
  .add({ scaleX: 0.5 }, 'startScale')
  .addMark('startRotate')
  .add({ rotateX: '50deg' }, 'startRotate');
```

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

### More Advanced Examples

add() method in the timeline

```javascript
const instance = anime({
  targets: 'div',
  translateX: 250,
});

const tl = anime
  .timeline({
    targets: '.class',
  })
  .add({
    rotateZ: '2turn',
  })
  .add(instance); // adding an instance to the timeline

const anotherTl = anime
  .timeline({
    targets: '.anotherClass',
  })
  .add(tl) // adding a timeline to the another timeline
  .addMark('MARK')
  .add(() => {
    //do something in this particular time
  }) // adding a function to get executed in this position in the timeline
  .add(
    {
      scaleY: 0.4,
    },
    'MARK'
  );

//You can add a reversed animation to a normal timeline
const reversedTl = anotherTl.reverse();
const normalTl = anime.timeline(...).add(reversedTl); //can be useful in many cases
```

seek() method & time offset parameter

```javascript
  const tl = anime
  .timeline(...)
  .add({ translateY : 200 })
  .addMark('scale')
  .add({scaleX : 1.2} , 'scale') // starts at the same time of the mark ('scale')
  .add({scaleY: 0.3} ,'scale'); // starts at the same time of the mark ('scale')

  tl.seek('scale'); // seek to a specefic position
  //OR
  tl.seek('32%') //Use a percentage
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

[Website](https://animejs.com/) | [Documentation](https://animejs.com/documentation/) | [Demos and examples](http://codepen.io/collection/b392d3a52d6abf5b8d9fda4e4cab61ab/) | [MIT License](LICENSE.md) | © 2024 [Sherif Magdy](https://sunshine-themes.com).
