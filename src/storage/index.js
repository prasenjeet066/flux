// Storage management system for Flux applications
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { FluxCache } from '../runtime/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class StorageManager {
  constructor(options = {}) {
    this.options = {
      basePath: options.basePath || 'storage',
      publicPath: options.publicPath || 'public',
      uploadsPath: options.uploadsPath || 'uploads',
      tempPath: options.tempPath || 'temp',
      maxFileSize: options.maxFileSize || 10 * 1024 * 1024, // 10MB
      allowedTypes: options.allowedTypes || ['image/*', 'text/*', 'application/*'],
      cache: options.cache !== false,
      ...options,
    };

    this.cache = this.options.cache ? new FluxCache() : null;
    this.storageRoot = path.resolve(this.options.basePath);
    this.publicPath = path.join(this.storageRoot, this.options.publicPath);
    this.uploadsPath = path.join(this.storageRoot, this.options.uploadsPath);
    this.tempPath = path.join(this.storageRoot, this.options.tempPath);

    this.initializeStorage();
  }

  async initializeStorage() {
    try {
      // Create storage directories
      await fs.ensureDir(this.storageRoot);
      await fs.ensureDir(this.publicPath);
      await fs.ensureDir(this.uploadsPath);
      await fs.ensureDir(this.tempPath);

      // Create subdirectories for better organization
      await fs.ensureDir(path.join(this.publicPath, 'images'));
      await fs.ensureDir(path.join(this.publicPath, 'css'));
      await fs.ensureDir(path.join(this.publicPath, 'js'));
      await fs.ensureDir(path.join(this.publicPath, 'fonts'));
      await fs.ensureDir(path.join(this.publicPath, 'documents'));

      await fs.ensureDir(path.join(this.uploadsPath, 'images'));
      await fs.ensureDir(path.join(this.uploadsPath, 'documents'));
      await fs.ensureDir(path.join(this.uploadsPath, 'videos'));
      await fs.ensureDir(path.join(this.uploadsPath, 'audio'));

      console.log('✅ Storage system initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize storage:', error);
      throw error;
    }
  }

  // File operations
  async storeFile(file, destination = 'uploads', options = {}) {
    const {
      filename = file.name || `file_${Date.now()}`,
      subfolder = '',
      overwrite = false,
      validate = true,
    } = options;

    try {
      // Validate file
      if (validate) {
        await this.validateFile(file);
      }

      // Determine destination path
      const destPath = destination === 'public' ? this.publicPath : this.uploadsPath;
      const finalPath = path.join(destPath, subfolder, filename);

      // Check if file exists and handle overwrite
      if (await fs.pathExists(finalPath) && !overwrite) {
        throw new Error(`File ${filename} already exists`);
      }

      // Ensure directory exists
      await fs.ensureDir(path.dirname(finalPath));

      // Copy file to destination
      await fs.copy(file.path || file, finalPath);

      // Generate file metadata
      const stats = await fs.stat(finalPath);
      const fileInfo = {
        filename,
        originalName: file.name || filename,
        path: finalPath,
        url: this.getPublicUrl(finalPath),
        size: stats.size,
        mimeType: file.mimetype || this.getMimeType(filename),
        uploadedAt: new Date(),
        destination,
        subfolder,
      };

      // Cache file info if caching is enabled
      if (this.cache) {
        this.cache.set(`file:${filename}`, fileInfo);
      }

      return fileInfo;
    } catch (error) {
      console.error('Error storing file:', error);
      throw error;
    }
  }

  async getFile(filename, destination = 'uploads') {
    try {
      // Check cache first
      if (this.cache) {
        const cached = this.cache.get(`file:${filename}`);
        if (cached) return cached;
      }

      const destPath = destination === 'public' ? this.publicPath : this.uploadsPath;
      const filePath = path.join(destPath, filename);

      if (!await fs.pathExists(filePath)) {
        throw new Error(`File ${filename} not found`);
      }

      const stats = await fs.stat(filePath);
      const fileInfo = {
        filename,
        path: filePath,
        url: this.getPublicUrl(filePath),
        size: stats.size,
        mimeType: this.getMimeType(filename),
        modifiedAt: stats.mtime,
        destination,
      };

      // Cache file info
      if (this.cache) {
        this.cache.set(`file:${filename}`, fileInfo);
      }

      return fileInfo;
    } catch (error) {
      console.error('Error getting file:', error);
      throw error;
    }
  }

  async deleteFile(filename, destination = 'uploads') {
    try {
      const destPath = destination === 'public' ? this.publicPath : this.uploadsPath;
      const filePath = path.join(destPath, filename);

      if (!await fs.pathExists(filePath)) {
        throw new Error(`File ${filename} not found`);
      }

      await fs.remove(filePath);

      // Remove from cache
      if (this.cache) {
        this.cache.delete(`file:${filename}`);
      }

      return { success: true, message: `File ${filename} deleted successfully` };
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  async listFiles(destination = 'uploads', subfolder = '', options = {}) {
    const {
      recursive = false,
      filter = null,
      sortBy = 'name',
      sortOrder = 'asc',
    } = options;

    try {
      const destPath = destination === 'public' ? this.publicPath : this.uploadsPath;
      const searchPath = path.join(destPath, subfolder);

      if (!await fs.pathExists(searchPath)) {
        return [];
      }

      const files = await this.scanDirectory(searchPath, recursive);

      // Apply filters
      let filteredFiles = files;
      if (filter) {
        filteredFiles = files.filter(file => {
          if (typeof filter === 'function') {
            return filter(file);
          }
          if (typeof filter === 'string') {
            return file.name.includes(filter);
          }
          if (filter.extension) {
            return path.extname(file.name) === filter.extension;
          }
          if (filter.mimeType) {
            return file.mimeType.startsWith(filter.mimeType);
          }
          return true;
        });
      }

      // Sort files
      filteredFiles.sort((a, b) => {
        let aValue = a[sortBy];
        let bValue = b[sortBy];

        if (sortBy === 'size' || sortBy === 'modifiedAt') {
          aValue = aValue || 0;
          bValue = bValue || 0;
        } else {
          aValue = String(aValue || '').toLowerCase();
          bValue = String(bValue || '').toLowerCase();
        }

        if (sortOrder === 'desc') {
          [aValue, bValue] = [bValue, aValue];
        }

        if (aValue < bValue) return -1;
        if (aValue > bValue) return 1;
        return 0;
      });

      return filteredFiles;
    } catch (error) {
      console.error('Error listing files:', error);
      throw error;
    }
  }

  async scanDirectory(dirPath, recursive = false) {
    const files = [];

    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        const relativePath = path.relative(this.storageRoot, fullPath);

        if (entry.isDirectory() && recursive) {
          const subFiles = await this.scanDirectory(fullPath, recursive);
          files.push(...subFiles);
        } else if (entry.isFile()) {
          const stats = await fs.stat(fullPath);
          files.push({
            name: entry.name,
            path: fullPath,
            relativePath,
            url: this.getPublicUrl(fullPath),
            size: stats.size,
            mimeType: this.getMimeType(entry.name),
            modifiedAt: stats.mtime,
            createdAt: stats.birthtime,
          });
        }
      }
    } catch (error) {
      console.error(`Error scanning directory ${dirPath}:`, error);
    }

    return files;
  }

  // Public file serving
  getPublicUrl(filePath) {
    const relativePath = path.relative(this.storageRoot, filePath);
    return `/storage/${relativePath.replace(/\\/g, '/')}`;
  }

  async servePublicFile(filePath) {
    try {
      const fullPath = path.join(this.storageRoot, filePath);

      if (!await fs.pathExists(fullPath)) {
        throw new Error('File not found');
      }

      const stats = await fs.stat(fullPath);
      const stream = fs.createReadStream(fullPath);

      return {
        stream,
        stats,
        mimeType: this.getMimeType(filePath),
      };
    } catch (error) {
      console.error('Error serving public file:', error);
      throw error;
    }
  }

  // File validation
  async validateFile(file) {
    // Check file size
    if (file.size && file.size > this.options.maxFileSize) {
      throw new Error(`File size exceeds maximum allowed size of ${this.formatBytes(this.options.maxFileSize)}`);
    }

    // Check file type
    if (file.mimetype && !this.isAllowedType(file.mimetype)) {
      throw new Error(`File type ${file.mimetype} is not allowed`);
    }

    return true;
  }

  isAllowedType(mimeType) {
    return this.options.allowedTypes.some(allowed => {
      if (allowed.endsWith('/*')) {
        return mimeType.startsWith(allowed.slice(0, -1));
      }
      return mimeType === allowed;
    });
  }

  // Utility methods
  getMimeType(filename) {
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'text/javascript',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon',
      '.woff': 'font/woff',
      '.woff2': 'font/woff2',
      '.ttf': 'font/ttf',
      '.eot': 'application/vnd.ms-fontobject',
      '.pdf': 'application/pdf',
      '.txt': 'text/plain',
      '.md': 'text/markdown',
      '.xml': 'text/xml',
      '.csv': 'text/csv',
    };

    return mimeTypes[ext] || 'application/octet-stream';
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  // Storage statistics
  async getStorageStats() {
    try {
      const publicStats = await this.getDirectoryStats(this.publicPath);
      const uploadsStats = await this.getDirectoryStats(this.uploadsPath);
      const tempStats = await this.getDirectoryStats(this.tempPath);

      return {
        public: publicStats,
        uploads: uploadsStats,
        temp: tempStats,
        total: {
          files: publicStats.files + uploadsStats.files + tempStats.files,
          size: publicStats.size + uploadsStats.size + tempStats.size,
        },
        cache: this.cache ? this.cache.getStats() : null,
      };
    } catch (error) {
      console.error('Error getting storage stats:', error);
      throw error;
    }
  }

  async getDirectoryStats(dirPath) {
    try {
      if (!await fs.pathExists(dirPath)) {
        return { files: 0, size: 0, directories: 0 };
      }

      const files = await this.scanDirectory(dirPath, true);
      const totalSize = files.reduce((sum, file) => sum + file.size, 0);
      const directories = new Set(files.map(f => path.dirname(f.relativePath))).size;

      return {
        files: files.length,
        size: totalSize,
        directories,
      };
    } catch (error) {
      console.error(`Error getting directory stats for ${dirPath}:`, error);
      return { files: 0, size: 0, directories: 0 };
    }
  }

  // Cleanup operations
  async cleanupTempFiles(maxAge = 24 * 60 * 60 * 1000) { // 24 hours
    try {
      const files = await this.scanDirectory(this.tempPath, true);
      const now = Date.now();
      let cleanedCount = 0;

      for (const file of files) {
        if (now - file.modifiedAt.getTime() > maxAge) {
          await this.deleteFile(file.name, 'temp');
          cleanedCount++;
        }
      }

      return { cleanedCount, message: `Cleaned ${cleanedCount} temporary files` };
    } catch (error) {
      console.error('Error cleaning temp files:', error);
      throw error;
    }
  }

  // Backup and restore
  async createBackup(backupPath) {
    try {
      await fs.ensureDir(path.dirname(backupPath));
      await fs.copy(this.storageRoot, backupPath);
      return { success: true, backupPath };
    } catch (error) {
      console.error('Error creating backup:', error);
      throw error;
    }
  }

  async restoreFromBackup(backupPath) {
    try {
      if (!await fs.pathExists(backupPath)) {
        throw new Error('Backup path does not exist');
      }

      // Create backup of current storage before restore
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const currentBackup = path.join(path.dirname(this.storageRoot), `backup-before-restore-${timestamp}`);
      await this.createBackup(currentBackup);

      // Restore from backup
      await fs.remove(this.storageRoot);
      await fs.copy(backupPath, this.storageRoot);

      return { success: true, message: 'Storage restored successfully' };
    } catch (error) {
      console.error('Error restoring from backup:', error);
      throw error;
    }
  }

  // Storage health check
  async getStorageHealth() {
    try {
      const stats = await this.getStorageStats();
      const publicHealth = await this.checkDirectoryHealth(this.publicPath);
      const uploadsHealth = await this.checkDirectoryHealth(this.uploadsPath);
      const tempHealth = await this.checkDirectoryHealth(this.tempPath);

      const overallHealth = publicHealth && uploadsHealth && tempHealth;

      return {
        status: overallHealth ? 'healthy' : 'degraded',
        message: overallHealth ? 'All storage systems operational' : 'Some storage systems experiencing issues',
        details: {
          public: publicHealth ? 'operational' : 'issues detected',
          uploads: uploadsHealth ? 'operational' : 'issues detected',
          temp: tempHealth ? 'operational' : 'issues detected',
        },
        stats,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: `Storage health check failed: ${error.message}`,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  async checkDirectoryHealth(dirPath) {
    try {
      if (!await fs.pathExists(dirPath)) {
        return false;
      }

      // Check if directory is readable and writable
      await fs.access(dirPath, fs.constants.R_OK | fs.constants.W_OK);

      // Check if we can create a test file
      const testFile = path.join(dirPath, '.health-check');
      await fs.writeFile(testFile, 'health check');
      await fs.remove(testFile);

      return true;
    } catch (error) {
      return false;
    }
  }
}

// Create default instance
export const storageManager = new StorageManager();

// Export the class and instance
export { StorageManager };
export default storageManager;
