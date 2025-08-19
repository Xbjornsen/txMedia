import { NextApiRequest, NextApiResponse } from 'next'
import { Client } from 'pg'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // For now, we'll skip admin authentication checks since the frontend handles it
    // In production, you might want to add a simple token-based auth check

    // Direct PostgreSQL connection
    const client = new Client({
      connectionString: process.env.DATABASE_URL
    })

    await client.connect()

    // Get galleries with image counts and download stats
    const galleriesResult = await client.query(`
      SELECT 
        g.id, g.title, g.slug, g."clientName", g."clientEmail", 
        g."eventType", g."eventDate", g."isActive", g."downloadLimit", 
        g."createdAt",
        COUNT(gi.id) as "imageCount",
        COUNT(d.id) as "downloadCount"
      FROM "Gallery" g
      LEFT JOIN "GalleryImage" gi ON g.id = gi."galleryId"
      LEFT JOIN "Download" d ON g.id = d."galleryId"
      GROUP BY g.id, g.title, g.slug, g."clientName", g."clientEmail", 
               g."eventType", g."eventDate", g."isActive", g."downloadLimit", g."createdAt"
      ORDER BY g."createdAt" DESC
    `)

    const galleries = galleriesResult.rows.map(row => ({
      ...row,
      imageCount: parseInt(row.imageCount) || 0,
      downloadCount: parseInt(row.downloadCount) || 0
    }))

    // Calculate stats
    const totalGalleries = galleries.length
    const activeGalleries = galleries.filter(g => g.isActive).length
    const totalImages = galleries.reduce((sum, g) => sum + g.imageCount, 0)
    const totalDownloads = galleries.reduce((sum, g) => sum + g.downloadCount, 0)

    await client.end()

    res.status(200).json({
      galleries,
      stats: {
        totalGalleries,
        activeGalleries,
        totalImages,
        totalDownloads
      }
    })
  } catch (error) {
    console.error('Galleries fetch error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}