// flux-core/src/runtime/index.js
// Core runtime system for Flux applications

// Reactive system implementation
class ReactiveState {
  constructor(initialValue) {
    this._value = initialValue;
    this._subscribers = new Set();
    this._computedCache = new Map();
  }

  get value() {
    // Track dependency
    if (currentEffect) {
      this._subscribers.add(currentEffect);
      currentEffect.dependencies.add(this);
    }
    
    return this._value;
  }

  set value(newValue) {
    if (newValue !== this._value) {
      this._value = newValue;
      this.notify();
    }
  }

  notify() {
    // Notify all subscribers
    for (const subscriber of this._subscribers) {
      subscriber.execute();
    }
    
    // Clear computed cache
    this._computedCache.clear();
    
    // Schedule component updates
    FluxRuntime.scheduleUpdate();
  }

  subscribe(callback) {
    this._subscribers.add(callback);
    return () => this._subscribers.delete(callback);
  }
}

class Effect {
  constructor(fn, dependencies = []) {
    this.fn = fn;
    this.dependencies = new Set();
    this.isActive = true;
    
    // Initial execution to capture dependencies
    this.execute();
  }

  execute() {
    if (!this.isActive) return;
    
    // Clear old dependencies
    for (const dep of this.dependencies) {
      dep._subscribers.delete(this);
    }
    this.dependencies.clear();
    
    // Execute with dependency tracking
    const prevEffect = currentEffect;
    currentEffect = this;
    
    try {
      this.fn();
    } finally {
      currentEffect = prevEffect;
    }
  }

  dispose() {
    this.isActive = false;
    
    // Clean up dependencies
    for (const dep of this.dependencies) {
      dep._subscribers.delete(this);
    }
    
    this.dependencies.clear();
  }
}

class Computed {
  constructor(fn) {
    this.fn = fn;
    this._value = undefined;
    this._cached = false;
    this.dependencies = new Set();
    this.effect = new Effect(() => {
      this._cached = false;
    });
  }

  get value() {
    if (!this._cached) {
      // Clear old dependencies
      for (const dep of this.dependencies) {
        dep._subscribers.delete(this.effect);
      }
      this.dependencies.clear();
      
      // Recompute value
      const prevEffect = currentEffect;
      currentEffect = this.effect;
      
      try {
        this._value = this.fn();
        this._cached = true;
      } finally {
        currentEffect = prevEffect;
      }
    }
    
    // Track as dependency
    if (currentEffect) {
      currentEffect.dependencies.add(this);
    }
    
    return this._value;
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
  }
}

class VirtualDOM {
  constructor() {
    this.rootNode = null;
    this.componentInstances = new WeakMap();
  }

  createElement(type, props, ...children) {
    // Flatten children array
    const flatChildren = children.flat().filter(child => 
      child != null && child !== false && child !== true
    );
    
    return new VNode(type, props, flatChildren);
  }

  render(vnode, container) {
    const newDomNode = this.createDOMNode(vnode);
    
    if (container.firstChild) {
      this.updateDOMNode(container.firstChild, newDomNode);
    } else {
      container.appendChild(newDomNode);
    }
    
    this.rootNode = newDomNode;
  }

  createDOMNode(vnode) {
    if (typeof vnode === 'string' || typeof vnode === 'number') {
      return document.createTextNode(String(vnode));
    }

    if (typeof vnode.type === 'string') {
      // HTML element
      const element = document.createElement(vnode.type);
      
      // Set properties
      for (const [key, value] of Object.entries(vnode.props)) {
        if (key === 'key' || key === 'ref') continue;
        
        if (key.startsWith('on') && typeof value === 'function') {
          // Event listener
          const eventName = key.slice(2).toLowerCase();
          element.addEventListener(eventName, value);
        } else if (key === 'className') {
          element.className = value;
        } else if (key === 'style' && typeof value === 'object') {
          Object.assign(element.style, value);
        } else {
          element.setAttribute(key, value);
        }
      }
      
      // Append children
      for (const child of vnode.children) {
        const childNode = this.createDOMNode(child);
        element.appendChild(childNode);
      }
      
      return element;
    } else if (typeof vnode.type === 'function') {
      // Component
      let instance = this.componentInstances.get(vnode.type);
      
      if (!instance) {
        instance = new vnode.type(vnode.props);
        this.componentInstances.set(vnode.type, instance);
      } else {
        // Update props
        Object.assign(instance.props, vnode.props);
      }
      
      const renderedVNode = instance.render();
      return this.createDOMNode(renderedVNode);
    }
    
    throw new Error(`Unknown vnode type: ${vnode.type}`);
  }

  updateDOMNode(oldNode, newNode) {
    // Simple update strategy - replace node
    if (oldNode.parentNode) {
      oldNode.parentNode.replaceChild(newNode, oldNode);
    }
  }
}

// Component base class
export class Component {
  constructor(props = {}) {
    this.props = props;
    this.effects = [];
    this.isMounted = false;
    this.updateScheduled = false;
  }

  setState(newState) {
    Object.assign(this.state, newState);
    this.scheduleUpdate();
  }

  scheduleUpdate() {
    if (!this.updateScheduled) {
      this.updateScheduled = true;
      FluxRuntime.scheduleUpdate(() => {
        if (this.isMounted) {
          this.forceUpdate();
        }
        this.updateScheduled = false;
      });
    }
  }

  forceUpdate() {
    if (this.isMounted) {
      const newVNode = this.render();
      FluxRuntime.virtualDOM.render(newVNode, this.container);
    }
  }

  mount(container) {
    this.container = container;
    this.isMounted = true;
    
    // Call lifecycle method
    if (this.mounted) {
      this.mounted();
    }
    
    // Initial render
    this.forceUpdate();
  }

  unmount() {
    this.isMounted = false;
    
    // Cleanup effects
    for (const effect of this.effects) {
      effect.dispose();
    }
    this.effects = [];
    
    // Call lifecycle method
    if (this.unmounted) {
      this.unmounted();
    }
  }

  render() {
    return createElement('div', null, 'Override render method');
  }
}

// Store base class
export class Store {
  constructor() {
    this.subscribers = new Set();
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notify() {
    for (const callback of this.subscribers) {
      callback();
    }
  }
}

// Router implementation
class Router {
  constructor() {
    this.routes = new Map();
    this.currentRoute = null;
    this.params = {};
    this.guards = new Map();
    this.loaders = new Map();
    
    // Listen to browser navigation
    window.addEventListener('popstate', () => this.handleNavigation());
    
    // Initial route
    this.handleNavigation();
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

    // Update browser history
    if (replace) {
      window.history.replaceState({ path }, '', path);
    } else {
      window.history.pushState({ path }, '', path);
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
    const path = window.location.pathname;
    await this.navigate(path, true);
  }

  renderCurrentRoute(data = {}) {
    if (this.currentRoute) {
      const component = new this.currentRoute.component({
        ...data,
        params: this.params
      });
      
      const appContainer = document.getElementById('app') || document.body;
      component.mount(appContainer);
    }
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
      
      // Use requestAnimationFrame for optimal performance
      requestAnimationFrame(() => {
        this.flushUpdates();
        this.isUpdating = false;
      });
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

  static mount(component, container) {
    if (typeof container === 'string') {
      container = document.querySelector(container);
    }
    
    if (!container) {
      throw new Error('Container not found');
    }
    
    const instance = new component();
    instance.mount(container);
    
    return instance;
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

// Export everything
export {
  ReactiveState,
  Effect,
  Computed,
  VNode,
  VirtualDOM,
  Router
};