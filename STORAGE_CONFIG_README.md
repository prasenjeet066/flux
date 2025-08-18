# Flux Language - Storage & Configuration Systems

This document describes the advanced storage and configuration management systems implemented in Flux Language 2.0.

## 📁 Storage System (`/storage`)

The storage system provides comprehensive file management capabilities with support for multiple storage backends.

### Features

- **Multi-backend Support**: Local filesystem, AWS S3, Google Cloud Storage, Azure Blob Storage
- **File Operations**: Upload, download, delete, list, and serve files
- **Caching**: Built-in caching with TTL and LRU eviction
- **Validation**: File type and size validation
- **Organization**: Structured directory organization for different file types
- **Backup & Restore**: Automated backup and restore capabilities
- **Monitoring**: Health checks and performance metrics

### Directory Structure

```
storage/
├── public/           # Publicly accessible files
│   ├── images/       # Public images
│   ├── css/          # Public CSS files
│   ├── js/           # Public JavaScript files
│   ├── fonts/        # Public font files
│   └── documents/    # Public documents
├── uploads/          # User uploaded files
│   ├── images/       # Uploaded images
│   ├── documents/    # Uploaded documents
│   ├── videos/       # Uploaded videos
│   └── audio/        # Uploaded audio files
└── temp/             # Temporary files (auto-cleanup)
```

### Usage Examples

#### Basic File Operations

```javascript
import { storageManager } from './src/storage/index.js';

// Store a file
const fileInfo = await storageManager.storeFile(file, 'uploads', {
  filename: 'my-file.txt',
  subfolder: 'documents'
});

// Get file information
const file = await storageManager.getFile('my-file.txt', 'uploads');

// List files
const files = await storageManager.listFiles('uploads', 'documents', {
  recursive: true,
  sortBy: 'modifiedAt',
  sortOrder: 'desc'
});

// Delete file
await storageManager.deleteFile('my-file.txt', 'uploads');
```

#### Storage Statistics

```javascript
// Get storage statistics
const stats = await storageManager.getStorageStats();
console.log(`Total files: ${stats.total.files}`);
console.log(`Total size: ${stats.total.size} bytes`);

// Get storage health
const health = await storageManager.getStorageHealth();
console.log(`Status: ${health.status}`);
```

#### File Validation

```javascript
// Validate file before upload
const isValid = await storageManager.validateFile(file);
if (isValid) {
  await storageManager.storeFile(file, 'uploads');
}
```

### Configuration

Storage can be configured through environment variables or configuration files:

```bash
# Local storage
STORAGE_TYPE=local
STORAGE_LOCAL_PATH=./storage
STORAGE_MAX_FILE_SIZE=52428800

# S3 storage
STORAGE_TYPE=s3
S3_BUCKET=my-bucket
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=your-key
S3_SECRET_ACCESS_KEY=your-secret
```

## ⚙️ Configuration System (`/config`)

The configuration system provides centralized configuration management with environment-specific overrides and validation.

### Features

- **Environment-based Configuration**: Development, production, and custom environments
- **Validation**: Automatic configuration validation on startup
- **Environment Variables**: Support for .env files and process.env
- **Watching**: Configuration change detection and reloading
- **Secrets Management**: Secure handling of sensitive configuration
- **Type Safety**: Strong typing and validation

### Configuration Files

#### Main Configuration (`config.js`)

```javascript
export default {
  app: {
    name: 'Flux Application',
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'development'
  },
  server: {
    port: parseInt(process.env.PORT) || 3000,
    host: process.env.HOST || 'localhost'
  },
  database: {
    type: process.env.DB_TYPE || 'postgresql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432
  }
  // ... more configuration
};
```

#### Environment-specific Configuration

```javascript
// development.js
export default {
  app: { debug: true },
  database: { ssl: false },
  logging: { level: 'debug' }
};

// production.js
export default {
  app: { debug: false },
  database: { ssl: true },
  logging: { level: 'info' }
};
```

#### Environment Variables (`.env`)

```bash
# Application
NODE_ENV=development
PORT=3000
HOST=localhost

# Database
DB_TYPE=postgresql
DB_HOST=localhost
DB_PORT=5432
DB_NAME=flux_app_dev
DB_USER=flux_user
DB_PASSWORD=flux_password

# Storage
STORAGE_TYPE=local
STORAGE_LOCAL_PATH=storage
STORAGE_MAX_FILE_SIZE=52428800

# Authentication
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=24h
```

### Usage Examples

#### Basic Configuration Access

```javascript
import { configManager } from './src/config/index.js';

// Get configuration values
const appName = configManager.get('app.name');
const serverPort = configManager.get('server.port', 3000); // with default
const dbConfig = configManager.get('database');

// Set configuration values
configManager.set('app.debug', true);

// Check if configuration is valid
if (configManager.isValid()) {
  console.log('Configuration loaded successfully');
}
```

#### Configuration Watching

```javascript
// Watch for configuration changes
const unsubscribe = configManager.watch('database.host', (oldValue, newValue) => {
  console.log(`Database host changed from ${oldValue} to ${newValue}`);
});

// Later, unsubscribe
unsubscribe();
```

#### Configuration Validation

```javascript
// Validate configuration
try {
  configManager.validate();
  console.log('Configuration is valid');
} catch (error) {
  console.error('Configuration validation failed:', error.message);
}
```

#### Reload Configuration

```javascript
// Reload configuration from files
await configManager.reload();
```

### Database Configuration

The database configuration system provides database-specific settings and connection management:

```javascript
import { databaseConfig } from './src/config/database.config.js';

// Get database configuration
const config = databaseConfig.getConfig();

// Get connection string
const connectionString = databaseConfig.getConnectionString();

// Get Knex.js configuration
const knexConfig = databaseConfig.getKnexConfig();

// Get Sequelize configuration
const sequelizeConfig = databaseConfig.getSequelizeConfig();

// Test database connection
const result = await databaseConfig.testConnection();
if (result.success) {
  console.log('Database connection successful');
}
```

### Storage Configuration

The storage configuration system manages storage-specific settings:

```javascript
import { storageConfig } from './src/config/storage.config.js';

// Initialize storage
await storageConfig.initialize();

// Get storage manager
const storageManager = storageConfig.getStorageManager();

// Get storage health
const health = await storageConfig.getStorageHealth();

// Test storage connection
const result = await storageConfig.testConnection();
```

## 🚀 Integration with Development Server

The development server now integrates with both systems:

```bash
# Start development server with storage and config
npm run dev

# The server will:
# 1. Load configuration from /config
# 2. Initialize storage system
# 3. Serve files from /storage/public
# 4. Handle file uploads to /storage/uploads
```

### Storage File Serving

Files in the storage system are automatically served at `/storage/*` URLs:

- `/storage/public/images/logo.png` → Serves from `storage/public/images/logo.png`
- `/storage/uploads/documents/report.pdf` → Serves from `storage/uploads/documents/report.pdf`

### Configuration Integration

The development server automatically:

- Loads configuration based on `NODE_ENV`
- Applies environment-specific settings
- Validates configuration on startup
- Provides configuration through the app

## 🔧 Advanced Features

### Storage Backups

```javascript
// Create backup
const backup = await storageManager.createBackup('./backups/storage-backup');

// Restore from backup
await storageManager.restoreFromBackup('./backups/storage-backup');
```

### Configuration Search

```javascript
// Search configuration
const results = configManager.search('database');
console.log('Found database-related config:', results);
```

### Configuration Diff

```javascript
// Compare configurations
const diff = configManager.diff(otherConfig);
console.log('Configuration differences:', diff);
```

### Storage Cleanup

```javascript
// Clean up temporary files
const cleanup = await storageManager.cleanupTempFiles(24 * 60 * 60 * 1000); // 24 hours
console.log(`Cleaned ${cleanup.cleanedCount} temporary files`);
```

## 📊 Monitoring and Health Checks

### Storage Health

```javascript
// Check storage health
const health = await storageManager.getStorageHealth();
console.log(`Storage Status: ${health.status}`);
console.log(`Storage Stats:`, health.stats);
```

### Configuration Health

```javascript
// Check configuration health
if (configManager.isValid()) {
  console.log('Configuration is healthy');
} else {
  console.log('Configuration has issues');
}
```

## 🛠️ Development Workflow

1. **Setup**: Copy `.env.example` to `.env` and configure your environment
2. **Configuration**: Modify configuration files in `/config` as needed
3. **Storage**: Use the storage system for file management
4. **Development**: Start the dev server with `npm run dev`
5. **Testing**: Use the advanced test runner with `npm run test:advanced`

## 🔒 Security Considerations

- **Secrets**: Never commit `.env` files or secrets to version control
- **File Validation**: Always validate uploaded files for type and size
- **Access Control**: Implement proper access control for storage endpoints
- **Configuration**: Use environment variables for sensitive configuration
- **Backups**: Regularly backup both configuration and storage data

## 📚 API Reference

For detailed API documentation, see:
- [Storage API](./src/storage/index.js)
- [Configuration API](./src/config/index.js)
- [Database Config API](./src/config/database.config.js)
- [Storage Config API](./src/config/storage.config.js)

## 🤝 Contributing

When adding new configuration options or storage features:

1. Update the main configuration file
2. Add environment variable support
3. Update the `.env.example` file
4. Add validation rules
5. Update this documentation
6. Add tests for new functionality

---

This storage and configuration system provides a robust foundation for Flux applications, enabling scalable file management and flexible configuration across different environments.