console.log('📁 Vercel Blob Storage Setup Guide')
console.log('=====================================\n')

console.log('📋 Step 1: Install Vercel CLI')
console.log('npm install -g vercel')
console.log('')

console.log('📋 Step 2: Connect Project to Vercel')
console.log('1. In your project directory, run:')
console.log('   vercel')
console.log('2. Follow the prompts to link your project')
console.log('3. Choose "Link to existing project" if you have one')
console.log('')

console.log('📋 Step 3: Enable Blob Storage')
console.log('1. Go to your Vercel dashboard')
console.log('2. Select your project')
console.log('3. Go to Storage tab')
console.log('4. Click "Create Database"')
console.log('5. Select "Blob" storage')
console.log('6. Click "Create"')
console.log('')

console.log('📋 Step 4: Get Blob Storage Token')
console.log('1. In Vercel dashboard > Storage > Blob')
console.log('2. Click "Create Token"')
console.log('3. Copy the token')
console.log('4. Add to environment variables:')
console.log('   BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxx')
console.log('')

console.log('📋 Step 5: Update Image Upload API')
console.log('The following files need Blob Storage integration:')
console.log('- src/pages/api/admin/upload-image.js')
console.log('- src/pages/api/admin/delete-image.js')
console.log('')

console.log('📋 Step 6: Migration Script')
console.log('Use this script to migrate existing photos:')
console.log('node scripts/migrate-photos-to-blob.js')
console.log('')

console.log('💰 Pricing Information:')
console.log('- Storage: $0.15 per GB per month')
console.log('- Operations: $0.40 per million requests')
console.log('- Bandwidth: Included with Vercel hosting')
console.log('')

console.log('🔧 Environment Variables Needed:')
console.log('```env')
console.log('BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxx')
console.log('NEXTAUTH_URL=https://your-domain.vercel.app')
console.log('DATABASE_URL=postgresql://...')
console.log('NEXTAUTH_SECRET=your-secret-key')
console.log('ADMIN_EMAIL=xavier@txmedia.com')
console.log('ADMIN_PASSWORD=your-password')
console.log('```')
console.log('')

console.log('✅ After setup, your images will be:')
console.log('- Globally distributed via CDN')
console.log('- Automatically optimized')
console.log('- Highly available')
console.log('- Scalable')

const packageJsonPath = require('path').join(process.cwd(), 'package.json')
if (require('fs').existsSync(packageJsonPath)) {
  const packageJson = require(packageJsonPath)
  
  // Check if @vercel/blob is installed
  const hasBlobPackage = packageJson.dependencies?.['@vercel/blob'] || 
                        packageJson.devDependencies?.['@vercel/blob']
  
  if (!hasBlobPackage) {
    console.log('\n🔧 Installing Vercel Blob package...')
    console.log('npm install @vercel/blob')
  } else {
    console.log('\n✅ @vercel/blob package already installed')
  }
}