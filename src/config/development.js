// Development environment configuration
export default {
  // Override development-specific settings
  app: {
    debug: true,
    environment: 'development',
  },

  server: {
    port: 3000,
    host: 'localhost',
    cors: {
      origin: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000'],
      credentials: true,
    },
  },

  database: {
    host: 'localhost',
    port: 5432,
    database: 'flux_app_dev',
    username: 'flux_user',
    password: 'flux_password',
    ssl: false,
    pool: {
      min: 1,
      max: 5,
    },
  },

  redis: {
    enabled: false, // Disable Redis in development for simplicity
    host: 'localhost',
    port: 6379,
  },

  storage: {
    type: 'local',
    local: {
      basePath: 'storage',
      maxFileSize: 50 * 1024 * 1024, // 50MB for development
    },
  },

  logging: {
    level: 'debug',
    format: 'dev',
    transports: {
      console: {
        enabled: true,
        colorize: true,
      },
      file: {
        enabled: false,
      },
    },
  },

  monitoring: {
    enabled: false,
    metrics: {
      enabled: false,
    },
  },

  queue: {
    enabled: false,
  },

  websocket: {
    enabled: true,
    cors: {
      origin: ['http://localhost:3000', 'http://localhost:3001'],
    },
  },

  api: {
    documentation: {
      enabled: true,
      path: '/docs',
    },
  },

  frontend: {
    devServer: {
      port: 3001,
      hot: true,
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
        '/storage': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
      },
    },
  },

  development: {
    hotReload: true,
    debug: true,
    sourceMaps: true,
    watchMode: true,
  },
};
