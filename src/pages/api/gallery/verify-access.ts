import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { gallerySlug, password } = req.body

    if (!gallerySlug || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Gallery ID and password are required' 
      })
    }

    // Find the gallery
    const gallery = await prisma.gallery.findUnique({
      where: {
        slug: gallerySlug,
        isActive: true
      }
    })

    if (!gallery) {
      return res.status(404).json({ 
        success: false, 
        message: 'Gallery not found or inactive' 
      })
    }

    // Check if gallery has expired
    if (gallery.expiryDate && new Date() > gallery.expiryDate) {
      return res.status(403).json({ 
        success: false, 
        message: 'Gallery has expired' 
      })
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, gallery.password)
    
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid password' 
      })
    }

    // Log gallery access
    await prisma.galleryAccess.create({
      data: {
        galleryId: gallery.id,
        clientIp: req.socket.remoteAddress || 'unknown',
        userAgent: req.headers['user-agent'] || undefined
      }
    })

    // Return success with gallery info
    res.status(200).json({
      success: true,
      gallery: {
        id: gallery.id,
        title: gallery.title,
        slug: gallery.slug,
        clientName: gallery.clientName,
        eventType: gallery.eventType,
        eventDate: gallery.eventDate,
        downloadLimit: gallery.downloadLimit
      }
    })
  } catch (error) {
    console.error('Gallery verification error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    })
  }
}