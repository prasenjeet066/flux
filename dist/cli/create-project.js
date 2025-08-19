// src/cli/create-project.js
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var TEMPLATES = {
  default: {
    name: "Default Template",
    description: "Basic Flux application with routing and state management",
    files: {
      "flux.config.js": `export default {
  name: '{{projectName}}',
  version: '1.0.0',
  entry: 'src/app.flux',
  output: 'dist',
  target: 'js',
  minify: false,
  sourceMaps: true,
  appDir: '.flux',
  publicDir: 'public'
};`,
      "src/app.flux": `component App {
  render {
    <div class="app">
      <header class="header">
        <h1>{{projectName}}</h1>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
        </nav>
      </header>
      
      <main class="main">
        <Router>
          <Route path="/" component={HomePage} />
          <Route path="/about" component={AboutPage} />
        </Router>
      </main>
    </div>
  }
}

styles App {
  .app {
    min-height: 100vh
    display: flex
    flex-direction: column
  }
  
  .header {
    background: #2c3e50
    color: white
    padding: 1rem
    display: flex
    justify-content: space-between
    align-items: center
    
    h1 {
      margin: 0
      font-size: 1.5rem
    }
    
    nav {
      display: flex
      gap: 1rem
      
      a {
        color: white
        text-decoration: none
        padding: 0.5rem 1rem
        border-radius: 4px
        transition: background-color 0.2s
        
        &:hover {
          background: rgba(255, 255, 255, 0.1)
        }
      }
    }
  }
  
  .main {
    flex: 1
    padding: 2rem
  }
}

// Mount the app
mount(App, '#root')`,
      "src/pages/home.flux": `@route("/")
component HomePage {
  state message = "Welcome to {{projectName}}!"
  
  render {
    <div class="home">
      <h2>{message}</h2>
      <p>This is a Flux application. Start building something amazing!</p>
      <Counter />
    </div>
  }
}

styles HomePage {
  .home {
    text-align: center
    max-width: 600px
    margin: 0 auto
    
    h2 {
      color: #2c3e50
      margin-bottom: 1rem
    }
    
    p {
      color: #7f8c8d
      margin-bottom: 2rem
    }
  }
}`,
      "src/pages/about.flux": `@route("/about")
component AboutPage {
  render {
    <div class="about">
      <h2>About {{projectName}}</h2>
      <p>This is an example Flux application demonstrating the language's features.</p>
      <ul>
        <li>Component-based architecture</li>
        <li>Built-in routing</li>
        <li>Reactive state management</li>
        <li>Scoped styling</li>
      </ul>
    </div>
  }
}

styles AboutPage {
  .about {
    max-width: 600px
    margin: 0 auto
    
    h2 {
      color: #2c3e50
      margin-bottom: 1rem
    }
    
    p {
      color: #7f8c8d
      margin-bottom: 1rem
    }
    
    ul {
      text-align: left
      color: #34495e
      
      li {
        margin-bottom: 0.5rem
      }
    }
  }
}`,
      "src/components/Counter.flux": `component Counter {
  state count = 0
  
  method increment() {
    count += 1
  }
  
  method decrement() {
    count -= 1
  }
  
  render {
    <div class="counter">
      <h3>Counter: {count}</h3>
      <div class="buttons">
        <button @click={decrement}>-</button>
        <button @click={increment}>+</button>
      </div>
    </div>
  }
}

styles Counter {
  .counter {
    text-align: center
    padding: 1rem
    border: 1px solid #ddd
    border-radius: 8px
    background: white
    
    h3 {
      margin: 0 0 1rem 0
      color: #2c3e50
    }
    
    .buttons {
      display: flex
      gap: 0.5rem
      justify-content: center
      
      button {
        padding: 0.5rem 1rem
        border: none
        border-radius: 4px
        background: #3498db
        color: white
        cursor: pointer
        font-size: 1.2rem
        min-width: 40px
        
        &:hover {
          background: #2980b9
        }
        
        &:active {
          transform: translateY(1px)
        }
      }
    }
  }
}`,
      "src/stores/AppStore.flux": `store AppStore {
  state theme = "light"
  state user = null
  
  action toggleTheme() {
    theme = theme === "light" ? "dark" : "light"
  }
  
  action setUser(userData) {
    user = userData
  }
  
  computed isLoggedIn() {
    return user !== null
  }
  
  computed greeting() {
    return user ? \`Hello, \${user.name}!\` : "Welcome, guest!"
  }
}`,
      ".flux/index.html": `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{projectName}}</title>
    <style>
        body {
            margin: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f5f5f5;
        }
    </style>
</head>
<body>
    <div id="root"></div>
    <script type="module" src="../src/app.flux"></script>
</body>
</html>`,
      "README.md": `# {{projectName}}

A Flux application.

## Development

\`\`\`bash
# Start development server
flux dev

# Build for production
flux build
\`\`\`

## Project Structure

- \`src/\` - Source code
  - \`app.flux\` - Main application component
  - \`pages/\` - Route components
  - \`components/\` - Reusable components
  - \`stores/\` - State management
- \`.flux/\` - HTML shell and app entry
- \`public/\` - Static assets (images, fonts, etc.)
- \`dist/\` - Build output

## Learn More

- [Flux Documentation](https://flux-lang.dev)
- [Flux Examples](https://github.com/flux-lang/examples)
`
    }
  },
  minimal: {
    name: "Minimal Template",
    description: "Simple Flux application with basic structure",
    files: {
      "flux.config.js": `export default {
  name: '{{projectName}}',
  entry: 'src/app.flux',
  output: 'dist',
  appDir: '.flux',
  publicDir: 'public'
};`,
      "src/app.flux": `component App {
  state message = "Hello, Flux!"
  
  method updateMessage() {
    message = "Hello, {{projectName}}!"
  }
  
  render {
    <div>
      <h1>{message}</h1>
      <button @click={updateMessage}>Update Message</button>
    </div>
  }
}

mount(App, '#root')`,
      ".flux/index.html": `<!DOCTYPE html>
<html>
<head>
    <title>{{projectName}}</title>
</head>
<body>
    <div id="root"></div>
    <script type="module" src="../src/app.flux"></script>
</body>
</html>`
    }
  }
};
async function createProject(projectName, templateName = "default") {
  const template = TEMPLATES[templateName];
  if (!template) {
    throw new Error(`Unknown template: ${templateName}. Available templates: ${Object.keys(TEMPLATES).join(", ")}`);
  }
  const projectDir = path.resolve(process.cwd(), projectName);
  if (await fs.pathExists(projectDir)) {
    throw new Error(`Directory ${projectName} already exists`);
  }
  await fs.ensureDir(projectDir);
  console.log(`Creating project with template: ${template.name}`);
  console.log(template.description);
  for (const [filePath, content] of Object.entries(template.files)) {
    const fullPath = path.join(projectDir, filePath);
    const dir = path.dirname(fullPath);
    await fs.ensureDir(dir);
    const processedContent = content.replace(/\{\{projectName\}\}/g, projectName);
    await fs.writeFile(fullPath, processedContent);
    console.log(`Created: ${filePath}`);
  }
  const packageJson = {
    name: projectName.toLowerCase().replace(/\s+/g, "-"),
    version: "1.0.0",
    description: `A Flux application: ${projectName}`,
    type: "module",
    scripts: {
      dev: "flux dev",
      build: "flux build",
      start: "flux dev"
    },
    dependencies: {
      "flux-lang": "^1.0.0"
    }
  };
  await fs.writeFile(
    path.join(projectDir, "package.json"),
    JSON.stringify(packageJson, null, 2)
  );
  console.log("Created: package.json");
  const gitignore = `node_modules/
dist/
.flux-cache/
*.log
.DS_Store
`;
  await fs.writeFile(path.join(projectDir, ".gitignore"), gitignore);
  console.log("Created: .gitignore");
  console.log(`
[ok] Project created successfully in ${projectDir}`);
  console.log("\nNext steps:");
  console.log(`  cd ${projectName}`);
  console.log("  npm install");
  console.log("  flux dev");
}
export {
  createProject
};
//# sourceMappingURL=create-project.js.map
