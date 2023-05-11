const defaultConfig = {
  shouldSpy: true,
  watchExit: false,
  offset: 0
};

class SpyService {
  constructor() {
    this.refreshInterval = 250;
    this.refreshIntervalId = undefined;

    this.globalContextKey = Symbol('global');
    this.noContextKey = Symbol('noContext');

    this.contexts = new Map();
    this.contexts.set(this.globalContextKey, []);
    this.contexts.set(this.noContextKey, []);
  }

  setOptions(options) {
    if (options && options.refreshInterval != undefined) {
      this.refreshInterval = options.refreshInterval;
    }
  }

  getContext(key) {
    if (key && typeof key === 'string') {
      if (!this.contexts.has(key)) this._createContext(key);

      return this.contexts.get(key);
    } else if (key === false) {
      return this.contexts.get(this.noContextKey);
    }
    return this.contexts.get(this.globalContextKey);
  }

  _createContext(key) {
    this.contexts.set(key, []);
  }

  _deleteContext(key) {
    if (key === this.noContextKey || key === this.globalContextKey) return;
    this.contexts.delete(key);
  }

  removeTarget(key, target) {
    const context = this.contexts.get(key);
    context.splice(context.indexOf(target), 1);
    if (!context.length) this._deleteContext(key);
  }

  findContextAndTarget(el) {
    let target, contextKey;

    for (const [key, items] of this.contexts.entries()) {
      target = items.find(item => item.el === el);
      if (target) {
        contextKey = key;
        break;
      }
    }

    return {contextKey, target};
  }

  _checkTargets() {
    this.contexts.forEach((value, key) => {
      if (key === this.noContextKey) {
        value.forEach(item => {
          const domRect = item.el.getBoundingClientRect();

          let active = domRect.top <= item.config.offset;
          if (item.config.watchExit) {
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
      if (item.config.watchExit) {
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
    if (!this.refreshIntervalId || this.contexts.size > 2 ||
        this.contexts.get(this.noContextKey).length || this.contexts.get(this.globalContextKey).length) return;
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
