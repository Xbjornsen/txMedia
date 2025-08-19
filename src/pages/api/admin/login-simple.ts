import { NextApiRequest, NextApiResponse } from 'next'
import { Client } from 'pg'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      })
    }

    // Check against environment variables
    const adminEmail = process.env.ADMIN_EMAIL
    const adminPassword = process.env.ADMIN_PASSWORD

    if (email !== adminEmail || password !== adminPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      })
    }

    // Direct PostgreSQL connection to verify admin user exists
    const client = new Client({
      connectionString: process.env.DATABASE_URL
    })

    await client.connect()

    // Find or create admin user
    const userResult = await client.query(`
      SELECT id, name, email FROM "User" WHERE email = $1
    `, [adminEmail])

    let adminUser
    if (userResult.rows.length === 0) {
      // Create admin user if doesn't exist
      const createResult = await client.query(`
        INSERT INTO "User" (id, name, email, "createdAt", "updatedAt") 
        VALUES ($1, $2, $3, NOW(), NOW()) 
        RETURNING id, name, email
      `, [`admin-${Date.now()}`, 'Admin User', adminEmail])
      adminUser = createResult.rows[0]
    } else {
      adminUser = userResult.rows[0]
    }

    await client.end()

    // Return success with admin info
    res.status(200).json({
      success: true,
      user: {
        id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
        type: 'admin'
      }
    })
  } catch (error) {
    console.error('Admin login error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    })
  }
}