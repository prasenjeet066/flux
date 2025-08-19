# Flux Language Specification

## Version 2.0.8

This document defines the syntax, semantics, and features of the Flux programming language - a next-generation web programming language designed for ultra-fast rendering and developer productivity.

## Table of Contents

1. [Overview](#overview)
2. [Lexical Structure](#lexical-structure)
3. [Syntax](#syntax)
4. [Components](#components)
5. [State Management](#state-management)
6. [Reactivity](#reactivity)
7. [Routing](#routing)
8. [Styling](#styling)
9. [Type System](#type-system)
10. [Standard Library](#standard-library)
11. [Compilation](#compilation)
12. [Runtime](#runtime)

## Overview

Flux is a declarative, component-based programming language that compiles to optimized JavaScript and WebAssembly. It provides a modern syntax for building web applications with built-in reactivity, state management, and performance optimizations.

### Design Principles

- **Zero-overhead abstractions**: What you don't use, you don't pay for
- **Compile-time optimizations**: Maximum performance through intelligent compilation
- **Declarative UI with imperative escape hatches**: Best of both worlds
- **Built-in state management**: No external libraries needed
- **Type safety by default**: Prevents runtime errors

## Lexical Structure

### Identifiers

```
identifier ::= [a-zA-Z_][a-zA-Z0-9_]*
```

### Keywords

```
component, store, state, method, render, lifecycle, effect, computed, action
prop, param, transition, styles, guard, route, meta, loader, errorBoundary
preload, cache, stream, layout, use, mount, export, import, type, async, await
```

### Literals

```
string ::= "..." | '...' | `...`
number ::= [0-9]+(\.[0-9]+)?
boolean ::= true | false
null ::= null
undefined ::= undefined
```

### Operators

```
arithmetic ::= + | - | * | / | % | **
comparison ::= == | != | === | !== | < | <= | > | >=
logical ::= && | || | !
assignment ::= = | += | -= | *= | /= | %= | **=
```

## Syntax

### Program Structure

A Flux program consists of components, stores, and other declarations:

```
program ::= declaration*
declaration ::= component | store | import | export | type
```

### Import/Export

```
import ::= import { name } from "module"
export ::= export default expression | export { name }
```

## Components

Components are the building blocks of Flux applications. They define reusable UI elements with their own state and behavior.

### Component Declaration

```
component ::= component Name { componentBody }
componentBody ::= (state | method | lifecycle | computed | effect)* render
```

### Component Parts

#### State

```
state ::= state name = expression
```

State variables are reactive and trigger re-renders when changed.

#### Methods

```
method ::= (async)? method name(params) { statements }
```

Methods define component behavior and can be async.

#### Lifecycle

```
lifecycle ::= lifecycle hook() { statements }
hook ::= mounted | unmounted | updated | beforeUpdate | afterUpdate
```

Lifecycle methods are called at specific points in a component's lifecycle.

#### Computed Properties

```
computed ::= computed name() { return expression }
```

Computed properties are cached and only recalculated when dependencies change.

#### Effects

```
effect ::= effect on dependency { statements }
```

Effects run when dependencies change, similar to React's useEffect.

#### Render

```
render ::= render { jsx }
```

The render method returns JSX that defines the component's UI.

### Component Example

```flux
component Counter {
  state count = 0
  
  method increment() {
    count += 1
  }
  
  method decrement() {
    count -= 1
  }
  
  computed isPositive() {
    return count > 0
  }
  
  effect on count {
    if (count < 0) {
      count = 0
    }
  }
  
  render {
    <div class="counter">
      <h2>Count: {count}</h2>
      <button @click={increment}>+</button>
      <button @click={decrement}>-</button>
      {isPositive && <p>Positive number!</p>}
    </div>
  }
}
```

## State Management

Flux provides built-in state management through stores and reactive state.

### Stores

```
store ::= store Name { storeBody }
storeBody ::= (state | action | computed)*
```

#### Store Actions

```
action ::= action name(params) { statements }
```

Actions are methods that can modify store state.

#### Store Example

```flux
store UserStore {
  state users = []
  state currentUser = null
  
  action addUser(user) {
    users.push(user)
  }
  
  action setCurrentUser(user) {
    currentUser = user
  }
  
  computed activeUsers() {
    return users.filter(u => u.active)
  }
}
```

### Using Stores

```
use ::= use StoreName
```

Components can use stores to access shared state.

## Reactivity

Flux's reactivity system automatically tracks dependencies and updates the UI when data changes.

### Reactive State

State variables are automatically reactive:

```flux
component ReactiveExample {
  state count = 0
  state name = "Flux"
  
  // This will automatically re-run when count or name changes
  computed display() {
    return `${name}: ${count}`
  }
  
  render {
    <div>
      <p>{display}</p>
      <button @click={() => count++}>Increment</button>
      <input @input={(e) => name = e.target.value} />
    </div>
  }
}
```

### Effects

Effects automatically track dependencies and run when they change:

```flux
effect on count, name {
  console.log(`Count: ${count}, Name: ${name}`)
}
```

## Routing

Flux provides file-based routing with declarative route definitions.

### Route Decorators

```
route ::= @route("path")
meta ::= @meta(object)
guard ::= @guard(function)
loader ::= @loader(function)
```

### Route Example

```flux
@route("/users/:id")
@meta({
  title: "User Profile",
  requiresAuth: true
})
@guard(requireAuth)
@loader(async (params) => {
  const user = await api.getUser(params.id)
  return { user }
})
component UserProfile {
  prop user: User
  param id: string
  
  render {
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  }
}
```

## Styling

Flux provides a built-in styling system with CSS-in-JS capabilities.

### Style Blocks

```
styles ::= styles ComponentName { cssRules }
```

### CSS Rules

```
cssRules ::= selector { properties }
selector ::= .className | tagName | pseudoClass
properties ::= property: value;
```

### Styling Example

```flux
styles Counter {
  .counter {
    display: flex
    flex-direction: column
    align-items: center
    padding: 20px
    
    h2 {
      color: var(--primary-color)
      margin-bottom: 16px
    }
    
    button {
      padding: 12px 24px
      border: none
      border-radius: 6px
      background: linear-gradient(45deg, #ff6b6b, #ee5a24)
      color: white
      cursor: pointer
      
      &:hover {
        transform: translateY(-2px)
        box-shadow: 0 4px 12px rgba(0,0,0,0.2)
      }
    }
  }
}
```

## Type System

Flux includes an optional type system for better development experience and error prevention.

### Type Annotations

```
typeAnnotation ::= : type
type ::= primitive | array | object | function | union
primitive ::= string | number | boolean | null | undefined
array ::= type[]
object ::= { property: type }
function ::= (params) => returnType
union ::= type | type
```

### Type Example

```flux
component TypedComponent {
  prop name: string
  prop age: number
  prop isActive: boolean
  prop user: User | null
  
  method processUser(user: User): boolean {
    return user.age >= 18
  }
  
  render {
    <div>
      <h1>{name}</h1>
      <p>Age: {age}</p>
      <p>Status: {isActive ? 'Active' : 'Inactive'}</p>
    </div>
  }
}

type User = {
  id: number
  name: string
  email: string
  age: number
}
```

## Standard Library

Flux provides a rich standard library for common web development tasks.

### Built-in Functions

```
mount(component, selector)
use(store)
createStore(initialState)
createRouter(routes)
createEffect(dependencies, callback)
```

### Utility Functions

```
debounce(func, delay)
throttle(func, delay)
deepClone(obj)
isEqual(a, b)
formatDate(date, format)
```

## Compilation

Flux code is compiled to optimized JavaScript and WebAssembly.

### Compilation Process

1. **Lexical Analysis**: Source code is tokenized
2. **Parsing**: Tokens are parsed into an Abstract Syntax Tree (AST)
3. **Semantic Analysis**: Type checking and validation
4. **Optimization**: Dead code elimination, tree shaking, etc.
5. **Code Generation**: Output JavaScript/WebAssembly

### Compiler Options

```javascript
{
  target: 'js', // 'js' or 'wasm'
  minify: false,
  sourceMaps: true,
  optimizations: true,
  treeShaking: true,
  codeSplitting: false
}
```

## Runtime

The Flux runtime provides the execution environment for compiled applications.

### Runtime Features

- **Virtual DOM**: Efficient DOM diffing and updates
- **Reactivity System**: Automatic dependency tracking
- **Component Lifecycle**: Mount, update, and unmount management
- **State Management**: Store and state synchronization
- **Routing**: Client-side routing with history management

### Runtime API

```javascript
class FluxRuntime {
  mount(component, selector)
  unmount(selector)
  update(component, newProps)
  createStore(initialState)
  createRouter(routes)
}
```

## Performance Features

### Automatic Optimizations

- **Dead Code Elimination**: Unused code is removed
- **Tree Shaking**: Only imported code is included
- **Code Splitting**: Automatic bundle splitting by routes
- **Lazy Loading**: Components loaded on demand
- **Memoization**: Computed properties are cached

### Memory Management

- **Automatic Cleanup**: No memory leaks from subscriptions
- **Object Pooling**: Reuse objects to reduce GC pressure
- **Garbage Collection**: Smart memory management

## Browser Support

Flux supports all modern browsers:

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Node.js Support

Flux can run on Node.js for server-side rendering and tooling:

- Node.js 18.0.0+

## Migration Guide

### From React

```javascript
// React
function Counter() {
  const [count, setCount] = useState(0)
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>+</button>
    </div>
  )
}

// Flux
component Counter {
  state count = 0
  
  render {
    <div>
      <p>Count: {count}</p>
      <button @click={() => count++}>+</button>
    </div>
  }
}
```

### From Vue

```javascript
// Vue
export default {
  data() {
    return { count: 0 }
  },
  methods: {
    increment() {
      this.count++
    }
  },
  template: `
    <div>
      <p>Count: {{ count }}</p>
      <button @click="increment">+</button>
    </div>
  `
}

// Flux
component Counter {
  state count = 0
  
  method increment() {
    count++
  }
  
  render {
    <div>
      <p>Count: {count}</p>
      <button @click={increment}>+</button>
    </div>
  }
}
```

## Best Practices

### Component Design

- Keep components small and focused
- Use composition over inheritance
- Extract reusable logic into stores
- Use computed properties for derived state

### Performance

- Use `computed` for expensive calculations
- Avoid creating objects in render methods
- Use `key` props for list items
- Leverage automatic memoization

### State Management

- Keep state as local as possible
- Use stores for shared state
- Prefer immutable updates
- Use actions for state mutations

### Styling

- Use component-scoped styles
- Leverage CSS custom properties
- Use logical property names
- Optimize for mobile-first design

## Conclusion

Flux provides a modern, performant, and developer-friendly approach to web development. Its innovative syntax, built-in optimizations, and comprehensive tooling make it an excellent choice for building next-generation web applications.

For more information, visit [flux-lang.dev](https://flux-lang.dev) or check out the [GitHub repository](https://github.com/flux-lang/flux).