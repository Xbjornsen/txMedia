/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id: galleryId, imageId } = req.query

  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const session = await getSession({ req })
    
    if (!session || (session.user as any)?.type !== 'admin') {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    // Find the image to delete
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

    // Delete physical files
    const imagePath = path.join(process.cwd(), 'public', image.filePath)
    
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath)
    }

    if (image.thumbnailPath) {
      const thumbnailPath = path.join(process.cwd(), 'public', image.thumbnailPath)
      if (fs.existsSync(thumbnailPath)) {
        fs.unlinkSync(thumbnailPath)
      }
    }

    // Delete from database
    await prisma.galleryImage.delete({
      where: { id: imageId as string }
    })

    res.status(200).json({ message: 'Image deleted successfully' })
  } catch (error) {
    console.error('Image delete error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}