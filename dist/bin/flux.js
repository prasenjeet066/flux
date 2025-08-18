#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { FluxCompiler } from '../src/compiler/index.js';
import { createProject } from '../src/cli/create-project.js';
import { devServer } from '../src/cli/dev-server.js';

const program = new Command();

program
  .name('flux')
  .description('Flux - Next-generation web programming language')
  .version('1.0.0');

program
  .command('new <name>')
  .description('Create a new Flux project')
  .option('-t, --template <template>', 'Project template to use', 'default')
  .action(async (name, options) => {
    try {
      console.log(chalk.blue(`🚀 Creating new Flux project: ${name}`));
      await createProject(name, options.template);
      console.log(chalk.green(`✅ Project ${name} created successfully!`));
      console.log(chalk.cyan(`\nNext steps:`));
      console.log(chalk.cyan(`  cd ${name}`));
      console.log(chalk.cyan(`  flux dev`));
    } catch (error) {
      console.error(chalk.red(`❌ Error creating project: ${error.message}`));
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
      console.log(chalk.blue(`🌐 Starting Flux dev server on ${options.host}:${options.port}`));
      await devServer(options);
    } catch (error) {
      console.error(chalk.red(`❌ Error starting dev server: ${error.message}`));
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
      console.log(chalk.blue(`🔨 Building project...`));
      const compiler = new FluxCompiler({
        minify: options.minify,
        sourceMaps: options.sourceMaps,
        outputDir: options.output
      });
      
      await compiler.build();
      console.log(chalk.green(`✅ Build completed successfully!`));
      console.log(chalk.cyan(`Output: ${options.output}`));
    } catch (error) {
      console.error(chalk.red(`❌ Build failed: ${error.message}`));
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
      console.log(chalk.blue(`⚡ Compiling ${file}...`));
      const compiler = new FluxCompiler({
        target: options.target
      });
      
      const result = await compiler.compileFile(file);
      
      if (options.output) {
        await compiler.writeOutput(result, options.output);
        console.log(chalk.green(`✅ Compiled to ${options.output}`));
      } else {
        console.log(chalk.cyan('\n--- Compiled Output ---'));
        console.log(result);
      }
    } catch (error) {
      console.error(chalk.red(`❌ Compilation failed: ${error.message}`));
      process.exit(1);
    }
  });

program.parse();