const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function importData() {
  try {
    console.log('📥 Importing database data...\n')

    // Read export file
    const exportPath = path.join(process.cwd(), 'data-export.json')
    if (!fs.existsSync(exportPath)) {
      console.error('❌ No data-export.json file found!')
      console.log('💡 Run "npm run db:export" first to create an export file')
      return
    }

    const data = JSON.parse(fs.readFileSync(exportPath, 'utf8'))
    console.log(`📄 Import file created: ${data.exportedAt}`)
    console.log(`📊 Data to import:`)
    console.log(`   - Users: ${data.users.length}`)
    console.log(`   - Galleries: ${data.galleries.length}`)
    console.log(`   - Images: ${data.images.length}`)
    console.log(`   - Downloads: ${data.downloads.length}`)
    console.log(`   - Favorites: ${data.favorites.length}`)
    console.log(`   - Access Logs: ${data.galleryAccess.length}`)

    console.log('\n🔄 Starting import...')

    // Import in order (respecting foreign keys)
    
    // 1. Users first (no dependencies)
    for (const user of data.users) {
      await prisma.user.upsert({
        where: { id: user.id },
        update: user,
        create: user
      })
    }
    console.log('✅ Users imported')

    // 2. Galleries (depend on users)
    for (const gallery of data.galleries) {
      await prisma.gallery.upsert({
        where: { id: gallery.id },
        update: gallery,
        create: {
          ...gallery,
          eventDate: gallery.eventDate ? new Date(gallery.eventDate) : null,
          expiryDate: gallery.expiryDate ? new Date(gallery.expiryDate) : null,
          createdAt: new Date(gallery.createdAt),
          updatedAt: new Date(gallery.updatedAt)
        }
      })
    }
    console.log('✅ Galleries imported')

    // 3. Images (depend on galleries)
    for (const image of data.images) {
      await prisma.galleryImage.upsert({
        where: { id: image.id },
        update: image,
        create: {
          ...image,
          createdAt: new Date(image.createdAt),
          updatedAt: new Date(image.updatedAt)
        }
      })
    }
    console.log('✅ Images imported')

    // 4. Downloads (depend on galleries and images)
    for (const download of data.downloads) {
      await prisma.download.upsert({
        where: { id: download.id },
        update: download,
        create: {
          ...download,
          downloadedAt: new Date(download.downloadedAt)
        }
      })
    }
    console.log('✅ Downloads imported')

    // 5. Favorites (depend on galleries and images)
    for (const favorite of data.favorites) {
      await prisma.favorite.upsert({
        where: { id: favorite.id },
        update: favorite,
        create: {
          ...favorite,
          createdAt: new Date(favorite.createdAt)
        }
      })
    }
    console.log('✅ Favorites imported')

    // 6. Gallery access logs
    for (const access of data.galleryAccess) {
      await prisma.galleryAccess.upsert({
        where: { id: access.id },
        update: access,
        create: {
          ...access,
          accessedAt: new Date(access.accessedAt)
        }
      })
    }
    console.log('✅ Access logs imported')

    console.log('\n🎉 Import completed successfully!')

  } catch (error) {
    console.error('❌ Import failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

importData()