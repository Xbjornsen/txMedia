const { Client } = require('pg')
const bcrypt = require('bcryptjs')

async function createTestData() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  })

  try {
    await client.connect()
    console.log('🔌 Connected to PostgreSQL')

    // Create admin user
    const adminEmail = process.env.ADMIN_EMAIL || 'xavier@txmedia.com'
    const adminPassword = process.env.ADMIN_PASSWORD || 'uVdTv3OlG9kJyu1flbAT'
    
    console.log('👤 Creating admin user...')
    const adminResult = await client.query(`
      INSERT INTO "User" (id, name, email, "createdAt", "updatedAt") 
      VALUES ($1, $2, $3, NOW(), NOW()) 
      ON CONFLICT (email) DO NOTHING 
      RETURNING id
    `, ['admin-001', 'Admin User', adminEmail])
    
    console.log('✅ Admin user created/exists')

    // Create test gallery
    const galleryPassword = await bcrypt.hash('password123', 10)
    
    console.log('📂 Creating test gallery...')
    const galleryResult = await client.query(`
      INSERT INTO "Gallery" (
        id, title, description, slug, password, "clientName", "clientEmail", 
        "eventType", "isActive", "downloadLimit", "userId", "createdAt", "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
      ON CONFLICT (slug) DO UPDATE SET
        password = EXCLUDED.password,
        "updatedAt" = NOW()
      RETURNING id, title, slug
    `, [
      'test-gallery-001', 
      'Test Wedding Gallery 2024', 
      'A beautiful wedding gallery for testing',
      'test-wedding-2024',
      galleryPassword,
      'John & Jane Smith',
      'john.smith@example.com',
      'wedding',
      true,
      50,
      'admin-001'
    ])
    
    console.log('✅ Test gallery created:', galleryResult.rows[0])
    
    // Verify gallery exists
    const checkGallery = await client.query(`
      SELECT id, title, slug, "clientName", "isActive" 
      FROM "Gallery" 
      WHERE slug = 'test-wedding-2024'
    `)
    
    console.log('🔍 Gallery verification:', checkGallery.rows[0])
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await client.end()
  }
}

createTestData()