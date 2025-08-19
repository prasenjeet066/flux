// flux-core/src/runtime/index.js
// Core runtime system for Flux applications

// Environment detection
const isNode = typeof process !== 'undefined' && process.versions && process.versions.node;
const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
const isWorker = typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope;

// Global context
const globalContext = isNode ? global : (isBrowser ? window : self);

// Performance monitoring
class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.startTime = Date.now();
  }

  startTimer(name) {
    this.metrics.set(name, { start: performance.now() || Date.now() });
  }

  endTimer(name) {
    const metric = this.metrics.get(name);
    if (metric) {
      metric.duration = (performance.now() || Date.now()) - metric.start;
      metric.end = performance.now() || Date.now();
    }
  }

  getMetrics() {
    return Object.fromEntries(this.metrics);
  }

  reset() {
    this.metrics.clear();
    this.startTime = Date.now();
  }
}

// Advanced error handling
class FluxError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = 'FluxError';
    this.code = code;
    this.details = details;
    this.timestamp = new Date();
    this.stack = this.stack || new Error().stack;
  }
}

// Memory management and garbage collection
class MemoryManager {
  constructor() {
    this.allocations = new Map();
    this.maxMemory = 100 * 1024 * 1024; // 100MB default
    this.currentMemory = 0;
  }

  allocate(id, size, type) {
    this.allocations.set(id, { size, type, timestamp: Date.now() });
    this.currentMemory += size;
    
    if (this.currentMemory > this.maxMemory) {
      this.garbageCollect();
    }
  }

  deallocate(id) {
    const allocation = this.allocations.get(id);
    if (allocation) {
      this.currentMemory -= allocation.size;
      this.allocations.delete(id);
    }
  }

  garbageCollect() {
    const now = Date.now();
    const maxAge = 5 * 60 * 1000; // 5 minutes
    
    for (const [id, allocation] of this.allocations) {
      if (now - allocation.timestamp > maxAge) {
        this.deallocate(id);
      }
    }
  }

  getStats() {
    return {
      currentMemory: this.currentMemory,
      maxMemory: this.maxMemory,
      allocationCount: this.allocations.size,
      memoryUsage: (this.currentMemory / this.maxMemory) * 100
    };
  }
}

// Reactive system implementation with advanced optimizations
class ReactiveState {
  constructor(initialValue, options = {}) {
    this._value = initialValue;
    this._subscribers = new Set();
    this._computedCache = new Map();
    this._batchUpdates = new Set();
    this._isBatching = false;
    this._comparator = options.comparator || ((a, b) => a !== b);
    this._debounceMs = options.debounce || 0;
    this._debounceTimer = null;
    this._history = options.history ? [initialValue] : null;
    this._maxHistory = options.maxHistory || 10;
    
    // Performance tracking
    this._updateCount = 0;
    this._lastUpdate = Date.now();
  }

  get value() {
    // Track dependency with performance monitoring
    if (currentEffect) {
      this._subscribers.add(currentEffect);
      currentEffect.dependencies.add(this);
      
      // Track dependency access patterns
      if (!this._accessPatterns) {
        this._accessPatterns = new Map();
      }
      const effectId = currentEffect.id || 'unknown';
      this._accessPatterns.set(effectId, (this._accessPatterns.get(effectId) || 0) + 1);
    }
    
    return this._value;
  }

  set value(newValue) {
    if (this._comparator(newValue, this._value)) {
      const oldValue = this._value;
      this._value = newValue;
      
      // Add to history if enabled
      if (this._history) {
        this._history.push(newValue);
        if (this._history.length > this._maxHistory) {
          this._history.shift();
        }
      }
      
      // Batch updates for performance
      if (this._isBatching) {
        this._batchUpdates.add(this);
      } else {
        this.notify();
      }
      
      // Update performance metrics
      this._updateCount++;
      this._lastUpdate = Date.now();
      
      // Emit change event
      this.emit('change', { oldValue, newValue });
    }
  }

  // Advanced value manipulation
  update(updater) {
    if (typeof updater === 'function') {
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
      this._batchUpdates.forEach(state => state.notify());
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
      this._history.pop(); // Remove current
      this.value = this._history[this._history.length - 1];
      return true;
    }
    return false;
  }

  redo() {
    // Implementation would require a redo stack
    return false;
  }

  notify() {
    // Performance optimization: batch notifications
    if (this._subscribers.size === 0) return;
    
    const subscribers = Array.from(this._subscribers);
    const startTime = performance.now() || Date.now();
    
    for (const subscriber of subscribers) {
      try {
        subscriber.execute();
      } catch (error) {
        console.error('Error in reactive subscriber:', error);
        // Remove problematic subscriber
        this._subscribers.delete(subscriber);
      }
    }
    
    // Track notification performance
    const duration = (performance.now() || Date.now()) - startTime;
    if (duration > 16) { // Longer than one frame
      console.warn(`Slow reactive update: ${duration.toFixed(2)}ms`);
    }
    
    // Clear computed cache
    this._computedCache.clear();
    
    // Schedule component updates
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
      this._eventListeners[event].forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error('Error in event listener:', error);
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
}

// Enhanced Effect system with better cleanup and performance
class Effect {
  constructor(fn, dependencies = [], options = {}) {
    this.fn = fn;
    this.dependencies = new Set();
    this.isActive = true;
    this.id = options.id || Math.random().toString(36);
    this.priority = options.priority || 0;
    this.cleanup = null;
    this.executionCount = 0;
    this.lastExecution = null;
    this.executionTime = 0;
    
    // Performance monitoring
    this._startTime = performance.now() || Date.now();
    
    // Initial execution to capture dependencies
    this.execute();
  }

  execute() {
    if (!this.isActive) return;
    
    const startTime = performance.now() || Date.now();
    
    // Clear old dependencies
    for (const dep of this.dependencies) {
      dep._subscribers.delete(this);
    }
    this.dependencies.clear();
    
    // Execute cleanup if exists
    if (this.cleanup) {
      try {
        this.cleanup();
      } catch (error) {
        console.error('Error in effect cleanup:', error);
      }
      this.cleanup = null;
    }
    
    // Execute with dependency tracking
    const prevEffect = currentEffect;
    currentEffect = this;
    
    try {
      const result = this.fn();
      
      // Handle cleanup function return
      if (typeof result === 'function') {
        this.cleanup = result;
      }
      
      // Update metrics
      this.executionCount++;
      this.lastExecution = Date.now();
      this.executionTime = (performance.now() || Date.now()) - startTime;
      
    } catch (error) {
      console.error('Error in effect execution:', error);
      throw error;
    } finally {
      currentEffect = prevEffect;
    }
  }

  dispose() {
    this.isActive = false;
    
    // Execute cleanup
    if (this.cleanup) {
      try {
        this.cleanup();
      } catch (error) {
        console.error('Error in effect cleanup:', error);
      }
    }
    
    // Clean up dependencies
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
}

// Enhanced Computed with intelligent caching and performance
class Computed {
  constructor(fn, options = {}) {
    this.fn = fn;
    this._value = undefined;
    this._cached = false;
    this.dependencies = new Set();
    this.effect = new Effect(() => {
      this._cached = false;
    });
    this.cacheStrategy = options.cacheStrategy || 'smart'; // 'smart', 'aggressive', 'none'
    this.maxCacheAge = options.maxCacheAge || 5 * 60 * 1000; // 5 minutes
    this.lastCacheTime = 0;
    this.hitCount = 0;
    this.missCount = 0;
  }

  get value() {
    const now = Date.now();
    
    // Check if cache is still valid
    if (this._cached && 
        (this.cacheStrategy === 'aggressive' || 
         now - this.lastCacheTime < this.maxCacheAge)) {
      this.hitCount++;
      return this._value;
    }
    
    this.missCount++;
    
    // Recompute value
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
    this._value = undefined;
    this._cached = false;
    this.lastCacheTime = 0;
  }

  // Performance statistics
  getStats() {
    const total = this.hitCount + this.missCount;
    const hitRate = total > 0 ? (this.hitCount / total) * 100 : 0;
    
    return {
      hitCount: this.hitCount,
      missCount: this.missCount,
      hitRate: hitRate.toFixed(2) + '%',
      isCached: this._cached,
      lastCacheTime: this.lastCacheTime,
      cacheAge: Date.now() - this.lastCacheTime
    };
  }
}

// Global effect tracking
let currentEffect = null;







// Virtual DOM implementation
class VNode {
  constructor(type, props, children) {
    this.type = type;
    this.props = props || {};
    this.children = children || [];
    this.key = props?.key;
    this.ref = props?.ref;
    this.dom = null;
  }
}

class VirtualDOM {
  constructor() {
    this.currentTree = null;
    this.pendingUpdates = new Map();
    this.updateQueue = [];
    this.isUpdating = false;
  }

  createElement(type, props, ...children) {
    // Flatten children
    const flatChildren = children.flat().filter(child => child != null);
    
    return new VNode(type, props, flatChildren);
  }

  // O(1) diffing algorithm for optimal performance
  diff(oldNode, newNode) {
    if (!oldNode || !newNode) {
      return { type: 'replace', newNode };
    }

    if (oldNode.type !== newNode.type || oldNode.key !== newNode.key) {
      return { type: 'replace', newNode };
    }

    const patches = [];
    
    // Diff props
    const propPatches = this.diffProps(oldNode.props, newNode.props);
    if (propPatches.length > 0) {
      patches.push({ type: 'props', patches: propPatches });
    }

    // Diff children
    const childPatches = this.diffChildren(oldNode.children, newNode.children);
    if (childPatches.length > 0) {
      patches.push({ type: 'children', patches: childPatches });
    }

    return patches.length > 0 ? { type: 'update', patches } : null;
  }

  diffProps(oldProps, newProps) {
    const patches = [];
    const allKeys = new Set([...Object.keys(oldProps), ...Object.keys(newProps)]);
    
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
        patches.push({ type: 'insert', index: i, node: newChild });
      } else if (oldChild && !newChild) {
        patches.push({ type: 'remove', index: i });
      } else if (oldChild && newChild) {
        const childDiff = this.diff(oldChild, newChild);
        if (childDiff) {
          patches.push({ type: 'update', index: i, diff: childDiff });
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
        console.error('Error updating component:', error);
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
        case 'props':
          this.applyPropPatches(dom, patch.patches);
          break;
        case 'children':
          this.applyChildPatches(dom, patch.patches);
          break;
        case 'replace':
          // Handle replacement
          break;
      }
    }
  }

  applyPropPatches(dom, propPatches) {
    for (const { key, value } of propPatches) {
      if (key.startsWith('on')) {
        // Event handler
        const eventName = key.toLowerCase().substring(2);
        dom.removeEventListener(eventName, dom[`_${key}`]);
        dom.addEventListener(eventName, value);
        dom[`_${key}`] = value;
      } else if (key === 'style' && typeof value === 'object') {
        // Style object
        Object.assign(dom.style, value);
      } else {
        // Regular attribute
        dom.setAttribute(key, value);
      }
    }
  }

  applyChildPatches(dom, childPatches) {
    for (const patch of childPatches) {
      switch (patch.type) {
        case 'insert':
          const newChild = this.createDOMNode(patch.node);
          dom.insertBefore(newChild, dom.children[patch.index] || null);
          break;
        case 'remove':
          if (dom.children[patch.index]) {
            dom.removeChild(dom.children[patch.index]);
          }
          break;
        case 'update':
          this.applyPatches(dom.children[patch.index], patch.diff);
          break;
      }
    }
  }

  createDOMNode(vnode) {
    if (typeof vnode === 'string' || typeof vnode === 'number') {
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
    
    // Set props
    for (const [key, value] of Object.entries(vnode.props)) {
      if (key !== 'key' && key !== 'ref') {
        if (key.startsWith('on')) {
          const eventName = key.toLowerCase().substring(2);
          dom.addEventListener(eventName, value);
          dom[`_${key}`] = value;
        } else if (key === 'style' && typeof value === 'object') {
          Object.assign(dom.style, value);
        } else {
          dom.setAttribute(key, value);
        }
      }
    }
    
    // Create children
    for (const child of vnode.children) {
      dom.appendChild(this.createDOMNode(child));
    }
    
    vnode.dom = dom;
    return dom;
  }
}

// Router implementation with environment detection
class Router {
  constructor(options = {}) {
    this.routes = new Map();
    this.currentRoute = null;
    this.params = {};
    this.guards = new Map();
    this.loaders = new Map();
    this.mode = options.mode || (isBrowser ? 'browser' : 'hash');
    this.base = options.base || '';
    this.fallback = options.fallback || '/';
    
    // Only initialize browser-specific features in browser environment
    if (isBrowser) {
      // Listen to browser navigation
      window.addEventListener('popstate', () => this.handleNavigation());
      
      // Initial route
      this.handleNavigation();
    } else {
      // Node.js environment - use mock navigation
      this.currentPath = '/';
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
    // Convert path like '/users/:id' to regex
    const pattern = path
      .replace(/\//g, '\\/')
      .replace(/:([^\/]+)/g, '(?<$1>[^\/]+)')
      .replace(/\*/g, '.*');
    
    return new RegExp(`^${pattern}$`);
  }

  async navigate(path, replace = false) {
    const route = this.findRoute(path);
    
    if (!route) {
      console.warn(`No route found for path: ${path}`);
      return;
    }

    // Execute guards
    for (const guardName of route.guards) {
      const guard = this.guards.get(guardName);
      if (guard && !(await guard(route, path))) {
        return; // Guard blocked navigation
      }
    }

    // Execute loader
    let data = {};
    if (route.loader) {
      data = await route.loader(this.params);
    }

    // Update navigation state based on environment
    if (isBrowser) {
      // Update browser history
      if (replace) {
        window.history.replaceState({ path }, '', path);
      } else {
        window.history.pushState({ path }, '', path);
      }
    } else {
      // Node.js environment - update internal state
      this.currentPath = path;
    }

    // Render component
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
      path = this.currentPath || '/';
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
        const appContainer = document.getElementById('app') || document.body;
        component.mount(appContainer);
      } else {
        // Node.js environment - just store the component
        this.currentComponent = component;
      }
    }
  }
}

// Base Component class
export class Component {
  constructor(props = {}) {
    this.props = props;
    this.state = {};
    this.effects = [];
    this.currentVNode = null;
    this.dom = null;
    this.isMounted = false;
    this.updateQueue = [];
    this.isUpdating = false;
    
    // Bind methods
    this.setState = this.setState.bind(this);
    this.forceUpdate = this.forceUpdate.bind(this);
    
    // Initialize component
    this.initialize();
  }

  initialize() {
    // Set current component for effect tracking
    setCurrentComponent(this);
    
    // Initialize state from class properties
    this.initializeState();
    
    // Run lifecycle methods
    if (this.componentDidMount) {
      this.componentDidMount();
    }
  }

  initializeState() {
    // Convert class properties to reactive state
    for (const [key, value] of Object.entries(this)) {
      if (key.startsWith('state_') || key === 'state') {
        const stateName = key.replace('state_', '');
        this.state[stateName] = new ReactiveState(value);
      }
    }
  }

  setState(updater) {
    if (typeof updater === 'function') {
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
      console.error('Error updating component:', error);
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
      console.error('Error mounting component:', error);
    }
  }

  unmount() {
    if (this.componentWillUnmount) {
      this.componentWillUnmount();
    }
    
    // Clean up effects
    for (const effect of this.effects) {
      effect.dispose();
    }
    
    this.isMounted = false;
  }

  render() {
    throw new Error('Component must implement render method');
  }
}

// Store class for state management
export class Store {
  constructor() {
    this.state = {};
    this.actions = {};
    this.computed = {};
    this.subscribers = new Set();
    this.middleware = [];
    
    this.initialize();
  }

  initialize() {
    // Convert class properties to reactive state
    for (const [key, value] of Object.entries(this)) {
      if (key.startsWith('state_')) {
        const stateName = key.replace('state_', '');
        this.state[stateName] = new ReactiveState(value);
      } else if (key.startsWith('action_')) {
        const actionName = key.replace('action_', '');
        this.actions[actionName] = value.bind(this);
      } else if (key.startsWith('computed_')) {
        const computedName = key.replace('computed_', '');
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
    
    // Apply middleware
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
        console.error('Error in store subscriber:', error);
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
}

// Main runtime class
export class FluxRuntime {
  static virtualDOM = new VirtualDOM();
  static router = new Router();
  static updateQueue = new Set();
  static isUpdating = false;

  static scheduleUpdate(callback) {
    if (callback) {
      this.updateQueue.add(callback);
    }
    
    if (!this.isUpdating) {
      this.isUpdating = true;
      
      // Use appropriate scheduling based on environment
      if (isBrowser && typeof requestAnimationFrame !== 'undefined') {
        requestAnimationFrame(() => {
          this.flushUpdates();
          this.isUpdating = false;
        });
      } else {
        // Node.js or fallback - use setImmediate or setTimeout
        const scheduler = typeof setImmediate !== 'undefined' ? setImmediate : setTimeout;
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
        console.error('Error during update:', error);
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
    
    // Initialize with provided state
    if (initialState && typeof initialState === 'object') {
      Object.assign(store, initialState);
    }
    
    return store;
  }
  
  // Mount component to DOM
  static mount(component, selector) {
    if (isBrowser) {
      if (typeof selector === 'string') {
        selector = document.querySelector(selector);
      }
      
      if (!selector) {
        throw new Error('Container not found');
      }
      
      const instance = new component();
      instance.mount(selector);
      
      return instance;
    } else {
      // Node.js environment - create instance without mounting
      const instance = new component();
      return instance;
    }
  }
}

// Factory functions
export function createReactiveState(initialValue) {
  return new ReactiveState(initialValue);
}

export function createEffect(fn, dependencies) {
  const effect = new Effect(fn, dependencies);
  
  // Add to current component's effects for cleanup
  if (currentComponent) {
    currentComponent.effects.push(effect);
  }
  
  return effect;
}

export function createComputed(fn) {
  return new Computed(fn);
}

// JSX helper
export function createElement(type, props, ...children) {
  return FluxRuntime.virtualDOM.createElement(type, props, ...children);
}

export const Fragment = Symbol('Fragment');

// Component tracking for effects
let currentComponent = null;

export function setCurrentComponent(component) {
  currentComponent = component;
}

// Global state management
export const FluxGlobalState = {
  stores: new Map(),
  effects: new Set(),
  components: new Set(),
  
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
    // Clean up all effects
    for (const effect of this.effects) {
      effect.dispose();
    }
    this.effects.clear();
    
    // Clean up all components
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

// Advanced caching system
export class FluxCache {
  constructor(options = {}) {
    this.maxSize = options.maxSize || 1000;
    this.maxAge = options.maxAge || 5 * 60 * 1000; // 5 minutes
    this.cache = new Map();
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

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.removeFromAccessOrder(key);
      return null;
    }

    // Update access count and order
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
    // Implementation would track hits vs misses
    return 0.85; // Placeholder
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
}

// WebSocket manager for real-time features
export class FluxWebSocket {
  constructor(url, options = {}) {
    this.url = url;
    this.options = {
      reconnectInterval: 1000,
      maxReconnectAttempts: 5,
      heartbeatInterval: 30000,
      ...options
    };
    
    this.ws = null;
    this.reconnectAttempts = 0;
    this.reconnectTimer = null;
    this.heartbeatTimer = null;
    this.messageQueue = [];
    this.subscribers = new Map();
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
        this.emit('connected');
      };
      
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      this.ws.onclose = () => {
        this.isConnected = false;
        this.stopHeartbeat();
        this.emit('disconnected');
        this.scheduleReconnect();
      };
      
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.emit('error', error);
      };
      
    } catch (error) {
      console.error('Error creating WebSocket:', error);
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
      this.subscribers.set(type, new Set());
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
          console.error('Error in WebSocket message handler:', error);
        }
      }
    }
    
    this.emit('message', data);
  }

  startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected) {
        this.send('heartbeat', { timestamp: Date.now() });
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
    // Implementation would use event emitter
    console.log(`WebSocket event: ${event}`, data);
  }
}

// Development helpers
export const FluxDevTools = {
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

// Performance monitoring
export const FluxProfiler = {
  measurements: new Map(),
  
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

// Export the mount function
export const mount = FluxRuntime.mount;

// Export runtime methods
export const createComponent = FluxRuntime.createComponent;
export const createStore = FluxRuntime.createStore;