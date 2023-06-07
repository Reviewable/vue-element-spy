import SpyService from './spy-service';

const spyService = new SpyService();

function isShallowObjectMatch(a, b) {
  return Object.keys(a).length === Object.keys(b).length &&
    Object.keys(a).every(i => a[i] === b[i])
}

function checkValidOffset(options) {
  if (!Object.hasOwn(options, 'offset')) return true
  if (options.offset === undefined || options.offset === null) return false;
  return !isNaN(Number(options.offset));
}

function setup(el, config) {
  spyService.setRefreshInterval();

  const target = {callback: config.callback, el, active: false, config};

  const context = spyService.getContext(config.context);

  const topObserver = new IntersectionObserver(([entry]) => {
    let activeNew = entry.boundingClientRect.top <= config.offset;
    if (config.watchExit) activeNew = activeNew && entry.boundingClientRect.top * -1 < el.offsetHeight;

    if (target.active === activeNew) return;
    if (config.context) {
      spyService.handleActivation(context);
      return;
    }

    target.active = activeNew;
    target.callback(activeNew, el);
  }, {threshold: 1, rootMargin: `${config.offset}px 0px 0px`});

  const anchor = document.createElement('div');
  anchor.style.cssText = 'width: 0; height: 0; display: block;';
  anchor.className = 'vue-element-spy-anchor';
  el.parentElement.insertBefore(anchor, el);
  target.anchor = anchor;

  topObserver.observe(anchor);
  target.topObserver = topObserver;

  if (config.watchExit) {
    const bottomObserver = new IntersectionObserver(([entry]) => {
      if (entry.boundingClientRect.top > config.offset) return;

      const activeNew = entry.intersectionRatio > 0;
      if (target.active === activeNew) return;

      if (config.context) {
        spyService.handleActivation(context);
        return;
      }

      target.active = activeNew;
      target.callback(activeNew, el);

    }, {threshold: 0, rootMargin: `${config.offset}px 0px 0px`});
    bottomObserver.observe(el);

    target.bottomObserver = bottomObserver;
  }
  context.push(target);
}

function teardown(el) {
  const {contextKey, target} = spyService.findContextAndTarget(el);
  if (!target) return;

  target.topObserver.disconnect();
  if (target.bottomObserver) target.bottomObserver.disconnect();
  target.anchor.remove();

  spyService.removeTarget(contextKey, target);

  spyService.resetRefreshInterval();
}

const vueElementSpy = {
  inserted(el, {value}) {
    const config = SpyService.parseConfig(value);
    if (config.shouldSpy && checkValidOffset(value)) setup(el, config);
  },
  update(el, {value, oldValue}) {
    if (isShallowObjectMatch(value, oldValue)) return
    const config = SpyService.parseConfig(value);
    teardown(el);
    if (config.shouldSpy && checkValidOffset(value)) setup(el, config);
  },
  unbind(el) {
    teardown(el);
  }
}

export default {
  install(Vue, options) {
    spyService.setOptions(options);

    Vue.directive('vue-element-spy', vueElementSpy);
  }
}
