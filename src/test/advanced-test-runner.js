#!/usr/bin/env node

import { FluxCompiler } from '../compiler/index.js';
import { FluxRuntime, FluxCache } from '../runtime/index.js';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { Worker } from 'worker_threads';
import { EventEmitter } from 'events';

class AdvancedTestRunner extends EventEmitter {
  constructor(options = {}) {
    super();
    this.options = {
      parallel: true,
      maxWorkers: 4,
      coverage: true,
      watch: false,
      grep: null,
      timeout: 30000,
      retries: 1,
      bail: false,
      verbose: false,
      ...options,
    };

    this.compiler = new FluxCompiler();
    this.runtime = new FluxRuntime();
    this.tests = [];
    this.results = {
      passed: 0,
      failed: 0,
      skipped: 0,
      total: 0,
      duration: 0,
      coverage: {},
      performance: {},
    };

    this.workers = new Map();
    this.testQueue = [];
    this.isRunning = false;
    this.startTime = null;

    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.on('test:start', (test) => {
      if (this.options.verbose) {
        console.log(chalk.blue(`▶️  Starting: ${test.name}`));
      }
    });

    this.on('test:pass', (test, duration) => {
      this.results.passed++;
      if (this.options.verbose) {
        console.log(chalk.green(`✅ ${test.name} (${duration}ms)`));
      }
    });

    this.on('test:fail', (test, error, duration) => {
      this.results.failed++;
      console.log(chalk.red(`❌ ${test.name} (${duration}ms)`));
      if (this.options.verbose) {
        console.error(chalk.red(`   Error: ${error.message}`));
        if (error.stack) {
          console.error(chalk.gray(`   ${error.stack.split('\n')[1]}`));
        }
      }
    });

    this.on('test:skip', (test) => {
      this.results.skipped++;
      if (this.options.verbose) {
        console.log(chalk.yellow(`⏭️  ${test.name} (skipped)`));
      }
    });

    this.on('worker:ready', (workerId) => {
      this.processNextTest(workerId);
    });

    this.on('worker:complete', (workerId, result) => {
      this.handleWorkerResult(workerId, result);
      this.workers.delete(workerId);
      this.processNextTest();
    });
  }

  // Test registration
  test(name, testFn, options = {}) {
    this.tests.push({
      name,
      fn: testFn,
      options: {
        timeout: this.options.timeout,
        retries: this.options.retries,
        skip: false,
        only: false,
        ...options,
      },
    });
  }

  // Test lifecycle hooks
  beforeAll(fn) {
    this.beforeAllHook = fn;
  }

  afterAll(fn) {
    this.afterAllHook = fn;
  }

  beforeEach(fn) {
    this.beforeEachHook = fn;
  }

  afterEach(fn) {
    this.afterEachHook = fn;
  }

  // Test utilities
  describe(name, fn) {
    const currentSuite = this.currentSuite;
    this.currentSuite = { name, parent: currentSuite };

    try {
      fn.call(this);
    } finally {
      this.currentSuite = currentSuite;
    }
  }

  it(name, testFn, options = {}) {
    this.test(name, testFn, { ...options, suite: this.currentSuite });
  }

  // Assertions
  assert(condition, message) {
    if (!condition) {
      throw new Error(message || 'Assertion failed');
    }
  }

  assertEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(
        message ||
        `Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(actual)}`,
      );
    }
  }

  assertDeepEqual(actual, expected, message) {
    if (!this.deepEqual(actual, expected)) {
      throw new Error(
        message ||
        `Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(actual)}`,
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
          `Expected error to contain "${expectedError}", but got "${error.message}"`,
        );
      }
    }
  }

  assertRejects(promise, expectedError) {
    return promise.then(
      () => { throw new Error('Expected promise to reject'); },
      (error) => {
        if (expectedError && !error.message.includes(expectedError)) {
          throw new Error(
            `Expected error to contain "${expectedError}", but got "${error.message}"`,
          );
        }
      },
    );
  }

  // Mocking system
  mock(modulePath, mockImplementation) {
    const mock = {
      calls: [],
      returns: [],
      throws: [],
      reset() {
        this.calls = [];
        this.returns = [];
        this.throws = [];
      },
      mockReturnValue(value) {
        this.returns.push(value);
        return this;
      },
      mockImplementation(fn) {
        this.implementation = fn;
        return this;
      },
    };

    // Store mock for later restoration
    if (!this.mocks) this.mocks = new Map();
    this.mocks.set(modulePath, mock);

    return mock;
  }

  // Performance testing
  benchmark(name, fn, options = {}) {
    const iterations = options.iterations || 1000;
    const warmup = options.warmup || 100;

    // Warmup
    for (let i = 0; i < warmup; i++) {
      fn();
    }

    // Actual benchmark
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      fn();
    }
    const end = performance.now();

    const duration = end - start;
    const avgDuration = duration / iterations;

    this.results.performance[name] = {
      iterations,
      totalDuration: duration,
      averageDuration: avgDuration,
      operationsPerSecond: iterations / (duration / 1000),
    };

    if (this.options.verbose) {
      console.log(chalk.cyan(`📊 ${name}: ${avgDuration.toFixed(3)}ms per operation`));
    }
  }

  // Coverage reporting
  async generateCoverage() {
    if (!this.options.coverage) return;

    const coverage = {
      statements: 0,
      branches: 0,
      functions: 0,
      lines: 0,
      files: [],
    };

    // Analyze test results and generate coverage data
    // This is a simplified implementation
    this.results.coverage = coverage;

    if (this.options.verbose) {
      console.log(chalk.cyan('📊 Coverage Report:'));
      console.log(chalk.cyan(`   Statements: ${coverage.statements}%`));
      console.log(chalk.cyan(`   Branches: ${coverage.branches}%`));
      console.log(chalk.cyan(`   Functions: ${coverage.functions}%`));
      console.log(chalk.cyan(`   Lines: ${coverage.lines}%`));
    }
  }

  // Test execution
  async run() {
    if (this.isRunning) {
      throw new Error('Test runner is already running');
    }

    this.isRunning = true;
    this.startTime = Date.now();

    console.log(chalk.blue('🧪 Running Advanced Flux Tests...\n'));

    try {
      // Filter tests based on grep pattern
      if (this.options.grep) {
        this.tests = this.tests.filter(test =>
          test.name.includes(this.options.grep),
        );
      }

      // Filter "only" tests
      const onlyTests = this.tests.filter(test => test.options.only);
      if (onlyTests.length > 0) {
        this.tests = onlyTests;
      }

      // Skip tests marked as skip
      this.tests = this.tests.filter(test => !test.options.skip);

      this.results.total = this.tests.length;

      // Run beforeAll hook
      if (this.beforeAllHook) {
        await this.beforeAllHook();
      }

      if (this.options.parallel && this.tests.length > 1) {
        await this.runParallel();
      } else {
        await this.runSequential();
      }

      // Run afterAll hook
      if (this.afterAllHook) {
        await this.afterAllHook();
      }

      // Generate coverage report
      await this.generateCoverage();

      // Generate performance report
      this.generatePerformanceReport();

      // Print summary
      this.printSummary();

      return this.results;

    } finally {
      this.isRunning = false;
      this.cleanup();
    }
  }

  async runParallel() {
    const maxWorkers = Math.min(this.options.maxWorkers, this.tests.length);

    // Create workers
    for (let i = 0; i < maxWorkers; i++) {
      await this.createWorker(i);
    }

    // Queue all tests
    this.testQueue = [...this.tests];

    // Wait for all tests to complete
    while (this.workers.size > 0 || this.testQueue.length > 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  async runSequential() {
    for (const test of this.tests) {
      await this.runTest(test);
    }
  }

  async createWorker(workerId) {
    const worker = new Worker(`
      const { parentPort } = require('worker_threads');
      
      parentPort.on('message', async (data) => {
        try {
          const { test, context } = data;
          const startTime = Date.now();
          
          // Execute test
          await test.fn(context);
          
          const duration = Date.now() - startTime;
          parentPort.postMessage({
            type: 'pass',
            test: test.name,
            duration
          });
        } catch (error) {
          const duration = Date.now() - startTime;
          parentPort.postMessage({
            type: 'fail',
            test: test.name,
            error: error.message,
            duration
          });
        }
      });
    `, { eval: true });

    this.workers.set(workerId, worker);
    this.emit('worker:ready', workerId);
  }

  async processNextTest(workerId = null) {
    if (this.testQueue.length === 0) return;

    const test = this.testQueue.shift();
    const availableWorker = workerId || this.getAvailableWorker();

    if (availableWorker) {
      const worker = this.workers.get(availableWorker);
      worker.postMessage({ test, context: {} });
    }
  }

  getAvailableWorker() {
    for (const [id, worker] of this.workers) {
      if (worker.listenerCount('message') === 0) {
        return id;
      }
    }
    return null;
  }

  async runTest(test) {
    const startTime = Date.now();

    try {
      this.emit('test:start', test);

      // Run beforeEach hook
      if (this.beforeEachHook) {
        await this.beforeEachHook();
      }

      // Execute test
      await test.fn();

      const duration = Date.now() - startTime;
      this.emit('test:pass', test, duration);

      // Run afterEach hook
      if (this.afterEachHook) {
        await this.afterEachHook();
      }

    } catch (error) {
      const duration = Date.now() - startTime;
      this.emit('test:fail', test, error, duration);

      if (this.options.bail) {
        throw error;
      }
    }
  }

  handleWorkerResult(workerId, result) {
    const test = this.tests.find(t => t.name === result.test);
    if (!test) return;

    if (result.type === 'pass') {
      this.emit('test:pass', test, result.duration);
    } else {
      const error = new Error(result.error);
      this.emit('test:fail', test, error, result.duration);
    }
  }

  generatePerformanceReport() {
    if (Object.keys(this.results.performance).length === 0) return;

    console.log(chalk.cyan('\n📊 Performance Report:'));
    for (const [name, metrics] of Object.entries(this.results.performance)) {
      console.log(chalk.cyan(`   ${name}:`));
      console.log(chalk.cyan(`     Average: ${metrics.averageDuration.toFixed(3)}ms`));
      console.log(chalk.cyan(`     Ops/sec: ${metrics.operationsPerSecond.toFixed(2)}`));
    }
  }

  printSummary() {
    const duration = Date.now() - this.startTime;
    this.results.duration = duration;

    console.log(`\n${'='.repeat(60)}`);
    console.log(chalk.blue('📊 Test Summary'));
    console.log('='.repeat(60));
    console.log(chalk.green(`✅ Passed: ${this.results.passed}`));
    console.log(chalk.red(`❌ Failed: ${this.results.failed}`));
    console.log(chalk.yellow(`⏭️  Skipped: ${this.results.skipped}`));
    console.log(chalk.cyan(`📈 Total: ${this.results.total}`));
    console.log(chalk.cyan(`⏱️  Duration: ${duration}ms`));

    if (this.results.failed === 0) {
      console.log(chalk.green('\n🎉 All tests passed!'));
    } else {
      console.log(chalk.red('\n💥 Some tests failed!'));
      process.exit(1);
    }
  }

  cleanup() {
    // Terminate all workers
    for (const worker of this.workers.values()) {
      worker.terminate();
    }
    this.workers.clear();

    // Restore mocks
    if (this.mocks) {
      for (const [modulePath, mock] of this.mocks) {
        mock.reset();
      }
    }
  }

  // Utility methods
  deepEqual(a, b) {
    if (a === b) return true;
    if (typeof a !== typeof b) return false;
    if (a == null || b == null) return a === b;

    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) {
        if (!this.deepEqual(a[i], b[i])) return false;
      }
      return true;
    }

    if (typeof a === 'object') {
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);
      if (keysA.length !== keysB.length) return false;
      for (const key of keysA) {
        if (!this.deepEqual(a[key], b[key])) return false;
      }
      return true;
    }

    return false;
  }
}

// Export the test runner
export { AdvancedTestRunner };

// Create a default instance for convenience
export const testRunner = new AdvancedTestRunner();

// Export convenience methods
export const {
  test,
  describe,
  it,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
  assert,
  assertEqual,
  assertDeepEqual,
  assertThrows,
  assertRejects,
  mock,
  benchmark,
} = testRunner;
