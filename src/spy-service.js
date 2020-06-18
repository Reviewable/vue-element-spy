const defaultConfig = {
  greedy: true,
  offset: 0
};

class SpyService {
  constructor() {
    this.refreshInterval = 250;
    this.refreshIntervalId = undefined;

    this.contextsList = new Map();
    this.contextsList.set('global', []);
    this.contextsList.set('outOfContext', []);
  }

  setOptions(options) {
    if (options && options.refreshInterval != undefined) {
      this.refreshInterval = options.refreshInterval;
    }
  }

  getContext(val) {
    return this.contextsList.get(val);
  }

  createContext(el) {
    this.contextsList.set(el, []);
  }

  deleteContext(el) {
    this.contextsList.delete(el);
  }

  findContextAndTarget(el) {
    let target;
  
    let context;
    for (const items of this.contextsList.values()) {
      target = items.find(item => item.el === el);
      if (target) {
        context = items;
        break;
      }
    }
  
    return {context, target};
  }

  _checkTargets() {
    this.contextsList.forEach((value, key) => {
      if (key === 'outOfContext') {
        value.forEach(item => {
          const domRect = item.el.getBoundingClientRect();

          let active = domRect.top <= item.config.offset;
          if (!item.config.greedy) {
            active = active && item.config.offset - domRect.top < domRect.height;
          }

          if (active === item.active) return;

          item.active = active;
          item.callback(active, item.el);
        });
      } else {
        this.handleActivation(value);
      }
    });
  }

  handleActivation(context) {
    let toBeActive;
    context.forEach(item => {
      const domRect = item.el.getBoundingClientRect();

      let active = domRect.top <= item.config.offset;
      if (!item.config.greedy) {
        active = active && item.config.offset - domRect.top < domRect.height;
      }

      if (active) {
        if (!toBeActive || toBeActive.top < domRect.top) {
          toBeActive = {
            item: item,
            top: domRect.top
          };
        }
      }
    });
  
    if (toBeActive) toBeActive = toBeActive.item;

    context.forEach(item => {
      if (!item.active || toBeActive === item) return;
  
      item.active = false;
      item.callback(false, item.el);
    });

    if (!toBeActive || toBeActive.active) return;
    toBeActive.active = true;
    toBeActive.callback(true, toBeActive.el);
  }

  setRefreshInterval() {
    if (!this.refreshIntervalId && this.refreshInterval) {
      this.refreshIntervalId = setInterval(() => this._checkTargets(), this.refreshInterval);
    }
  }

  resetRefreshInterval() {
    if (!this.refreshIntervalId || this.contextsList.size > 2 ||
        this.contextsList.get('global').length || this.contextsList.get('outOfContext').length) return;
    clearInterval(this.refreshIntervalId);
    this.refreshIntervalId = null;
  }

  static parseConfig(value) {
    return typeof value === 'function' ?
      Object.assign({}, defaultConfig, {callback: value}) :
      Object.assign({}, defaultConfig, value);
  }
}

export default SpyService;
