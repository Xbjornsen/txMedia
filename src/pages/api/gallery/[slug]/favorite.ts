/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { slug } = req.query
  
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const session = await getSession({ req })
    
    if (!session || (session.user as any)?.gallerySlug !== slug) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const { imageId } = req.body

    if (!imageId) {
      return res.status(400).json({ message: 'Image ID is required' })
    }

    const gallery = await prisma.gallery.findUnique({
      where: { slug: slug as string, isActive: true }
    })

    if (!gallery) {
      return res.status(404).json({ message: 'Gallery not found' })
    }

    const clientIp = getClientIP(req)

    // Check if favorite already exists
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        clientIp_imageId: {
          clientIp,
          imageId: imageId as string
        }
      }
    })

    if (existingFavorite) {
      // Remove favorite
      await prisma.favorite.delete({
        where: {
          id: existingFavorite.id
        }
      })
      res.status(200).json({ isFavorite: false })
    } else {
      // Add favorite
      await prisma.favorite.create({
        data: {
          galleryId: gallery.id,
          imageId: imageId as string,
          clientIp
        }
      })
      res.status(200).json({ isFavorite: true })
    }
  } catch (error) {
    console.error('Favorite toggle error:', error)
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