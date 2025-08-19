import { NextApiRequest, NextApiResponse } from 'next'
import { Client } from 'pg'
import bcrypt from 'bcryptjs'

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

    // Direct PostgreSQL connection
    const client = new Client({
      connectionString: process.env.DATABASE_URL
    })

    await client.connect()

    // Find the gallery using direct SQL
    const galleryResult = await client.query(`
      SELECT id, title, slug, password, "clientName", "clientEmail", "eventType", "eventDate", "downloadLimit", "isActive", "expiryDate"
      FROM "Gallery"
      WHERE slug = $1 AND "isActive" = true
    `, [gallerySlug])

    if (galleryResult.rows.length === 0) {
      await client.end()
      return res.status(404).json({ 
        success: false, 
        message: 'Gallery not found or inactive' 
      })
    }

    const gallery = galleryResult.rows[0]

    // Check if gallery has expired
    if (gallery.expiryDate && new Date() > new Date(gallery.expiryDate)) {
      await client.end()
      return res.status(403).json({ 
        success: false, 
        message: 'Gallery has expired' 
      })
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, gallery.password)
    
    if (!isValidPassword) {
      await client.end()
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid password' 
      })
    }

    // Log gallery access
    await client.query(`
      INSERT INTO "GalleryAccess" (id, "galleryId", "clientIp", "userAgent", "accessedAt")
      VALUES ($1, $2, $3, $4, NOW())
    `, [
      `access-${Date.now()}`,
      gallery.id,
      req.socket.remoteAddress || 'unknown',
      req.headers['user-agent'] || null
    ])

    await client.end()

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