import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { slug } = req.query
  
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // For now, allow direct access to gallery data if gallery exists and is active
    // In production, you might want to add additional security checks

    const gallery = await prisma.gallery.findUnique({
      where: {
        slug: slug as string,
        isActive: true
      },
      include: {
        images: {
          orderBy: { order: 'asc' }
        },
        downloads: true,
        favorites: {
          where: {
            clientIp: getClientIP(req)
          }
        }
      }
    })

    if (!gallery) {
      return res.status(404).json({ message: 'Gallery not found' })
    }

    // Check if gallery has expired
    if (gallery.expiryDate && new Date() > gallery.expiryDate) {
      return res.status(410).json({ message: 'Gallery has expired' })
    }

    // Track gallery access
    await prisma.galleryAccess.create({
      data: {
        galleryId: gallery.id,
        clientIp: getClientIP(req),
        userAgent: req.headers['user-agent'] || null
      }
    })

    // Process images with favorite status
    const imagesWithFavorites = gallery.images.map(image => ({
      id: image.id,
      fileName: image.fileName,
      originalName: image.originalName,
      thumbnailPath: `/galleries/${gallery.slug}/thumbnails/${image.fileName}`,
      filePath: `/galleries/${gallery.slug}/${image.fileName}`,
      width: image.width,
      height: image.height,
      isFavorite: gallery.favorites.some(fav => fav.imageId === image.id)
    }))

    const response = {
      id: gallery.id,
      title: gallery.title,
      description: gallery.description,
      clientName: gallery.clientName,
      eventDate: gallery.eventDate,
      eventType: gallery.eventType,
      downloadLimit: gallery.downloadLimit,
      images: imagesWithFavorites,
      downloadsUsed: gallery.downloads.length
    }

    res.status(200).json(response)
  } catch (error) {
    console.error('Gallery fetch error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

function getClientIP(req: NextApiRequest): string {
  const forwarded = req.headers['x-forwarded-for']
  const ip = forwarded 
    ? (Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0])
    : req.socket.remoteAddress || 'unknown'
  return ip
}