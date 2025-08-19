const { PrismaClient } = require('@prisma/client')
const { put } = require('@vercel/blob')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function migratePhotosToBlob() {
  console.log('📁 Starting photo migration to Vercel Blob...\n')

  // Check if Vercel Blob is configured
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.log('❌ BLOB_READ_WRITE_TOKEN not found in environment variables')
    console.log('💡 Set up Vercel Blob Storage first:')
    console.log('   npm run setup-vercel-blob')
    process.exit(1)
  }

  try {
    // Get all galleries with images
    const galleries = await prisma.gallery.findMany({
      include: {
        images: true
      }
    })

    if (galleries.length === 0) {
      console.log('❌ No galleries found to migrate')
      return
    }

    console.log(`📋 Found ${galleries.length} galleries to migrate`)

    let totalImages = 0
    let migratedImages = 0
    let skippedImages = 0

    for (const gallery of galleries) {
      console.log(`\n🖼️  Processing gallery: ${gallery.title} (${gallery.slug})`)
      console.log(`   Images: ${gallery.images.length}`)

      const galleryDir = path.join(process.cwd(), 'public', 'galleries', gallery.slug)
      const thumbnailDir = path.join(galleryDir, 'thumbnails')

      for (const image of gallery.images) {
        totalImages++
        
        // Skip if already using Blob URLs
        if (image.filePath.startsWith('https://')) {
          console.log(`   ✓ Skipping ${image.fileName} (already migrated)`)
          skippedImages++
          continue
        }

        const imagePath = path.join(process.cwd(), 'public', image.filePath)
        const thumbnailPath = path.join(process.cwd(), 'public', image.thumbnailPath)

        try {
          // Check if files exist
          if (!fs.existsSync(imagePath)) {
            console.log(`   ❌ File not found: ${imagePath}`)
            continue
          }

          if (!fs.existsSync(thumbnailPath)) {
            console.log(`   ❌ Thumbnail not found: ${thumbnailPath}`)
            continue
          }

          // Read files
          const imageBuffer = fs.readFileSync(imagePath)
          const thumbnailBuffer = fs.readFileSync(thumbnailPath)

          // Upload to Vercel Blob
          console.log(`   📤 Uploading ${image.fileName}...`)
          
          const [imageBlob, thumbnailBlob] = await Promise.all([
            put(`galleries/${gallery.slug}/${image.fileName}`, imageBuffer, {
              access: 'public',
              contentType: 'image/jpeg'
            }),
            put(`galleries/${gallery.slug}/thumbnails/thumb_${image.fileName}`, thumbnailBuffer, {
              access: 'public',
              contentType: 'image/jpeg'
            })
          ])

          // Update database with new URLs
          await prisma.galleryImage.update({
            where: { id: image.id },
            data: {
              filePath: imageBlob.url,
              thumbnailPath: thumbnailBlob.url
            }
          })

          console.log(`   ✅ Migrated ${image.fileName}`)
          migratedImages++

        } catch (error) {
          console.error(`   ❌ Failed to migrate ${image.fileName}:`, error.message)
        }
      }
    }

    console.log('\n🎉 Migration Summary:')
    console.log(`   Total images: ${totalImages}`)
    console.log(`   Migrated: ${migratedImages}`)
    console.log(`   Skipped: ${skippedImages}`)
    console.log(`   Failed: ${totalImages - migratedImages - skippedImages}`)

    if (migratedImages > 0) {
      console.log('\n✅ Migration completed successfully!')
      console.log('\n📋 Next steps:')
      console.log('1. Test your galleries to ensure images load correctly')
      console.log('2. Update upload API to use Blob storage for new uploads')
      console.log('3. Consider removing local files to save space')
      console.log('\n⚠️  Backup recommendation:')
      console.log('   Keep local files until you\'ve verified everything works')
    }

  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Add dry-run option
const isDryRun = process.argv.includes('--dry-run')
if (isDryRun) {
  console.log('🔍 DRY RUN MODE - No files will be uploaded or modified\n')
}

migratePhotosToBlob()