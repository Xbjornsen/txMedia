# TxMedia API Generator Guide

A comprehensive API endpoint generator for the txMedia photography portfolio project that automatically creates endpoints following established patterns.

## Overview

The API Generator analyzes your existing API patterns and creates new endpoints that perfectly match your codebase's architecture, authentication patterns, and database operations.

## Features

### 🔐 Dual Authentication Support
- **NextAuth Integration**: Full NextAuth support with Prisma ORM
- **Simple Authentication**: Direct PostgreSQL client with bcrypt
- **Automatic Detection**: Generates both versions when appropriate

### 🗄️ Database Pattern Recognition
- **Prisma ORM**: Type-safe database operations with relationships
- **Direct PostgreSQL**: Raw SQL queries with parameter binding
- **Transaction Support**: Built-in transaction handling for complex operations

### 📸 Photography-Specific Features
- **Gallery Management**: Create, edit, delete galleries
- **Image Operations**: Upload, download, processing endpoints
- **Download Tracking**: Automatic download limit enforcement
- **Access Control**: Gallery password verification and session management

### 🛡️ Security & Validation
- **Input Validation**: Comprehensive request validation
- **SQL Injection Protection**: Parameterized queries
- **Authentication Checks**: Proper admin and gallery access verification
- **Error Handling**: Consistent error responses

## Installation & Setup

The generator is ready to use immediately. No additional installation required.

```bash
# Make the script executable (Linux/Mac)
chmod +x api-generator.js

# Run directly with Node.js
node api-generator.js <scope> <resource> [options]
```

## Usage

### Basic Syntax
```bash
node api-generator.js <scope> <resource> [options]
```

### Scopes
- **`admin`** - Admin-only endpoints (defaults to NextAuth + Prisma)
- **`gallery`** - Gallery/client endpoints (defaults to Simple auth + PostgreSQL)

### Resources
- **`galleries`** - Gallery management operations
- **`upload`** - File upload endpoints with multipart support
- **`download`** - File download with tracking
- **`access`** - Authentication and access control
- **`images`** - Image management operations
- **`users`** - User management (admin scope)
- **`favorites`** - Image favorites functionality
- **Custom** - Any custom resource name

### Options
- **`--crud`** - Generate full CRUD operations (GET, POST, PUT, DELETE)
- **`--auth`** - Generate authentication endpoint
- **`--simple`** - Force simple authentication (direct PostgreSQL)
- **`--nextauth`** - Force NextAuth authentication (Prisma)
- **`--multipart`** - Enable multipart file upload handling
- **`--nested`** - Create nested route structure
- **`--dynamic`** - Create dynamic route with [id] parameter
- **`--force`** - Overwrite existing files

## Examples

### 1. Admin Gallery Management
```bash
# Generate full CRUD for admin gallery management
node api-generator.js admin galleries --crud

# Generates:
# - /api/admin/galleries.ts (NextAuth + Prisma)
# - /api/admin/galleries-simple.ts (Simple + PostgreSQL)
```

**Generated endpoints:**
- `GET /api/admin/galleries` - List all galleries with stats
- `POST /api/admin/galleries` - Create new gallery
- `PUT /api/admin/galleries` - Update gallery
- `DELETE /api/admin/galleries` - Delete gallery

### 2. Gallery Access Control
```bash
# Generate gallery password verification
node api-generator.js gallery access --auth --simple

# Generates:
# - /api/gallery/verify-access-simple.ts
```

**Generated endpoint:**
- `POST /api/gallery/verify-access-simple` - Verify gallery password

### 3. Image Upload System
```bash
# Generate admin image upload with multipart support
node api-generator.js admin upload --multipart

# Generates:
# - /api/admin/upload.ts (NextAuth + Prisma)
# - /api/admin/upload-simple.ts (Simple + PostgreSQL)
```

**Generated endpoint:**
- `POST /api/admin/upload` - Upload multiple images with processing

### 4. Download Tracking
```bash
# Generate gallery download endpoint with tracking
node api-generator.js gallery download --nested --dynamic

# Generates:
# - /api/gallery/[slug]/download/[imageId].ts
```

**Generated endpoint:**
- `GET /api/gallery/[slug]/download/[imageId]` - Download image with tracking

### 5. User Management
```bash
# Generate admin user management
node api-generator.js admin users --crud --dynamic

# Generates:
# - /api/admin/users.ts (List/Create users)
# - /api/admin/users/[id].ts (Get/Update/Delete specific user)
```

### 6. Image Favorites
```bash
# Generate gallery favorites system
node api-generator.js gallery favorites --crud

# Generates:
# - /api/gallery/favorites.ts (Simple auth + PostgreSQL)
```

## Generated Code Structure

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
    // NextAuth session check
    const session = await getSession({ req })
    
    if (!session || (session.user as any)?.type !== 'admin') {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    // Prisma database operations
    const galleries = await prisma.gallery.findMany({
      include: {
        images: true,
        downloads: true
      }
    })

    res.status(200).json({ galleries })
  } catch (error) {
    console.error('Error:', error)
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

    // Raw SQL with parameter binding
    const result = await client.query(`
      SELECT * FROM "Gallery"
      WHERE "isActive" = true
      ORDER BY "createdAt" DESC
    `)

    await client.end()

    res.status(200).json({ galleries: result.rows })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
```

## Database Schema Integration

The generator automatically understands your Prisma schema and generates appropriate database operations:

```prisma
model Gallery {
  id            String   @id @default(cuid())
  title         String
  slug          String   @unique
  password      String
  clientName    String
  clientEmail   String
  eventDate     DateTime?
  eventType     String
  isActive      Boolean  @default(true)
  downloadLimit Int      @default(50)
  
  images        GalleryImage[]
  downloads     Download[]
  favorites     Favorite[]
  accessLogs    GalleryAccess[]
}
```

**Generated operations include:**
- Proper relationship handling (`include` in Prisma, `JOIN` in SQL)
- Field validation based on schema requirements
- Automatic ID generation (cuid for Prisma, custom for SQL)
- Date/time handling

## Authentication Patterns

### Admin Authentication (NextAuth)
```typescript
// Session-based authentication
const session = await getSession({ req })

if (!session || (session.user as any)?.type !== 'admin') {
  return res.status(401).json({ message: 'Unauthorized' })
}
```

### Gallery Authentication (Simple)
```typescript
// Password-based authentication
const { gallerySlug, password } = req.body

const gallery = await client.query(`
  SELECT * FROM "Gallery" 
  WHERE slug = $1 AND "isActive" = true
`, [gallerySlug])

const isValid = await bcrypt.compare(password, gallery.rows[0].password)
```

## File Upload Handling

The generator creates proper multipart upload endpoints:

```typescript
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb'
    }
  }
}

// File processing with directory creation
const galleryDir = path.join(process.cwd(), 'public', 'galleries', gallerySlug)
const thumbnailDir = path.join(galleryDir, 'thumbnails')

if (!fs.existsSync(galleryDir)) {
  fs.mkdirSync(galleryDir, { recursive: true })
}
```

## Download Tracking

Automatic download tracking with limit enforcement:

```typescript
// Check download limit
if (gallery.downloads.length >= gallery.downloadLimit) {
  return res.status(429).json({ message: 'Download limit exceeded' })
}

// Track download
await prisma.download.create({
  data: {
    galleryId: gallery.id,
    imageId: image.id,
    clientIp: getClientIP(req),
    userAgent: req.headers['user-agent'] || null
  }
})
```

## Error Handling

Consistent error handling across all endpoints:

```typescript
try {
  // Endpoint logic
} catch (error) {
  console.error('Endpoint error:', error)
  
  // Close database connection for simple auth
  if (client) {
    await client.end()
  }
  
  res.status(500).json({ message: 'Internal server error' })
}
```

## TypeScript Integration

All generated endpoints include proper TypeScript interfaces:

```typescript
interface RequestBody {
  gallerySlug: string
  password: string
}

interface ResponseData {
  success: boolean
  gallery?: {
    id: string
    title: string
    slug: string
    clientName: string
    downloadLimit: number
  }
  message?: string
}
```

## Best Practices

### 1. Review Generated Code
Always review and customize the generated code for your specific needs:
- Add proper validation logic
- Implement business rules
- Customize error messages
- Add logging as needed

### 2. Test Thoroughly
- Test authentication flows
- Verify database operations
- Check error handling
- Validate file uploads/downloads

### 3. Security Considerations
- Validate all inputs
- Use parameterized queries
- Implement rate limiting
- Add proper CORS headers

### 4. Performance Optimization
- Add database indexes for frequently queried fields
- Implement caching where appropriate
- Optimize file upload/download processes
- Use database connections efficiently

## Customization

### Adding Custom Validation
```typescript
// Add after method validation
const { title, clientName, password } = req.body

if (!title || title.length < 3) {
  return res.status(400).json({ 
    message: 'Title must be at least 3 characters' 
  })
}

if (!password || password.length < 8) {
  return res.status(400).json({ 
    message: 'Password must be at least 8 characters' 
  })
}
```

### Adding Business Logic
```typescript
// Add custom business rules
if (gallery.expiryDate && new Date() > gallery.expiryDate) {
  return res.status(403).json({ 
    message: 'Gallery has expired' 
  })
}

// Calculate pricing based on download count
const pricing = calculateGalleryPricing(gallery.downloads.length)
```

## Troubleshooting

### Common Issues

1. **File Already Exists**
   ```bash
   ⚠️  File already exists: /api/admin/galleries.ts
   Use --force to overwrite
   ```
   Solution: Add `--force` flag or rename the resource

2. **Invalid Scope**
   ```bash
   ❌ Invalid scope: client. Must be 'admin' or 'gallery'
   ```
   Solution: Use only 'admin' or 'gallery' as scope

3. **Database Connection Issues**
   - Ensure `DATABASE_URL` environment variable is set
   - Check PostgreSQL connection permissions
   - Verify Prisma schema is up to date

### Getting Help

1. **View Help**:
   ```bash
   node api-generator.js
   ```

2. **Check Generated Files**: Always review generated code before use

3. **Existing Patterns**: Study existing API files in `/src/pages/api/` for reference

## Advanced Usage

### Custom Authentication
```bash
# Generate endpoint with custom auth pattern
node api-generator.js gallery reports --simple --force
```

Then customize the authentication:
```typescript
// Custom session verification
const gallerySession = req.headers['x-gallery-session']
if (!gallerySession || !isValidSession(gallerySession)) {
  return res.status(401).json({ message: 'Invalid session' })
}
```

### Nested Routes
```bash
# Create nested route structure
node api-generator.js gallery images --nested --dynamic
# Generates: /api/gallery/[slug]/images/[imageId].ts
```

### Batch Operations
```bash
# Generate batch image operations
node api-generator.js admin batch-upload --multipart
```

## Integration with Frontend

### React Hook Examples
```typescript
// Using the generated gallery endpoint
const useGalleries = () => {
  const [galleries, setGalleries] = useState([])
  
  useEffect(() => {
    fetch('/api/admin/galleries')
      .then(res => res.json())
      .then(data => setGalleries(data.galleries))
  }, [])
  
  return galleries
}

// Using the generated auth endpoint
const verifyGalleryAccess = async (slug: string, password: string) => {
  const response = await fetch('/api/gallery/verify-access', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gallerySlug: slug, password })
  })
  
  return response.json()
}
```

The TxMedia API Generator saves significant development time by creating consistent, secure, and well-structured API endpoints that follow your project's established patterns.