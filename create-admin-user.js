const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdminUser() {
  console.log('👤 Creating admin user...\n')

  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: process.env.ADMIN_EMAIL || 'xavier@txmedia.com' }
    })

    if (existingAdmin) {
      console.log('✅ Admin user already exists:')
      console.log(`   Name: ${existingAdmin.name}`)
      console.log(`   Email: ${existingAdmin.email}`)
      console.log(`   ID: ${existingAdmin.id}`)
      return existingAdmin
    }

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        name: 'Xavier Thorbjornsen',
        email: process.env.ADMIN_EMAIL || 'xavier@txmedia.com',
        emailVerified: new Date()
      }
    })

    console.log('✅ Admin user created successfully!')
    console.log(`   Name: ${adminUser.name}`)
    console.log(`   Email: ${adminUser.email}`)
    console.log(`   ID: ${adminUser.id}`)

    return adminUser

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message)
    
    if (error.message.includes('Unknown argument')) {
      console.log('\n💡 This might be a Prisma client version issue.')
      console.log('Try regenerating the client:')
      console.log('   npx prisma generate')
    }
  } finally {
    await prisma.$disconnect()
  }
}

createAdminUser()