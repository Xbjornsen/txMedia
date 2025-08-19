const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

function setupProductionDB() {
  console.log('🚀 Production Database Setup Script\n')

  // Check if DATABASE_URL is set
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl || dbUrl.includes('file:./dev.db')) {
    console.log('❌ Production DATABASE_URL not configured!')
    console.log('\n📋 Setup Instructions:')
    console.log('1. Set up your production database (Supabase, Neon, etc.)')
    console.log('2. Update DATABASE_URL in your .env file or Vercel environment')
    console.log('3. Run this script again')
    console.log('\n💡 Example DATABASE_URL formats:')
    console.log('   Supabase:    postgresql://user:pass@host:5432/database')
    console.log('   Neon:        postgresql://user:pass@host:5432/database?sslmode=require')
    console.log('   PlanetScale: mysql://user:pass@host:3306/database?sslaccept=strict')
    return
  }

  try {
    console.log('🔍 Checking database connection...')
    execSync('npx prisma db pull --force', { stdio: 'inherit' })
    console.log('✅ Database connection successful!')

    console.log('\n📊 Deploying schema...')
    execSync('npx prisma db push', { stdio: 'inherit' })
    console.log('✅ Schema deployed!')

    console.log('\n🔧 Generating client...')
    execSync('npx prisma generate', { stdio: 'inherit' })
    console.log('✅ Client generated!')

    console.log('\n📤 Would you like to import existing data? (y/n)')
    console.log('💡 Make sure you have run "npm run db:export" first')
    
    // For now, just show instructions
    console.log('\n🎯 Next Steps:')
    console.log('1. Export local data: npm run db:export')
    console.log('2. Import to production: npm run db:import')
    console.log('3. Test the connection: npm run db:check')
    console.log('\n✅ Production database setup complete!')

  } catch (error) {
    console.error('❌ Setup failed:', error.message)
    console.log('\n💡 Troubleshooting:')
    console.log('- Check your DATABASE_URL is correct')
    console.log('- Ensure the database exists and is accessible')
    console.log('- Check network connectivity')
  }
}

setupProductionDB()