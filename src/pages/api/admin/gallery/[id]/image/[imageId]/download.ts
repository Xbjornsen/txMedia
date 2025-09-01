/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { prisma } from '@/lib/prisma'
import fs from 'fs'
import path from 'path'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const session = await getSession({ req })
    
    if (!session || (session.user as any)?.type !== 'admin') {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const { id: galleryId, imageId } = req.query

    // Get the image from database
    const image = await prisma.galleryImage.findFirst({
      where: {
        id: imageId as string,
        galleryId: galleryId as string
      },
      include: {
        gallery: true
      }
    })

    if (!image) {
      return res.status(404).json({ message: 'Image not found' })
    }

    // Admin downloads don't count against limits - they're for preview purposes
    // So we don't create a Download record

    // Construct file path
    const publicDir = path.join(process.cwd(), 'public')
    const filePath = path.join(publicDir, image.filePath)

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on server' })
    }

    // Get file stats
    const stats = fs.statSync(filePath)
    const fileBuffer = fs.readFileSync(filePath)

    // Set appropriate headers
    res.setHeader('Content-Type', 'application/octet-stream')
    res.setHeader('Content-Length', stats.size)
    res.setHeader('Content-Disposition', `attachment; filename="${image.originalName || image.fileName}"`)
    res.setHeader('Cache-Control', 'no-cache')

    // Send the file
    res.status(200).send(fileBuffer)

  } catch (error) {
    console.error('Admin download error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}