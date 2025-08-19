#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🚀 Production Deployment Script')
console.log('===============================\n')

// Check if we're ready for production
const envPath = path.join(process.cwd(), '.env')
const envExamplePath = path.join(process.cwd(), '.env.example')

function checkEnvFile() {
  if (!fs.existsSync(envPath)) {
    console.log('❌ .env file not found')
    if (fs.existsSync(envExamplePath)) {
      console.log('💡 Copy .env.example to .env and fill in your values:')
      console.log('   cp .env.example .env')
    }
    return false
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8')
  const requiredVars = [
    'NEXTAUTH_SECRET',
    'DATABASE_URL',
    'ADMIN_EMAIL',
    'ADMIN_PASSWORD'
  ]
  
  const missing = requiredVars.filter(varName => 
    !envContent.includes(`${varName}=`) || 
    envContent.includes(`${varName}=your-`) ||
    envContent.includes(`${varName}=change-me`)
  )
  
  if (missing.length > 0) {
    console.log('❌ Missing environment variables:')
    missing.forEach(varName => console.log(`   - ${varName}`))
    return false
  }
  
  console.log('✅ Environment variables configured')
  return true
}

function runStep(description, command, optional = false) {
  console.log(`\n🔧 ${description}`)
  console.log(`   Running: ${command}`)
  
  try {
    execSync(command, { stdio: 'inherit' })
    console.log(`✅ ${description} completed`)
    return true
  } catch (error) {
    console.log(`❌ ${description} failed`)
    if (!optional) {
      console.log('   Error:', error.message)
      process.exit(1)
    }
    return false
  }
}

async function deployToProduction() {
  console.log('📋 Pre-deployment checks...')
  
  // Check environment
  if (!checkEnvFile()) {
    console.log('\n❌ Environment not ready for deployment')
    console.log('📖 See PRODUCTION_SETUP.md for detailed instructions')
    process.exit(1)
  }
  
  // Install dependencies
  runStep('Installing dependencies', 'npm install')
  
  // Run build
  runStep('Building application', 'npm run build')
  
  // Run tests if available
  runStep('Running tests', 'npm test', true)
  
  // Deploy with Vercel
  console.log('\n🚀 Deploying to Vercel...')
  console.log('   If this is your first deployment:')
  console.log('   1. Install Vercel CLI: npm i -g vercel')
  console.log('   2. Run: vercel')
  console.log('   3. Follow the setup prompts')
  console.log('   4. Then run this script again')
  
  try {
    execSync('vercel --version', { stdio: 'ignore' })
    runStep('Deploying to production', 'vercel --prod')
    
    console.log('\n🎉 Deployment successful!')
    console.log('\n📋 Post-deployment steps:')
    console.log('1. Set up your database (if using Supabase):')
    console.log('   node scripts/setup-supabase.js')
    console.log('2. Run database migrations on production')
    console.log('3. Create your first admin user')
    console.log('4. Test the gallery system')
    console.log('')
    console.log('📖 See PRODUCTION_SETUP.md for detailed instructions')
    
  } catch (error) {
    console.log('\n❌ Vercel CLI not found')
    console.log('📦 Install Vercel CLI:')
    console.log('   npm install -g vercel')
    console.log('\n🚀 Then deploy:')
    console.log('   vercel')
    console.log('   vercel --prod')
  }
}

// Run the deployment
deployToProduction().catch(console.error)