#!/usr/bin/env node

import { build } from 'esbuild';
import fs from 'fs-extra';
import { join } from 'path';
import chalk from 'chalk';

async function main() {
  console.log(chalk.blue('[build] Building Flux Language...'));
  
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
        'src/cli/dev-server.js',
        'src/cli/advanced-cli.js'
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
      console.error(chalk.red('[build] Errors:'));
      result.errors.forEach(error => console.error(error));
      process.exit(1);
    }
    
    if (result.warnings.length > 0) {
      console.warn(chalk.yellow('[build] Warnings:'));
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
    
    // Create CLI entry point that executes the advanced CLI
    const cliIndex = `#!/usr/bin/env node
import { AdvancedCLI } from './src/cli/advanced-cli.js';
const cli = new AdvancedCLI();
cli.run();
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
    
    console.log(chalk.green('[build] Completed successfully'));
    console.log(chalk.cyan('[out] dist/'));
    
    // Show build summary
    const buildInfo = {
      'Compiler': '[ok]',
      'Runtime': '[ok]',
      'AST Nodes': '[ok]',
      'Error Handling': '[ok]',
      'CLI Tools': '[ok]',
      'Project Templates': '[ok]',
      'Dev Server': '[ok]'
    };
    
    console.log(chalk.blue('\n[build] Summary:'));
    Object.entries(buildInfo).forEach(([component, status]) => {
      console.log(`  ${status} ${component}`);
    });
    
  } catch (error) {
    console.error(chalk.red('[build] Failed:'), error);
    process.exit(1);
  }
}



// Run build
main().catch(error => {
  console.error(chalk.red('Fatal build error:'), error);
  process.exit(1);
});