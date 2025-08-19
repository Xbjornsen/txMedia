const { PrismaClient } = require('@prisma/client')

async function testConnection() {
  console.log('🔍 Testing Supabase database connection...\n')
  
  console.log('Database URL from .env:')
  console.log(process.env.DATABASE_URL)
  console.log('')

  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  })

  try {
    console.log('📡 Connecting to database...')
    await prisma.$connect()
    console.log('✅ Database connection successful!')
    
    console.log('\n🔍 Testing basic query...')
    await prisma.$queryRaw`SELECT version()`
    console.log('✅ Query test successful!')
    
  } catch (error) {
    console.log('❌ Database connection failed:')
    console.log('Error:', error.message)
    console.log('')
    
    if (error.message.includes('Authentication failed')) {
      console.log('💡 This looks like an authentication issue.')
      console.log('Please check:')
      console.log('1. Your database password is correct')
      console.log('2. Your connection string format is correct')
      console.log('3. Try copying the connection string again from Supabase dashboard')
      console.log('')
      console.log('Expected format:')
      console.log('postgresql://postgres.[ref]:[password]@[host]:6543/postgres')
    }
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()