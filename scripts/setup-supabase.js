const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🚀 Supabase Setup Guide')
console.log('=======================\n')

console.log('📋 Step 1: Create Supabase Project')
console.log('1. Go to https://supabase.com')
console.log('2. Click "New Project"')
console.log('3. Choose organization')
console.log('4. Enter project details:')
console.log('   - Name: txmedia-gallery')
console.log('   - Database Password: [secure password]')
console.log('   - Region: [closest to your users]')
console.log('5. Click "Create new project"')
console.log('')

console.log('📋 Step 2: Get Database URL')
console.log('1. In your Supabase dashboard')
console.log('2. Go to Settings > Database')
console.log('3. Copy "Connection string" for "Connection pooling"')
console.log('4. Replace [YOUR-PASSWORD] with your database password')
console.log('')

console.log('📋 Step 3: Update Environment Variables')
console.log('Add to your .env file:')
console.log('')
console.log('DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres"')
console.log('NEXTAUTH_URL="https://your-domain.vercel.app"')
console.log('')

console.log('📋 Step 4: Run Database Migrations')
console.log('After updating .env, run:')
console.log('')
console.log('npx prisma migrate deploy')
console.log('npx prisma generate')
console.log('')

console.log('📋 Step 5: Create Admin User (Production)')
console.log('Run this after database setup:')
console.log('')
console.log('node scripts/create-admin-user.js')
console.log('')

console.log('✅ Your database will be ready for production!')
console.log('')
console.log('💡 Pro Tips:')
console.log('- Enable Row Level Security in Supabase for extra security')
console.log('- Set up database backups in Supabase dashboard')
console.log('- Monitor usage in Supabase dashboard')
console.log('- Consider upgrading to Pro plan for production workloads')

// Check if we're in production mode
const isProduction = process.env.NODE_ENV === 'production'
if (isProduction && process.env.DATABASE_URL && process.env.DATABASE_URL.includes('supabase')) {
  console.log('\n🔧 Detected Supabase database in production mode')
  console.log('Running migrations...')
  
  try {
    execSync('npx prisma migrate deploy', { stdio: 'inherit' })
    console.log('✅ Migrations completed successfully!')
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
  }
}