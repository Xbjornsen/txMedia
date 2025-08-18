/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { PrismaClient } from '@prisma/client'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import sharp from 'sharp'
import { v4 as uuidv4 } from 'uuid'

const prisma = new PrismaClient()

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed'))
    }
  }
})

// Disable Next.js body parsing to handle multipart data
export const config = {
  api: {
    bodyParser: false,
  },
}

const runMiddleware = (req: any, res: any, fn: any) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result)
      }
      return resolve(result)
    })
  })
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const session = await getSession({ req })
    
    if (!session || (session.user as any)?.type !== 'admin') {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    // Run multer middleware
    await runMiddleware(req, res, upload.array('images'))

    const { galleryId } = req.body
    const files = (req as any).files

    if (!galleryId) {
      return res.status(400).json({ message: 'Gallery ID is required' })
    }

    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' })
    }

    // Verify gallery exists and belongs to admin
    const gallery = await prisma.gallery.findUnique({
      where: { id: galleryId }
    })

    if (!gallery) {
      return res.status(404).json({ message: 'Gallery not found' })
    }

    // Create gallery directories
    const galleryDir = path.join(process.cwd(), 'public', 'galleries', gallery.slug)
    const thumbnailDir = path.join(galleryDir, 'thumbnails')
    
    if (!fs.existsSync(galleryDir)) {
      fs.mkdirSync(galleryDir, { recursive: true })
    }
    if (!fs.existsSync(thumbnailDir)) {
      fs.mkdirSync(thumbnailDir, { recursive: true })
    }

    const uploadedImages = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const fileId = uuidv4()
      const fileExt = path.extname(file.originalname).toLowerCase()
      const fileName = `${fileId}${fileExt}`
      const thumbnailName = `thumb_${fileName}`

      // Full size image path
      const imagePath = path.join(galleryDir, fileName)
      const thumbnailPath = path.join(thumbnailDir, thumbnailName)

      try {
        // Process and save full image (max 2000px width)
        const imageBuffer = await sharp(file.buffer)
          .resize(2000, 2000, { 
            fit: 'inside', 
            withoutEnlargement: true 
          })
          .jpeg({ quality: 90 })
          .toBuffer()

        // Get image metadata
        const metadata = await sharp(file.buffer).metadata()

        // Save full image
        fs.writeFileSync(imagePath, imageBuffer)

        // Create thumbnail (400px width)
        const thumbnailBuffer = await sharp(file.buffer)
          .resize(400, 400, { 
            fit: 'cover' 
          })
          .jpeg({ quality: 80 })
          .toBuffer()

        // Save thumbnail
        fs.writeFileSync(thumbnailPath, thumbnailBuffer)

        // Save to database
        const galleryImage = await prisma.galleryImage.create({
          data: {
            fileName,
            originalName: file.originalname,
            filePath: `/galleries/${gallery.slug}/${fileName}`,
            thumbnailPath: `/galleries/${gallery.slug}/thumbnails/${thumbnailName}`,
            fileSize: imageBuffer.length,
            width: metadata.width || 0,
            height: metadata.height || 0,
            order: i,
            galleryId: gallery.id
          }
        })

        uploadedImages.push(galleryImage)
      } catch (error) {
        console.error(`Failed to process image ${file.originalname}:`, error)
        // Continue with other images even if one fails
      }
    }

    res.status(200).json({
      message: `Successfully uploaded ${uploadedImages.length} images`,
      images: uploadedImages.map(img => ({
        id: img.id,
        fileName: img.fileName,
        originalName: img.originalName,
        filePath: img.filePath,
        thumbnailPath: img.thumbnailPath
      }))
    })
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ message: 'Upload failed' })
  }
}