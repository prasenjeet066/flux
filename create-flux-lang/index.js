#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';

async function run() {
  const program = new Command();

  program
    .name('create-flux-lang')
    .description('Create a new Flux project')
    .argument('<name>', 'Project name')
    .option('-t, --template <template>', 'Project template to use', 'default')
    .action(async (name, options) => {
      try {
        const { createProject } = await import('flux-lang/cli/create-project.js');
        console.log(chalk.blue(`🚀 Creating new Flux project: ${name}`));
        await createProject(name, options.template);

        // Pin flux-lang dependency to ^2.0.3 in generated project
        try {
          const projectDir = path.resolve(process.cwd(), name);
          const pkgPath = path.join(projectDir, 'package.json');
          if (await fs.pathExists(pkgPath)) {
            const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf8'));
            pkg.dependencies = pkg.dependencies || {};
            pkg.dependencies['flux-lang'] = '^2.0.3';
            await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2));
          }
        } catch {}

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
