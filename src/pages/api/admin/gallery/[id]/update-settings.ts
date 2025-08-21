import { NextApiRequest, NextApiResponse } from 'next'
import { Client } from 'pg'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { id: galleryId } = req.query
  const {
    title,
    description,
    clientName,
    clientEmail,
    eventType,
    eventDate,
    downloadLimit,
    isActive,
    expiryDate
  } = req.body

  // Validate required fields
  if (!title || !clientName || !clientEmail || !eventType) {
    return res.status(400).json({ message: 'Missing required fields' })
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL
  })

  try {
    await client.connect()

    // Generate new slug from title if it changed
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Check if new slug conflicts with existing galleries (excluding current one)
    const existingGallery = await client.query(`
      SELECT id FROM "Gallery" WHERE slug = $1 AND id != $2
    `, [slug, galleryId])

    if (existingGallery.rows.length > 0) {
      await client.end()
      return res.status(400).json({ message: 'A gallery with this title already exists' })
    }

    // Update gallery
    const updateResult = await client.query(`
      UPDATE "Gallery" SET 
        title = $1,
        description = $2,
        slug = $3,
        "clientName" = $4,
        "clientEmail" = $5,
        "eventType" = $6,
        "eventDate" = $7,
        "downloadLimit" = $8,
        "isActive" = $9,
        "expiryDate" = $10,
        "updatedAt" = NOW()
      WHERE id = $11
      RETURNING id, title, slug, "clientName", "eventType", "isActive"
    `, [
      title,
      description || null,
      slug,
      clientName,
      clientEmail,
      eventType,
      eventDate ? new Date(eventDate) : null,
      parseInt(downloadLimit) || 50,
      isActive,
      expiryDate ? new Date(expiryDate) : null,
      galleryId
    ])

    await client.end()

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ message: 'Gallery not found' })
    }

    res.status(200).json({
      success: true,
      message: 'Gallery settings updated successfully',
      gallery: updateResult.rows[0]
    })
  } catch (error) {
    console.error('Update gallery settings error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}