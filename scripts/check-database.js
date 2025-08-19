const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkDatabase() {
  try {
    console.log('🔍 Checking database status...\n')

    // Check users
    const users = await prisma.user.findMany()
    console.log(`👥 Users: ${users.length}`)
    users.forEach(user => {
      console.log(`   - ${user.name} (${user.email})`)
    })

    // Check galleries
    const galleries = await prisma.gallery.findMany({
      include: {
        images: true,
        downloads: true,
        _count: {
          select: {
            images: true,
            downloads: true,
            favorites: true
          }
        }
      }
    })
    
    console.log(`\n🖼️  Galleries: ${galleries.length}`)
    galleries.forEach(gallery => {
      console.log(`   - "${gallery.title}" (slug: ${gallery.slug})`)
      console.log(`     Client: ${gallery.clientName} <${gallery.clientEmail}>`)
      console.log(`     Type: ${gallery.eventType}`)
      console.log(`     Images: ${gallery._count.images}`)
      console.log(`     Downloads: ${gallery._count.downloads}/${gallery.downloadLimit}`)
      console.log(`     Favorites: ${gallery._count.favorites}`)
      console.log(`     Active: ${gallery.isActive ? '✅' : '❌'}`)
      console.log(`     Expires: ${gallery.expiryDate ? gallery.expiryDate.toLocaleDateString() : 'Never'}`)
      console.log('')
    })

    // Check total images
    const totalImages = await prisma.galleryImage.count()
    console.log(`📸 Total Images: ${totalImages}`)

    // Check total downloads
    const totalDownloads = await prisma.download.count()
    console.log(`⬇️  Total Downloads: ${totalDownloads}`)

    // Check favorites
    const totalFavorites = await prisma.favorite.count()
    console.log(`❤️  Total Favorites: ${totalFavorites}`)

    // Check gallery access logs
    const accessLogs = await prisma.galleryAccess.count()
    console.log(`📊 Gallery Access Logs: ${accessLogs}`)

    console.log('\n✅ Database check complete!')

  } catch (error) {
    console.error('❌ Database check failed:', error)
    
    if (error.code === 'P1001') {
      console.log('\n💡 Solution: Run "npx prisma migrate dev" to set up the database')
    }
  } finally {
    await prisma.$disconnect()
  }
}

checkDatabase()