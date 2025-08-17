// flux.config.js
// Configuration for the Flux programming language project

export default {
  name: 'flux-lang',
  version: '1.0.0',
  description: 'A next-generation web programming language',
  
  // Build configuration
  build: {
    target: 'js', // 'js' or 'wasm'
    minify: false,
    sourceMaps: true,
    optimizations: true,
    outputDir: 'dist',
    
    // Compiler options
    compiler: {
      strict: true,
      experimental: false,
      warnings: true
    }
  },
  
  // Development server
  dev: {
    port: 3000,
    host: 'localhost',
    hotReload: true,
    openBrowser: false
  },
  
  // Project structure
  structure: {
    src: 'src',
    pages: 'src/pages',
    components: 'src/components',
    stores: 'src/stores',
    public: 'public',
    dist: 'dist'
  },
  
  // Language features
  features: {
    jsx: true,
    decorators: true,
    asyncAwait: true,
    computed: true,
    effects: true,
    stores: true,
    routing: true,
    styling: true
  },
  
  // Dependencies
  dependencies: {
    runtime: {
      react: false, // Use built-in runtime
      vue: false,
      svelte: false
    },
    styling: {
      cssModules: false,
      sass: false,
      less: false
    }
  },
  
  // Performance options
  performance: {
    treeShaking: true,
    codeSplitting: true,
    lazyLoading: true,
    preloading: true
  },
  
  // Testing
  testing: {
    framework: 'builtin',
    coverage: true,
    watch: true
  },
  
  // Documentation
  docs: {
    generate: true,
    format: 'markdown',
    output: 'docs'
  }
};