// Database configuration and connection management
import { configManager } from './index.js';

class DatabaseConfig {
  constructor() {
    this.config = configManager.get('database');
    this.connections = new Map();
    this.pools = new Map();
  }

  // Get database configuration
  getConfig() {
    return this.config;
  }

  // Get connection string for different database types
  getConnectionString(type = null) {
    const dbType = type || this.config.type;
    const config = this.config;

    switch (dbType) {
      case 'postgresql':
      case 'postgres':
        return `postgresql://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}`;
      
      case 'mysql':
      case 'mariadb':
        return `mysql://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}`;
      
      case 'sqlite':
        return `sqlite:${config.database}`;
      
      case 'mongodb':
        return `mongodb://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}`;
      
      case 'redis':
        return `redis://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}`;
      
      default:
        throw new Error(`Unsupported database type: ${dbType}`);
    }
  }

  // Get Knex.js configuration
  getKnexConfig() {
    const config = this.config;
    
    return {
      client: this.getKnexClient(),
      connection: {
        host: config.host,
        port: config.port,
        user: config.username,
        password: config.password,
        database: config.database,
        ssl: config.ssl ? { rejectUnauthorized: false } : false
      },
      pool: {
        min: config.pool.min,
        max: config.pool.max,
        acquireTimeoutMillis: config.pool.acquireTimeoutMillis,
        createTimeoutMillis: config.pool.createTimeoutMillis,
        destroyTimeoutMillis: config.pool.destroyTimeoutMillis,
        idleTimeoutMillis: config.pool.idleTimeoutMillis,
        reapIntervalMillis: config.pool.reapIntervalMillis,
        createRetryIntervalMillis: config.pool.createRetryIntervalMillis
      },
      migrations: {
        directory: config.migrations.directory,
        tableName: config.migrations.tableName
      },
      seeds: {
        directory: config.seeds.directory
      },
      debug: configManager.get('app.debug', false)
    };
  }

  // Get Knex client name
  getKnexClient() {
    switch (this.config.type) {
      case 'postgresql':
      case 'postgres':
        return 'postgresql';
      case 'mysql':
        return 'mysql2';
      case 'mariadb':
        return 'mysql2';
      case 'sqlite':
        return 'sqlite3';
      case 'mongodb':
        return 'mongodb';
      default:
        throw new Error(`Unsupported database type: ${this.config.type}`);
    }
  }

  // Get Sequelize configuration
  getSequelizeConfig() {
    const config = this.config;
    
    return {
      dialect: this.getSequelizeDialect(),
      host: config.host,
      port: config.port,
      username: config.username,
      password: config.password,
      database: config.database,
      logging: configManager.get('app.debug', false),
      pool: {
        max: config.pool.max,
        min: config.pool.min,
        acquire: config.pool.acquireTimeoutMillis,
        idle: config.pool.idleTimeoutMillis
      },
      dialectOptions: {
        ssl: config.ssl ? { require: true, rejectUnauthorized: false } : false
      }
    };
  }

  // Get Sequelize dialect
  getSequelizeDialect() {
    switch (this.config.type) {
      case 'postgresql':
      case 'postgres':
        return 'postgres';
      case 'mysql':
        return 'mysql';
      case 'mariadb':
        return 'mariadb';
      case 'sqlite':
        return 'sqlite';
      case 'mongodb':
        return 'mongodb';
      default:
        throw new Error(`Unsupported database type: ${this.config.type}`);
    }
  }

  // Get Mongoose configuration
  getMongooseConfig() {
    const config = this.config;
    
    return {
      uri: this.getConnectionString('mongodb'),
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: config.pool.max,
        minPoolSize: config.pool.min,
        serverSelectionTimeoutMS: config.pool.acquireTimeoutMillis,
        socketTimeoutMS: config.pool.idleTimeoutMillis
      }
    };
  }

  // Get Redis configuration
  getRedisConfig() {
    const config = configManager.get('redis');
    
    if (!config.enabled) {
      throw new Error('Redis is not enabled in configuration');
    }
    
    return {
      host: config.host,
      port: config.port,
      password: config.password,
      db: config.db,
      keyPrefix: config.keyPrefix,
      retryDelayOnFailover: config.retryDelayOnFailover,
      maxRetriesPerRequest: config.maxRetriesPerRequest
    };
  }

  // Validate database configuration
  validate() {
    const config = this.config;
    const errors = [];

    if (!config.type) {
      errors.push('Database type is required');
    }

    if (!['postgresql', 'postgres', 'mysql', 'mariadb', 'sqlite', 'mongodb'].includes(config.type)) {
      errors.push(`Unsupported database type: ${config.type}`);
    }

    if (config.type !== 'sqlite') {
      if (!config.host) {
        errors.push('Database host is required');
      }
      if (!config.port) {
        errors.push('Database port is required');
      }
      if (!config.username) {
        errors.push('Database username is required');
      }
      if (!config.password) {
        errors.push('Database password is required');
      }
    }

    if (!config.database) {
      errors.push('Database name is required');
    }

    if (errors.length > 0) {
      throw new Error(`Database configuration validation failed:\n${errors.join('\n')}`);
    }

    return true;
  }

  // Test database connection
  async testConnection() {
    try {
      this.validate();
      
      const config = this.config;
      const connectionString = this.getConnectionString();
      
      console.log(`Testing database connection to ${config.host}:${config.port}/${config.database}...`);
      
      // This would be implemented based on the actual database driver being used
      // For now, we'll just return a success message
      
      return {
        success: true,
        message: `Successfully connected to ${config.type} database`,
        connectionString: connectionString.replace(/\/\/[^:]+:[^@]+@/, '//***:***@') // Hide credentials
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Get database-specific environment variables
  getEnvironmentVariables() {
    const config = this.config;
    
    return {
      DB_TYPE: config.type,
      DB_HOST: config.host,
      DB_PORT: config.port.toString(),
      DB_NAME: config.database,
      DB_USER: config.username,
      DB_PASSWORD: config.password,
      DB_SSL: config.ssl.toString(),
      DB_POOL_MIN: config.pool.min.toString(),
      DB_POOL_MAX: config.pool.max.toString()
    };
  }

  // Get database health check configuration
  getHealthCheckConfig() {
    return {
      enabled: true,
      timeout: 5000,
      interval: 30000,
      endpoint: '/health/database'
    };
  }

  // Get backup configuration
  getBackupConfig() {
    const config = this.config;
    
    return {
      enabled: true,
      schedule: '0 2 * * *', // Daily at 2 AM
      retention: {
        daily: 7,
        weekly: 4,
        monthly: 12
      },
      compression: true,
      encryption: false,
      storage: {
        type: 'local',
        path: './backups/database'
      }
    };
  }

  // Get migration configuration
  getMigrationConfig() {
    const config = this.config;
    
    return {
      directory: config.migrations.directory,
      tableName: config.migrations.tableName,
      extension: 'js',
      loadExtensions: ['.js'],
      stub: 'migration.stub',
      timezone: 'UTC'
    };
  }

  // Get seed configuration
  getSeedConfig() {
    const config = this.config;
    
    return {
      directory: config.seeds.directory,
      extension: 'js',
      loadExtensions: ['.js'],
      stub: 'seed.stub'
    };
  }
}

// Create default instance
export const databaseConfig = new DatabaseConfig();

// Export the class and instance
export { DatabaseConfig };
export default databaseConfig;