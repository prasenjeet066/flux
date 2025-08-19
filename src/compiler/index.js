// flux-core/src/compiler/index.js
// Main compiler entry point

import { FluxLexer } from './lexer.js';
import { FluxParser } from './parser.js';
import { FluxCodeGenerator } from './codegen.js';
import { FluxError } from '../errors.js';
import fs from 'fs-extra';
import path from 'path';

export class FluxCompiler {
  constructor(options = {}) {
    this.options = {
      target: 'js', // 'js' or 'wasm'
      minify: false,
      sourceMaps: true,
      optimizations: true,
      outputDir: 'dist',
      treeShaking: true,
      codeSplitting: false,
      bundleAnalysis: false,
      watchMode: false,
      incremental: true,
      parallel: true,
      maxWorkers: 4,
      ...options
    };
    
    this.errors = [];
    this.warnings = [];
    this.compilationCache = new Map();
    this.dependencyGraph = new Map();
    // Initialize optimization and bundling systems
    this.optimizer = this.createOptimizer();
    this.bundler = this.createBundler();
  }

  async compileFile(filePath) {
    try {
      // Read source file
      const source = await fs.readFile(filePath, 'utf-8');
      
      // Compile source
      const result = this.compile(source, filePath);
      
      if (this.errors.length > 0) {
        throw new FluxError('Compilation failed', this.errors);
      }
      
      return result;
    } catch (error) {
      if (error instanceof FluxError) {
        throw error;
      }
      throw new FluxError(`Failed to read file ${filePath}: ${error.message}`);
    }
  }

  compile(source, filePath = '<unknown>') {
    try {
      // Reset error state
      this.errors = [];
      this.warnings = [];
      
      // Tokenize
      const lexer = new FluxLexer(source);
      const tokens = lexer.tokenize();
      
      if (lexer.errors.length > 0) {
        this.errors.push(...lexer.errors);
        return null;
      }
      
      // Parse
      const parser = new FluxParser(tokens);
      const ast = parser.program();
      
      if (parser.errors.length > 0) {
        this.errors.push(...parser.errors);
        return null;
      }
      
      // Generate code
      const generator = new FluxCodeGenerator(this.options);
      const output = generator.generate(ast);
      
      if (generator.errors.length > 0) {
        this.errors.push(...generator.errors);
        return null;
      }
      
      return {
        source,
        ast,
        output,
        sourceMap: generator.sourceMap || null,
        filePath
      };
    } catch (error) {
      this.errors.push({
        message: error.message,
        file: filePath,
        line: 1,
        column: 1
      });
      return null;
    }
  }

  async build() {
    const projectRoot = process.cwd();
    const fluxConfig = await this.loadConfig(projectRoot);
    
    // Find all .flux files
    const fluxFiles = await this.findFluxFiles(projectRoot);
    
    if (fluxFiles.length === 0) {
      throw new FluxError('No .flux files found in project');
    }
    
    console.log(`Found ${fluxFiles.length} Flux files to compile`);
    
    // Compile each file
    const results = [];
    for (const file of fluxFiles) {
      const result = await this.compileFile(file);
      if (result) {
        results.push(result);
      }
    }
    
    if (this.errors.length > 0) {
      throw new FluxError('Build failed', this.errors);
    }
    
    // Write output files
    await this.writeBuildOutput(results, projectRoot);
    
    return results;
  }

  async findFluxFiles(rootDir) {
    const files = [];
    
    async function scan(dir) {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          await scan(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.flux')) {
          files.push(fullPath);
        }
      }
    }
    
    await scan(rootDir);
    return files;
  }

  async loadConfig(projectRoot) {
    const configPath = path.join(projectRoot, 'flux.config.js');
    
    try {
      if (await fs.pathExists(configPath)) {
        const config = await import(configPath);
        return config.default || config;
      }
    } catch (error) {
      console.warn(`Warning: Could not load flux.config.js: ${error.message}`);
    }
    
    return {};
  }

  async writeBuildOutput(results, projectRoot) {
    const outputDir = path.join(projectRoot, this.options.outputDir);
    
    // Ensure output directory exists
    await fs.ensureDir(outputDir);
    
    // Write compiled files
    for (const result of results) {
      const relativePath = path.relative(projectRoot, result.filePath);
      const outputPath = path.join(
        outputDir,
        relativePath.replace(/\.flux$/, '.js')
      );
      
      await fs.ensureDir(path.dirname(outputPath));
      await fs.writeFile(outputPath, result.output);
      
      // Write source map if enabled
      if (this.options.sourceMaps && result.sourceMap) {
        await fs.writeFile(outputPath + '.map', JSON.stringify(result.sourceMap));
      }
    }
    
    // Write runtime files
    await this.writeRuntimeFiles(outputDir);
    
    // Write index.html if it doesn't exist
    const indexPath = path.join(outputDir, 'index.html');
    if (!await fs.pathExists(indexPath)) {
      await this.writeDefaultIndexHtml(indexPath);
    }
  }

  async writeRuntimeFiles(outputDir) {
    const runtimeDir = path.join(outputDir, 'runtime');
    await fs.ensureDir(runtimeDir);
    
    // Copy runtime files
    const runtimeSource = path.join(__dirname, '../runtime');
    await fs.copy(runtimeSource, runtimeDir);
  }

  async writeDefaultIndexHtml(outputPath) {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Flux App</title>
</head>
<body>
    <div id="root"></div>
    <script type="module" src="./app.js"></script>
</body>
</html>`;
    
    await fs.writeFile(outputPath, html);
  }

  async writeOutput(result, outputPath) {
    await fs.ensureDir(path.dirname(outputPath));
    await fs.writeFile(outputPath, result.output);
    
    if (this.options.sourceMaps && result.sourceMap) {
      await fs.writeFile(outputPath + '.map', JSON.stringify(result.sourceMap));
    }
  }
  
  createOptimizer() {
    return {
      optimize: (ast) => ast, // Placeholder optimization
      getOptimizations: () => []
    };
  }
  
  createBundler() {
    return {
      bundle: (files) => ({ code: '', map: null }), // Placeholder bundling
      getBundleInfo: () => ({ size: 0, files: [] })
    };
  }
}

// Advanced compiler optimization system
class FluxOptimizer {
  constructor(options) {
    this.options = options;
    this.optimizations = new Map();
    this.analysis = new Map();
  }

  optimize(ast, context) {
    if (!this.options.optimizations) return ast;
    
    let optimizedAst = ast;
    
    // Apply various optimizations
    optimizedAst = this.constantFolding(optimizedAst);
    optimizedAst = this.deadCodeElimination(optimizedAst);
    optimizedAst = this.inlineExpansion(optimizedAst);
    optimizedAst = this.hoisting(optimizedAst);
    
    return optimizedAst;
  }

  constantFolding(ast) {
    // Fold constant expressions at compile time
    return ast;
  }

  deadCodeElimination(ast) {
    // Remove unreachable code
    return ast;
  }

  inlineExpansion(ast) {
    // Inline small functions
    return ast;
  }

  hoisting(ast) {
    // Hoist variable declarations
    return ast;
  }

  analyze(ast) {
    // Analyze code for optimization opportunities
    const analysis = {
      complexity: this.calculateComplexity(ast),
      dependencies: this.findDependencies(ast),
      performance: this.analyzePerformance(ast)
    };
    
    this.analysis.set(ast, analysis);
    return analysis;
  }

  calculateComplexity(ast) {
    // Calculate cyclomatic complexity
    return 1; // Placeholder
  }

  findDependencies(ast) {
    // Find all dependencies
    return []; // Placeholder
  }

  analyzePerformance(ast) {
    // Analyze performance characteristics
    return {}; // Placeholder
  }
}

// Advanced bundling system
class FluxBundler {
  constructor(options) {
    this.options = options;
    this.bundles = new Map();
    this.chunks = new Map();
  }

  createBundle(entryPoints, dependencies) {
    if (!this.options.codeSplitting) {
      return this.createSingleBundle(entryPoints, dependencies);
    }
    
    return this.createSplitBundles(entryPoints, dependencies);
  }

  createSingleBundle(entryPoints, dependencies) {
    // Create a single bundle
    return {
      type: 'single',
      code: this.mergeCode(entryPoints, dependencies),
      sourceMap: this.mergeSourceMaps(entryPoints, dependencies)
    };
  }

  createSplitBundles(entryPoints, dependencies) {
    // Create multiple bundles for code splitting
    const bundles = [];
    
    for (const entryPoint of entryPoints) {
      const bundle = this.createBundleForEntry(entryPoint, dependencies);
      bundles.push(bundle);
    }
    
    return bundles;
  }

  createBundleForEntry(entryPoint, dependencies) {
    // Create bundle for specific entry point
    return {
      type: 'entry',
      entry: entryPoint,
      code: this.generateEntryCode(entryPoint, dependencies),
      dependencies: this.getEntryDependencies(entryPoint, dependencies)
    };
  }

  mergeCode(entryPoints, dependencies) {
    // Merge all code into single output
    return entryPoints.map(ep => ep.code).join('\n');
  }

  mergeSourceMaps(entryPoints, dependencies) {
    // Merge source maps
    return {}; // Placeholder
  }

  generateEntryCode(entryPoint, dependencies) {
    // Generate code for entry point
    return entryPoint.code;
  }

  getEntryDependencies(entryPoint, dependencies) {
    // Get dependencies for entry point
    return dependencies.filter(dep => dep.entryPoint === entryPoint);
  }
}

export { FluxBundler };