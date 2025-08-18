#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';

async function run() {
  const program = new Command();

  program
    .name('create-flux')
    .description('Create a new Flux project')
    .argument('<name>', 'Project name')
    .option('-t, --template <template>', 'Project template to use', 'default')
    .action(async (name, options) => {
      try {
        const { createProject } = await import('flux-lang/cli/create-project.js');
        console.log(chalk.blue(`🚀 Creating new Flux project: ${name}`));
        await createProject(name, options.template);
        console.log(chalk.green(`✅ Project ${name} created successfully!`));
        console.log(chalk.cyan('\nNext steps:'));
        console.log(chalk.cyan(`  cd ${name}`));
        console.log(chalk.cyan('  npm install'));
        console.log(chalk.cyan('  npx flux dev'));
      } catch (error) {
        console.error(chalk.red(`❌ Error creating project: ${error.message}`));
        process.exit(1);
      }
    });

  await program.parseAsync();
}

run();
