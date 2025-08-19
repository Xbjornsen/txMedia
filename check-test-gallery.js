const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkTestGallery() {
  try {
    const gallery = await prisma.gallery.findUnique({
      where: { slug: 'test-wedding-2024' },
      include: { images: true }
    })
    
    console.log('Gallery:', gallery?.title)
    console.log('Images count:', gallery?.images?.length || 0)
    
    if (gallery?.images && gallery.images.length > 0) {
      console.log('Images:')
      gallery.images.forEach((img, i) => {
        console.log(`  ${i+1}. ${img.fileName} (${img.originalName})`)
      })
    } else {
      console.log('No images found in gallery')
    }
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkTestGallery()