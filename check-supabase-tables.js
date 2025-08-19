const { PrismaClient } = require('@prisma/client')

async function checkTables() {
  console.log('🔍 Checking existing tables in Supabase...\n')
  
  const prisma = new PrismaClient()

  try {
    // Check what tables exist
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `
    
    console.log('📋 Existing tables:')
    if (tables.length === 0) {
      console.log('   No tables found - database is empty')
      console.log('\n✅ Ready for initial migration!')
    } else {
      tables.forEach((table, index) => {
        console.log(`   ${index + 1}. ${table.table_name}`)
      })
      
      console.log('\n💡 Tables already exist. Options:')
      console.log('1. Database is already set up')
      console.log('2. Or run: npx prisma db push --accept-data-loss')
    }
    
  } catch (error) {
    console.log('❌ Error checking tables:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkTables()