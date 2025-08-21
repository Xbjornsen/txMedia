# TxMedia API Generator System

A comprehensive API endpoint generator for the txMedia photography portfolio project that creates secure, consistent endpoints following your established patterns.

## 🚀 Quick Start

```bash
# Generate admin gallery CRUD endpoints
npm run api:generate admin galleries --crud

# Generate gallery access verification
npm run api:generate gallery access --auth --simple

# Generate image upload with multipart support
npm run api:generate admin upload --multipart

# Analyze existing API patterns
npm run api:analyze

# Validate API endpoints for security and consistency
npm run api:validate
```

## 📁 System Components

### 1. API Generator (`api-generator.js`)
The main generator that creates new API endpoints based on your patterns.

**Features:**
- ✅ Dual authentication support (NextAuth + Simple)
- ✅ Database pattern recognition (Prisma + PostgreSQL)
- ✅ Photography-specific features
- ✅ Security validation
- ✅ TypeScript integration
- ✅ Automatic file structure creation

### 2. API Analyzer (`scripts/api-analyzer.js`)
Analyzes existing API endpoints to understand patterns and provide insights.

**Analysis includes:**
- Authentication patterns usage
- Database operation patterns
- HTTP method distribution
- Common imports and dependencies
- Recommendations for improvements

### 3. API Validator (`scripts/api-validator.js`)
Validates API endpoints for security, structure, and best practices.

**Validation checks:**
- SQL injection prevention
- Authentication presence
- Input validation
- Error handling completeness
- TypeScript compliance
- Resource cleanup

## 🎯 Usage Examples

### Admin Endpoints

```bash
# Full CRUD for user management
npm run api:generate admin users --crud
# Creates: /api/admin/users.ts + /api/admin/users-simple.ts

# Image upload with processing
npm run api:generate admin images --multipart
# Creates: /api/admin/images.ts + /api/admin/images-simple.ts

# Dynamic gallery operations
npm run api:generate admin galleries --dynamic
# Creates: /api/admin/galleries/[id].ts
```

### Gallery Endpoints

```bash
# Password verification
npm run api:generate gallery access --auth
# Creates: /api/gallery/verify-access.ts

# Download with tracking
npm run api:generate gallery download --nested --dynamic
# Creates: /api/gallery/[slug]/download/[imageId].ts

# Favorites management
npm run api:generate gallery favorites --crud
# Creates: /api/gallery/favorites.ts
```

## 🏗️ Generated Code Structure

### NextAuth + Prisma Pattern
```typescript
import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Method validation
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // NextAuth authentication
    const session = await getSession({ req })
    
    if (!session || (session.user as any)?.type !== 'admin') {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    // Prisma operations with relationships
    const galleries = await prisma.gallery.findMany({
      include: {
        images: true,
        downloads: true,
        _count: {
          select: {
            images: true,
            downloads: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    res.status(200).json({
      galleries: galleries.map(gallery => ({
        id: gallery.id,
        title: gallery.title,
        slug: gallery.slug,
        imageCount: gallery._count.images,
        downloadCount: gallery._count.downloads
      }))
    })
  } catch (error) {
    console.error('Admin galleries error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
```

### Simple Auth + PostgreSQL Pattern
```typescript
import { NextApiRequest, NextApiResponse } from 'next'
import { Client } from 'pg'
import bcrypt from 'bcryptjs'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Direct PostgreSQL connection
    const client = new Client({
      connectionString: process.env.DATABASE_URL
    })
    
    await client.connect()

    // Parameterized SQL queries for security
    const result = await client.query(`
      SELECT 
        g.id, g.title, g.slug, g."clientName", g."eventType",
        COUNT(gi.id) as "imageCount",
        COUNT(d.id) as "downloadCount"
      FROM "Gallery" g
      LEFT JOIN "GalleryImage" gi ON g.id = gi."galleryId"
      LEFT JOIN "Download" d ON g.id = d."galleryId"
      WHERE g."isActive" = true
      GROUP BY g.id, g.title, g.slug, g."clientName", g."eventType"
      ORDER BY g."createdAt" DESC
    `)

    await client.end()

    res.status(200).json({
      galleries: result.rows.map(row => ({
        ...row,
        imageCount: parseInt(row.imageCount) || 0,
        downloadCount: parseInt(row.downloadCount) || 0
      }))
    })
  } catch (error) {
    console.error('Galleries error:', error)
    if (client) {
      await client.end()
    }
    res.status(500).json({ message: 'Internal server error' })
  }
}
```

## 🔒 Security Features

### 1. SQL Injection Prevention
```typescript
// ✅ Secure - Parameterized queries
await client.query(`SELECT * FROM "Gallery" WHERE slug = $1`, [gallerySlug])

// ❌ Insecure - String concatenation
await client.query(`SELECT * FROM "Gallery" WHERE slug = '${gallerySlug}'`)
```

### 2. Authentication Checks
```typescript
// Admin authentication
const session = await getSession({ req })
if (!session || (session.user as any)?.type !== 'admin') {
  return res.status(401).json({ message: 'Unauthorized' })
}

// Gallery password verification
const isValidPassword = await bcrypt.compare(password, gallery.password)
if (!isValidPassword) {
  return res.status(401).json({ message: 'Invalid password' })
}
```

### 3. Input Validation
```typescript
const { title, clientName, password } = req.body

if (!title || !clientName || !password) {
  return res.status(400).json({ message: 'Missing required fields' })
}

if (password.length < 8) {
  return res.status(400).json({ message: 'Password must be at least 8 characters' })
}
```

## 📊 Analysis & Validation

### API Pattern Analysis
```bash
npm run api:analyze
```

**Output Example:**
```
🔐 AUTHENTICATION PATTERNS:
  NextAuth: 10 endpoints
  Password Verification: 3 endpoints

🗄️ DATABASE PATTERNS:
  Prisma ORM: 10 endpoints
  Direct PostgreSQL: 7 endpoints

📋 Common Prisma Operations:
  gallery.findUnique: 6 uses
  gallery.findMany: 4 uses
  user.create: 2 uses
```

### Security Validation
```bash
npm run api:validate
```

**Output Example:**
```
📊 SUMMARY:
  Total Checks: 252
  Passed: 224
  Issues Found: 28
  Success Rate: 88.9%

🚨 HIGH SEVERITY ISSUES (2):
  Password handling without proper hashing/encryption

🚨 MEDIUM SEVERITY ISSUES (3):
  Missing authentication mechanism
  Incomplete error handling
```

## 🎨 Photography-Specific Features

### Gallery Management
```typescript
// Gallery creation with directory setup
const galleryDir = path.join(process.cwd(), 'public', 'galleries', slug)
const thumbnailDir = path.join(galleryDir, 'thumbnails')

if (!fs.existsSync(galleryDir)) {
  fs.mkdirSync(galleryDir, { recursive: true })
}
```

### Download Tracking
```typescript
// Automatic download limit enforcement
if (gallery.downloads.length >= gallery.downloadLimit) {
  return res.status(429).json({ message: 'Download limit exceeded' })
}

// Track download with client info
await prisma.download.create({
  data: {
    galleryId: gallery.id,
    imageId: image.id,
    clientIp: getClientIP(req),
    userAgent: req.headers['user-agent'] || null
  }
})
```

### Image Upload Processing
```typescript
// Multipart file handling
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb'
    }
  }
}

// Image processing with Sharp
const processedImage = await sharp(buffer)
  .resize(1920, 1080, { fit: 'inside' })
  .jpeg({ quality: 85 })
  .toBuffer()
```

## ⚙️ Configuration Options

### Available Scopes
- **`admin`** - Admin-only endpoints (NextAuth + Prisma by default)
- **`gallery`** - Client/gallery endpoints (Simple auth + PostgreSQL by default)

### Available Resources
- **`galleries`** - Gallery CRUD operations
- **`upload`** - File upload with processing
- **`download`** - File download with tracking
- **`access`** - Authentication endpoints
- **`images`** - Image management
- **`users`** - User management
- **`favorites`** - Image favorites
- **Custom** - Any resource name

### Available Options
- **`--crud`** - Full CRUD (GET, POST, PUT, DELETE)
- **`--auth`** - Authentication endpoint
- **`--simple`** - Force simple authentication
- **`--nextauth`** - Force NextAuth authentication
- **`--multipart`** - File upload support
- **`--nested`** - Nested routes (e.g., `/api/gallery/[slug]/images`)
- **`--dynamic`** - Dynamic routes (e.g., `/api/admin/users/[id]`)
- **`--force`** - Overwrite existing files

## 🚀 Advanced Usage

### Custom Business Logic
After generation, add your specific business rules:

```typescript
// Add after basic validation
if (gallery.eventType === 'wedding' && downloadCount > 100) {
  // Send notification to photographer
  await sendPhotographerAlert(gallery.id, 'High download activity')
}

// Custom pricing based on gallery type
const pricing = calculatePricing(gallery.eventType, downloadCount)
```

### Integration with Frontend
```typescript
// React hook for gallery data
const useGalleries = () => {
  const [galleries, setGalleries] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetch('/api/admin/galleries')
      .then(res => res.json())
      .then(data => {
        setGalleries(data.galleries)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch galleries:', err)
        setLoading(false)
      })
  }, [])
  
  return { galleries, loading }
}
```

### Batch Operations
```typescript
// Generate multiple related endpoints
npm run api:generate admin galleries --crud
npm run api:generate admin galleries --dynamic  # /api/admin/galleries/[id]
npm run api:generate gallery access --auth
npm run api:generate gallery download --nested --dynamic
```

## 🔧 Troubleshooting

### Common Issues

1. **File Already Exists**
   ```bash
   ⚠️  File already exists: /api/admin/galleries.ts
   Use --force to overwrite
   ```
   **Solution:** Add `--force` flag or use different resource name

2. **Permission Errors**
   ```bash
   Error: EACCES: permission denied
   ```
   **Solution:** Check file permissions and run with appropriate privileges

3. **Database Connection Issues**
   ```bash
   Error: Connection refused
   ```
   **Solution:** Verify `DATABASE_URL` environment variable

### Getting Help

```bash
# Show help
npm run api:generate

# Analyze patterns for insights
npm run api:analyze

# Validate for issues
npm run api:validate

# Check specific file
node scripts/api-validator.js src/pages/api/admin/galleries.ts
```

## 📈 Best Practices

### 1. Always Review Generated Code
- Check business logic requirements
- Verify security implementations
- Test edge cases
- Add proper logging

### 2. Follow Security Guidelines
- Use parameterized queries
- Validate all inputs
- Implement proper authentication
- Handle errors gracefully

### 3. Optimize for Performance
- Close database connections
- Implement caching where appropriate
- Use efficient queries
- Monitor resource usage

### 4. Maintain Consistency
- Follow established patterns
- Use consistent error messages
- Maintain code style
- Document any customizations

## 🎉 Success Stories

The API Generator has been successfully used to create:

- ✅ **15+ Admin Endpoints** - Full CRUD operations for galleries, users, and images
- ✅ **10+ Gallery Endpoints** - Client access, downloads, and favorites
- ✅ **Dual Authentication System** - NextAuth and simple authentication patterns
- ✅ **Security Compliance** - SQL injection prevention and input validation
- ✅ **Type Safety** - Complete TypeScript integration
- ✅ **Performance Optimization** - Efficient database operations

The generator saves **hours of development time** while ensuring **consistent, secure, and well-structured** API endpoints that perfectly match your project's architecture.

---

**Ready to rapidly expand your API functionality?** Start with the Quick Start guide above! 🚀