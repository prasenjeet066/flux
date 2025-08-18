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
    
    // Create CLI entry point
    const cliIndex = `#!/usr/bin/env node
import { FluxCompiler } from './compiler/index.js';
import { createProject } from './cli/create-project.js';
import { devServer } from './cli/dev-server.js';

export { FluxCompiler, createProject, devServer };
`;
    
    await fs.writeFile('dist/cli.js', cliIndex);
    
    // Update package.json for distribution
    const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8'));
    packageJson.main = './index.js';
    packageJson.bin = {
      'flux': './bin/flux.js'
    };
    
    await fs.writeFile('dist/package.json', JSON.stringify(packageJson, null, 2));
    
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