// flux-core/src/cli/dev-server.js
// Development server with hot reloading

import { createServer } from 'http';
import { createReadStream } from 'fs';
import { stat, readFile, readdir, access } from 'fs/promises';
import { extname, join, resolve } from 'path';
import fs from 'fs-extra';
import { FluxCompiler } from '../compiler/index.js';
import { configManager } from '../config/index.js';
import { storageManager } from '../storage/index.js';
import chalk from 'chalk';

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject'
};

export async function devServer(options = {}) {
  const {
    port = 3000,
    host = 'localhost',
    root = process.cwd(),
    hot = false,
    analyze = false,
    profile = false
  } = options;
  
  console.log(chalk.blue('🚀 Starting Flux Development Server...'));
  
  try {
    // Initialize configuration system only if config file exists
    const configPath = path.resolve(root, 'flux.config.js');
    if (await fs.pathExists(configPath)) {
      console.log(chalk.blue('📋 Loading configuration...'));
      await configManager.loadConfiguration();
    } else {
      console.log(chalk.yellow('⚠️  No flux.config.js found, using default configuration'));
    }
    
    // Initialize storage system only if needed
    try {
      console.log(chalk.blue('💾 Initializing storage system...'));
      await storageManager.initializeStorage();
    } catch (error) {
      console.log(chalk.yellow('⚠️  Storage system not available, continuing without storage'));
    }
    
    // Get configuration values (use defaults if no config loaded)
    const configPort = configManager.loaded ? configManager.get('server.port', port) : port;
    const configHost = configManager.loaded ? configManager.get('server.host', host) : host;
    const finalPort = port || configPort;
    const finalHost = host || configHost;
    
    const compiler = new FluxCompiler({
      target: 'js',
      minify: false,
      sourceMaps: true,
      optimizations: false,
      watchMode: true
    });
  
  // File watcher for hot reloading
  const watchedFiles = new Set();
  const fileWatchers = new Map();
  
  // WebSocket connections for live reload
  const connections = new Set();
  
  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url, `http://${finalHost}:${finalPort}`);
      let filePath = url.pathname;
      
      // Handle root path
      if (filePath === '/') {
        filePath = '/index.html';
      }
      
      // Remove leading slash
      filePath = filePath.substring(1);
      
      // Security: prevent directory traversal
      if (filePath.includes('..')) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
      }
      
      const fullPath = resolve(root, filePath);
      
      try {
        const stats = await stat(fullPath);
        
        if (stats.isDirectory()) {
          // Serve index.html for directories
          const indexPath = join(fullPath, 'index.html');
          try {
            await access(indexPath);
            await serveFile(indexPath, res);
          } catch {
            // Generate directory listing
            await serveDirectoryListing(fullPath, res, filePath);
          }
        } else {
          await serveFile(fullPath, res);
        }
      } catch (error) {
        // Try to serve from storage if file not found
        if (filePath.startsWith('storage/')) {
          try {
            await serveStorageFile(filePath, res);
            return;
          } catch (storageError) {
            console.log(`Storage file not found: ${filePath}`);
          }
        }
        
        // File not found, try to compile Flux files
        if (filePath.endsWith('.js') && !filePath.includes('node_modules')) {
          const fluxPath = filePath.replace(/\.js$/, '.flux');
          const fullFluxPath = resolve(root, fluxPath);
          
          try {
            await access(fullFluxPath);
            await compileAndServeFlux(fullFluxPath, res, compiler);
            return;
          } catch {
            // Flux file doesn't exist
          }
        }
        
        // Try to serve from public directory
        const publicPath = resolve(root, 'public', filePath);
        try {
          await access(publicPath);
          await serveFile(publicPath, res);
        } catch {
          // 404
          await serve404(res, filePath);
        }
      }
    } catch (error) {
      console.error('Server error:', error);
      res.writeHead(500);
      res.end('Internal Server Error');
    }
  });
  
  // WebSocket server for live reload
  server.on('upgrade', (request, socket, head) => {
    if (request.url === '/__flux_live_reload') {
      const ws = new WebSocket();
      ws.setSocket(socket, request, head);
      
      connections.add(ws);
      
      ws.on('close', () => {
        connections.delete(ws);
      });
      
      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          if (data.type === 'ping') {
            ws.send(JSON.stringify({ type: 'pong' }));
          }
        } catch (error) {
          console.error('WebSocket message error:', error);
        }
      });
    }
  });
  
  server.listen(finalPort, finalHost, () => {
    console.log(chalk.green(`🚀 Flux dev server running at http://${finalHost}:${finalPort}`));
    console.log(chalk.cyan(`📁 Serving from: ${root}`));
    console.log(chalk.blue(`💾 Storage: ${configManager.loaded ? configManager.get('storage.type', 'local') : 'none'}`));
    console.log(chalk.yellow(`⚡ Hot reload: ${hot ? 'enabled' : 'disabled'}`));
    console.log(chalk.gray(`Press Ctrl+C to stop`));
  });
  
  // Setup file watching
  await setupFileWatching(root, compiler, connections);
  
  return server;
  
  } catch (error) {
    console.error(chalk.red('❌ Failed to start development server:'), error);
    throw error;
  }
}

async function serveFile(filePath, res) {
  const ext = extname(filePath);
  const mimeType = MIME_TYPES[ext] || 'application/octet-stream';
  
  res.setHeader('Content-Type', mimeType);
  res.setHeader('Cache-Control', 'no-cache');
  
  const stream = createReadStream(filePath);
  stream.pipe(res);
  
  stream.on('error', (error) => {
    console.error('Error reading file:', error);
    res.writeHead(500);
    res.end('Error reading file');
  });
}

async function serveDirectoryListing(dirPath, res, urlPath) {
  try {
    const files = await readdir(dirPath);
    
    res.setHeader('Content-Type', 'text/html');
    res.writeHead(200);
    
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Directory: ${urlPath}</title>
    <style>
        body { font-family: monospace; margin: 20px; }
        .file { margin: 5px 0; }
        .dir { color: #0066cc; font-weight: bold; }
        .file a { color: #333; text-decoration: none; }
        .file a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <h2>Directory: ${urlPath}</h2>
    <div class="files">
        ${files.map(file => {
          const isDir = file.includes('.') === false;
          const className = isDir ? 'dir' : 'file';
          const href = isDir ? `${file}/` : file;
          return `<div class="${className}"><a href="${href}">${file}</a></div>`;
        }).join('')}
    </div>
</body>
</html>`;
    
    res.end(html);
  } catch (error) {
    res.writeHead(500);
    res.end('Error reading directory');
  }
}

async function serveStorageFile(filePath, res) {
  try {
    // Remove 'storage/' prefix to get the relative path
    const relativePath = filePath.replace(/^storage\//, '');
    
    // Get file info from storage manager
    const fileInfo = await storageManager.servePublicFile(relativePath);
    
    // Set appropriate headers
    res.writeHead(200, {
      'Content-Type': fileInfo.mimeType,
      'Content-Length': fileInfo.stats.size,
      'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
    });
    
    // Pipe the file stream to response
    fileInfo.stream.pipe(res);
    
    console.log(chalk.blue(`📁 Served storage file: ${filePath}`));
  } catch (error) {
    console.error(chalk.red(`❌ Storage file error: ${error.message}`));
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('File not found');
  }
}

async function compileAndServeFlux(fluxPath, res, compiler) {
  try {
    const result = await compiler.compileFile(fluxPath);
    
    if (!result) {
      res.writeHead(500);
      res.end('Compilation failed');
      return;
    }
    
    res.setHeader('Content-Type', 'text/javascript');
    res.setHeader('Cache-Control', 'no-cache');
    res.writeHead(200);
    res.end(result.output);
    
    console.log(chalk.green(`✅ Compiled: ${fluxPath}`));
  } catch (error) {
    console.error(chalk.red(`❌ Compilation error: ${error.message}`));
    res.writeHead(500);
    res.end(`Compilation error: ${error.message}`);
  }
}

async function serve404(res, filePath) {
  res.setHeader('Content-Type', 'text/html');
  res.writeHead(404);
  
  const html = `
<!DOCTYPE html>
<html>
<head>
    <title>404 - File Not Found</title>
    <style>
        body { font-family: monospace; text-align: center; margin: 50px; }
        .error { color: #e74c3c; font-size: 72px; margin: 20px; }
        .message { color: #7f8c8d; font-size: 18px; }
    </style>
</head>
<body>
    <div class="error">404</div>
    <div class="message">File not found: ${filePath}</div>
</body>
</html>`;
  
  res.end(html);
}

async function setupFileWatching(root, compiler, connections) {
  // Simple file watching using polling
  // In production, you'd use chokidar or similar
  
  const watchInterval = setInterval(async () => {
    try {
      // Check for changes in common directories
      const dirs = ['src', 'public', 'pages', 'components', 'stores'];
      
      for (const dir of dirs) {
        const dirPath = join(root, dir);
        try {
          await access(dirPath);
          // In a real implementation, you'd check file modification times
          // and trigger recompilation when files change
        } catch {
          // Directory doesn't exist, skip
        }
      }
    } catch (error) {
      console.error('File watching error:', error);
    }
  }, 1000);
  
  // Cleanup on process exit
  process.on('SIGINT', () => {
    clearInterval(watchInterval);
    process.exit(0);
  });
}

// Simple WebSocket implementation for live reload
class WebSocket {
  constructor() {
    this.socket = null;
  }
  
  setSocket(socket, request, head) {
    this.socket = socket;
    
    // Send WebSocket handshake
    const key = request.headers['sec-websocket-key'];
    const accept = this.generateAccept(key);
    
    const response = [
      'HTTP/1.1 101 Switching Protocols',
      'Upgrade: websocket',
      'Connection: Upgrade',
      `Sec-WebSocket-Accept: ${accept}`,
      '',
      ''
    ].join('\r\n');
    
    socket.write(response);
    
    socket.on('data', (data) => {
      this.handleMessage(data);
    });
    
    socket.on('close', () => {
      this.socket = null;
    });
  }
  
  generateAccept(key) {
    const crypto = require('crypto');
    const magic = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
    const hash = crypto.createHash('sha1').update(key + magic).digest('base64');
    return hash;
  }
  
  handleMessage(data) {
    // Simple WebSocket frame parsing
    if (data.length < 2) return;
    
    const opcode = data[0] & 0x0F;
    const payloadLength = data[1] & 0x7F;
    
    if (opcode === 8) { // Close frame
      this.socket.end();
      return;
    }
    
    if (opcode === 1 && payloadLength > 0) { // Text frame
      const payload = data.slice(2, 2 + payloadLength);
      const message = payload.toString('utf8');
      
      this.emit('message', message);
    }
  }
  
  send(data) {
    if (this.socket && !this.socket.destroyed) {
      const message = typeof data === 'string' ? data : JSON.stringify(data);
      const frame = this.createFrame(message);
      this.socket.write(frame);
    }
  }
  
  createFrame(payload) {
    const length = Buffer.byteLength(payload);
    const frame = Buffer.alloc(2 + length);
    
    frame[0] = 0x81; // FIN + text frame
    frame[1] = length;
    frame.write(payload, 2);
    
    return frame;
  }
  
  on(event, callback) {
    if (event === 'message') {
      this.messageCallback = callback;
    } else if (event === 'close') {
      this.closeCallback = callback;
    }
  }
  
  emit(event, data) {
    if (event === 'message' && this.messageCallback) {
      this.messageCallback(data);
    } else if (event === 'close' && this.closeCallback) {
      this.closeCallback();
    }
  }
}