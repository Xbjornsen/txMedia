const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function exportData() {
  try {
    console.log('📤 Exporting database data...\n')

    // Export all data
    const users = await prisma.user.findMany()
    const galleries = await prisma.gallery.findMany()
    const images = await prisma.galleryImage.findMany()
    const downloads = await prisma.download.findMany()
    const favorites = await prisma.favorite.findMany()
    const galleryAccess = await prisma.galleryAccess.findMany()

    const exportData = {
      users,
      galleries,
      images,
      downloads,
      favorites,
      galleryAccess,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    }

    // Save to file
    const exportPath = path.join(process.cwd(), 'data-export.json')
    fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2))

    console.log('✅ Data exported successfully!')
    console.log(`📁 File: ${exportPath}`)
    console.log(`📊 Statistics:`)
    console.log(`   - Users: ${users.length}`)
    console.log(`   - Galleries: ${galleries.length}`)
    console.log(`   - Images: ${images.length}`)
    console.log(`   - Downloads: ${downloads.length}`)
    console.log(`   - Favorites: ${favorites.length}`)
    console.log(`   - Access Logs: ${galleryAccess.length}`)

  } catch (error) {
    console.error('❌ Export failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

exportData()