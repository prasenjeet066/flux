// Main configuration file for Flux application
export default {
  // Application configuration
  app: {
    name: 'Flux Application',
    version: '2.0.0',
    description: 'Next-generation web application built with Flux',
    author: 'Flux Team',
    license: 'MIT',
    environment: process.env.NODE_ENV || 'development',
    debug: process.env.NODE_ENV === 'development',
    timezone: 'UTC',
    locale: 'en-US',
  },

  // Server configuration
  server: {
    port: parseInt(process.env.PORT) || 3000,
    host: process.env.HOST || 'localhost',
    protocol: process.env.PROTOCOL || 'http',
    cors: {
      enabled: true,
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      credentials: true,
    },
    compression: {
      enabled: true,
      level: 6,
    },
    rateLimit: {
      enabled: true,
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    },
    security: {
      helmet: true,
      hsts: true,
      xssProtection: true,
      noSniff: true,
    },
  },

  // Database configuration
  database: {
    type: process.env.DB_TYPE || 'postgresql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'flux_app',
    username: process.env.DB_USER || 'flux_user',
    password: process.env.DB_PASSWORD || 'flux_password',
    ssl: process.env.DB_SSL === 'true',
    pool: {
      min: parseInt(process.env.DB_POOL_MIN) || 2,
      max: parseInt(process.env.DB_POOL_MAX) || 10,
      acquireTimeoutMillis: 30000,
      createTimeoutMillis: 30000,
      destroyTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
      reapIntervalMillis: 1000,
      createRetryIntervalMillis: 200,
    },
    migrations: {
      directory: 'src/database/migrations',
      tableName: 'knex_migrations',
    },
    seeds: {
      directory: 'src/database/seeds',
    },
  },

  // Redis configuration (for caching and sessions)
  redis: {
    enabled: process.env.REDIS_ENABLED === 'true',
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || null,
    db: parseInt(process.env.REDIS_DB) || 0,
    keyPrefix: process.env.REDIS_KEY_PREFIX || 'flux:',
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3,
  },

  // Storage configuration
  storage: {
    type: process.env.STORAGE_TYPE || 'local', // local, s3, gcs, azure
    local: {
      basePath: process.env.STORAGE_LOCAL_PATH || 'storage',
      publicPath: 'public',
      uploadsPath: 'uploads',
      tempPath: 'temp',
      maxFileSize: parseInt(process.env.STORAGE_MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
      allowedTypes: ['image/*', 'text/*', 'application/*'],
    },
    s3: {
      bucket: process.env.S3_BUCKET,
      region: process.env.S3_REGION || 'us-east-1',
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      endpoint: process.env.S3_ENDPOINT,
    },
  },

  // Authentication configuration
  auth: {
    jwt: {
      secret: process.env.JWT_SECRET || 'your-secret-key',
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      issuer: process.env.JWT_ISSUER || 'flux-app',
      audience: process.env.JWT_AUDIENCE || 'flux-users',
    },
    bcrypt: {
      rounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
    },
    session: {
      secret: process.env.SESSION_SECRET || 'your-session-secret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    },
  },

  // Email configuration
  email: {
    enabled: process.env.EMAIL_ENABLED === 'true',
    provider: process.env.EMAIL_PROVIDER || 'smtp',
    smtp: {
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    },
    sendgrid: {
      apiKey: process.env.SENDGRID_API_KEY,
    },
    from: {
      name: process.env.EMAIL_FROM_NAME || 'Flux App',
      email: process.env.EMAIL_FROM_EMAIL || 'noreply@fluxapp.com',
    },
  },

  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
    transports: {
      console: {
        enabled: true,
        colorize: process.env.NODE_ENV === 'development',
      },
      file: {
        enabled: process.env.LOG_FILE_ENABLED === 'true',
        filename: process.env.LOG_FILE_PATH || 'logs/app.log',
        maxsize: parseInt(process.env.LOG_FILE_MAX_SIZE) || 10 * 1024 * 1024, // 10MB
        maxFiles: parseInt(process.env.LOG_FILE_MAX_FILES) || 5,
      },
    },
  },

  // Monitoring and metrics
  monitoring: {
    enabled: process.env.MONITORING_ENABLED === 'true',
    metrics: {
      enabled: true,
      port: parseInt(process.env.METRICS_PORT) || 9090,
    },
    health: {
      enabled: true,
      endpoint: '/health',
    },
    tracing: {
      enabled: process.env.TRACING_ENABLED === 'true',
      jaeger: {
        host: process.env.JAEGER_HOST || 'localhost',
        port: parseInt(process.env.JAEGER_PORT) || 6832,
      },
    },
  },

  // Queue configuration
  queue: {
    enabled: process.env.QUEUE_ENABLED === 'true',
    type: process.env.QUEUE_TYPE || 'bull', // bull, agenda, bee-queue
    redis: {
      host: process.env.QUEUE_REDIS_HOST || process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.QUEUE_REDIS_PORT) || process.env.REDIS_PORT || 6379,
      password: process.env.QUEUE_REDIS_PASSWORD || process.env.REDIS_PASSWORD || null,
      db: parseInt(process.env.QUEUE_REDIS_DB) || 1,
    },
    defaultJobOptions: {
      removeOnComplete: 100,
      removeOnFail: 50,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    },
  },

  // WebSocket configuration
  websocket: {
    enabled: process.env.WEBSOCKET_ENABLED === 'true',
    path: process.env.WEBSOCKET_PATH || '/socket.io',
    cors: {
      origin: process.env.WEBSOCKET_CORS_ORIGIN || '*',
      methods: ['GET', 'POST'],
    },
    pingTimeout: parseInt(process.env.WEBSOCKET_PING_TIMEOUT) || 60000,
    pingInterval: parseInt(process.env.WEBSOCKET_PING_INTERVAL) || 25000,
  },

  // API configuration
  api: {
    version: process.env.API_VERSION || 'v1',
    prefix: process.env.API_PREFIX || '/api',
    rateLimit: {
      enabled: true,
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    },
    documentation: {
      enabled: process.env.API_DOCS_ENABLED !== 'false',
      path: process.env.API_DOCS_PATH || '/docs',
      swagger: {
        enabled: true,
        title: 'Flux API Documentation',
        version: '2.0.0',
        description: 'API documentation for Flux application',
      },
    },
  },

  // Frontend configuration
  frontend: {
    build: {
      outputDir: process.env.FRONTEND_BUILD_DIR || 'dist',
      publicPath: process.env.FRONTEND_PUBLIC_PATH || '/',
      sourceMap: process.env.NODE_ENV === 'development',
    },
    devServer: {
      port: parseInt(process.env.FRONTEND_DEV_PORT) || 3001,
      hot: true,
      proxy: {
        '/api': {
          target: `http://localhost:${process.env.PORT || 3000}`,
          changeOrigin: true,
        },
      },
    },
  },

  // Testing configuration
  testing: {
    enabled: process.env.TESTING_ENABLED === 'true',
    framework: process.env.TESTING_FRAMEWORK || 'jest',
    coverage: {
      enabled: process.env.TESTING_COVERAGE_ENABLED !== 'false',
      threshold: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
    parallel: process.env.TESTING_PARALLEL === 'true',
    maxWorkers: parseInt(process.env.TESTING_MAX_WORKERS) || 4,
  },

  // Development configuration
  development: {
    hotReload: process.env.NODE_ENV === 'development',
    debug: process.env.NODE_ENV === 'development',
    sourceMaps: true,
    watchMode: process.env.NODE_ENV === 'development',
  },
};
