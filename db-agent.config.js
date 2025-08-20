/**
 * Database Agent Configuration
 * 
 * Configuration file for the txMedia Database Schema Management Agent
 */

module.exports = {
  // Backup configuration
  backup: {
    directory: './backups',
    retentionDays: 30,
    compressionLevel: 6,
    includeTestData: false
  },

  // Test data generation
  testData: {
    galleries: 5,
    imagesPerGallery: 20,
    downloadsPerGallery: 10,
    favoritesPerGallery: 5,
    accessLogsPerGallery: 50,
    userCount: 2
  },

  // Health monitoring thresholds
  health: {
    maxQueryTime: 1000,        // milliseconds
    maxTableSize: 1000000,     // rows
    minDiskSpace: 1048576,     // 1GB in KB
    connectionTimeout: 5000,   // milliseconds
    warningQueryTime: 500      // milliseconds
  },

  // Validation rules
  validation: {
    enforcePasswordSecurity: true,
    checkFilePathsExist: false,  // Set to true to validate file system
    validateImageDimensions: true,
    enforceDownloadLimits: true,
    checkExpiryDates: true
  },

  // Cleanup configuration
  cleanup: {
    removeOrphanedRecords: true,
    removeExpiredSessions: true,
    removeOldAccessLogs: false,  // Days to keep
    dryRun: false               // Set to true to preview changes
  },

  // Export/Import settings
  export: {
    directory: './exports',
    format: 'json',            // json, csv, sql
    includeRelations: true,
    batchSize: 1000,
    timestampFiles: true
  },

  // Migration settings
  migration: {
    autoApply: false,
    createBackupBeforeMigration: true,
    validateAfterMigration: true,
    rollbackOnFailure: true
  },

  // Gallery-specific settings
  gallery: {
    defaultDownloadLimit: 50,
    defaultExpiryDays: 90,
    passwordMinLength: 8,
    allowedEventTypes: ['wedding', 'portrait', 'drone', 'event', 'commercial', 'family'],
    maxImagesPerGallery: 1000
  },

  // Performance monitoring
  performance: {
    enableQueryLogging: false,
    logSlowQueries: true,
    slowQueryThreshold: 1000,  // milliseconds
    enablePerformanceMetrics: true
  },

  // Security settings
  security: {
    disableResetInProduction: true,
    requireConfirmationForDestructive: true,
    enableAuditLogging: true,
    maskSensitiveData: true
  },

  // Logging configuration
  logging: {
    level: 'info',            // error, warn, info, debug
    enableColors: true,
    enableTimestamps: true,
    logToFile: false,
    logFile: './logs/db-agent.log'
  },

  // Environment-specific overrides
  environments: {
    development: {
      testData: {
        galleries: 10,
        imagesPerGallery: 50
      },
      validation: {
        checkFilePathsExist: false
      }
    },
    production: {
      security: {
        disableResetInProduction: true,
        requireConfirmationForDestructive: true
      },
      performance: {
        enableQueryLogging: false
      },
      backup: {
        retentionDays: 90
      }
    }
  }
}