// Storage configuration and management
import { configManager } from './index.js';
import { StorageManager } from '../storage/index.js';

class StorageConfig {
  constructor() {
    this.config = configManager.get('storage');
    this.storageManager = null;
    this.initialized = false;
  }

  // Get storage configuration
  getConfig() {
    return this.config;
  }

  // Initialize storage manager
  async initialize() {
    try {
      if (this.initialized) {
        return this.storageManager;
      }

      const storageOptions = this.getStorageOptions();
      this.storageManager = new StorageManager(storageOptions);

      // Wait for initialization to complete
      await this.storageManager.initializeStorage();

      this.initialized = true;
      console.log('✅ Storage configuration initialized successfully');

      return this.storageManager;
    } catch (error) {
      console.error('❌ Failed to initialize storage configuration:', error);
      throw error;
    }
  }

  // Get storage options based on configuration
  getStorageOptions() {
    const config = this.config;
    const type = config.type || 'local';

    switch (type) {
    case 'local':
      return this.getLocalStorageOptions();
    case 's3':
      return this.getS3StorageOptions();
    case 'gcs':
      return this.getGCSStorageOptions();
    case 'azure':
      return this.getAzureStorageOptions();
    default:
      throw new Error(`Unsupported storage type: ${type}`);
    }
  }

  // Get local storage options
  getLocalStorageOptions() {
    const config = this.config.local;

    return {
      basePath: config.basePath || 'storage',
      publicPath: config.publicPath || 'public',
      uploadsPath: config.uploadsPath || 'uploads',
      tempPath: config.tempPath || 'temp',
      maxFileSize: config.maxFileSize || 10 * 1024 * 1024, // 10MB
      allowedTypes: config.allowedTypes || ['image/*', 'text/*', 'application/*'],
      cache: true,
    };
  }

  // Get S3 storage options
  getS3StorageOptions() {
    const config = this.config.s3;

    if (!config.bucket) {
      throw new Error('S3 bucket is required for S3 storage');
    }

    return {
      type: 's3',
      bucket: config.bucket,
      region: config.region || 'us-east-1',
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
      endpoint: config.endpoint,
      maxFileSize: this.config.local?.maxFileSize || 100 * 1024 * 1024, // 100MB
      allowedTypes: this.config.local?.allowedTypes || ['image/*', 'text/*', 'application/*'],
      cache: true,
    };
  }

  // Get Google Cloud Storage options
  getGCSStorageOptions() {
    const config = this.config.gcs;

    if (!config.bucket) {
      throw new Error('GCS bucket is required for Google Cloud Storage');
    }

    return {
      type: 'gcs',
      bucket: config.bucket,
      projectId: config.projectId,
      keyFilename: config.keyFilename,
      maxFileSize: this.config.local?.maxFileSize || 100 * 1024 * 1024, // 100MB
      allowedTypes: this.config.local?.allowedTypes || ['image/*', 'text/*', 'application/*'],
      cache: true,
    };
  }

  // Get Azure Blob Storage options
  getAzureStorageOptions() {
    const config = this.config.azure;

    if (!config.accountName || !config.containerName) {
      throw new Error('Azure account name and container name are required for Azure Blob Storage');
    }

    return {
      type: 'azure',
      accountName: config.accountName,
      accountKey: config.accountKey,
      containerName: config.containerName,
      maxFileSize: this.config.local?.maxFileSize || 100 * 1024 * 1024, // 100MB
      allowedTypes: this.config.local?.allowedTypes || ['image/*', 'text/*', 'application/*'],
      cache: true,
    };
  }

  // Get storage statistics
  async getStorageStats() {
    if (!this.initialized) {
      await this.initialize();
    }

    return await this.storageManager.getStorageStats();
  }

  // Get storage health status
  async getStorageHealth() {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const stats = await this.storageManager.getStorageStats();

      return {
        status: 'healthy',
        timestamp: new Date(),
        stats,
        message: 'Storage system is operating normally',
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date(),
        error: error.message,
        message: 'Storage system is experiencing issues',
      };
    }
  }

  // Validate storage configuration
  validate() {
    const config = this.config;
    const errors = [];

    if (!config.type) {
      errors.push('Storage type is required');
    }

    if (!['local', 's3', 'gcs', 'azure'].includes(config.type)) {
      errors.push(`Unsupported storage type: ${config.type}`);
    }

    // Validate type-specific configuration
    switch (config.type) {
    case 'local':
      this.validateLocalConfig(config.local, errors);
      break;
    case 's3':
      this.validateS3Config(config.s3, errors);
      break;
    case 'gcs':
      this.validateGCSConfig(config.gcs, errors);
      break;
    case 'azure':
      this.validateAzureConfig(config.azure, errors);
      break;
    }

    if (errors.length > 0) {
      throw new Error(`Storage configuration validation failed:\n${errors.join('\n')}`);
    }

    return true;
  }

  // Validate local storage configuration
  validateLocalConfig(config, errors) {
    if (!config.basePath) {
      errors.push('Local storage base path is required');
    }

    if (config.maxFileSize && config.maxFileSize <= 0) {
      errors.push('Local storage max file size must be greater than 0');
    }
  }

  // Validate S3 storage configuration
  validateS3Config(config, errors) {
    if (!config.bucket) {
      errors.push('S3 bucket is required');
    }

    if (!config.accessKeyId) {
      errors.push('S3 access key ID is required');
    }

    if (!config.secretAccessKey) {
      errors.push('S3 secret access key is required');
    }
  }

  // Validate GCS storage configuration
  validateGCSConfig(config, errors) {
    if (!config.bucket) {
      errors.push('GCS bucket is required');
    }

    if (!config.projectId) {
      errors.push('GCS project ID is required');
    }

    if (!config.keyFilename) {
      errors.push('GCS key filename is required');
    }
  }

  // Validate Azure storage configuration
  validateAzureConfig(config, errors) {
    if (!config.accountName) {
      errors.push('Azure account name is required');
    }

    if (!config.accountKey) {
      errors.push('Azure account key is required');
    }

    if (!config.containerName) {
      errors.push('Azure container name is required');
    }
  }

  // Get storage environment variables
  getEnvironmentVariables() {
    const config = this.config;
    const envVars = {
      STORAGE_TYPE: config.type,
    };

    switch (config.type) {
    case 'local':
      Object.assign(envVars, {
        STORAGE_LOCAL_PATH: config.local?.basePath || 'storage',
        STORAGE_MAX_FILE_SIZE: (config.local?.maxFileSize || 10 * 1024 * 1024).toString(),
      });
      break;
    case 's3':
      Object.assign(envVars, {
        S3_BUCKET: config.s3?.bucket,
        S3_REGION: config.s3?.region || 'us-east-1',
        S3_ACCESS_KEY_ID: config.s3?.accessKeyId,
        S3_SECRET_ACCESS_KEY: config.s3?.secretAccessKey,
        S3_ENDPOINT: config.s3?.endpoint,
      });
      break;
    case 'gcs':
      Object.assign(envVars, {
        GCS_BUCKET: config.gcs?.bucket,
        GCS_PROJECT_ID: config.gcs?.projectId,
        GCS_KEY_FILENAME: config.gcs?.keyFilename,
      });
      break;
    case 'azure':
      Object.assign(envVars, {
        AZURE_STORAGE_ACCOUNT: config.azure?.accountName,
        AZURE_STORAGE_KEY: config.azure?.accountKey,
        AZURE_STORAGE_CONTAINER: config.azure?.containerName,
      });
      break;
    }

    return envVars;
  }

  // Get storage backup configuration
  getBackupConfig() {
    return {
      enabled: true,
      schedule: '0 3 * * *', // Daily at 3 AM
      retention: {
        daily: 7,
        weekly: 4,
        monthly: 12,
      },
      compression: true,
      encryption: false,
      storage: {
        type: 'local',
        path: './backups/storage',
      },
    };
  }

  // Get storage cleanup configuration
  getCleanupConfig() {
    return {
      enabled: true,
      schedule: '0 4 * * *', // Daily at 4 AM
      tempFiles: {
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        enabled: true,
      },
      orphanedFiles: {
        enabled: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      },
      logRetention: {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      },
    };
  }

  // Get storage monitoring configuration
  getMonitoringConfig() {
    return {
      enabled: true,
      metrics: {
        enabled: true,
        collectionInterval: 60000, // 1 minute
      },
      alerts: {
        enabled: true,
        diskUsage: {
          warning: 80, // 80%
          critical: 90, // 90%
        },
        fileCount: {
          warning: 10000,
          critical: 50000,
        },
      },
    };
  }

  // Test storage connection
  async testConnection() {
    try {
      this.validate();

      if (!this.initialized) {
        await this.initialize();
      }

      const stats = await this.storageManager.getStorageStats();

      return {
        success: true,
        message: `Successfully connected to ${this.config.type} storage`,
        stats,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // Get storage manager instance
  getStorageManager() {
    if (!this.initialized) {
      throw new Error('Storage not initialized. Call initialize() first.');
    }

    return this.storageManager;
  }

  // Check if storage is initialized
  isInitialized() {
    return this.initialized;
  }

  // Reload storage configuration
  async reload() {
    this.initialized = false;
    this.storageManager = null;
    await this.initialize();
  }
}

// Create default instance
export const storageConfig = new StorageConfig();

// Export the class and instance
export { StorageConfig };
export default storageConfig;
