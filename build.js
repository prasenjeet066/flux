#!/usr/bin/env node

import { build } from 'esbuild';
import fs from 'fs-extra';
import { join } from 'path';
import chalk from 'chalk';

async function main() {
  console.log(chalk.blue('🔨 Building Flux Language...'));
  
  try {
    // Clean dist directory
    await fs.rm('dist', { force: true, recursive: true });
    await fs.mkdir('dist');
    
    // Build with esbuild
    const result = await build({
      entryPoints: [
        'src/compiler/index.js',
        'src/runtime/index.js',
        'src/ast/nodes.js',
        'src/compiler/lexer.js',
        'src/compiler/parser.js',
        'src/compiler/codegen.js',
        'src/errors.js',
        'src/cli/create-project.js',
        'src/cli/dev-server.js'
      ],
      bundle: true,
      format: 'esm',
      platform: 'node',
      target: 'node18',
      outdir: 'dist',
      sourcemap: true,
      minify: false,
      external: ['chalk', 'commander', 'fs-extra', 'glob'],
      define: {
        'process.env.NODE_ENV': '"production"'
      }
    });
    
    if (result.errors.length > 0) {
      console.error(chalk.red('Build errors:'));
      result.errors.forEach(error => console.error(error));
      process.exit(1);
    }
    
    if (result.warnings.length > 0) {
      console.warn(chalk.yellow('Build warnings:'));
      result.warnings.forEach(warning => console.warn(warning));
    }
    
    // Copy CLI binary
    await fs.copy('bin', 'dist/bin');
    
    // Copy package.json
    await fs.copy('package.json', 'dist/package.json');
    
    // Copy README
    await fs.copy('readme.md', 'dist/README.md');
    
    // Create main index.js
    const mainIndex = `export { FluxCompiler } from './compiler/index.js';
export { FluxRuntime, Component, Store } from './runtime/index.js';
export * from './ast/nodes.js';
export * from './errors.js';

// CLI exports
export { createProject } from './cli/create-project.js';
export { devServer } from './cli/dev-server.js';
`;
    
    await fs.writeFile('dist/index.js', mainIndex);
    
    // Read version for CLI
    const rootPkg = JSON.parse(await fs.readFile('package.json', 'utf8'));

    // Create CLI entry point (lazy-load heavy modules only when needed)
    const cliIndex = `#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';

const program = new Command();

program
  .name('flux')
  .description('Flux - Next-generation web programming language')
  .version('${rootPkg.version}');

program
  .command('new <name>')
  .description('Create a new Flux project')
  .option('-t, --template <template>', 'Project template to use', 'default')
  .action(async (name, options) => {
    try {
      const { createProject } = await import('./cli/create-project.js');
      console.log(chalk.blue(\`🚀 Creating new Flux project: \${name}\`));
      await createProject(name, options.template);
      console.log(chalk.green(\`✅ Project \${name} created successfully!\`));
      console.log(chalk.cyan('\\nNext steps:'));
      console.log(chalk.cyan(\`  cd \${name}\`));
      console.log(chalk.cyan('  flux dev'));
    } catch (error) {
      console.error(chalk.red(\`❌ Error creating project: \${error.message}\`));
      process.exit(1);
    }
  });

program
  .command('dev')
  .description('Start development server')
  .option('-p, --port <port>', 'Port to run on', '3000')
  .option('-h, --host <host>', 'Host to bind to', 'localhost')
  .action(async (options) => {
    try {
      const { devServer } = await import('./cli/dev-server.js');
      console.log(chalk.blue(\`🌐 Starting Flux dev server on \${options.host}:\${options.port}\`));
      await devServer(options);
    } catch (error) {
      console.error(chalk.red(\`❌ Error starting dev server: \${error.message}\`));
      process.exit(1);
    }
  });

program
  .command('build')
  .description('Build project for production')
  .option('-o, --output <dir>', 'Output directory', 'dist')
  .option('--minify', 'Minify output', false)
  .option('--source-maps', 'Generate source maps', true)
  .action(async (options) => {
    try {
      const { FluxCompiler } = await import('./compiler/index.js');
      console.log(chalk.blue('🔨 Building project...'));
      const compiler = new FluxCompiler({
        minify: options.minify,
        sourceMaps: options.sourceMaps,
        outputDir: options.output
      });
      await compiler.build();
      console.log(chalk.green('✅ Build completed successfully!'));
      console.log(chalk.cyan(\`Output: \${options.output}\`));
    } catch (error) {
      console.error(chalk.red(\`❌ Build failed: \${error.message}\`));
      process.exit(1);
    }
  });

program
  .command('compile <file>')
  .description('Compile a single Flux file')
  .option('-o, --output <file>', 'Output file path')
  .option('--target <target>', 'Target (js, wasm)', 'js')
  .action(async (file, options) => {
    try {
      const { FluxCompiler } = await import('./compiler/index.js');
      console.log(chalk.blue(\`⚡ Compiling \${file}...\`));
      const compiler = new FluxCompiler({ target: options.target });
      const result = await compiler.compileFile(file);
      if (options.output) {
        await compiler.writeOutput(result, options.output);
        console.log(chalk.green(\`✅ Compiled to \${options.output}\`));
      } else {
        console.log(chalk.cyan('\\n--- Compiled Output ---'));
        console.log(result);
      }
    } catch (error) {
      console.error(chalk.red(\`❌ Compilation failed: \${error.message}\`));
      process.exit(1);
    }
  });

program.parse();
`;
    
    await fs.writeFile('dist/cli.js', cliIndex);
    
    // Update package.json for distribution
    const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8'));
    packageJson.main = './index.js';
    packageJson.bin = {
      'flux': './cli.js'
    };
    
    // Remove dev-only fields and scripts from the distributed package.json
    delete packageJson.scripts;
    delete packageJson.devDependencies;
    // Remove any publishConfig that points to non-npm registries
    delete packageJson.publishConfig;
    
    // Keep only runtime dependencies
    packageJson.dependencies = packageJson.dependencies || {};
    
    // Limit published files
    packageJson.files = [
      '*.js',
      '*.js.map',
      'runtime',
      'compiler',
      'ast',
      'cli',
      'errors.js',
      'README.md'
    ];
    
    await fs.writeFile('dist/package.json', JSON.stringify(packageJson, null, 2));

    // Ensure CLI entry is executable in the tarball
    await fs.chmod('dist/cli.js', 0o755);
    
    console.log(chalk.green('✅ Build completed successfully!'));
    console.log(chalk.cyan('📦 Output directory: dist/'));
    
    // Show build summary
    const buildInfo = {
      'Compiler': '✅',
      'Runtime': '✅',
      'AST Nodes': '✅',
      'Error Handling': '✅',
      'CLI Tools': '✅',
      'Project Templates': '✅',
      'Dev Server': '✅'
    };
    
    console.log(chalk.blue('\n📋 Build Summary:'));
    Object.entries(buildInfo).forEach(([component, status]) => {
      console.log(`  ${status} ${component}`);
    });
    
  } catch (error) {
    console.error(chalk.red('❌ Build failed:'), error);
    process.exit(1);
  }
}



// Run build
main().catch(error => {
  console.error(chalk.red('Fatal build error:'), error);
  process.exit(1);
});