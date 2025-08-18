const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function setupTestGallery() {
  try {
    console.log('Setting up test gallery...')

    // Create a test user
    const user = await prisma.user.upsert({
      where: { email: 'xavier@txmedia.com' },
      update: {},
      create: {
        name: 'Xavier Thorbjornsen',
        email: 'xavier@txmedia.com'
      }
    })

    console.log('User created/found:', user.email)

    // Hash password
    const hashedPassword = await bcrypt.hash('demo123', 12)
    
    // Create test gallery
    const gallery = await prisma.gallery.create({
      data: {
        title: 'Smith Wedding 2024',
        description: 'Beautiful wedding ceremony at Mindil Beach',
        slug: 'smith-wedding-2024',
        password: hashedPassword,
        clientName: 'John & Sarah Smith',
        clientEmail: 'smith@example.com',
        eventDate: new Date('2024-06-15'),
        eventType: 'wedding',
        downloadLimit: 50,
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        userId: user.id
      }
    })

    console.log('Gallery created:', gallery.title)

    // Create galleries directory structure
    const galleryDir = path.join(process.cwd(), 'public', 'galleries', gallery.slug)
    const thumbnailDir = path.join(galleryDir, 'thumbnails')
    
    if (!fs.existsSync(galleryDir)) {
      fs.mkdirSync(galleryDir, { recursive: true })
    }
    if (!fs.existsSync(thumbnailDir)) {
      fs.mkdirSync(thumbnailDir, { recursive: true })
    }

    console.log('Gallery directories created')

    // Add test images using existing portfolio images
    const testImages = [
      {
        fileName: 'wedding_hill.jpg',
        originalName: 'Wedding_Ceremony_Hill.jpg',
        width: 1920,
        height: 1280
      },
      {
        fileName: 'brides.jpg',
        originalName: 'Bride_And_Groom_Portrait.jpg',
        width: 1920,
        height: 1280
      },
      {
        fileName: 'wedding_ring.jpg',
        originalName: 'Wedding_Rings_Detail.jpg',
        width: 1920,
        height: 1280
      }
    ]

    // Copy existing images to gallery folder and create database records
    for (let i = 0; i < testImages.length; i++) {
      const img = testImages[i]
      const sourcePath = path.join(process.cwd(), 'public', img.fileName)
      const destPath = path.join(galleryDir, img.fileName)
      const thumbPath = path.join(thumbnailDir, img.fileName)

      // Copy image if it exists
      if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, destPath)
        fs.copyFileSync(sourcePath, thumbPath) // Using same image as thumbnail for demo
        console.log(`Copied ${img.fileName}`)
      }

      // Create database record
      await prisma.galleryImage.create({
        data: {
          fileName: img.fileName,
          originalName: img.originalName,
          filePath: `/galleries/${gallery.slug}/${img.fileName}`,
          thumbnailPath: `/galleries/${gallery.slug}/thumbnails/${img.fileName}`,
          fileSize: fs.existsSync(sourcePath) ? fs.statSync(sourcePath).size : 2500000,
          width: img.width,
          height: img.height,
          order: i,
          galleryId: gallery.id
        }
      })
    }

    console.log('\n✅ Test gallery setup complete!')
    console.log('─'.repeat(50))
    console.log(`Gallery ID: ${gallery.slug}`)
    console.log(`Password: demo123`)
    console.log(`Login URL: http://localhost:3000/gallery/login`)
    console.log(`Direct URL: http://localhost:3000/gallery/${gallery.slug}`)
    console.log('─'.repeat(50))

  } catch (error) {
    console.error('Error setting up test gallery:', error)
  } finally {
    await prisma.$disconnect()
  }
}

setupTestGallery()