import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { prisma } from '@/lib/prisma'
import fs from 'fs/promises'
import path from 'path'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Check authentication
    const session = await getSession({ req })
    if (!session?.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { galleryId } = req.body

    // Validate input
    if (!galleryId || typeof galleryId !== 'string') {
      return res.status(400).json({ error: 'Gallery ID is required' })
    }

    // Check if gallery exists and get its slug for file cleanup
    const gallery = await prisma.gallery.findUnique({
      where: { id: galleryId },
      select: {
        id: true,
        slug: true,
        title: true,
        images: {
          select: {
            fileName: true
          }
        }
      }
    })

    if (!gallery) {
      return res.status(404).json({ error: 'Gallery not found' })
    }

    // Start database transaction for safe deletion
    await prisma.$transaction(async (tx) => {
      // Delete in correct order to handle foreign key constraints
      // 1. Delete downloads (references both gallery and images)
      await tx.download.deleteMany({
        where: { galleryId: galleryId }
      })

      // 2. Delete favorites (references both gallery and images)
      await tx.favorite.deleteMany({
        where: { galleryId: galleryId }
      })

      // 3. Delete access logs
      await tx.galleryAccess.deleteMany({
        where: { galleryId: galleryId }
      })

      // 4. Delete gallery images
      await tx.galleryImage.deleteMany({
        where: { galleryId: galleryId }
      })

      // 5. Finally delete the gallery itself
      await tx.gallery.delete({
        where: { id: galleryId }
      })
    })

    // Clean up files from file system
    try {
      const galleryPath = path.join(process.cwd(), 'public', 'galleries', gallery.slug)
      
      // Check if directory exists before attempting to remove it
      try {
        await fs.access(galleryPath)
        await fs.rm(galleryPath, { recursive: true, force: true })
        console.log(`Removed gallery directory: ${galleryPath}`)
      } catch (fsError) {
        // Directory might not exist or already be deleted - log but don't fail
        console.warn(`Could not remove gallery directory ${galleryPath}:`, fsError)
      }
    } catch (cleanupError) {
      // File system cleanup failed, but database deletion succeeded
      console.error('File system cleanup failed:', cleanupError)
      // Return success but with a warning about file cleanup
      return res.status(200).json({
        success: true,
        message: `Gallery "${gallery.title}" deleted successfully`,
        warning: 'Some files may not have been cleaned up from the file system',
        deletedGallery: {
          id: gallery.id,
          title: gallery.title,
          slug: gallery.slug
        }
      })
    }

    return res.status(200).json({
      success: true,
      message: `Gallery "${gallery.title}" deleted successfully`,
      deletedGallery: {
        id: gallery.id,
        title: gallery.title,
        slug: gallery.slug
      }
    })

  } catch (error) {
    console.error('Error deleting gallery:', error)
    
    // Check if it's a Prisma error
    if (error instanceof Error) {
      if (error.message.includes('foreign key constraint')) {
        return res.status(400).json({ 
          error: 'Cannot delete gallery: it has related records that must be removed first' 
        })
      }
      
      if (error.message.includes('Record to delete does not exist')) {
        return res.status(404).json({ error: 'Gallery not found' })
      }
    }

    return res.status(500).json({ 
      error: 'Internal server error occurred while deleting gallery' 
    })
  }
}