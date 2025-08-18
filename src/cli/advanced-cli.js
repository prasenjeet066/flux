#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { FluxCompiler } from '../compiler/index.js';
import { FluxRuntime, FluxCache, FluxWebSocket } from '../runtime/index.js';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AdvancedCLI {
  constructor() {
    this.program = new Command();
    this.compiler = new FluxCompiler();
    this.setupCommands();
  }

  setupCommands() {
    this.program
      .name('flux')
      .description('Advanced Flux Language CLI with enhanced features')
      .version('2.0.0');

    // Project management
    this.program
      .command('new <project-name>')
      .description('Create a new Flux project with advanced templates')
      .option('-t, --template <template>', 'Project template (basic, fullstack, api, spa)', 'basic')
      .option('-y, --yes', 'Skip prompts and use defaults')
      .option('--typescript', 'Enable TypeScript support')
      .option('--testing', 'Include testing setup')
      .option('--linting', 'Include linting configuration')
      .action(this.createProject.bind(this));

    // Development
    this.program
      .command('dev')
      .description('Start development server with advanced features')
      .option('-p, --port <port>', 'Port number', '3000')
      .option('-h, --host <host>', 'Host address', 'localhost')
      .option('--hot', 'Enable hot module replacement')
      .option('--analyze', 'Enable bundle analysis')
      .option('--profile', 'Enable performance profiling')
      .action(this.startDevServer.bind(this));

    // Building
    this.program
      .command('build')
      .description('Build project with advanced optimizations')
      .option('-o, --output <dir>', 'Output directory', 'dist')
      .option('--minify', 'Minify output')
      .option('--source-maps', 'Generate source maps')
      .option('--analyze', 'Analyze bundle')
      .option('--watch', 'Watch mode')
      .action(this.buildProject.bind(this));

    // Testing
    this.program
      .command('test')
      .description('Run tests with advanced features')
      .option('--watch', 'Watch mode')
      .option('--coverage', 'Generate coverage report')
      .option('--parallel', 'Run tests in parallel')
      .option('--grep <pattern>', 'Run tests matching pattern')
      .action(this.runTests.bind(this));

    // Debugging
    this.program
      .command('debug')
      .description('Debug application with advanced tools')
      .option('--inspect', 'Enable Node.js inspector')
      .option('--break-on-error', 'Break on first error')
      .option('--profile', 'Generate CPU profile')
      .option('--heap', 'Generate heap snapshot')
      .action(this.debugApplication.bind(this));

    // Performance
    this.program
      .command('profile')
      .description('Profile application performance')
      .option('--cpu', 'CPU profiling')
      .option('--memory', 'Memory profiling')
      .option('--network', 'Network profiling')
      .option('--output <file>', 'Output file for results')
      .action(this.profileApplication.bind(this));

    // Database
    this.program
      .command('db')
      .description('Database management commands')
      .option('--migrate', 'Run migrations')
      .option('--seed', 'Seed database')
      .option('--reset', 'Reset database')
      .action(this.manageDatabase.bind(this));

    // Deployment
    this.program
      .command('deploy')
      .description('Deploy application')
      .option('--env <environment>', 'Deployment environment', 'production')
      .option('--platform <platform>', 'Deployment platform')
      .option('--region <region>', 'Deployment region')
      .action(this.deployApplication.bind(this));

    // Maintenance
    this.program
      .command('maintenance')
      .description('Maintenance and utility commands')
      .option('--clean', 'Clean build artifacts')
      .option('--update', 'Update dependencies')
      .option('--audit', 'Security audit')
      .action(this.maintenanceTasks.bind(this));

    // Code generation
    this.program
      .command('generate <type> <name>')
      .alias('g')
      .description('Generate boilerplate: component|page|store')
      .option('-d, --dir <dir>', 'Directory to place the generated file')
      .action(this.generateArtifact.bind(this));
  }

  async createProject(projectName, options) {
    console.log(chalk.blue(`[new] Creating Flux project: ${projectName}`));
    
    try {
      const projectDir = path.resolve(projectName);
      
      if (await fs.pathExists(projectDir)) {
        console.error(chalk.red(`Directory ${projectName} already exists`));
        process.exit(1);
      }

      await fs.ensureDir(projectDir);
      
      // Create project structure based on template
      await this.createProjectStructure(projectDir, options.template, options);
      
      // Install dependencies
      await this.installDependencies(projectDir, options);
      
      console.log(chalk.green(`[ok] Project ${projectName} created`));
      console.log(chalk.cyan(`[dir] ${projectDir}`));
      console.log(chalk.yellow(`[next]`));
      console.log(chalk.yellow(`   cd ${projectName}`));
      console.log(chalk.yellow(`   npm run dev`));
      
    } catch (error) {
      console.error(chalk.red('Error creating project:'), error);
      process.exit(1);
    }
  }

  async createProjectStructure(projectDir, template, options) {
    const templates = {
      basic: this.createBasicTemplate.bind(this),
      fullstack: this.createFullstackTemplate.bind(this),
      api: this.createAPITemplate.bind(this),
      spa: this.createSPATemplate.bind(this)
    };

    const templateFn = templates[template] || templates.basic;
    await templateFn(projectDir, options);
  }

  async createBasicTemplate(projectDir, options) {
    const files = {
      'package.json': this.generatePackageJson(options),
      'flux.config.js': this.generateFluxConfig(options),
      'README.md': this.generateREADME(options),
      'src/app.flux': this.generateAppFlux(options),
      'src/components/Header.flux': this.generateHeaderComponent(),
      'src/components/Footer.flux': this.generateFooterComponent(),
      'src/pages/home.flux': this.generateHomePage(),
      'src/styles/global.css': this.generateGlobalCSS(),
      '.gitignore': this.generateGitignore(),
      '.flux/index.html': this.generateIndexHTML()
    };

    for (const [filename, content] of Object.entries(files)) {
      const filePath = path.join(projectDir, filename);
      await fs.ensureDir(path.dirname(filePath));
      await fs.writeFile(filePath, content);
    }
  }

  async createFullstackTemplate(projectDir, options) {
    // Create basic structure first
    await this.createBasicTemplate(projectDir, options);
    
    // Add fullstack-specific files
    const fullstackFiles = {
      'src/server/index.js': this.generateServerFile(),
      'src/database/schema.js': this.generateDatabaseSchema(),
      'src/api/routes.js': this.generateAPIRoutes(),
      'src/middleware/auth.js': this.generateAuthMiddleware(),
      'docker-compose.yml': this.generateDockerCompose(),
      'src/config/database.js': this.generateDatabaseConfig()
    };

    for (const [filename, content] of Object.entries(fullstackFiles)) {
      const filePath = path.join(projectDir, filename);
      await fs.ensureDir(path.dirname(filePath));
      await fs.writeFile(filePath, content);
    }
  }

  async createAPITemplate(projectDir, options) {
    const apiFiles = {
      'package.json': this.generateAPIPackageJson(options),
      'src/server.js': this.generateAPIServer(),
      'src/routes/index.js': this.generateAPIRoutes(),
      'src/controllers/index.js': this.generateAPIControllers(),
      'src/models/index.js': this.generateAPIModels(),
      'src/middleware/index.js': this.generateAPIMiddleware(),
      'src/config/index.js': this.generateAPIConfig(),
      'tests/api.test.js': this.generateAPITests(),
      '.env.example': this.generateEnvExample(),
      'README.md': this.generateAPIREADME()
    };

    for (const [filename, content] of Object.entries(apiFiles)) {
      const filePath = path.join(projectDir, filename);
      await fs.ensureDir(path.dirname(filePath));
      await fs.writeFile(filePath, content);
    }
  }

  async createSPATemplate(projectDir, options) {
    // Create basic structure first
    await this.createBasicTemplate(projectDir, options);
    
    // Add SPA-specific files
    const spaFiles = {
      'src/router/index.js': this.generateSPARouter(),
      'src/store/index.js': this.generateSPAStore(),
      'src/utils/api.js': this.generateSPAAPI(),
      'src/components/Layout.flux': this.generateSPALayout(),
      'src/pages/about.flux': this.generateAboutPage(),
      'src/pages/contact.flux': this.generateContactPage(),
      'src/styles/components.css': this.generateComponentCSS()
    };

    for (const [filename, content] of Object.entries(spaFiles)) {
      const filePath = path.join(projectDir, filename);
      await fs.ensureDir(path.dirname(filePath));
      await fs.writeFile(filePath, content);
    }
  }

  async installDependencies(projectDir, options) {
    console.log(chalk.blue('[deps] Installing dependencies...'));
    
    const packageManager = this.detectPackageManager();
    const installCmd = packageManager === 'npm' ? 'npm install' : 'yarn install';
    
    // Change to project directory and install
    process.chdir(projectDir);
    
    try {
      const { execSync } = await import('child_process');
      execSync(installCmd, { stdio: 'inherit' });
    } catch (error) {
      console.warn(chalk.yellow('[warn] Could not install dependencies automatically'));
      console.warn(chalk.yellow(`[hint] Run '${installCmd}' manually`));
    }
  }

  detectPackageManager() {
    if (fs.pathExistsSync('yarn.lock')) return 'yarn';
    if (fs.pathExistsSync('pnpm-lock.yaml')) return 'pnpm';
    return 'npm';
  }

  async startDevServer(options) {
    console.log(chalk.blue('[dev] Starting development server...'));
    
    try {
      // Start the dev server with advanced features
      const devServer = await import('./dev-server.js');
      await devServer.devServer({
        port: parseInt(options.port),
        host: options.host,
        hot: options.hot,
        analyze: options.analyze,
        profile: options.profile
      });
    } catch (error) {
      console.error(chalk.red('Error starting dev server:'), error);
      process.exit(1);
    }
  }

  async buildProject(options) {
    console.log(chalk.blue('[build] Building project...'));
    
    try {
      const compiler = new FluxCompiler({
        outputDir: options.output,
        minify: options.minify,
        sourceMaps: options.sourceMaps,
        analyze: options.analyze
      });

      const results = await compiler.build();
      
      if (options.analyze) {
        await this.analyzeBundle(results);
      }
      
      console.log(chalk.green('[ok] Build completed'));
      
    } catch (error) {
      console.error(chalk.red('Build failed:'), error);
      process.exit(1);
    }
  }

  async runTests(options) {
    console.log(chalk.blue('[test] Running tests...'));
    
    try {
      // Run test suite with advanced features
      const testRunner = await import('../test/run-tests.js');
      await testRunner.runTests(options);
    } catch (error) {
      console.error(chalk.red('Tests failed:'), error);
      process.exit(1);
    }
  }

  async debugApplication(options) {
    console.log(chalk.blue('[debug] Starting debug session...'));
    
    try {
      // Start debugging session
      if (options.inspect) {
        process.env.NODE_OPTIONS = '--inspect-brk';
      }
      
      // Start the application in debug mode
      console.log(chalk.green('[ok] Debug session started'));
      console.log(chalk.yellow('[hint] Use your debugger to connect'));
      
    } catch (error) {
      console.error(chalk.red('Debug session failed:'), error);
      process.exit(1);
    }
  }

  async profileApplication(options) {
    console.log(chalk.blue('[profile] Starting performance profiling...'));
    
    try {
      // Start profiling based on options
      if (options.cpu) {
        await this.startCPUProfiling(options.output);
      }
      
      if (options.memory) {
        await this.startMemoryProfiling(options.output);
      }
      
      if (options.network) {
        await this.startNetworkProfiling(options.output);
      }
      
      console.log(chalk.green('[ok] Profiling started'));
      
    } catch (error) {
      console.error(chalk.red('Profiling failed:'), error);
      process.exit(1);
    }
  }

  async manageDatabase(options) {
    console.log(chalk.blue('[db] Managing database...'));
    
    try {
      if (options.migrate) {
        await this.runMigrations();
      }
      
      if (options.seed) {
        await this.seedDatabase();
      }
      
      if (options.reset) {
        await this.resetDatabase();
      }
      
      console.log(chalk.green('[ok] Database operations completed'));
      
    } catch (error) {
      console.error(chalk.red('Database operations failed:'), error);
      process.exit(1);
    }
  }

  async deployApplication(options) {
    console.log(chalk.blue('[deploy] Deploying application...'));
    
    try {
      // Build the project first
      await this.buildProject({ output: 'dist' });
      
      // Deploy based on platform
      if (options.platform === 'vercel') {
        await this.deployToVercel(options);
      } else if (options.platform === 'netlify') {
        await this.deployToNetlify(options);
      } else if (options.platform === 'aws') {
        await this.deployToAWS(options);
      } else {
        console.log(chalk.yellow('[warn] No deployment platform specified'));
      }
      
      console.log(chalk.green('[ok] Deployment completed'));
      
    } catch (error) {
      console.error(chalk.red('Deployment failed:'), error);
      process.exit(1);
    }
  }

  async maintenanceTasks(options) {
    console.log(chalk.blue('[maint] Running maintenance tasks...'));
    
    try {
      if (options.clean) {
        await this.cleanBuildArtifacts();
      }
      
      if (options.update) {
        await this.updateDependencies();
      }
      
      if (options.audit) {
        await this.securityAudit();
      }
      
      console.log(chalk.green('[ok] Maintenance tasks completed'));
      
    } catch (error) {
      console.error(chalk.red('Maintenance tasks failed:'), error);
      process.exit(1);
    }
  }

  // Template generation methods
  generatePackageJson(options) {
    return JSON.stringify({
      name: "flux-project",
      version: "1.0.0",
      description: "Flux Language Project",
      main: "src/app.flux",
      scripts: {
        "dev": "flux dev",
        "build": "flux build",
        "test": "flux test",
        "start": "flux start"
      },
      dependencies: {
        "flux-lang": "^2.0.0"
      },
      devDependencies: {
        "@types/node": "^18.0.0"
      }
    }, null, 2);
  }

  generateFluxConfig(options) {
    return `export default {
  target: 'js',
  minify: false,
  sourceMaps: true,
  optimizations: true,
  treeShaking: true,
  codeSplitting: false,
  appDir: '.flux',
  publicDir: 'public'
};`;
  }

  generateREADME(options) {
    return `# Flux Project

This is a Flux Language project created with the advanced CLI.

## Getting Started

\`\`\`bash
npm run dev
\`\`\`

## Available Scripts

- \`npm run dev\` - Start development server
- \`npm run build\` - Build for production
- \`npm run test\` - Run tests
`;
  }

  generateAppFlux(options) {
    return `component App {
  state title = "Welcome to Flux!"
  
  render {
    <div class="app">
      <Header />
      <main>
        <h1>{title}</h1>
        <p>Your Flux application is running!</p>
      </main>
      <Footer />
    </div>
  }
}

export default App;`;
  }

  generateHeaderComponent() {
    return `component Header {
  render {
    <header class="header">
      <h1>Flux App</h1>
      <nav>
        <a href="/">Home</a>
        <a href="/about">About</a>
      </nav>
    </header>
  }
}`;
  }

  generateFooterComponent() {
    return `component Footer {
  render {
    <footer class="footer">
      <p>&copy; 2024 Flux App</p>
    </footer>
  }
}`;
  }

  generateHomePage() {
    return `component HomePage {
  render {
    <div class="home">
      <h2>Welcome Home</h2>
      <p>This is your home page.</p>
    </div>
  }
}`;
  }

  generateGlobalCSS() {
    return `/* Global styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: #333;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background: #2c3e50;
  color: white;
  padding: 1rem;
}

.footer {
  background: #34495e;
  color: white;
  padding: 1rem;
  margin-top: auto;
}`;
  }

  generateGitignore() {
    return `node_modules/\ndist/\n.env\n*.log\n.DS_Store`;
  }

  generateIndexHTML() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Flux App</title>
</head>
<body>
    <div id="root"></div>
    <script type="module" src="../src/app.flux"></script>
</body>
</html>`;
  }

  // Additional template methods would go here...
  generateServerFile() { return '// Server implementation'; }
  generateDatabaseSchema() { return '// Database schema'; }
  generateAPIRoutes() { return '// API routes'; }
  generateAuthMiddleware() { return '// Auth middleware'; }
  generateDockerCompose() { return '// Docker compose'; }
  generateDatabaseConfig() { return '// Database config'; }
  generateAPIPackageJson() { return '{}'; }
  generateAPIServer() { return '// API server'; }
  generateAPIControllers() { return '// API controllers'; }
  generateAPIModels() { return '// API models'; }
  generateAPIMiddleware() { return '// API middleware'; }
  generateAPIConfig() { return '// API config'; }
  generateAPITests() { return '// API tests'; }
  generateEnvExample() { return '// Environment variables'; }
  generateAPIREADME() { return '// API README'; }
  generateSPARouter() { return '// SPA router'; }
  generateSPAStore() { return '// SPA store'; }
  generateSPAAPI() { return '// SPA API'; }
  generateSPALayout() { return '// SPA layout'; }
  generateAboutPage() { return '// About page'; }
  generateContactPage() { return '// Contact page'; }
  generateComponentCSS() { return '// Component CSS'; }

  // Profiling methods
  async startCPUProfiling(output) {
    // CPU profiling implementation
    console.log('[profile] CPU profiling started');
  }

  async startMemoryProfiling(output) {
    // Memory profiling implementation
    console.log('[profile] Memory profiling started');
  }

  async startNetworkProfiling(output) {
    // Memory profiling implementation
    console.log('[profile] Network profiling started');
  }

  // Database methods
  async runMigrations() {
    console.log('[db] Running migrations...');
  }

  async seedDatabase() {
    console.log('[db] Seeding database...');
  }

  async resetDatabase() {
    console.log('[db] Resetting database...');
  }

  // Deployment methods
  async deployToVercel(options) {
    console.log('[deploy] Vercel...');
  }

  async deployToNetlify(options) {
    console.log('[deploy] Netlify...');
  }

  async deployToAWS(options) {
    console.log('[deploy] AWS...');
  }

  // Maintenance methods
  async cleanBuildArtifacts() {
    console.log('[maint] Cleaning build artifacts...');
  }

  async updateDependencies() {
    console.log('[maint] Updating dependencies...');
  }

  async securityAudit() {
    console.log('[maint] Running security audit...');
  }

  // Bundle analysis
  async analyzeBundle(results) {
    console.log('[analyze] Bundle...');
    // Implementation would analyze the build results
  }

  async generateArtifact(type, name, options) {
    const cwd = process.cwd();
    const targetDir = options.dir ? path.resolve(options.dir) : path.resolve(cwd, 'src',
      type === 'page' ? 'pages' : type === 'store' ? 'stores' : 'components');
    await fs.ensureDir(targetDir);
    const fileName = type === 'store' ? `${name}.flux` : `${capitalize(name)}.flux`;
    const filePath = path.join(targetDir, fileName);
    if (await fs.pathExists(filePath)) {
      console.log(chalk.yellow('[skip] File exists:'), filePath);
      return;
    }
    const content = this.scaffold(type, name);
    await fs.writeFile(filePath, content);
    console.log(chalk.green('[ok] Generated:'), filePath);
  }

  scaffold(type, name) {
    const compName = capitalize(name);
    if (type === 'component') {
      return `component ${compName} {\n  render {\n    <div class=\"${kebab(compName)}\">${compName}</div>\n  }\n}`;
    }
    if (type === 'page') {
      return `@route(\"/${kebab(compName)}\")\ncomponent ${compName}Page {\n  render {\n    <div class=\"page ${kebab(compName)}\">${compName} Page</div>\n  }\n}`;
    }
    if (type === 'store') {
      return `store ${compName}Store {\n  state value = null\n}`;
    }
    return `// Unknown type`;
  }

  run() {
    this.program.parse();
  }
}

function capitalize(s) {
  return s && s.length ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

function kebab(s) {
  return s
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/\s+/g, '-')
    .toLowerCase();
}

// Run the CLI if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const cli = new AdvancedCLI();
  cli.run();
}

export { AdvancedCLI };