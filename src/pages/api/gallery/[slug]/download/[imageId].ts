/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { slug, imageId } = req.query
  
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const session = await getSession({ req })
    
    if (!session || (session.user as any)?.gallerySlug !== slug) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const gallery = await prisma.gallery.findUnique({
      where: { slug: slug as string, isActive: true },
      include: {
        downloads: true,
        images: {
          where: { id: imageId as string }
        }
      }
    })

    if (!gallery || gallery.images.length === 0) {
      return res.status(404).json({ message: 'Gallery or image not found' })
    }

    // Check download limit
    if (gallery.downloads.length >= gallery.downloadLimit) {
      return res.status(429).json({ message: 'Download limit exceeded' })
    }

    const image = gallery.images[0]
    const imagePath = path.join(process.cwd(), 'public', 'galleries', slug as string, image.fileName)

    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ message: 'Image file not found' })
    }

    // Track download
    await prisma.download.create({
      data: {
        galleryId: gallery.id,
        imageId: image.id,
        clientIp: getClientIP(req),
        userAgent: req.headers['user-agent'] || null
      }
    })

    // Set headers for file download
    const fileBuffer = fs.readFileSync(imagePath)
    const fileExtension = path.extname(image.fileName)
    const mimeTypes: { [key: string]: string } = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp'
    }

    res.setHeader('Content-Type', mimeTypes[fileExtension.toLowerCase()] || 'application/octet-stream')
    res.setHeader('Content-Disposition', `attachment; filename="${image.originalName}"`)
    res.setHeader('Content-Length', fileBuffer.length)

    res.status(200).send(fileBuffer)
  } catch (error) {
    console.error('Download error:', error)
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