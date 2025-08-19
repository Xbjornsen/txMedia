import { NextApiRequest, NextApiResponse } from 'next'
import { Client } from 'pg'
import bcrypt from 'bcryptjs'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { 
      title, 
      description, 
      clientName, 
      clientEmail, 
      eventType, 
      eventDate, 
      password,
      downloadLimit = 50 
    } = req.body

    // Validate required fields
    if (!title || !clientName || !clientEmail || !eventType || !password) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Connect to database
    const client = new Client({
      connectionString: process.env.DATABASE_URL
    })

    await client.connect()

    // Check if slug already exists
    const existingGallery = await client.query(`
      SELECT id FROM "Gallery" WHERE slug = $1
    `, [slug])

    if (existingGallery.rows.length > 0) {
      await client.end()
      return res.status(400).json({ message: 'A gallery with this name already exists' })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create gallery
    const galleryId = `gallery-${Date.now()}`
    const userId = 'cmehu6kqc0000fke4y0bethdo' // Admin user ID

    const galleryResult = await client.query(`
      INSERT INTO "Gallery" (
        id, title, description, slug, password, "clientName", "clientEmail", 
        "eventType", "eventDate", "downloadLimit", "userId", "isActive", "createdAt", "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
      RETURNING id, title, slug, "clientName", "eventType", "isActive"
    `, [
      galleryId,
      title,
      description || null,
      slug,
      hashedPassword,
      clientName,
      clientEmail,
      eventType,
      eventDate ? new Date(eventDate) : null,
      parseInt(downloadLimit) || 50,
      userId,
      true
    ])

    await client.end()

    const newGallery = galleryResult.rows[0]

    res.status(201).json({
      success: true,
      message: 'Gallery created successfully',
      gallery: newGallery
    })
  } catch (error) {
    console.error('Create gallery error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}