import { NextApiRequest, NextApiResponse } from 'next'
import { Client } from 'pg'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { id: galleryId } = req.query
  const { operation, imageIds } = req.body

  if (!operation || !imageIds || !Array.isArray(imageIds)) {
    return res.status(400).json({ message: 'Invalid operation data' })
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL
  })

  try {
    await client.connect()

    switch (operation) {
      case 'delete':
        // Delete multiple images
        await client.query(
          'DELETE FROM "GalleryImage" WHERE id = ANY($1) AND "galleryId" = $2',
          [imageIds, galleryId]
        )
        break

      case 'toggle_public':
        // Toggle public visibility for multiple images
        await client.query(
          'UPDATE "GalleryImage" SET "isPublic" = NOT "isPublic", "updatedAt" = NOW() WHERE id = ANY($1) AND "galleryId" = $2',
          [imageIds, galleryId]
        )
        break

      case 'set_public':
        // Set images as public
        await client.query(
          'UPDATE "GalleryImage" SET "isPublic" = true, "updatedAt" = NOW() WHERE id = ANY($1) AND "galleryId" = $2',
          [imageIds, galleryId]
        )
        break

      case 'set_private':
        // Set images as private
        await client.query(
          'UPDATE "GalleryImage" SET "isPublic" = false, "updatedAt" = NOW() WHERE id = ANY($1) AND "galleryId" = $2',
          [imageIds, galleryId]
        )
        break

      default:
        await client.end()
        return res.status(400).json({ message: 'Invalid operation' })
    }

    await client.end()

    res.status(200).json({ 
      message: `Bulk ${operation} completed successfully`,
      affectedImages: imageIds.length
    })
  } catch (error) {
    console.error('Bulk operation error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}