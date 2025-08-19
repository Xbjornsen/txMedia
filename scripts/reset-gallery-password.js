const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function resetGalleryPassword() {
  try {
    const gallerySlug = process.argv[2] || 'smith-wedding-2024'
    const newPassword = process.argv[3] || 'wedding2024'
    
    console.log(`🔄 Resetting password for gallery: ${gallerySlug}`)
    
    const gallery = await prisma.gallery.findUnique({
      where: { slug: gallerySlug }
    })
    
    if (!gallery) {
      console.log('❌ Gallery not found')
      return
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 12)
    
    await prisma.gallery.update({
      where: { slug: gallerySlug },
      data: { password: hashedPassword }
    })
    
    console.log('✅ Password reset successfully!')
    console.log('')
    console.log('📋 Gallery Access Details:')
    console.log(`   Gallery ID: ${gallerySlug}`)
    console.log(`   Password: ${newPassword}`)
    console.log(`   URL: http://localhost:3002/gallery/login`)
    console.log(`   Direct: http://localhost:3002/gallery/${gallerySlug}`)
    
  } catch (error) {
    console.error('❌ Error resetting password:', error)
  } finally {
    await prisma.$disconnect()
  }
}

resetGalleryPassword()