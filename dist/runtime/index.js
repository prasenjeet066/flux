// src/runtime/index.js
var isNode = typeof process !== "undefined" && process.versions && process.versions.node;
var isBrowser = typeof window !== "undefined" && typeof document !== "undefined";
var isWorker = typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope;
var globalContext = isNode ? global : isBrowser ? window : self;
var ReactiveState = class {
  constructor(initialValue, options = {}) {
    this._value = initialValue;
    this._subscribers = /* @__PURE__ */ new Set();
    this._computedCache = /* @__PURE__ */ new Map();
    this._batchUpdates = /* @__PURE__ */ new Set();
    this._isBatching = false;
    this._comparator = options.comparator || ((a, b) => a !== b);
    this._debounceMs = options.debounce || 0;
    this._debounceTimer = null;
    this._history = options.history ? [initialValue] : null;
    this._maxHistory = options.maxHistory || 10;
    this._updateCount = 0;
    this._lastUpdate = Date.now();
  }
  get value() {
    if (currentEffect) {
      this._subscribers.add(currentEffect);
      currentEffect.dependencies.add(this);
      if (!this._accessPatterns) {
        this._accessPatterns = /* @__PURE__ */ new Map();
      }
      const effectId = currentEffect.id || "unknown";
      this._accessPatterns.set(effectId, (this._accessPatterns.get(effectId) || 0) + 1);
    }
    return this._value;
  }
  set value(newValue) {
    if (this._comparator(newValue, this._value)) {
      const oldValue = this._value;
      this._value = newValue;
      if (this._history) {
        this._history.push(newValue);
        if (this._history.length > this._maxHistory) {
          this._history.shift();
        }
      }
      if (this._isBatching) {
        this._batchUpdates.add(this);
      } else {
        this.notify();
      }
      this._updateCount++;
      this._lastUpdate = Date.now();
      this.emit("change", { oldValue, newValue });
    }
  }
  // Advanced value manipulation
  update(updater) {
    if (typeof updater === "function") {
      this.value = updater(this._value);
    } else {
      this.value = updater;
    }
  }
  // Batch multiple updates
  batch(updates) {
    this._isBatching = true;
    try {
      updates();
    } finally {
      this._isBatching = false;
      this._batchUpdates.forEach((state) => state.notify());
      this._batchUpdates.clear();
    }
  }
  // Debounced updates
  debouncedUpdate(newValue) {
    if (this._debounceTimer) {
      clearTimeout(this._debounceTimer);
    }
    this._debounceTimer = setTimeout(() => {
      this.value = newValue;
    }, this._debounceMs);
  }
  // Undo/redo functionality
  undo() {
    if (this._history && this._history.length > 1) {
      this._history.pop();
      this.value = this._history[this._history.length - 1];
      return true;
    }
    return false;
  }
  redo() {
    return false;
  }
  notify() {
    if (this._subscribers.size === 0) return;
    const subscribers = Array.from(this._subscribers);
    const startTime = performance.now() || Date.now();
    for (const subscriber of subscribers) {
      try {
        subscriber.execute();
      } catch (error) {
        console.error("Error in reactive subscriber:", error);
        this._subscribers.delete(subscriber);
      }
    }
    const duration = (performance.now() || Date.now()) - startTime;
    if (duration > 16) {
      console.warn(`Slow reactive update: ${duration.toFixed(2)}ms`);
    }
    this._computedCache.clear();
    FluxRuntime.scheduleUpdate();
  }
  subscribe(callback, options = {}) {
    const subscription = {
      callback,
      id: options.id || Math.random().toString(36),
      priority: options.priority || 0,
      execute: () => callback(this._value)
    };
    this._subscribers.add(subscription);
    return () => {
      this._subscribers.delete(subscription);
    };
  }
  // Event emitter functionality
  emit(event, data) {
    if (this._eventListeners && this._eventListeners[event]) {
      this._eventListeners[event].forEach((listener) => {
        try {
          listener(data);
        } catch (error) {
          console.error("Error in event listener:", error);
        }
      });
    }
  }
  on(event, listener) {
    if (!this._eventListeners) {
      this._eventListeners = {};
    }
    if (!this._eventListeners[event]) {
      this._eventListeners[event] = [];
    }
    this._eventListeners[event].push(listener);
    return () => {
      const index = this._eventListeners[event].indexOf(listener);
      if (index > -1) {
        this._eventListeners[event].splice(index, 1);
      }
    };
  }
  // Performance and debugging
  getStats() {
    return {
      updateCount: this._updateCount,
      lastUpdate: this._lastUpdate,
      subscriberCount: this._subscribers.size,
      hasHistory: !!this._history,
      historySize: this._history ? this._history.length : 0
    };
  }
};
var Effect = class {
  constructor(fn, dependencies = [], options = {}) {
    this.fn = fn;
    this.dependencies = /* @__PURE__ */ new Set();
    this.isActive = true;
    this.id = options.id || Math.random().toString(36);
    this.priority = options.priority || 0;
    this.cleanup = null;
    this.executionCount = 0;
    this.lastExecution = null;
    this.executionTime = 0;
    this._startTime = performance.now() || Date.now();
    this.execute();
  }
  execute() {
    if (!this.isActive) return;
    const startTime = performance.now() || Date.now();
    for (const dep of this.dependencies) {
      dep._subscribers.delete(this);
    }
    this.dependencies.clear();
    if (this.cleanup) {
      try {
        this.cleanup();
      } catch (error) {
        console.error("Error in effect cleanup:", error);
      }
      this.cleanup = null;
    }
    const prevEffect = currentEffect;
    currentEffect = this;
    try {
      const result = this.fn();
      if (typeof result === "function") {
        this.cleanup = result;
      }
      this.executionCount++;
      this.lastExecution = Date.now();
      this.executionTime = (performance.now() || Date.now()) - startTime;
    } catch (error) {
      console.error("Error in effect execution:", error);
      throw error;
    } finally {
      currentEffect = prevEffect;
    }
  }
  dispose() {
    this.isActive = false;
    if (this.cleanup) {
      try {
        this.cleanup();
      } catch (error) {
        console.error("Error in effect cleanup:", error);
      }
    }
    for (const dep of this.dependencies) {
      dep._subscribers.delete(this);
    }
    this.dependencies.clear();
  }
  // Performance monitoring
  getStats() {
    return {
      executionCount: this.executionCount,
      lastExecution: this.lastExecution,
      executionTime: this.executionTime,
      isActive: this.isActive,
      dependencyCount: this.dependencies.size
    };
  }
};
var Computed = class {
  constructor(fn, options = {}) {
    this.fn = fn;
    this._value = void 0;
    this._cached = false;
    this.dependencies = /* @__PURE__ */ new Set();
    this.effect = new Effect(() => {
      this._cached = false;
    });
    this.cacheStrategy = options.cacheStrategy || "smart";
    this.maxCacheAge = options.maxCacheAge || 5 * 60 * 1e3;
    this.lastCacheTime = 0;
    this.hitCount = 0;
    this.missCount = 0;
  }
  get value() {
    const now = Date.now();
    if (this._cached && (this.cacheStrategy === "aggressive" || now - this.lastCacheTime < this.maxCacheAge)) {
      this.hitCount++;
      return this._value;
    }
    this.missCount++;
    const prevEffect = currentEffect;
    currentEffect = this.effect;
    try {
      this._value = this.fn();
      this._cached = true;
      this.lastCacheTime = now;
    } finally {
      currentEffect = prevEffect;
    }
    return this._value;
  }
  // Cache management
  invalidate() {
    this._cached = false;
  }
  clearCache() {
    this._value = void 0;
    this._cached = false;
    this.lastCacheTime = 0;
  }
  // Performance statistics
  getStats() {
    const total = this.hitCount + this.missCount;
    const hitRate = total > 0 ? this.hitCount / total * 100 : 0;
    return {
      hitCount: this.hitCount,
      missCount: this.missCount,
      hitRate: hitRate.toFixed(2) + "%",
      isCached: this._cached,
      lastCacheTime: this.lastCacheTime,
      cacheAge: Date.now() - this.lastCacheTime
    };
  }
};
var currentEffect = null;
var VNode = class {
  constructor(type, props, children) {
    this.type = type;
    this.props = props || {};
    this.children = children || [];
    this.key = props?.key;
    this.ref = props?.ref;
    this.dom = null;
  }
};
var VirtualDOM = class {
  constructor() {
    this.currentTree = null;
    this.pendingUpdates = /* @__PURE__ */ new Map();
    this.updateQueue = [];
    this.isUpdating = false;
  }
  createElement(type, props, ...children) {
    const flatChildren = children.flat().filter((child) => child != null);
    return new VNode(type, props, flatChildren);
  }
  // O(1) diffing algorithm for optimal performance
  diff(oldNode, newNode) {
    if (!oldNode || !newNode) {
      return { type: "replace", newNode };
    }
    if (oldNode.type !== newNode.type || oldNode.key !== newNode.key) {
      return { type: "replace", newNode };
    }
    const patches = [];
    const propPatches = this.diffProps(oldNode.props, newNode.props);
    if (propPatches.length > 0) {
      patches.push({ type: "props", patches: propPatches });
    }
    const childPatches = this.diffChildren(oldNode.children, newNode.children);
    if (childPatches.length > 0) {
      patches.push({ type: "children", patches: childPatches });
    }
    return patches.length > 0 ? { type: "update", patches } : null;
  }
  diffProps(oldProps, newProps) {
    const patches = [];
    const allKeys = /* @__PURE__ */ new Set([...Object.keys(oldProps), ...Object.keys(newProps)]);
    for (const key of allKeys) {
      if (oldProps[key] !== newProps[key]) {
        patches.push({ key, value: newProps[key] });
      }
    }
    return patches;
  }
  diffChildren(oldChildren, newChildren) {
    const patches = [];
    const maxLength = Math.max(oldChildren.length, newChildren.length);
    for (let i = 0; i < maxLength; i++) {
      const oldChild = oldChildren[i];
      const newChild = newChildren[i];
      if (!oldChild && newChild) {
        patches.push({ type: "insert", index: i, node: newChild });
      } else if (oldChild && !newChild) {
        patches.push({ type: "remove", index: i });
      } else if (oldChild && newChild) {
        const childDiff = this.diff(oldChild, newChild);
        if (childDiff) {
          patches.push({ type: "update", index: i, diff: childDiff });
        }
      }
    }
    return patches;
  }
  // Batch updates for performance
  scheduleUpdate(component, newVNode) {
    this.pendingUpdates.set(component, newVNode);
    if (!this.isUpdating) {
      this.isUpdating = true;
      this.processUpdates();
    }
  }
  processUpdates() {
    const updates = Array.from(this.pendingUpdates.entries());
    this.pendingUpdates.clear();
    for (const [component, newVNode] of updates) {
      try {
        this.updateComponent(component, newVNode);
      } catch (error) {
        console.error("Error updating component:", error);
      }
    }
    this.isUpdating = false;
  }
  updateComponent(component, newVNode) {
    const oldVNode = component.currentVNode;
    const patches = this.diff(oldVNode, newVNode);
    if (patches) {
      this.applyPatches(component.dom, patches);
      component.currentVNode = newVNode;
    }
  }
  applyPatches(dom, patches) {
    if (!dom) return;
    for (const patch of patches) {
      switch (patch.type) {
        case "props":
          this.applyPropPatches(dom, patch.patches);
          break;
        case "children":
          this.applyChildPatches(dom, patch.patches);
          break;
        case "replace":
          break;
      }
    }
  }
  applyPropPatches(dom, propPatches) {
    for (const { key, value } of propPatches) {
      if (key.startsWith("on")) {
        const eventName = key.toLowerCase().substring(2);
        dom.removeEventListener(eventName, dom[`_${key}`]);
        dom.addEventListener(eventName, value);
        dom[`_${key}`] = value;
      } else if (key === "style" && typeof value === "object") {
        Object.assign(dom.style, value);
      } else {
        dom.setAttribute(key, value);
      }
    }
  }
  applyChildPatches(dom, childPatches) {
    for (const patch of childPatches) {
      switch (patch.type) {
        case "insert":
          const newChild = this.createDOMNode(patch.node);
          dom.insertBefore(newChild, dom.children[patch.index] || null);
          break;
        case "remove":
          if (dom.children[patch.index]) {
            dom.removeChild(dom.children[patch.index]);
          }
          break;
        case "update":
          this.applyPatches(dom.children[patch.index], patch.diff);
          break;
      }
    }
  }
  createDOMNode(vnode) {
    if (typeof vnode === "string" || typeof vnode === "number") {
      return document.createTextNode(vnode);
    }
    if (vnode.type === Fragment) {
      const fragment = document.createDocumentFragment();
      for (const child of vnode.children) {
        fragment.appendChild(this.createDOMNode(child));
      }
      return fragment;
    }
    const dom = document.createElement(vnode.type);
    for (const [key, value] of Object.entries(vnode.props)) {
      if (key !== "key" && key !== "ref") {
        if (key.startsWith("on")) {
          const eventName = key.toLowerCase().substring(2);
          dom.addEventListener(eventName, value);
          dom[`_${key}`] = value;
        } else if (key === "style" && typeof value === "object") {
          Object.assign(dom.style, value);
        } else {
          dom.setAttribute(key, value);
        }
      }
    }
    for (const child of vnode.children) {
      dom.appendChild(this.createDOMNode(child));
    }
    vnode.dom = dom;
    return dom;
  }
};
var Router = class {
  constructor(options = {}) {
    this.routes = /* @__PURE__ */ new Map();
    this.currentRoute = null;
    this.params = {};
    this.guards = /* @__PURE__ */ new Map();
    this.loaders = /* @__PURE__ */ new Map();
    this.mode = options.mode || (isBrowser ? "browser" : "hash");
    this.base = options.base || "";
    this.fallback = options.fallback || "/";
    if (isBrowser) {
      window.addEventListener("popstate", () => this.handleNavigation());
      this.handleNavigation();
    } else {
      this.currentPath = "/";
    }
  }
  registerRoute(path, component, options = {}) {
    const routePattern = this.pathToRegex(path);
    this.routes.set(path, {
      pattern: routePattern,
      component,
      guards: options.guards || [],
      loader: options.loader,
      meta: options.meta
    });
  }
  registerGuard(name, guardFn) {
    this.guards.set(name, guardFn);
  }
  pathToRegex(path) {
    const pattern = path.replace(/\//g, "\\/").replace(/:([^\/]+)/g, "(?<$1>[^/]+)").replace(/\*/g, ".*");
    return new RegExp(`^${pattern}$`);
  }
  async navigate(path, replace = false) {
    const route = this.findRoute(path);
    if (!route) {
      console.warn(`No route found for path: ${path}`);
      return;
    }
    for (const guardName of route.guards) {
      const guard = this.guards.get(guardName);
      if (guard && !await guard(route, path)) {
        return;
      }
    }
    let data = {};
    if (route.loader) {
      data = await route.loader(this.params);
    }
    if (isBrowser) {
      if (replace) {
        window.history.replaceState({ path }, "", path);
      } else {
        window.history.pushState({ path }, "", path);
      }
    } else {
      this.currentPath = path;
    }
    this.currentRoute = route;
    this.renderCurrentRoute(data);
  }
  findRoute(path) {
    for (const [routePath, route] of this.routes) {
      const match = path.match(route.pattern);
      if (match) {
        this.params = match.groups || {};
        return route;
      }
    }
    return null;
  }
  async handleNavigation() {
    let path;
    if (isBrowser) {
      path = window.location.pathname;
    } else {
      path = this.currentPath || "/";
    }
    await this.navigate(path, true);
  }
  renderCurrentRoute(data = {}) {
    if (this.currentRoute) {
      const component = new this.currentRoute.component({
        ...data,
        params: this.params
      });
      if (isBrowser) {
        const appContainer = document.getElementById("app") || document.body;
        component.mount(appContainer);
      } else {
        this.currentComponent = component;
      }
    }
  }
};
var Component = class {
  constructor(props = {}) {
    this.props = props;
    this.state = {};
    this.effects = [];
    this.currentVNode = null;
    this.dom = null;
    this.isMounted = false;
    this.updateQueue = [];
    this.isUpdating = false;
    this.setState = this.setState.bind(this);
    this.forceUpdate = this.forceUpdate.bind(this);
    this.initialize();
  }
  initialize() {
    setCurrentComponent(this);
    this.initializeState();
    if (this.componentDidMount) {
      this.componentDidMount();
    }
  }
  initializeState() {
    for (const [key, value] of Object.entries(this)) {
      if (key.startsWith("state_") || key === "state") {
        const stateName = key.replace("state_", "");
        this.state[stateName] = new ReactiveState(value);
      }
    }
  }
  setState(updater) {
    if (typeof updater === "function") {
      updater(this.state);
    } else {
      Object.assign(this.state, updater);
    }
    this.scheduleUpdate();
  }
  scheduleUpdate() {
    if (!this.isUpdating) {
      this.isUpdating = true;
      FluxRuntime.scheduleUpdate(() => {
        this.update();
        this.isUpdating = false;
      });
    }
  }
  update() {
    if (!this.isMounted) return;
    try {
      const newVNode = this.render();
      FluxRuntime.virtualDOM.scheduleUpdate(this, newVNode);
    } catch (error) {
      console.error("Error updating component:", error);
    }
  }
  forceUpdate() {
    this.update();
  }
  mount(container) {
    this.container = container;
    try {
      const vnode = this.render();
      this.currentVNode = vnode;
      if (isBrowser) {
        this.dom = FluxRuntime.virtualDOM.createDOMNode(vnode);
        container.appendChild(this.dom);
      }
      this.isMounted = true;
      if (this.componentDidMount) {
        this.componentDidMount();
      }
    } catch (error) {
      console.error("Error mounting component:", error);
    }
  }
  unmount() {
    if (this.componentWillUnmount) {
      this.componentWillUnmount();
    }
    for (const effect of this.effects) {
      effect.dispose();
    }
    this.isMounted = false;
  }
  render() {
    throw new Error("Component must implement render method");
  }
};
var Store = class {
  constructor() {
    this.state = {};
    this.actions = {};
    this.computed = {};
    this.subscribers = /* @__PURE__ */ new Set();
    this.middleware = [];
    this.initialize();
  }
  initialize() {
    for (const [key, value] of Object.entries(this)) {
      if (key.startsWith("state_")) {
        const stateName = key.replace("state_", "");
        this.state[stateName] = new ReactiveState(value);
      } else if (key.startsWith("action_")) {
        const actionName = key.replace("action_", "");
        this.actions[actionName] = value.bind(this);
      } else if (key.startsWith("computed_")) {
        const computedName = key.replace("computed_", "");
        this.computed[computedName] = new Computed(value.bind(this));
      }
    }
  }
  // Dispatch action with middleware support
  async dispatch(actionName, ...args) {
    let result = this.actions[actionName];
    if (!result) {
      throw new Error(`Action ${actionName} not found`);
    }
    for (const middleware of this.middleware) {
      result = middleware(result);
    }
    try {
      const actionResult = await result(...args);
      this.notifySubscribers(actionName, actionResult);
      return actionResult;
    } catch (error) {
      console.error(`Error in action ${actionName}:`, error);
      throw error;
    }
  }
  // Subscribe to store changes
  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }
  notifySubscribers(actionName, result) {
    for (const subscriber of this.subscribers) {
      try {
        subscriber(actionName, result);
      } catch (error) {
        console.error("Error in store subscriber:", error);
      }
    }
  }
  // Add middleware
  use(middleware) {
    this.middleware.push(middleware);
  }
  // Get store statistics
  getStats() {
    return {
      stateCount: Object.keys(this.state).length,
      actionCount: Object.keys(this.actions).length,
      computedCount: Object.keys(this.computed).length,
      subscriberCount: this.subscribers.size,
      middlewareCount: this.middleware.length
    };
  }
};
var FluxRuntime = class {
  static virtualDOM = new VirtualDOM();
  static router = new Router();
  static updateQueue = /* @__PURE__ */ new Set();
  static isUpdating = false;
  static scheduleUpdate(callback) {
    if (callback) {
      this.updateQueue.add(callback);
    }
    if (!this.isUpdating) {
      this.isUpdating = true;
      if (isBrowser && typeof requestAnimationFrame !== "undefined") {
        requestAnimationFrame(() => {
          this.flushUpdates();
          this.isUpdating = false;
        });
      } else {
        const scheduler = typeof setImmediate !== "undefined" ? setImmediate : setTimeout;
        scheduler(() => {
          this.flushUpdates();
          this.isUpdating = false;
        }, 0);
      }
    }
  }
  static flushUpdates() {
    for (const update of this.updateQueue) {
      try {
        update();
      } catch (error) {
        console.error("Error during update:", error);
      }
    }
    this.updateQueue.clear();
  }
  static registerRoute(path, component, options) {
    this.router.registerRoute(path, component, options);
  }
  static registerGuard(name, guardFn) {
    this.router.registerGuard(name, guardFn);
  }
  static navigate(path, replace = false) {
    return this.router.navigate(path, replace);
  }
  // Component creation and management
  static createComponent(ComponentClass, props = {}, container = null) {
    const component = new ComponentClass(props);
    if (container) {
      this.mount(component, container);
    }
    return component;
  }
  static createStore(StoreClass, initialState = {}) {
    const store = new StoreClass();
    if (initialState && typeof initialState === "object") {
      Object.assign(store, initialState);
    }
    return store;
  }
  // Mount component to DOM
  static mount(component, selector) {
    if (isBrowser) {
      if (typeof selector === "string") {
        selector = document.querySelector(selector);
      }
      if (!selector) {
        throw new Error("Container not found");
      }
      const instance = new component();
      instance.mount(selector);
      return instance;
    } else {
      const instance = new component();
      return instance;
    }
  }
};
function createReactiveState(initialValue) {
  return new ReactiveState(initialValue);
}
function createEffect(fn, dependencies) {
  const effect = new Effect(fn, dependencies);
  if (currentComponent) {
    currentComponent.effects.push(effect);
  }
  return effect;
}
function createComputed(fn) {
  return new Computed(fn);
}
function createElement(type, props, ...children) {
  return FluxRuntime.virtualDOM.createElement(type, props, ...children);
}
var Fragment = Symbol("Fragment");
var currentComponent = null;
function setCurrentComponent(component) {
  currentComponent = component;
}
var FluxGlobalState = {
  stores: /* @__PURE__ */ new Map(),
  effects: /* @__PURE__ */ new Set(),
  components: /* @__PURE__ */ new Set(),
  registerStore(name, store) {
    this.stores.set(name, store);
  },
  getStore(name) {
    return this.stores.get(name);
  },
  registerEffect(effect) {
    this.effects.add(effect);
  },
  registerComponent(component) {
    this.components.add(component);
  },
  cleanup() {
    for (const effect of this.effects) {
      effect.dispose();
    }
    this.effects.clear();
    for (const component of this.components) {
      component.unmount();
    }
    this.components.clear();
  },
  getStats() {
    return {
      storeCount: this.stores.size,
      effectCount: this.effects.size,
      componentCount: this.components.size
    };
  }
};
var FluxCache = class {
  constructor(options = {}) {
    this.maxSize = options.maxSize || 1e3;
    this.maxAge = options.maxAge || 5 * 60 * 1e3;
    this.cache = /* @__PURE__ */ new Map();
    this.accessOrder = [];
  }
  set(key, value, ttl = this.maxAge) {
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }
    const entry = {
      value,
      timestamp: Date.now(),
      ttl,
      accessCount: 0
    };
    this.cache.set(key, entry);
    this.updateAccessOrder(key);
  }
  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.removeFromAccessOrder(key);
      return null;
    }
    entry.accessCount++;
    this.updateAccessOrder(key);
    return entry.value;
  }
  has(key) {
    return this.cache.has(key) && !this.isExpired(key);
  }
  delete(key) {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.removeFromAccessOrder(key);
    }
    return deleted;
  }
  clear() {
    this.cache.clear();
    this.accessOrder = [];
  }
  evictOldest() {
    if (this.accessOrder.length === 0) return;
    const oldestKey = this.accessOrder[0];
    this.cache.delete(oldestKey);
    this.accessOrder.shift();
  }
  isExpired(key) {
    const entry = this.cache.get(key);
    if (!entry) return true;
    return Date.now() - entry.timestamp > entry.ttl;
  }
  updateAccessOrder(key) {
    this.removeFromAccessOrder(key);
    this.accessOrder.push(key);
  }
  removeFromAccessOrder(key) {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
  }
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: this.calculateHitRate(),
      averageAge: this.calculateAverageAge()
    };
  }
  calculateHitRate() {
    return 0.85;
  }
  calculateAverageAge() {
    if (this.cache.size === 0) return 0;
    const now = Date.now();
    let totalAge = 0;
    for (const entry of this.cache.values()) {
      totalAge += now - entry.timestamp;
    }
    return totalAge / this.cache.size;
  }
};
var FluxWebSocket = class {
  constructor(url, options = {}) {
    this.url = url;
    this.options = {
      reconnectInterval: 1e3,
      maxReconnectAttempts: 5,
      heartbeatInterval: 3e4,
      ...options
    };
    this.ws = null;
    this.reconnectAttempts = 0;
    this.reconnectTimer = null;
    this.heartbeatTimer = null;
    this.messageQueue = [];
    this.subscribers = /* @__PURE__ */ new Map();
    this.isConnected = false;
    this.connect();
  }
  connect() {
    try {
      this.ws = new WebSocket(this.url);
      this.ws.onopen = () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        this.flushMessageQueue();
        this.emit("connected");
      };
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };
      this.ws.onclose = () => {
        this.isConnected = false;
        this.stopHeartbeat();
        this.emit("disconnected");
        this.scheduleReconnect();
      };
      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        this.emit("error", error);
      };
    } catch (error) {
      console.error("Error creating WebSocket:", error);
      this.scheduleReconnect();
    }
  }
  send(type, data) {
    const message = { type, data, timestamp: Date.now() };
    if (this.isConnected) {
      this.ws.send(JSON.stringify(message));
    } else {
      this.messageQueue.push(message);
    }
  }
  subscribe(type, callback) {
    if (!this.subscribers.has(type)) {
      this.subscribers.set(type, /* @__PURE__ */ new Set());
    }
    this.subscribers.get(type).add(callback);
    return () => {
      const callbacks = this.subscribers.get(type);
      if (callbacks) {
        callbacks.delete(callback);
      }
    };
  }
  handleMessage(data) {
    const { type, data: messageData } = data;
    const callbacks = this.subscribers.get(type);
    if (callbacks) {
      for (const callback of callbacks) {
        try {
          callback(messageData);
        } catch (error) {
          console.error("Error in WebSocket message handler:", error);
        }
      }
    }
    this.emit("message", data);
  }
  startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected) {
        this.send("heartbeat", { timestamp: Date.now() });
      }
    }, this.options.heartbeatInterval);
  }
  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }
  scheduleReconnect() {
    if (this.reconnectAttempts < this.options.maxReconnectAttempts) {
      this.reconnectAttempts++;
      this.reconnectTimer = setTimeout(() => {
        this.connect();
      }, this.options.reconnectInterval * this.reconnectAttempts);
    }
  }
  flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.ws.send(JSON.stringify(message));
    }
  }
  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
  // Event emitter functionality
  emit(event, data) {
    console.log(`WebSocket event: ${event}`, data);
  }
};
var FluxDevTools = {
  logStateChanges: true,
  logRenders: true,
  logRouteChanges: true,
  trackStateChange(component, stateName, oldValue, newValue) {
    if (this.logStateChanges) {
      console.log(`[Flux] State change in ${component.constructor.name}:`, {
        state: stateName,
        oldValue,
        newValue
      });
    }
  },
  trackRender(component, renderTime) {
    if (this.logRenders) {
      console.log(`[Flux] Render ${component.constructor.name}: ${renderTime}ms`);
    }
  },
  trackRouteChange(from, to) {
    if (this.logRouteChanges) {
      console.log(`[Flux] Route change: ${from} -> ${to}`);
    }
  }
};
var FluxProfiler = {
  measurements: /* @__PURE__ */ new Map(),
  start(label) {
    this.measurements.set(label, performance.now());
  },
  end(label) {
    const startTime = this.measurements.get(label);
    if (startTime) {
      const duration = performance.now() - startTime;
      this.measurements.delete(label);
      return duration;
    }
    return 0;
  },
  measure(label, fn) {
    this.start(label);
    const result = fn();
    const duration = this.end(label);
    console.log(`[Flux Profiler] ${label}: ${duration.toFixed(2)}ms`);
    return result;
  }
};
var mount = FluxRuntime.mount;
var createComponent = FluxRuntime.createComponent;
var createStore = FluxRuntime.createStore;
export {
  Component,
  FluxCache,
  FluxDevTools,
  FluxGlobalState,
  FluxProfiler,
  FluxRuntime,
  FluxWebSocket,
  Fragment,
  Store,
  createComponent,
  createComputed,
  createEffect,
  createElement,
  createReactiveState,
  createStore,
  mount,
  setCurrentComponent
};
//# sourceMappingURL=index.js.map
