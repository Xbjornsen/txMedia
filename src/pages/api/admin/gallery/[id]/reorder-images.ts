import { NextApiRequest, NextApiResponse } from 'next'
import { Client } from 'pg'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { id: galleryId } = req.query
  const { imageOrders } = req.body

  if (!imageOrders || !Array.isArray(imageOrders)) {
    return res.status(400).json({ message: 'Invalid image orders data' })
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL
  })

  try {
    await client.connect()

    // Update each image's order
    for (const { imageId, order } of imageOrders) {
      await client.query(
        'UPDATE "GalleryImage" SET "order" = $1, "updatedAt" = NOW() WHERE id = $2 AND "galleryId" = $3',
        [order, imageId, galleryId]
      )
    }

    await client.end()

    res.status(200).json({ message: 'Images reordered successfully' })
  } catch (error) {
    console.error('Reorder images error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}