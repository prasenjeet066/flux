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
        console.log(chalk.blue(`🚀 Creating new Flux project: ${name}`));

        const projectDir = path.resolve(process.cwd(), name);
        await fs.ensureDir(projectDir);

        // Minimal template files
        const files = {
          'package.json': JSON.stringify({
            name: name.toLowerCase().replace(/\s+/g, '-'),
            version: '1.0.0',
            type: 'module',
            scripts: {
              dev: 'npx flux dev',
              build: 'npx flux build',
              start: 'npx flux dev'
            },
            dependencies: {
              'flux-lang': '^2.0.3'
            }
          }, null, 2),
          'flux.config.js': `export default {
  name: '${name}',
  entry: 'src/app.flux',
  output: 'dist'
};\n`,
          'src/app.flux': `component App {
  state message = 'Hello, Flux!'
  render {
    <div><h1>{message}</h1></div>
  }
}

mount(App, '#root')\n`,
          'public/index.html': `<!DOCTYPE html>
<html>
  <head><meta charset="utf-8"><title>${name}</title></head>
  <body><div id="root"></div></body>
</html>\n`,
          '.gitignore': `node_modules\ndist\n`,
          'README.md': `# ${name}\n\nGenerated with create-flux-lang.\n\n## Run\n\n\`\`\`bash\nnpm install\nnpx flux dev\n\`\`\`\n`
        };

        for (const [rel, content] of Object.entries(files)) {
          const dest = path.join(projectDir, rel);
          await fs.ensureDir(path.dirname(dest));
          await fs.writeFile(dest, content);
        }

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
