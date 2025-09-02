const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function setupProduction() {
  try {
    console.log('Setting up production data...')

    // Create admin user
    const adminUser = await prisma.user.upsert({
      where: { email: 'xavier@txmedia.com' },
      update: {},
      create: {
        name: 'Xavier Thorbjornsen',
        email: 'xavier@txmedia.com'
      }
    })

    console.log('✅ Admin user created/found:', adminUser.email)

    // Check if smith-wedding gallery exists, if not create it
    const existingGallery = await prisma.gallery.findUnique({
      where: { slug: 'smith-wedding-2024' }
    })

    if (!existingGallery) {
      // Hash password
      const hashedPassword = await bcrypt.hash('wedding2024', 12)
      
      // Create smith-wedding gallery
      const gallery = await prisma.gallery.create({
        data: {
          title: 'Smith Wedding 2024',
          description: 'Beautiful wedding ceremony demonstration gallery',
          slug: 'smith-wedding-2024',
          password: hashedPassword,
          clientName: 'John & Sarah Smith',
          clientEmail: 'smith@example.com',
          eventDate: new Date('2024-06-15'),
          eventType: 'wedding',
          downloadLimit: 50,
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
          userId: adminUser.id
        }
      })

      console.log('✅ Smith wedding gallery created:', gallery.title)
      console.log('   Gallery ID:', gallery.slug)
      console.log('   Password: wedding2024')
    } else {
      // Update existing gallery password to ensure it's correct
      const hashedPassword = await bcrypt.hash('wedding2024', 12)
      await prisma.gallery.update({
        where: { slug: 'smith-wedding-2024' },
        data: { password: hashedPassword }
      })
      console.log('✅ Smith wedding gallery password updated')
    }

    console.log('\n🎉 Production setup complete!')
    console.log('────────────────────────────────────────')
    console.log('Gallery: smith-wedding-2024')
    console.log('Password: wedding2024')
    console.log('Admin: xavier@txmedia.com')
    console.log('────────────────────────────────────────')

  } catch (error) {
    console.error('❌ Error setting up production:', error)
  } finally {
    await prisma.$disconnect()
  }
}

setupProduction()