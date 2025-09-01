import { NextApiRequest, NextApiResponse } from 'next'
import { Client } from 'pg'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const slug = 'smith-wedding-2024'
    const client = new Client({
      connectionString: process.env.DATABASE_URL
    })

    await client.connect()

    // Get gallery
    const galleryResult = await client.query(`
      SELECT 
        g.id, g.title, g.description, g."clientName", g."eventDate", 
        g."eventType", g."downloadLimit", g."expiryDate", g."isActive"
      FROM "Gallery" g
      WHERE g.slug = $1 AND g."isActive" = true
    `, [slug])

    if (galleryResult.rows.length === 0) {
      await client.end()
      return res.status(404).json({ message: 'Gallery not found' })
    }

    const gallery = galleryResult.rows[0]

    // Get gallery images
    const imagesResult = await client.query(`
      SELECT 
        id, "fileName", "originalName", width, height, "order"
      FROM "GalleryImage"
      WHERE "galleryId" = $1
      ORDER BY "order" ASC
    `, [gallery.id])

    // Get download count
    const downloadsResult = await client.query(`
      SELECT COUNT(*) as count
      FROM "Download"
      WHERE "galleryId" = $1
    `, [gallery.id])

    const downloadsUsed = parseInt(downloadsResult.rows[0].count) || 0

    await client.end()

    // Process images
    const imagesWithFavorites = imagesResult.rows.map(image => ({
      id: image.id,
      fileName: image.fileName,
      originalName: image.originalName,
      thumbnailPath: `/galleries/${slug}/thumbnails/${image.fileName}`,
      filePath: `/galleries/${slug}/${image.fileName}`,
      width: image.width,
      height: image.height,
      isFavorite: false // Simple version
    }))

    const response = {
      id: gallery.id,
      title: gallery.title,
      description: gallery.description,
      clientName: gallery.clientName,
      eventDate: gallery.eventDate,
      eventType: gallery.eventType,
      downloadLimit: gallery.downloadLimit,
      images: imagesWithFavorites,
      downloadsUsed: downloadsUsed
    }

    res.status(200).json(response)
  } catch (error) {
    console.error('Gallery fetch error:', error)
    res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}