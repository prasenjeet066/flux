// Production environment configuration
export default {
  // Override production-specific settings
  app: {
    debug: false,
    environment: 'production'
  },

  server: {
    port: parseInt(process.env.PORT) || 3000,
    host: process.env.HOST || '0.0.0.0',
    protocol: 'https',
    cors: {
      origin: process.env.CORS_ORIGIN?.split(',') || ['https://yourdomain.com'],
      credentials: true
    },
    security: {
      helmet: true,
      hsts: true,
      xssProtection: true,
      noSniff: true,
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'"],
          fontSrc: ["'self'", "https:"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"]
        }
      }
    }
  },

  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'flux_app_prod',
    username: process.env.DB_USER || 'flux_user',
    password: process.env.DB_PASSWORD || 'flux_password',
    ssl: true,
    pool: {
      min: parseInt(process.env.DB_POOL_MIN) || 5,
      max: parseInt(process.env.DB_POOL_MAX) || 20
    }
  },

  redis: {
    enabled: true,
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB) || 0
  },

  storage: {
    type: process.env.STORAGE_TYPE || 's3',
    local: {
      basePath: process.env.STORAGE_LOCAL_PATH || '/var/flux/storage',
      maxFileSize: parseInt(process.env.STORAGE_MAX_FILE_SIZE) || 100 * 1024 * 1024 // 100MB
    },
    s3: {
      bucket: process.env.S3_BUCKET,
      region: process.env.S3_REGION || 'us-east-1',
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      endpoint: process.env.S3_ENDPOINT
    }
  },

  auth: {
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: '1h',
      refreshExpiresIn: '7d'
    },
    session: {
      secret: process.env.SESSION_SECRET,
      cookie: {
        secure: true,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        domain: process.env.COOKIE_DOMAIN,
        sameSite: 'strict'
      }
    }
  },

  logging: {
    level: 'info',
    format: 'json',
    transports: {
      console: {
        enabled: false
      },
      file: {
        enabled: true,
        filename: '/var/log/flux/app.log',
        maxsize: 100 * 1024 * 1024, // 100MB
        maxFiles: 10
      }
    }
  },

  monitoring: {
    enabled: true,
    metrics: {
      enabled: true,
      port: parseInt(process.env.METRICS_PORT) || 9090
    },
    health: {
      enabled: true,
      endpoint: '/health'
    },
    tracing: {
      enabled: process.env.TRACING_ENABLED === 'true',
      jaeger: {
        host: process.env.JAEGER_HOST || 'localhost',
        port: parseInt(process.env.JAEGER_PORT) || 6832
      }
    }
  },

  queue: {
    enabled: true,
    type: 'bull',
    redis: {
      host: process.env.QUEUE_REDIS_HOST || process.env.REDIS_HOST,
      port: parseInt(process.env.QUEUE_REDIS_PORT) || process.env.REDIS_PORT || 6379,
      password: process.env.QUEUE_REDIS_PASSWORD || process.env.REDIS_PASSWORD,
      db: parseInt(process.env.QUEUE_REDIS_DB) || 1
    }
  },

  websocket: {
    enabled: true,
    cors: {
      origin: process.env.WEBSOCKET_CORS_ORIGIN?.split(',') || ['https://yourdomain.com']
    }
  },

  api: {
    rateLimit: {
      enabled: true,
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000 // Higher limit for production
    },
    documentation: {
      enabled: process.env.API_DOCS_ENABLED === 'true',
      path: '/docs'
    }
  },

  frontend: {
    build: {
      outputDir: '/var/flux/frontend',
      publicPath: '/',
      sourceMap: false
    }
  },

  development: {
    hotReload: false,
    debug: false,
    sourceMaps: false,
    watchMode: false
  }
};