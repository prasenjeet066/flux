// Main Flux application component
import { configManager } from './config/index.js';
import { storageManager } from './storage/index.js';

component App {
  state config = null
  state storageStats = null
  state loading = true
  state error = null
  
  async componentDidMount() {
    try {
      // Load configuration
      this.config = configManager.export();
      
      // Get storage statistics
      this.storageStats = await storageManager.getStorageStats();
      
      this.loading = false;
    } catch (error) {
      this.error = error.message;
      this.loading = false;
    }
  }
  
  render {
    <div class="app">
      <Header />
      
      <main class="main-content">
        {this.loading ? (
          <div class="loading">
            <h2>Loading Flux Application...</h2>
            <p>Initializing configuration and storage systems...</p>
          </div>
        ) : this.error ? (
          <div class="error">
            <h2>Error Loading Application</h2>
            <p>{this.error}</p>
          </div>
        ) : (
          <div class="dashboard">
            <h1>Welcome to Flux Application</h1>
            
            <div class="config-section">
              <h2>Configuration</h2>
              <div class="config-grid">
                <div class="config-item">
                  <strong>App Name:</strong> {this.config.app.name}
                </div>
                <div class="config-item">
                  <strong>Version:</strong> {this.config.app.version}
                </div>
                <div class="config-item">
                  <strong>Environment:</strong> {this.config.app.environment}
                </div>
                <div class="config-item">
                  <strong>Server Port:</strong> {this.config.server.port}
                </div>
                <div class="config-item">
                  <strong>Database Type:</strong> {this.config.database.type}
                </div>
                <div class="config-item">
                  <strong>Storage Type:</strong> {this.config.storage.type}
                </div>
              </div>
            </div>
            
            <div class="storage-section">
              <h2>Storage Statistics</h2>
              <div class="storage-grid">
                <div class="storage-item">
                  <strong>Public Files:</strong> {this.storageStats.public.files}
                </div>
                <div class="storage-item">
                  <strong>Upload Files:</strong> {this.storageStats.uploads.files}
                </div>
                <div class="storage-item">
                  <strong>Total Size:</strong> {this.formatBytes(this.storageStats.total.size)}
                </div>
                <div class="storage-item">
                  <strong>Cache Hit Rate:</strong> {this.storageStats.cache?.hitRate || 'N/A'}
                </div>
              </div>
            </div>
            
            <div class="actions-section">
              <h2>Actions</h2>
              <div class="action-buttons">
                <button @click={this.uploadFile} class="btn btn-primary">
                  Upload File
                </button>
                <button @click={this.listFiles} class="btn btn-secondary">
                  List Files
                </button>
                <button @click={this.getConfig} class="btn btn-info">
                  Get Config
                </button>
                <button @click={this.getStorageHealth} class="btn btn-success">
                  Storage Health
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  }
  
  async uploadFile() {
    try {
      // Create a sample file for demonstration
      const sampleFile = {
        name: 'sample.txt',
        path: '/tmp/sample.txt',
        mimetype: 'text/plain',
        size: 1024
      };
      
      const result = await storageManager.storeFile(sampleFile, 'uploads', {
        filename: `sample_${Date.now()}.txt`,
        subfolder: 'examples'
      });
      
      alert(`File uploaded successfully: ${result.filename}`);
      
      // Refresh storage stats
      this.storageStats = await storageManager.getStorageStats();
    } catch (error) {
      alert(`Upload failed: ${error.message}`);
    }
  }
  
  async listFiles() {
    try {
      const files = await storageManager.listFiles('uploads', '', {
        recursive: true,
        sortBy: 'modifiedAt',
        sortOrder: 'desc'
      });
      
      if (files.length === 0) {
        alert('No files found in uploads directory');
      } else {
        const fileList = files.slice(0, 5).map(f => f.name).join('\n');
        alert(`Recent files:\n${fileList}${files.length > 5 ? '\n... and more' : ''}`);
      }
    } catch (error) {
      alert(`Failed to list files: ${error.message}`);
    }
  }
  
  getConfig() {
    const config = configManager.export();
    const configStr = JSON.stringify(config, null, 2);
    alert(`Current Configuration:\n${configStr}`);
  }
  
  async getStorageHealth() {
    try {
      const health = await storageManager.getStorageHealth();
      alert(`Storage Health: ${health.status}\n${health.message}`);
    } catch (error) {
      alert(`Health check failed: ${error.message}`);
    }
  }
  
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

component Header {
  render {
    <header class="header">
      <div class="header-content">
        <h1 class="logo">Flux App</h1>
        <nav class="nav">
          <a href="/" class="nav-link">Home</a>
          <a href="/config" class="nav-link">Config</a>
          <a href="/storage" class="nav-link">Storage</a>
          <a href="/docs" class="nav-link">Docs</a>
        </nav>
      </div>
    </header>
  }
}

component Footer {
  render {
    <footer class="footer">
      <div class="footer-content">
        <p>&copy; 2024 Flux Application. Built with the Flux Language.</p>
        <div class="footer-links">
          <a href="/about">About</a>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
        </div>
      </div>
    </footer>
  }
}

export default App;