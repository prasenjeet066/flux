// Configuration management system for Flux applications
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ConfigManager {
  constructor(options = {}) {
    this.options = {
      configDir: options.configDir || 'src/config',
      environment: options.environment || process.env.NODE_ENV || 'development',
      configFile: options.configFile || 'config.js',
      secretsFile: options.secretsFile || '.env',
      validateOnLoad: options.validateOnLoad !== false,
      cache: options.cache !== false,
      ...options
    };
    
    this.config = new Map();
    this.secrets = new Map();
    this.loaded = false;
    this.watchers = new Map();
    
    this.loadConfiguration();
  }

  async loadConfiguration() {
    try {
      // Load environment variables
      await this.loadEnvironmentVariables();
      
      // Load main configuration
      await this.loadMainConfig();
      
      // Load environment-specific configuration
      await this.loadEnvironmentConfig();
      
      // Load secrets
      await this.loadSecrets();
      
      // Validate configuration
      if (this.options.validateOnLoad) {
        await this.validateConfiguration();
      }
      
      this.loaded = true;
      console.log('✅ Configuration loaded successfully');
      
    } catch (error) {
      console.error('❌ Failed to load configuration:', error);
      throw error;
    }
  }

  async loadEnvironmentVariables() {
    // Load from .env file if it exists
    const envPath = path.resolve(this.options.secretsFile);
    if (await fs.pathExists(envPath)) {
      try {
        const envContent = await fs.readFile(envPath, 'utf-8');
        const envVars = this.parseEnvFile(envContent);
        
        for (const [key, value] of Object.entries(envVars)) {
          process.env[key] = value;
        }
      } catch (error) {
        console.warn('Warning: Could not load .env file:', error.message);
      }
    }
  }

  parseEnvFile(content) {
    const envVars = {};
    const lines = content.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          envVars[key.trim()] = valueParts.join('=').trim();
        }
      }
    }
    
    return envVars;
  }

  async loadMainConfig() {
    const configPath = path.resolve(this.options.configDir, this.options.configFile);
    
    if (await fs.pathExists(configPath)) {
      try {
        const config = await import(configPath);
        const configData = config.default || config;
        
        // Merge with environment variables
        this.config.set('main', this.interpolateEnvVars(configData));
      } catch (error) {
        console.warn('Warning: Could not load main config:', error.message);
        this.config.set('main', {});
      }
    } else {
      this.config.set('main', {});
    }
  }

  async loadEnvironmentConfig() {
    const envConfigPath = path.resolve(this.options.configDir, `${this.options.environment}.js`);
    
    if (await fs.pathExists(envConfigPath)) {
      try {
        const config = await import(envConfigPath);
        const configData = config.default || config;
        
        // Merge with main config
        const mainConfig = this.config.get('main') || {};
        const envConfig = this.interpolateEnvVars(configData);
        
        this.config.set('environment', this.mergeConfigs(mainConfig, envConfig));
      } catch (error) {
        console.warn(`Warning: Could not load ${this.options.environment} config:`, error.message);
        this.config.set('environment', this.config.get('main') || {});
      }
    } else {
      this.config.set('environment', this.config.get('main') || {});
    }
  }

  async loadSecrets() {
    const secretsPath = path.resolve(this.options.configDir, 'secrets.js');
    
    if (await fs.pathExists(secretsPath)) {
      try {
        const secrets = await import(secretsPath);
        const secretsData = secrets.default || secrets;
        
        this.secrets = new Map(Object.entries(secretsData));
      } catch (error) {
        console.warn('Warning: Could not load secrets:', error.message);
      }
    }
  }

  interpolateEnvVars(config) {
    if (typeof config === 'string') {
      return config.replace(/\$\{([^}]+)\}/g, (match, key) => {
        return process.env[key] || match;
      });
    }
    
    if (Array.isArray(config)) {
      return config.map(item => this.interpolateEnvVars(item));
    }
    
    if (typeof config === 'object' && config !== null) {
      const result = {};
      for (const [key, value] of Object.entries(config)) {
        result[key] = this.interpolateEnvVars(value);
      }
      return result;
    }
    
    return config;
  }

  mergeConfigs(base, override) {
    const result = { ...base };
    
    for (const [key, value] of Object.entries(override)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        result[key] = this.mergeConfigs(result[key] || {}, value);
      } else {
        result[key] = value;
      }
    }
    
    return result;
  }

  async validateConfiguration() {
    const config = this.config.get('environment');
    
    // Validate required fields
    const required = ['app', 'server', 'database'];
    for (const field of required) {
      if (!config[field]) {
        throw new Error(`Missing required configuration: ${field}`);
      }
    }
    
    // Validate specific configurations
    await this.validateAppConfig(config.app);
    await this.validateServerConfig(config.server);
    await this.validateDatabaseConfig(config.database);
    
    console.log('✅ Configuration validation passed');
  }

  async validateAppConfig(appConfig) {
    if (!appConfig.name) {
      throw new Error('App name is required');
    }
    
    if (!appConfig.version) {
      throw new Error('App version is required');
    }
  }

  async validateServerConfig(serverConfig) {
    if (!serverConfig.port) {
      throw new Error('Server port is required');
    }
    
    if (serverConfig.port < 1 || serverConfig.port > 65535) {
      throw new Error('Server port must be between 1 and 65535');
    }
  }

  async validateDatabaseConfig(dbConfig) {
    if (!dbConfig.host) {
      throw new Error('Database host is required');
    }
    
    if (!dbConfig.port) {
      throw new Error('Database port is required');
    }
    
    if (!dbConfig.database) {
      throw new Error('Database name is required');
    }
  }

  // Configuration access methods
  get(key, defaultValue = undefined) {
    const config = this.config.get('environment');
    return this.getNestedValue(config, key, defaultValue);
  }

  getNestedValue(obj, path, defaultValue) {
    const keys = path.split('.');
    let current = obj;
    
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return defaultValue;
      }
    }
    
    return current !== undefined ? current : defaultValue;
  }

  set(key, value) {
    const config = this.config.get('environment');
    this.setNestedValue(config, key, value);
  }

  setNestedValue(obj, path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    let current = obj;
    
    for (const key of keys) {
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }
    
    current[lastKey] = value;
  }

  // Secret access
  getSecret(key, defaultValue = undefined) {
    return this.secrets.get(key) || defaultValue;
  }

  setSecret(key, value) {
    this.secrets.set(key, value);
  }

  // Configuration watching
  watch(key, callback) {
    if (!this.watchers.has(key)) {
      this.watchers.set(key, new Set());
    }
    this.watchers.get(key).add(callback);
    
    return () => {
      const watchers = this.watchers.get(key);
      if (watchers) {
        watchers.delete(callback);
      }
    };
  }

  notifyWatchers(key, oldValue, newValue) {
    const watchers = this.watchers.get(key);
    if (watchers) {
      for (const callback of watchers) {
        try {
          callback(oldValue, newValue);
        } catch (error) {
          console.error('Error in config watcher:', error);
        }
      }
    }
  }

  // Configuration reloading
  async reload() {
    this.loaded = false;
    this.config.clear();
    await this.loadConfiguration();
  }

  // Configuration export
  export() {
    const config = this.config.get('environment');
    return JSON.parse(JSON.stringify(config));
  }

  // Configuration validation
  isValid() {
    return this.loaded;
  }

  // Get all configuration keys
  getKeys() {
    const config = this.config.get('environment');
    return this.getAllKeys(config);
  }

  getAllKeys(obj, prefix = '') {
    const keys = [];
    
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        keys.push(...this.getAllKeys(value, fullKey));
      } else {
        keys.push(fullKey);
      }
    }
    
    return keys;
  }

  // Configuration search
  search(query) {
    const config = this.config.get('environment');
    const results = [];
    
    for (const key of this.getKeys()) {
      if (key.toLowerCase().includes(query.toLowerCase())) {
        results.push({
          key,
          value: this.get(key)
        });
      }
    }
    
    return results;
  }

  // Configuration diff
  diff(otherConfig) {
    const currentConfig = this.config.get('environment');
    const diff = {
      added: {},
      modified: {},
      removed: {}
    };
    
    // Find added and modified
    for (const [key, value] of Object.entries(otherConfig)) {
      if (!(key in currentConfig)) {
        diff.added[key] = value;
      } else if (JSON.stringify(currentConfig[key]) !== JSON.stringify(value)) {
        diff.modified[key] = {
          old: currentConfig[key],
          new: value
        };
      }
    }
    
    // Find removed
    for (const key of Object.keys(currentConfig)) {
      if (!(key in otherConfig)) {
        diff.removed[key] = currentConfig[key];
      }
    }
    
    return diff;
  }
}

// Create default instance
export const configManager = new ConfigManager();

// Export the class and instance
export { ConfigManager };
export default configManager;