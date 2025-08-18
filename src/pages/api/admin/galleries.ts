/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const session = await getSession({ req })
    
    if (!session || (session.user as any)?.type !== 'admin') {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    // Fetch galleries with image and download counts
    const galleries = await prisma.gallery.findMany({
      include: {
        images: true,
        downloads: true,
        _count: {
          select: {
            images: true,
            downloads: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calculate stats
    const totalGalleries = galleries.length
    const activeGalleries = galleries.filter(g => g.isActive).length
    const totalImages = galleries.reduce((sum, g) => sum + g._count.images, 0)
    const totalDownloads = galleries.reduce((sum, g) => sum + g._count.downloads, 0)

    // Format galleries for response
    const formattedGalleries = galleries.map(gallery => ({
      id: gallery.id,
      title: gallery.title,
      slug: gallery.slug,
      clientName: gallery.clientName,
      clientEmail: gallery.clientEmail,
      eventType: gallery.eventType,
      eventDate: gallery.eventDate?.toISOString() || null,
      isActive: gallery.isActive,
      downloadLimit: gallery.downloadLimit,
      imageCount: gallery._count.images,
      downloadCount: gallery._count.downloads,
      createdAt: gallery.createdAt.toISOString()
    }))

    const stats = {
      totalGalleries,
      activeGalleries,
      totalImages,
      totalDownloads
    }

    res.status(200).json({
      galleries: formattedGalleries,
      stats
    })
  } catch (error) {
    console.error('Admin galleries fetch error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}