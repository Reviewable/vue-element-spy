import SpyService from './spy-service';

const spyService = new SpyService();

const vueElementSpy = {
  inserted(el, {value}) {
    spyService.setRefreshInterval();

    const config = SpyService.parseConfig(value);

    const target = {callback: config.callback, el, active: false, config};

    let context;
    if (config.outOfContext) {
      context = spyService.getContext('outOfContext');
    } else {
      const contextEl = el.closest('[data-intersect-context]');
      if (contextEl) {
        context = spyService.getContext(contextEl);
      } else {
        context = spyService.getContext('global');
      }
    }

    const topObserver = new IntersectionObserver(([entry]) => {
      let activeNew = entry.boundingClientRect.top <= config.offset;
      if (!config.greedy) activeNew = activeNew && entry.boundingClientRect.top*-1 < el.offsetHeight;

      if (target.active === activeNew) return;
      if (!config.outOfContext) {
        spyService.handleActivation(context);
        return;
      }

      target.active = activeNew;
      target.callback(activeNew, el);
    }, {threshold: 1, rootMargin: `${config.offset}px 0px 0px`});

    const anchor = document.createElement('div');
    el.before(anchor);
    target.anchor = anchor;

    topObserver.observe(anchor);
    target.topObserver = topObserver;

    if (!config.greedy) {
      const bottomObserver = new IntersectionObserver(([entry]) => {
        if (entry.boundingClientRect.top > config.offset) return;

        const activeNew = entry.intersectionRatio > 0;
        if (target.active === activeNew) return;

        if (!config.outOfContext) {
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
  },

  unbind(el) {
    const {context, target} = spyService.findContextAndTarget(el);
    if (!target) return;
    target.topObserver.disconnect();
    if (target.bottomObserver) target.bottomObserver.disconnect();
    target.anchor.remove();
    context.splice(context.indexOf(target), 1);
    spyService.resetRefreshInterval();
  }
}


const vueElementSpyContext = {
  bind(el, {value}) {
    spyService.createContext(el);
    el.dataset.intersectContext = '';
  },

  unbind(el) {
    spyService.getContext(el).forEach(target => {
      target.topObserver.disconnect();
      if (target.bottomObserver) target.bottomObserver.disconnect();
      target.anchor.remove();
    });

    spyService.deleteContext(el);
    spyService.resetRefreshInterval();
  }
};

export default {
  install(Vue, options) {
    spyService.setOptions(options);

    Vue.directive('vue-element-spy', vueElementSpy);
    Vue.directive('vue-element-spy-context', vueElementSpyContext)
  }
}
