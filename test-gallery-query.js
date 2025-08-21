const { Client } = require('pg');

async function testGalleryQuery() {
  console.log('Testing Gallery table queries...');
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('✅ Connected to Supabase');

    // Test a simple Gallery query
    const result = await client.query('SELECT COUNT(*) as count FROM "Gallery"');
    console.log(`📊 Gallery count: ${result.rows[0].count}`);

    // Test the slug check query (the one failing in create-gallery-simple)
    const testSlug = 'test-gallery-123';
    const slugCheck = await client.query(`
      SELECT id FROM "Gallery" WHERE slug = $1
    `, [testSlug]);
    
    console.log(`🔍 Slug check for '${testSlug}': ${slugCheck.rows.length} results`);

    // Test inserting a gallery (without committing)
    await client.query('BEGIN');
    try {
      const insertResult = await client.query(`
        INSERT INTO "Gallery" (
          id, title, description, slug, password, "clientName", "clientEmail", 
          "eventType", "eventDate", "downloadLimit", "userId", "isActive", "createdAt", "updatedAt"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
        RETURNING id, title, slug
      `, [
        'test-' + Date.now(),
        'Test Gallery',
        'Test Description',
        testSlug,
        'hashedpassword123',
        'Test Client',
        'test@example.com',
        'wedding',
        null,
        50,
        'test-user-id',
        true
      ]);
      
      console.log('✅ Test insert successful:', insertResult.rows[0]);
      await client.query('ROLLBACK'); // Don't actually save it
      
    } catch (insertError) {
      console.error('❌ Insert test failed:', insertError.message);
      await client.query('ROLLBACK');
    }

  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await client.end();
  }
}

// Load environment variables
require('dotenv').config();
testGalleryQuery();