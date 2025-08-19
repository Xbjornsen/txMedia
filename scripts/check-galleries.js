const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkGalleries() {
  try {
    console.log('📋 Checking existing galleries...\n')
    
    const galleries = await prisma.gallery.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        clientName: true,
        eventType: true,
        eventDate: true,
        isActive: true,
        expiryDate: true,
        downloadLimit: true,
        _count: {
          select: {
            images: true
          }
        }
      }
    })

    if (galleries.length === 0) {
      console.log('❌ No galleries found in database')
      console.log('💡 Run: npm run create-test-gallery')
      return
    }

    console.log(`✅ Found ${galleries.length} galleries:\n`)
    
    galleries.forEach((gallery, index) => {
      console.log(`${index + 1}. ${gallery.title}`)
      console.log(`   📂 Slug: ${gallery.slug}`)
      console.log(`   👥 Client: ${gallery.clientName}`)
      console.log(`   📸 Images: ${gallery._count.images}`)
      console.log(`   📅 Event: ${gallery.eventDate?.toLocaleDateString() || 'Not set'}`)
      console.log(`   🔒 Active: ${gallery.isActive ? 'Yes' : 'No'}`)
      console.log(`   ⏰ Expires: ${gallery.expiryDate?.toLocaleDateString() || 'Never'}`)
      console.log(`   ⬇️  Download Limit: ${gallery.downloadLimit || 'Unlimited'}`)
      console.log('')
    })

    console.log('🔗 Test URLs:')
    galleries.forEach(gallery => {
      console.log(`   ${gallery.title}: http://localhost:3002/gallery/${gallery.slug}`)
    })

  } catch (error) {
    console.error('❌ Error checking galleries:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkGalleries()