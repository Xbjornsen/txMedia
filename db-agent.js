#!/usr/bin/env node

/**
 * txMedia Database Schema Management Agent
 * 
 * A comprehensive tool for managing database schema, validation, and health monitoring
 * for the txMedia photography portfolio platform.
 * 
 * Usage:
 *   node db-agent.js validate     - Validate schema and data integrity
 *   node db-agent.js migrate      - Generate and apply migrations
 *   node db-agent.js backup       - Create database backups
 *   node db-agent.js test-data    - Generate test data
 *   node db-agent.js health       - Database health check
 *   node db-agent.js reset        - Reset database (development only)
 *   node db-agent.js analyze      - Analyze relationships and performance
 *   node db-agent.js export       - Export data for migration
 *   node db-agent.js import       - Import data from backup
 *   node db-agent.js cleanup      - Clean up orphaned records
 */

const { PrismaClient } = require('@prisma/client')
const fs = require('fs').promises
const path = require('path')
const { exec } = require('child_process')
const { promisify } = require('util')
const bcrypt = require('bcryptjs')

const execAsync = promisify(exec)

// Function to create a fresh Prisma client instance
function createPrismaClient() {
  return new PrismaClient({
    log: [],
    errorFormat: 'pretty',
  })
}

// Default prisma instance
let prisma = createPrismaClient()

// Configuration
const CONFIG = {
  backupDir: './backups',
  testDataCount: {
    galleries: 5,
    imagesPerGallery: 20,
    downloadsPerGallery: 10,
    favoritesPerGallery: 5
  },
  healthThresholds: {
    maxQueryTime: 1000, // ms
    maxTableSize: 1000000, // rows
    minDiskSpace: 1048576 // 1GB in KB
  }
}

// Utility functions
const log = {
  info: (msg) => console.log(`ℹ️  ${msg}`),
  success: (msg) => console.log(`✅ ${msg}`),
  warning: (msg) => console.log(`⚠️  ${msg}`),
  error: (msg) => console.error(`❌ ${msg}`),
  section: (title) => console.log(`\n🔍 ${title}\n${'='.repeat(50)}`)
}

const formatBytes = (bytes) => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 Byte'
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

const ensureDirectoryExists = async (dirPath) => {
  try {
    await fs.access(dirPath)
  } catch {
    await fs.mkdir(dirPath, { recursive: true })
  }
}

// Schema validation functions
async function validateSchema() {
  log.section('Schema Validation')
  
  try {
    // Test database connection
    await prisma.$connect()
    log.success('Database connection established')

    // Validate foreign key relationships
    await validateForeignKeys()
    
    // Validate data integrity
    await validateDataIntegrity()
    
    // Check for orphaned records
    await checkOrphanedRecords()
    
    // Validate business rules
    await validateBusinessRules()
    
    log.success('Schema validation completed successfully')
    
  } catch (error) {
    log.error(`Schema validation failed: ${error.message}`)
    throw error
  }
}

async function validateForeignKeys() {
  log.info('Validating foreign key relationships...')
  
  const issues = []
  
  // Check User -> Gallery relationship using raw query
  const orphanedGalleries = await prisma.$queryRaw`
    SELECT g.id, g.title, g."userId" 
    FROM "Gallery" g 
    LEFT JOIN "User" u ON g."userId" = u.id 
    WHERE u.id IS NULL
  `
  
  if (orphanedGalleries.length > 0) {
    issues.push(`Found ${orphanedGalleries.length} galleries with invalid user references`)
  }
  
  // Check Gallery -> GalleryImage relationship
  const orphanedImages = await prisma.$queryRaw`
    SELECT gi.id, gi."fileName", gi."galleryId" 
    FROM "GalleryImage" gi 
    LEFT JOIN "Gallery" g ON gi."galleryId" = g.id 
    WHERE g.id IS NULL
  `
  
  if (orphanedImages.length > 0) {
    issues.push(`Found ${orphanedImages.length} images with invalid gallery references`)
  }
  
  // Check Download relationships
  const orphanedDownloads = await prisma.$queryRaw`
    SELECT d.id 
    FROM "Download" d 
    LEFT JOIN "Gallery" g ON d."galleryId" = g.id 
    LEFT JOIN "GalleryImage" gi ON d."imageId" = gi.id 
    WHERE g.id IS NULL OR gi.id IS NULL
  `
  
  if (orphanedDownloads.length > 0) {
    issues.push(`Found ${orphanedDownloads.length} downloads with invalid references`)
  }
  
  if (issues.length === 0) {
    log.success('All foreign key relationships are valid')
  } else {
    issues.forEach(issue => log.warning(issue))
  }
  
  return issues
}

async function validateDataIntegrity() {
  log.info('Validating data integrity...')
  
  const issues = []
  
  // Check for galleries without passwords (empty strings)
  const galleriesWithoutPasswords = await prisma.gallery.count({
    where: { 
      password: { equals: '' }
    }
  })
  
  if (galleriesWithoutPasswords > 0) {
    issues.push(`Found ${galleriesWithoutPasswords} galleries without passwords`)
  }
  
  // Check for duplicate gallery slugs
  const duplicateSlugs = await prisma.$queryRaw`
    SELECT slug, COUNT(*) as count 
    FROM "Gallery" 
    GROUP BY slug 
    HAVING COUNT(*) > 1
  `
  
  if (duplicateSlugs.length > 0) {
    issues.push(`Found ${duplicateSlugs.length} duplicate gallery slugs`)
  }
  
  // Check for images without file paths
  const imagesWithoutPaths = await prisma.galleryImage.count({
    where: { 
      filePath: { equals: '' }
    }
  })
  
  if (imagesWithoutPaths > 0) {
    issues.push(`Found ${imagesWithoutPaths} images without file paths`)
  }
  
  // Check download limits
  const galleriesOverLimit = await prisma.$queryRaw`
    SELECT g.id, g.title, g."downloadLimit", COUNT(d.id) as downloadCount
    FROM "Gallery" g
    LEFT JOIN "Download" d ON g.id = d."galleryId"
    GROUP BY g.id, g.title, g."downloadLimit"
    HAVING COUNT(d.id) > g."downloadLimit"
  `
  
  if (galleriesOverLimit.length > 0) {
    issues.push(`Found ${galleriesOverLimit.length} galleries over download limit`)
  }
  
  if (issues.length === 0) {
    log.success('Data integrity validation passed')
  } else {
    issues.forEach(issue => log.warning(issue))
  }
  
  return issues
}

async function checkOrphanedRecords() {
  log.info('Checking for orphaned records...')
  
  // Check for accounts without users
  const orphanedAccounts = await prisma.$queryRaw`
    SELECT COUNT(*) as count
    FROM "Account" a 
    LEFT JOIN "User" u ON a."userId" = u.id 
    WHERE u.id IS NULL
  `
  
  // Check for sessions without users
  const orphanedSessions = await prisma.$queryRaw`
    SELECT COUNT(*) as count
    FROM "Session" s 
    LEFT JOIN "User" u ON s."userId" = u.id 
    WHERE u.id IS NULL
  `
  
  // Check for favorites without galleries or images
  const orphanedFavorites = await prisma.$queryRaw`
    SELECT f.id 
    FROM "Favorite" f 
    LEFT JOIN "Gallery" g ON f."galleryId" = g.id 
    LEFT JOIN "GalleryImage" gi ON f."imageId" = gi.id 
    WHERE g.id IS NULL OR gi.id IS NULL
  `
  
  const orphanedAccessLogs = await prisma.$queryRaw`
    SELECT COUNT(*) as count
    FROM "GalleryAccess" ga 
    LEFT JOIN "Gallery" g ON ga."galleryId" = g.id 
    WHERE g.id IS NULL
  `
  
  log.info(`Orphaned accounts: ${orphanedAccounts[0].count}`)
  log.info(`Orphaned sessions: ${orphanedSessions[0].count}`)
  log.info(`Orphaned favorites: ${orphanedFavorites.length}`)
  log.info(`Orphaned access logs: ${orphanedAccessLogs[0].count}`)
  
  const totalOrphaned = Number(orphanedAccounts[0].count) + Number(orphanedSessions[0].count) + orphanedFavorites.length + Number(orphanedAccessLogs[0].count)
  
  if (totalOrphaned === 0) {
    log.success('No orphaned records found')
  } else {
    log.warning(`Found ${totalOrphaned} total orphaned records`)
  }
  
  return totalOrphaned
}

async function validateBusinessRules() {
  log.info('Validating business rules...')
  
  const issues = []
  
  // Check for expired galleries that are still active
  const expiredActiveGalleries = await prisma.gallery.count({
    where: {
      isActive: true,
      expiryDate: {
        lt: new Date()
      }
    }
  })
  
  if (expiredActiveGalleries > 0) {
    issues.push(`Found ${expiredActiveGalleries} expired galleries still marked as active`)
  }
  
  // Check for galleries with invalid event dates (future dates)
  const futureEventDates = await prisma.gallery.count({
    where: {
      eventDate: {
        gt: new Date()
      }
    }
  })
  
  if (futureEventDates > 0) {
    log.warning(`Found ${futureEventDates} galleries with future event dates`)
  }
  
  // Check for images with invalid dimensions
  const invalidDimensions = await prisma.galleryImage.count({
    where: {
      OR: [
        { width: { lte: 0 } },
        { height: { lte: 0 } }
      ]
    }
  })
  
  if (invalidDimensions > 0) {
    issues.push(`Found ${invalidDimensions} images with invalid dimensions`)
  }
  
  if (issues.length === 0) {
    log.success('All business rules validation passed')
  } else {
    issues.forEach(issue => log.warning(issue))
  }
  
  return issues
}

// Migration functions
async function generateMigration() {
  log.section('Migration Management')
  
  try {
    log.info('Generating Prisma migration...')
    const { stdout } = await execAsync('npx prisma migrate dev --create-only')
    log.info(stdout)
    log.success('Migration generated successfully')
  } catch (error) {
    log.error(`Migration generation failed: ${error.message}`)
    throw error
  }
}

async function applyMigrations() {
  try {
    log.info('Applying pending migrations...')
    const { stdout } = await execAsync('npx prisma migrate deploy')
    log.info(stdout)
    log.success('Migrations applied successfully')
  } catch (error) {
    log.error(`Migration application failed: ${error.message}`)
    throw error
  }
}

// Health monitoring functions
async function performHealthCheck() {
  log.section('Database Health Check')
  
  // Create a fresh client for health checks to avoid prepared statement conflicts
  const healthPrisma = createPrismaClient()
  
  try {
    const healthReport = {
      connection: await checkConnection(healthPrisma),
      performance: await checkPerformance(healthPrisma),
      storage: await checkStorage(healthPrisma),
      indexes: await checkIndexes(healthPrisma),
      queries: await analyzeQueries(healthPrisma)
    }
    
    displayHealthReport(healthReport)
    
  } catch (error) {
    log.error(`Health check failed: ${error.message}`)
    throw error
  } finally {
    await healthPrisma.$disconnect()
  }
}

async function checkConnection(prismaClient = prisma) {
  const start = Date.now()
  try {
    // Simple connection test with a lightweight query
    await prismaClient.$queryRaw`SELECT 1 as test`
    const duration = Date.now() - start
    return {
      status: 'healthy',
      responseTime: duration,
      message: `Connected in ${duration}ms`
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      responseTime: Date.now() - start,
      message: error.message
    }
  }
}

async function checkPerformance(prismaClient = prisma) {
  const tests = []
  
  // Test simple queries
  const start1 = Date.now()
  await prismaClient.user.count()
  tests.push({ query: 'User count', time: Date.now() - start1 })
  
  const start2 = Date.now()
  await prismaClient.gallery.count()
  tests.push({ query: 'Gallery count', time: Date.now() - start2 })
  
  const start3 = Date.now()
  await prismaClient.galleryImage.count()
  tests.push({ query: 'Image count', time: Date.now() - start3 })
  
  const start4 = Date.now()
  await prismaClient.gallery.findMany({ take: 10, include: { images: true } })
  tests.push({ query: 'Gallery with images', time: Date.now() - start4 })
  
  const avgTime = tests.reduce((sum, test) => sum + test.time, 0) / tests.length
  
  return {
    averageQueryTime: avgTime,
    queries: tests,
    status: avgTime < CONFIG.healthThresholds.maxQueryTime ? 'good' : 'slow'
  }
}

async function checkStorage(prismaClient = prisma) {
  try {
    // Get table sizes
    const tableSizes = await prismaClient.$queryRaw`
      SELECT 
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
        pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
    `
    
    const totalSize = tableSizes.reduce((sum, table) => sum + Number(table.size_bytes), 0)
    
    return {
      totalSize: formatBytes(totalSize),
      totalSizeBytes: totalSize,
      tables: tableSizes,
      status: 'monitored'
    }
  } catch (error) {
    return {
      status: 'unavailable',
      message: 'PostgreSQL-specific queries not available (likely SQLite)'
    }
  }
}

async function checkIndexes(prismaClient = prisma) {
  try {
    // Check for missing indexes on foreign keys
    const indexInfo = await prismaClient.$queryRaw`
      SELECT 
        schemaname,
        tablename,
        indexname,
        indexdef
      FROM pg_indexes 
      WHERE schemaname = 'public'
      ORDER BY tablename, indexname
    `
    
    return {
      indexes: indexInfo,
      count: indexInfo.length,
      status: 'monitored'
    }
  } catch (error) {
    return {
      status: 'unavailable',
      message: 'Index information not available'
    }
  }
}

async function analyzeQueries(prismaClient = prisma) {
  // Simulate common query patterns
  const queryAnalysis = []
  
  try {
    // Gallery access pattern
    const start1 = Date.now()
    await prismaClient.gallery.findUnique({
      where: { slug: 'test-gallery' },
      include: {
        images: { take: 10 },
        _count: { select: { downloads: true, favorites: true } }
      }
    })
    queryAnalysis.push({
      pattern: 'Gallery detail with images',
      time: Date.now() - start1,
      type: 'read'
    })
    
    // Download tracking
    const start2 = Date.now()
    const recentDownloads = await prismaClient.download.findMany({
      take: 100,
      orderBy: { downloadedAt: 'desc' },
      include: { gallery: true, image: true }
    })
    queryAnalysis.push({
      pattern: 'Recent downloads with relations',
      time: Date.now() - start2,
      type: 'read',
      results: recentDownloads.length
    })
    
    // Gallery statistics
    const start3 = Date.now()
    await prismaClient.$queryRaw`
      SELECT 
        g.title,
        COUNT(DISTINCT gi.id) as image_count,
        COUNT(DISTINCT d.id) as download_count,
        COUNT(DISTINCT f.id) as favorite_count
      FROM "Gallery" g
      LEFT JOIN "GalleryImage" gi ON g.id = gi."galleryId"
      LEFT JOIN "Download" d ON g.id = d."galleryId"
      LEFT JOIN "Favorite" f ON g.id = f."galleryId"
      GROUP BY g.id, g.title
      ORDER BY download_count DESC
      LIMIT 10
    `
    queryAnalysis.push({
      pattern: 'Gallery statistics aggregation',
      time: Date.now() - start3,
      type: 'analytics'
    })
    
    return queryAnalysis
    
  } catch (error) {
    return [{ error: error.message }]
  }
}

function displayHealthReport(report) {
  log.info('=== CONNECTION ===')
  log.info(`Status: ${report.connection.status}`)
  log.info(`Response Time: ${report.connection.responseTime}ms`)
  
  log.info('\n=== PERFORMANCE ===')
  log.info(`Average Query Time: ${report.performance.averageQueryTime.toFixed(2)}ms`)
  log.info(`Status: ${report.performance.status}`)
  report.performance.queries.forEach(q => {
    log.info(`  ${q.query}: ${q.time}ms`)
  })
  
  log.info('\n=== STORAGE ===')
  if (report.storage.status === 'monitored') {
    log.info(`Total Database Size: ${report.storage.totalSize}`)
  } else {
    log.info(report.storage.message)
  }
  
  log.info('\n=== QUERY ANALYSIS ===')
  report.queries.forEach(q => {
    if (q.error) {
      log.warning(`Query failed: ${q.error}`)
    } else {
      log.info(`${q.pattern}: ${q.time}ms (${q.type})`)
    }
  })
}

// Test data generation
async function generateTestData() {
  log.section('Test Data Generation')
  
  try {
    // Create test user if doesn't exist
    let testUser = await prisma.user.findUnique({
      where: { email: 'test@txmedia.com' }
    })
    
    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          email: 'test@txmedia.com',
          name: 'Test User',
          emailVerified: new Date()
        }
      })
      log.success('Created test user')
    }
    
    // Generate test galleries
    for (let i = 1; i <= CONFIG.testDataCount.galleries; i++) {
      const slug = `test-gallery-${i}`
      
      let gallery = await prisma.gallery.findUnique({ where: { slug } })
      
      if (!gallery) {
        gallery = await prisma.gallery.create({
          data: {
            title: `Test Gallery ${i}`,
            description: `Test description for gallery ${i}`,
            slug,
            password: await bcrypt.hash('testpass123', 10),
            clientName: `Test Client ${i}`,
            clientEmail: `client${i}@example.com`,
            eventType: ['wedding', 'portrait', 'drone', 'event'][i % 4],
            userId: testUser.id,
            eventDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
            expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          }
        })
        
        // Generate test images
        for (let j = 1; j <= CONFIG.testDataCount.imagesPerGallery; j++) {
          await prisma.galleryImage.create({
            data: {
              fileName: `test-image-${i}-${j}.jpg`,
              originalName: `Original Test Image ${j}.jpg`,
              filePath: `/uploads/galleries/${slug}/test-image-${i}-${j}.jpg`,
              thumbnailPath: `/uploads/galleries/${slug}/thumbs/test-image-${i}-${j}.jpg`,
              fileSize: Math.floor(Math.random() * 5000000) + 1000000,
              width: 1920 + Math.floor(Math.random() * 1080),
              height: 1080 + Math.floor(Math.random() * 720),
              order: j,
              galleryId: gallery.id
            }
          })
        }
        
        // Generate test downloads
        const images = await prisma.galleryImage.findMany({
          where: { galleryId: gallery.id },
          take: CONFIG.testDataCount.downloadsPerGallery
        })
        
        for (const image of images) {
          await prisma.download.create({
            data: {
              clientIp: `192.168.1.${Math.floor(Math.random() * 255)}`,
              userAgent: 'Test User Agent',
              galleryId: gallery.id,
              imageId: image.id,
              downloadedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
            }
          })
        }
        
        // Generate test favorites
        const favoriteImages = images.slice(0, CONFIG.testDataCount.favoritesPerGallery)
        for (const image of favoriteImages) {
          await prisma.favorite.create({
            data: {
              clientIp: `192.168.1.${Math.floor(Math.random() * 255)}`,
              galleryId: gallery.id,
              imageId: image.id
            }
          })
        }
        
        log.success(`Created test gallery: ${gallery.title}`)
      } else {
        log.info(`Test gallery already exists: ${gallery.title}`)
      }
    }
    
    log.success('Test data generation completed')
    
  } catch (error) {
    log.error(`Test data generation failed: ${error.message}`)
    throw error
  }
}

// Backup and restore functions
async function createBackup() {
  log.section('Database Backup')
  
  const backupPrisma = createPrismaClient()
  
  try {
    await ensureDirectoryExists(CONFIG.backupDir)
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupFile = path.join(CONFIG.backupDir, `txmedia-backup-${timestamp}.json`)
    
    log.info('Exporting data...')
    
    const backup = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      data: {
        users: await backupPrisma.user.findMany({
          include: {
            accounts: true,
            sessions: true,
            galleries: {
              include: {
                images: true,
                downloads: true,
                favorites: true,
                accessLogs: true
              }
            }
          }
        })
      }
    }
    
    await fs.writeFile(backupFile, JSON.stringify(backup, null, 2))
    
    const stats = await fs.stat(backupFile)
    log.success(`Backup created: ${backupFile}`)
    log.info(`Backup size: ${formatBytes(stats.size)}`)
    
    return backupFile
    
  } catch (error) {
    log.error(`Backup creation failed: ${error.message}`)
    throw error
  } finally {
    await backupPrisma.$disconnect()
  }
}

async function exportData() {
  log.section('Data Export')
  
  try {
    await ensureDirectoryExists('./exports')
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    
    // Export each table separately with fresh client for each
    const tables = [
      { name: 'user', model: 'user' },
      { name: 'gallery', model: 'gallery' },
      { name: 'galleryImage', model: 'galleryImage' },
      { name: 'download', model: 'download' },
      { name: 'favorite', model: 'favorite' },
      { name: 'galleryAccess', model: 'galleryAccess' }
    ]
    
    for (const table of tables) {
      const exportPrisma = createPrismaClient()
      try {
        const data = await exportPrisma[table.model].findMany()
        const filename = `./exports/${table.name}-${timestamp}.json`
        await fs.writeFile(filename, JSON.stringify(data, null, 2))
        log.success(`Exported ${data.length} ${table.name} records to ${filename}`)
      } finally {
        await exportPrisma.$disconnect()
      }
    }
    
  } catch (error) {
    log.error(`Data export failed: ${error.message}`)
    throw error
  }
}

// Cleanup functions
async function cleanupOrphanedRecords() {
  log.section('Cleanup Orphaned Records')
  
  const cleanupPrisma = createPrismaClient()
  
  try {
    let cleaned = 0
    
    // Clean orphaned accounts
    const orphanedAccountsResult = await cleanupPrisma.$executeRaw`
      DELETE FROM "Account" a 
      WHERE NOT EXISTS (SELECT 1 FROM "User" u WHERE u.id = a."userId")
    `
    cleaned += orphanedAccountsResult
    log.info(`Cleaned ${orphanedAccountsResult} orphaned accounts`)
    
    // Clean orphaned sessions
    const orphanedSessionsResult = await cleanupPrisma.$executeRaw`
      DELETE FROM "Session" s 
      WHERE NOT EXISTS (SELECT 1 FROM "User" u WHERE u.id = s."userId")
    `
    cleaned += orphanedSessionsResult
    log.info(`Cleaned ${orphanedSessionsResult} orphaned sessions`)
    
    // Clean orphaned favorites
    const orphanedFavoritesResult = await cleanupPrisma.$executeRaw`
      DELETE FROM "Favorite" f 
      WHERE NOT EXISTS (SELECT 1 FROM "Gallery" g WHERE g.id = f."galleryId")
         OR NOT EXISTS (SELECT 1 FROM "GalleryImage" gi WHERE gi.id = f."imageId")
    `
    cleaned += orphanedFavoritesResult
    log.info(`Cleaned ${orphanedFavoritesResult} orphaned favorites`)
    
    // Clean orphaned downloads
    const orphanedDownloadsResult = await cleanupPrisma.$executeRaw`
      DELETE FROM "Download" d 
      WHERE NOT EXISTS (SELECT 1 FROM "Gallery" g WHERE g.id = d."galleryId")
         OR NOT EXISTS (SELECT 1 FROM "GalleryImage" gi WHERE gi.id = d."imageId")
    `
    cleaned += orphanedDownloadsResult
    log.info(`Cleaned ${orphanedDownloadsResult} orphaned downloads`)
    
    // Clean orphaned access logs
    const orphanedAccessLogsResult = await cleanupPrisma.$executeRaw`
      DELETE FROM "GalleryAccess" ga 
      WHERE NOT EXISTS (SELECT 1 FROM "Gallery" g WHERE g.id = ga."galleryId")
    `
    cleaned += orphanedAccessLogsResult
    log.info(`Cleaned ${orphanedAccessLogsResult} orphaned access logs`)
    
    log.success(`Cleanup completed. Removed ${cleaned} orphaned records`)
    
  } catch (error) {
    log.error(`Cleanup failed: ${error.message}`)
    throw error
  } finally {
    await cleanupPrisma.$disconnect()
  }
}

// Analysis functions
async function analyzeRelationships() {
  log.section('Relationship Analysis')
  
  const analysisPrisma = createPrismaClient()
  
  try {
    // User to Gallery relationship
    const userGalleryStats = await analysisPrisma.$queryRaw`
      SELECT 
        u.name,
        u.email,
        COUNT(g.id) as gallery_count,
        SUM(CASE WHEN g."isActive" THEN 1 ELSE 0 END) as active_galleries
      FROM "User" u
      LEFT JOIN "Gallery" g ON u.id = g."userId"
      GROUP BY u.id, u.name, u.email
      ORDER BY gallery_count DESC
    `
    
    log.info('User → Gallery relationships:')
    userGalleryStats.forEach(stat => {
      log.info(`  ${stat.name} (${stat.email}): ${stat.gallery_count} galleries (${stat.active_galleries} active)`)
    })
    
    // Gallery to Image relationship
    const galleryImageStats = await analysisPrisma.$queryRaw`
      SELECT 
        g.title,
        g.slug,
        COUNT(gi.id) as image_count,
        AVG(gi."fileSize") as avg_file_size,
        SUM(gi."fileSize") as total_size
      FROM "Gallery" g
      LEFT JOIN "GalleryImage" gi ON g.id = gi."galleryId"
      GROUP BY g.id, g.title, g.slug
      ORDER BY image_count DESC
      LIMIT 10
    `
    
    log.info('\nGallery → Image relationships (top 10):')
    galleryImageStats.forEach(stat => {
      log.info(`  ${stat.title}: ${stat.image_count} images, ${formatBytes(Number(stat.total_size || 0))} total`)
    })
    
    // Download patterns
    const downloadStats = await analysisPrisma.$queryRaw`
      SELECT 
        g.title,
        COUNT(d.id) as download_count,
        g."downloadLimit",
        ROUND((COUNT(d.id) * 100.0 / g."downloadLimit"), 2) as usage_percent
      FROM "Gallery" g
      LEFT JOIN "Download" d ON g.id = d."galleryId"
      GROUP BY g.id, g.title, g."downloadLimit"
      HAVING COUNT(d.id) > 0
      ORDER BY usage_percent DESC
      LIMIT 10
    `
    
    log.info('\nDownload usage patterns (top 10):')
    downloadStats.forEach(stat => {
      log.info(`  ${stat.title}: ${stat.download_count}/${stat.downloadLimit} (${stat.usage_percent}% used)`)
    })
    
  } catch (error) {
    log.error(`Analysis failed: ${error.message}`)
    throw error
  } finally {
    await analysisPrisma.$disconnect()
  }
}

// Reset function (development only)
async function resetDatabase() {
  if (process.env.NODE_ENV === 'production') {
    log.error('Database reset is not allowed in production environment')
    return
  }
  
  log.section('Database Reset (Development Only)')
  
  try {
    log.warning('This will delete all data. Continue? (This is automated - skipping confirmation)')
    
    // Reset using Prisma
    await execAsync('npx prisma migrate reset --force')
    log.success('Database reset completed')
    
  } catch (error) {
    log.error(`Database reset failed: ${error.message}`)
    throw error
  }
}

// Main CLI handler
async function main() {
  const command = process.argv[2]
  
  if (!command) {
    console.log(`
txMedia Database Schema Management Agent

Available commands:
  validate    - Validate schema and data integrity
  migrate     - Generate and apply migrations
  backup      - Create database backups
  test-data   - Generate test data
  health      - Database health check
  reset       - Reset database (development only)
  analyze     - Analyze relationships and performance
  export      - Export data for migration
  cleanup     - Clean up orphaned records

Usage: node db-agent.js <command>
    `)
    process.exit(0)
  }
  
  try {
    switch (command) {
      case 'validate':
        await validateSchema()
        break
        
      case 'migrate':
        await generateMigration()
        await applyMigrations()
        break
        
      case 'backup':
        await createBackup()
        break
        
      case 'test-data':
        await generateTestData()
        break
        
      case 'health':
        await performHealthCheck()
        break
        
      case 'reset':
        await resetDatabase()
        break
        
      case 'analyze':
        await analyzeRelationships()
        break
        
      case 'export':
        await exportData()
        break
        
      case 'cleanup':
        await cleanupOrphanedRecords()
        break
        
      default:
        log.error(`Unknown command: ${command}`)
        process.exit(1)
    }
    
  } catch (error) {
    log.error(`Command failed: ${error.message}`)
    process.exit(1)
    
  } finally {
    await prisma.$disconnect()
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  log.info('Shutting down gracefully...')
  await prisma.$disconnect()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  log.info('Shutting down gracefully...')
  await prisma.$disconnect()
  process.exit(0)
})

// Run the CLI
if (require.main === module) {
  main().catch(console.error)
}

module.exports = {
  validateSchema,
  generateMigration,
  applyMigrations,
  performHealthCheck,
  generateTestData,
  createBackup,
  exportData,
  cleanupOrphanedRecords,
  analyzeRelationships,
  resetDatabase
}