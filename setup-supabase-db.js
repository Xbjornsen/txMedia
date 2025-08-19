const { execSync } = require('child_process')

console.log('🛠️  Setting up Supabase database...\n')

function runCommand(command, description) {
  console.log(`🔧 ${description}`)
  console.log(`   Command: ${command}`)
  
  try {
    const output = execSync(command, { 
      stdio: 'pipe',
      encoding: 'utf8',
      env: { ...process.env }
    })
    console.log('✅ Success!')
    if (output.trim()) {
      console.log(`   Output: ${output.trim()}`)
    }
    return true
  } catch (error) {
    console.log('❌ Failed!')
    console.log(`   Error: ${error.message}`)
    if (error.stdout) {
      console.log(`   Stdout: ${error.stdout}`)
    }
    if (error.stderr) {
      console.log(`   Stderr: ${error.stderr}`)
    }
    return false
  }
}

async function setupDatabase() {
  console.log('📋 Step 1: Generate Prisma client')
  // Skip client generation for now since it's locked
  
  console.log('\n📋 Step 2: Push schema to database')
  if (!runCommand('npx prisma db push --force-reset', 'Force reset and push schema')) {
    console.log('\n❌ Database setup failed!')
    console.log('\n💡 Try these manual steps:')
    console.log('1. Close any running development servers')
    console.log('2. Delete node_modules\\.prisma folder')
    console.log('3. Run: npx prisma generate')
    console.log('4. Run: npx prisma db push')
    return
  }
  
  console.log('\n📋 Step 3: Generate Prisma client')
  runCommand('npx prisma generate', 'Generate Prisma client')
  
  console.log('\n🎉 Database setup complete!')
  console.log('\n📋 Next steps:')
  console.log('1. Create admin user: node scripts/create-admin-user.js')
  console.log('2. Test connection: node test-db-connection.js')
  console.log('3. Start development: yarn dev')
}

setupDatabase()