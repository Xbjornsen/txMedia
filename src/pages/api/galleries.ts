import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // Fetch only public/active galleries for public viewing
    const galleries = await prisma.gallery.findMany({
      where: {
        isActive: true,
        // Optional: Add additional filters for public galleries
        // You might want to add a `isPublic` field to the schema in the future
      },
      select: {
        id: true,
        title: true,
        description: true,
        slug: true,
        eventType: true,
        eventDate: true,
        createdAt: true,
        images: {
          select: {
            id: true,
            fileName: true,
            thumbnailPath: true,
            filePath: true,
            width: true,
            height: true,
          },
          take: 1, // Get first image as thumbnail
          orderBy: { order: 'asc' }
        },
        _count: {
          select: {
            images: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Format galleries for public consumption
    const formattedGalleries = galleries.map(gallery => ({
      id: gallery.id,
      title: gallery.title,
      description: gallery.description,
      slug: gallery.slug,
      eventType: gallery.eventType,
      eventDate: gallery.eventDate?.toISOString() || null,
      imageCount: gallery._count.images,
      thumbnail: gallery.images[0] ? {
        id: gallery.images[0].id,
        fileName: gallery.images[0].fileName,
        thumbnailPath: `/galleries/${gallery.slug}/thumbnails/${gallery.images[0].fileName}`,
        filePath: `/galleries/${gallery.slug}/${gallery.images[0].fileName}`,
        width: gallery.images[0].width,
        height: gallery.images[0].height,
      } : null,
      createdAt: gallery.createdAt.toISOString()
    }))

    res.status(200).json({
      galleries: formattedGalleries,
      total: formattedGalleries.length
    })
  } catch (error) {
    console.error('Public galleries fetch error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}