#!/usr/bin/env node

import { FluxCompiler } from '../src/compiler/index.js';
import { FluxRuntime } from '../src/runtime/index.js';
import chalk from 'chalk';

class TestRunner {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
    this.compiler = new FluxCompiler();
    this.runtime = new FluxRuntime();
  }
  
  test(name, testFn) {
    this.tests.push({ name, testFn });
  }
  
  async run() {
    console.log(chalk.blue('🧪 Running Flux Language Tests...\n'));
    
    for (const test of this.tests) {
      try {
        await test.testFn();
        console.log(chalk.green(`✅ ${test.name}`));
        this.passed++;
      } catch (error) {
        console.log(chalk.red(`❌ ${test.name}`));
        console.error(chalk.red(`   Error: ${error.message}`));
        if (error.stack) {
          console.error(chalk.gray(`   ${error.stack.split('\n')[1]}`));
        }
        this.failed++;
      }
    }
    
    this.printSummary();
  }
  
  printSummary() {
    console.log('\n' + '='.repeat(50));
    console.log(chalk.blue('📊 Test Summary'));
    console.log('='.repeat(50));
    console.log(chalk.green(`✅ Passed: ${this.passed}`));
    console.log(chalk.red(`❌ Failed: ${this.failed}`));
    console.log(chalk.cyan(`📈 Total: ${this.tests.length}`));
    
    if (this.failed === 0) {
      console.log(chalk.green('\n🎉 All tests passed!'));
    } else {
      console.log(chalk.red('\n💥 Some tests failed!'));
      process.exit(1);
    }
  }
  
  assert(condition, message) {
    if (!condition) {
      throw new Error(message || 'Assertion failed');
    }
  }
  
  assertEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(
        message || 
        `Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(actual)}`
      );
    }
  }
  
  assertThrows(fn, expectedError) {
    try {
      fn();
      throw new Error('Expected function to throw an error');
    } catch (error) {
      if (expectedError && !error.message.includes(expectedError)) {
        throw new Error(
          `Expected error to contain "${expectedError}", but got "${error.message}"`
        );
      }
    }
  }
}

const runner = new TestRunner();

// Test 1: Basic component compilation
runner.test('Basic Component Compilation', async () => {
  const source = `
component TestComponent {
  state count = 0
  
  method increment() {
    count += 1
  }
  
  render {
    <div>
      <span>{count}</span>
      <button @click={increment}>+</button>
    </div>
  }
}
`;
  
  const result = runner.compiler.compile(source);
  runner.assert(result !== null, 'Compilation should succeed');
  runner.assert(result.output.includes('class TestComponent'), 'Should generate class');
  runner.assert(result.output.includes('this.count.value') && result.output.includes('+=') && result.output.includes('1'), 'Should preserve method logic');
});

// Test 2: Store compilation
runner.test('Store Compilation', async () => {
  const source = `
store TestStore {
  state value = 0
  
  action increment() {
    value += 1
  }
  
  computed doubled() {
    return value * 2
  }
}
`;
  
  const result = runner.compiler.compile(source);
  runner.assert(result !== null, 'Store compilation should succeed');
  runner.assert(result.output.includes('class TestStore'), 'Should generate store class');
  runner.assert(result.output.includes('increment'), 'Should preserve action');
});

// Test 3: JSX-like syntax
runner.test('JSX-like Syntax', async () => {
  const source = `
component JSXTest {
  render {
    <div class="container">
      <h1>Hello</h1>
      <p>World</p>
    </div>
  }
}
`;
  
  const result = runner.compiler.compile(source);
  runner.assert(result !== null, 'JSX compilation should succeed');
  runner.assert(result.output.includes('createElement'), 'Should use createElement');
});

// Test 4: State management
runner.test('State Management', async () => {
  const source = `
component StateTest {
  state name = "Flux"
  state count = 0
  
  method updateName(newName) {
    name = newName
  }
  
  method increment() {
    count += 1
  }
}
`;
  
  const result = runner.compiler.compile(source);
  runner.assert(result !== null, 'State compilation should succeed');
  runner.assert(result.output.includes('createReactiveState'), 'Should use reactive state');
});

// Test 5: Methods and event handling
runner.test('Methods and Event Handling', async () => {
  const source = `
component EventTest {
  state clicked = false
  
  method handleClick() {
    clicked = true
  }
  
  render {
    <button @click={handleClick}>
      Click me
    </button>
  }
}
`;
  
  const result = runner.compiler.compile(source);
  runner.assert(result !== null, 'Event handling compilation should succeed');
  runner.assert(result.output.includes('handleClick'), 'Should preserve method names');
});

// Test 6: Computed properties
runner.test('Computed Properties', async () => {
  const source = `
component ComputedTest {
  state a = 5
  state b = 3
  
  computed sum() {
    return a + b
  }
  
  computed product() {
    return a * b
  }
}
`;
  
  const result = runner.compiler.compile(source);
  runner.assert(result !== null, 'Computed properties compilation should succeed');
  runner.assert(result.output.includes('createComputed'), 'Should use createComputed');
});

// Test 7: Effects
runner.test('Effects', async () => {
  const source = `
component EffectTest {
  state count = 0
  
  effect on count {
    console.log('Count changed to:', count)
  }
  
  method increment() {
    count += 1
  }
}
`;
  
  const result = runner.compiler.compile(source);
  runner.assert(result !== null, 'Effects compilation should succeed');
  runner.assert(result.output.includes('createEffect'), 'Should use createEffect');
});

// Test 8: Props
runner.test('Props', async () => {
  const source = `
component PropsTest {
  prop title: string
  prop count: number = 0
  
  render {
    <div>
      <h1>{title}</h1>
      <p>Count: {count}</p>
    </div>
  }
}
`;
  
  const result = runner.compiler.compile(source);
  runner.assert(result !== null, 'Props compilation should succeed');
  runner.assert(result.output.includes('constructor'), 'Should have constructor');
});

// Test 9: Lifecycle methods
runner.test('Lifecycle Methods', async () => {
  const source = `
component LifecycleTest {
  lifecycle mounted() {
    console.log('Component mounted')
  }
  
  lifecycle unmounted() {
    console.log('Component unmounted')
  }
}
`;
  
  const result = runner.compiler.compile(source);
  runner.assert(result !== null, 'Lifecycle compilation should succeed');
  runner.assert(result.output.includes('mounted'), 'Should preserve lifecycle methods');
});

// Test 10: Error handling
runner.test('Error Handling', async () => {
  const invalidSource = `
component InvalidComponent {
  state count = 
  
  render {
    <div>{count}</div>
  }
}
`;
  
  const result = runner.compiler.compile(invalidSource);
  runner.assert(result === null, 'Invalid syntax should fail compilation');
  runner.assert(runner.compiler.errors.length > 0, 'Should have compilation errors');
});

// Test 11: Complex expressions
runner.test('Complex Expressions', async () => {
  const source = `
component ComplexTest {
  state items = [1, 2, 3, 4, 5]
  
  computed filteredItems() {
    return items.filter(item => item > 2).map(item => item * 2)
  }
  
  render {
    <div>
      {filteredItems.map(item => (
        <span key={item}>{item}</span>
      ))}
    </div>
  }
}
`;
  
  const result = runner.compiler.compile(source);
  runner.assert(result !== null, 'Complex expressions compilation should succeed');
});

// Test 12: Conditional rendering
runner.test('Conditional Rendering', async () => {
  const source = `
component ConditionalTest {
  state show = true
  
  render {
    <div>
      {show ? <span>Visible</span> : <span>Hidden</span>}
      {show && <p>Also visible</p>}
    </div>
  }
}
`;
  
  const result = runner.compiler.compile(source);
  runner.assert(result !== null, 'Conditional rendering compilation should succeed');
});

// Test 13: List rendering
runner.test('List Rendering', async () => {
  const source = `
component ListTest {
  state items = ['a', 'b', 'c']
  
  render {
    <ul>
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  }
}
`;
  
  const result = runner.compiler.compile(source);
  runner.assert(result !== null, 'List rendering compilation should succeed');
});

// Test 14: Nested components
runner.test('Nested Components', async () => {
  const source = `
component Parent {
  render {
    <div>
      <Child name="Flux" />
      <Child name="Language" />
    </div>
  }
}

component Child {
  prop name: string
  
  render {
    <span>{name}</span>
  }
}
`;
  
  const result = runner.compiler.compile(source);
  runner.assert(result !== null, 'Nested components compilation should succeed');
  runner.assert(result.output.includes('class Parent'), 'Should generate parent class');
  runner.assert(result.output.includes('class Child'), 'Should generate child class');
});

// Test 15: Store actions
runner.test('Store Actions', async () => {
  const source = `
store CounterStore {
  state count = 0
  
  action increment() {
    count += 1
  }
  
  action decrement() {
    count -= 1
  }
  
  action reset() {
    count = 0
  }
}
`;
  
  const result = runner.compiler.compile(source);
  runner.assert(result !== null, 'Store actions compilation should succeed');
  runner.assert(result.output.includes('increment'), 'Should preserve increment action');
  runner.assert(result.output.includes('decrement'), 'Should preserve decrement action');
  runner.assert(result.output.includes('reset'), 'Should preserve reset action');
});

// Test 16: Async methods
runner.test('Async Methods', async () => {
  const source = `
component AsyncTest {
  state data = null
  state loading = false
  
  async method fetchData() {
    loading = true
    try {
      data = await fetch('/api/data').json()
    } finally {
      loading = false
    }
  }
}
`;
  
  const result = runner.compiler.compile(source);
  runner.assert(result !== null, 'Async methods compilation should succeed');
  runner.assert(result.output.includes('async'), 'Should preserve async keyword');
});

// Test 17: Decorators
runner.test('Decorators', async () => {
  const source = `
@route("/test")
@meta({ title: "Test Page" })
component DecoratedComponent {
  render {
    <div>Test</div>
  }
}
`;
  
  const result = runner.compiler.compile(source);
  runner.assert(result !== null, 'Decorators compilation should succeed');
  runner.assert(result.output.includes('@route'), 'Should preserve route decorator');
  runner.assert(result.output.includes('@meta'), 'Should preserve meta decorator');
});

// Test 18: Styling system
runner.test('Styling System', async () => {
  const source = `
component StyledComponent {
  render {
    <div class="styled">Hello</div>
  }
}

styles StyledComponent {
  .styled {
    color: red
    font-size: 16px
    padding: 10px
    
    &:hover {
      color: blue
    }
  }
}
`;
  
  const result = runner.compiler.compile(source);
  runner.assert(result !== null, 'Styling compilation should succeed');
  runner.assert(result.output.includes('styles'), 'Should handle styles block');
});

// Test 19: Import/Export
runner.test('Import/Export', async () => {
  const source = `
import { Component } from './base'
import { Button, Card } from './ui'

export component TestComponent {
  render {
    <Card>
      <Button>Click me</Button>
    </Card>
  }
}
`;
  
  const result = runner.compiler.compile(source);
  runner.assert(result !== null, 'Import/Export compilation should succeed');
  runner.assert(result.output.includes('import'), 'Should preserve imports');
  runner.assert(result.output.includes('export'), 'Should preserve exports');
});

// Test 20: Runtime functionality
runner.test('Runtime Functionality', async () => {
  // Test that the runtime can be instantiated
  runner.assert(runner.runtime !== null, 'Runtime should be instantiable');
  
  // Test basic runtime methods exist
  runner.assert(typeof runner.runtime.createComponent === 'function', 'Should have createComponent method');
  runner.assert(typeof runner.runtime.createStore === 'function', 'Should have createStore method');
});

// Run all tests
runner.run().catch(error => {
  console.error(chalk.red('Test runner failed:'), error);
  process.exit(1);
});