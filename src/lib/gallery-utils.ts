import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export async function createTestGallery() {
  const hashedPassword = await bcrypt.hash('demo123', 12)
  
  // Create a test user first using environment variables
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com'
  const user = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: 'Admin User',
      email: adminEmail
    }
  })

  // Create a test gallery
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
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      userId: user.id
    }
  })

  // Add some test images (using existing portfolio images)
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

  for (let i = 0; i < testImages.length; i++) {
    const img = testImages[i]
    await prisma.galleryImage.create({
      data: {
        fileName: img.fileName,
        originalName: img.originalName,
        filePath: `/${img.fileName}`, // Using existing portfolio images
        thumbnailPath: `/${img.fileName}`, // Same for demo
        fileSize: 2500000, // 2.5MB estimate
        width: img.width,
        height: img.height,
        order: i,
        galleryId: gallery.id
      }
    })
  }

  console.log(`Test gallery created:`)
  console.log(`Gallery ID: ${gallery.slug}`)
  console.log(`Password: demo123`)
  const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000'
  console.log(`Access URL: ${baseUrl}/gallery/${gallery.slug}`)
  
  return gallery
}

export function generateGallerySlug(clientName: string, eventType: string, eventDate: Date): string {
  const cleanName = clientName.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 20)
  
  const year = eventDate.getFullYear()
  const month = String(eventDate.getMonth() + 1).padStart(2, '0')
  
  return `${eventType}-${cleanName}-${year}${month}`
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}