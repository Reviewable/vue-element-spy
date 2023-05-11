vue-element-spy
========

Plugin for detecting when element reaches top of the viewport. The plugin uses Intersection Observer.

# Installation

```
yarn add vue-element-spy
```

## Import

```javascript
import Vue from 'vue'
import VueElementSpy from 'vue-element-spy'

Vue.use(VueElementSpy)
```

## Browser

```html
<script src="vue.js"></script>
<script src="/node_modules/vue-element-spy/dist/vue-element-spy.js"></script>
```

```javascript
Vue.use(VueElementSpy)
```

## Install options

### refreshInterval

It's possible to set `refreshInterval` option for periodical spies refresh. Use if content changes or reflows without scrolling.
**Default**: `250`
**Disable**: `0`

```javascript
Vue.use(VueElementSpy, {refreshInterval: 500})
```

# Usage


## v-vue-element-spy directive

`v-vue-element-spy` observes whether the target element is at the top of the viewport and calls `callback`.

**Beware that `v-vue-element-spy` has a side effect - an empty `div` element is appended before the spied element. The reason is that a target element may be bigger then the viewport that's why expected intersection `100%` isn't possible and `IntersectionObserver` will remain silent.**

```html
<div v-vue-element-spy="{callback: myCallback}">
<!-- or shortened syntax -->
<div v-vue-element-spy="myCallback">
```

### v-vue-element-spy options

#### callback: Function - required

Callback function. Two arguments are passed: boolean whether element is reached top, target element.

#### watchExit: Boolean

Set `watchExit` to `true` if you want to observe bottom of the target and get notified when the whole element leaves viewport.
**Default**: `false`

#### offset: Number

Set `offset` value if you want to move activation point in px.
**Default**: `0`

#### context: String || Boolean

By default all spies are in one global context and if second target reaches viewport then first target becomes inactive.
Set `context` to `false` if you don't want the target to be affected by other spies.
Set `context` to any `String` values to define separate context for a target.
**Default**: `true`

#### shouldSpy: Boolean

Set `shouldSpy` if you want to conditionally activate/deactivate the spy.
**Default**: `true`

```html
<div>
  <h1 v-vue-element-spy="{myCallback, context: 'titles'}">Title 1</h1>
  <h1 v-vue-element-spy="{myCallback, context: 'titles'}">Title 2</h1>
  <h1 v-vue-element-spy="{myCallback, context: 'titles'}">Title 3</h1>
</div>
```
