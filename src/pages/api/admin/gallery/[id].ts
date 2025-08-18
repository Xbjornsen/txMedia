/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (req.method === 'GET') {
    try {
      const session = await getSession({ req })
      
      if (!session || (session.user as any)?.type !== 'admin') {
        return res.status(401).json({ message: 'Unauthorized' })
      }

      const gallery = await prisma.gallery.findUnique({
        where: { id: id as string },
        include: {
          images: {
            orderBy: { order: 'asc' }
          },
          _count: {
            select: {
              downloads: true
            }
          }
        }
      })

      if (!gallery) {
        return res.status(404).json({ message: 'Gallery not found' })
      }

      res.status(200).json({
        gallery: {
          id: gallery.id,
          title: gallery.title,
          slug: gallery.slug,
          clientName: gallery.clientName,
          clientEmail: gallery.clientEmail,
          eventType: gallery.eventType,
          eventDate: gallery.eventDate?.toISOString() || null,
          description: gallery.description,
          downloadLimit: gallery.downloadLimit,
          isActive: gallery.isActive,
          expiryDate: gallery.expiryDate?.toISOString() || null,
          downloadCount: gallery._count.downloads,
          images: gallery.images.map(image => ({
            id: image.id,
            fileName: image.fileName,
            originalName: image.originalName,
            filePath: image.filePath,
            thumbnailPath: image.thumbnailPath,
            fileSize: image.fileSize,
            width: image.width,
            height: image.height,
            order: image.order,
            isPublic: image.isPublic
          }))
        }
      })
    } catch (error) {
      console.error('Gallery fetch error:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  } else if (req.method === 'PATCH') {
    try {
      const session = await getSession({ req })
      
      if (!session || (session.user as any)?.type !== 'admin') {
        return res.status(401).json({ message: 'Unauthorized' })
      }

      const updates = req.body
      
      const updatedGallery = await prisma.gallery.update({
        where: { id: id as string },
        data: updates
      })

      res.status(200).json({
        message: 'Gallery updated successfully',
        gallery: {
          id: updatedGallery.id,
          title: updatedGallery.title,
          isActive: updatedGallery.isActive
        }
      })
    } catch (error) {
      console.error('Gallery update error:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  } else if (req.method === 'DELETE') {
    try {
      const session = await getSession({ req })
      
      if (!session || (session.user as any)?.type !== 'admin') {
        return res.status(401).json({ message: 'Unauthorized' })
      }

      await prisma.gallery.delete({
        where: { id: id as string }
      })

      res.status(200).json({ message: 'Gallery deleted successfully' })
    } catch (error) {
      console.error('Gallery delete error:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}