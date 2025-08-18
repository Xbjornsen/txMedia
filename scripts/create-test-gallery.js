const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function createTestGallery() {
  try {
    console.log('Creating test gallery...')

    // Get or create admin user
    let user = await prisma.user.findUnique({
      where: { email: process.env.ADMIN_EMAIL || 'xavier@txmedia.com' }
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: 'Xavier Thorbjornsen',
          email: process.env.ADMIN_EMAIL || 'xavier@txmedia.com'
        }
      })
      console.log('✅ Created admin user')
    }

    // Create test gallery
    const hashedPassword = await bcrypt.hash('test123', 12)
    const expiryDate = new Date()
    expiryDate.setMonth(expiryDate.getMonth() + 12)

    const gallery = await prisma.gallery.create({
      data: {
        title: 'Test Wedding Gallery',
        slug: 'test-wedding-2024',
        password: hashedPassword,
        clientName: 'John & Sarah Smith',
        clientEmail: 'john.sarah@example.com',
        eventType: 'wedding',
        eventDate: new Date('2024-06-15'),
        description: 'Beautiful wedding celebration',
        downloadLimit: 50,
        expiryDate,
        userId: user.id
      }
    })

    // Create gallery directories
    const galleryDir = path.join(process.cwd(), 'public', 'galleries', gallery.slug)
    const thumbnailDir = path.join(galleryDir, 'thumbnails')
    
    if (!fs.existsSync(galleryDir)) {
      fs.mkdirSync(galleryDir, { recursive: true })
    }
    if (!fs.existsSync(thumbnailDir)) {
      fs.mkdirSync(thumbnailDir, { recursive: true })
    }

    console.log('✅ Test gallery created successfully!')
    console.log('📋 Gallery Details:')
    console.log(`   Slug: ${gallery.slug}`)
    console.log(`   Password: test123`)
    console.log(`   Client: ${gallery.clientName}`)
    console.log(`   Access URL: /gallery/${gallery.slug}`)
    console.log('')
    console.log('🔗 Test URLs:')
    console.log(`   Admin Login: http://localhost:3000/admin/login`)
    console.log(`   Client Login: http://localhost:3000/gallery/login`)
    console.log(`   Direct Gallery: http://localhost:3000/gallery/${gallery.slug}`)
    
  } catch (error) {
    console.error('❌ Error creating test gallery:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestGallery()