const { PrismaClient } = require('@prisma/client')

async function testConnection() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  })

  try {
    console.log('🔌 Testing database connection...')
    
    // Test basic connection
    await prisma.$connect()
    console.log('✅ Database connected')
    
    // Check if tables exist
    const galleryCount = await prisma.gallery.count()
    console.log(`📊 Galleries in database: ${galleryCount}`)
    
    const userCount = await prisma.user.count()
    console.log(`👤 Users in database: ${userCount}`)
    
    // List galleries if any
    if (galleryCount > 0) {
      const galleries = await prisma.gallery.findMany({
        select: { id: true, title: true, slug: true, isActive: true }
      })
      console.log('📂 Galleries:')
      galleries.forEach(g => {
        console.log(`   - ${g.title} (${g.slug}) - ${g.isActive ? 'Active' : 'Inactive'}`)
      })
    }
    
  } catch (error) {
    console.error('❌ Database error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()