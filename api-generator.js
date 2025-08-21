#!/usr/bin/env node

/**
 * TxMedia API Endpoint Generator
 * 
 * Generates API endpoints following established patterns in the txMedia photography portfolio.
 * Supports both NextAuth (with Prisma) and Simple (direct PostgreSQL) authentication patterns.
 * 
 * Usage:
 *   node api-generator.js <scope> <resource> [options]
 * 
 * Examples:
 *   node api-generator.js admin galleries --crud
 *   node api-generator.js gallery download --auth
 *   node api-generator.js admin upload --multipart
 *   node api-generator.js gallery access --simple
 */

const fs = require('fs');
const path = require('path');

// Configuration based on existing patterns
const CONFIG = {
  apiDir: path.join(__dirname, 'src', 'pages', 'api'),
  patterns: {
    admin: {
      auth: 'nextauth', // Default to NextAuth for admin
      authCheck: `
    const session = await getSession({ req })
    
    if (!session || (session.user as any)?.type !== 'admin') {
      return res.status(401).json({ message: 'Unauthorized' })
    }`,
      imports: [
        `import { getSession } from 'next-auth/react'`,
        `import { PrismaClient } from '@prisma/client'`
      ],
      dbConnection: `const prisma = new PrismaClient()`
    },
    gallery: {
      auth: 'simple', // Default to simple for gallery
      authCheck: (slug = false) => `
    // Gallery access should be verified through session storage or password verification
    // This endpoint assumes proper authentication has been established`,
      imports: [
        `import { Client } from 'pg'`
      ],
      dbConnection: `
    const client = new Client({
      connectionString: process.env.DATABASE_URL
    })
    
    await client.connect()`
    }
  },
  schema: {
    Gallery: {
      fields: ['id', 'title', 'slug', 'password', 'clientName', 'clientEmail', 'eventType', 'eventDate', 'isActive', 'downloadLimit', 'expiryDate', 'createdAt', 'updatedAt'],
      relations: ['images', 'downloads', 'favorites', 'accessLogs']
    },
    GalleryImage: {
      fields: ['id', 'fileName', 'originalName', 'filePath', 'thumbnailPath', 'watermarkPath', 'fileSize', 'width', 'height', 'order', 'isPublic', 'galleryId', 'createdAt', 'updatedAt'],
      relations: ['gallery', 'downloads', 'favorites']
    },
    Download: {
      fields: ['id', 'clientIp', 'userAgent', 'galleryId', 'imageId', 'downloadedAt'],
      relations: ['gallery', 'image']
    },
    Favorite: {
      fields: ['id', 'clientIp', 'galleryId', 'imageId', 'createdAt'],
      relations: ['gallery', 'image']
    },
    GalleryAccess: {
      fields: ['id', 'galleryId', 'clientIp', 'userAgent', 'accessedAt'],
      relations: ['gallery']
    }
  }
};

// Template generators
class TemplateGenerator {
  constructor(scope, resource, options = {}) {
    this.scope = scope; // 'admin' or 'gallery'
    this.resource = resource; // 'galleries', 'upload', 'download', etc.
    this.options = options;
    this.config = CONFIG.patterns[scope] || CONFIG.patterns.gallery;
    
    // Override auth pattern if specified
    if (options.simple) {
      this.config = CONFIG.patterns.gallery;
    } else if (options.nextauth) {
      this.config = CONFIG.patterns.admin;
    }
  }

  generateImports() {
    const baseImports = [
      `import { NextApiRequest, NextApiResponse } from 'next'`
    ];
    
    const authImports = this.config.imports || [];
    
    // Add specific imports based on functionality
    const functionalImports = [];
    
    if (this.options.crud || this.options.auth) {
      functionalImports.push(`import bcrypt from 'bcryptjs'`);
    }
    
    if (this.options.multipart || this.resource === 'upload') {
      functionalImports.push(`import fs from 'fs'`, `import path from 'path'`);
    }
    
    if (this.resource === 'download') {
      functionalImports.push(`import fs from 'fs'`, `import path from 'path'`);
    }

    return [...baseImports, ...authImports, ...functionalImports].join('\n');
  }

  generateDatabaseConnection() {
    return this.config.dbConnection;
  }

  generateAuthCheck(customAuth = false) {
    if (customAuth) return customAuth;
    
    if (typeof this.config.authCheck === 'function') {
      return this.config.authCheck(this.options.slug);
    }
    return this.config.authCheck;
  }

  generateMethodValidation(methods = ['GET']) {
    const methodList = Array.isArray(methods) ? methods : [methods];
    
    if (methodList.length === 1) {
      return `
  if (req.method !== '${methodList[0]}') {
    return res.status(405).json({ message: 'Method not allowed' })
  }`;
    } else {
      return `
  if (!['${methodList.join("', '")}'].includes(req.method || '')) {
    return res.status(405).json({ message: 'Method not allowed' })
  }`;
    }
  }

  generateErrorHandling() {
    return `
  } catch (error) {
    console.error('${this.scope} ${this.resource} error:', error)${this.config.auth === 'simple' ? `
    if (client) {
      await client.end()
    }` : ''}
    res.status(500).json({ message: 'Internal server error' })
  }`;
  }

  generateDatabaseQuery(operation, model, conditions = {}, include = {}) {
    if (this.config.auth === 'nextauth') {
      // Prisma queries
      return this.generatePrismaQuery(operation, model, conditions, include);
    } else {
      // Direct SQL queries
      return this.generateSqlQuery(operation, model, conditions);
    }
  }

  generatePrismaQuery(operation, model, conditions = {}, include = {}) {
    const modelName = model.toLowerCase();
    
    switch (operation) {
      case 'findMany':
        return `
    const ${modelName}s = await prisma.${modelName}.findMany({${Object.keys(conditions).length ? `
      where: ${JSON.stringify(conditions, null, 6).replace(/"/g, '')},` : ''}${Object.keys(include).length ? `
      include: ${JSON.stringify(include, null, 6).replace(/"/g, '')},` : ''}
      orderBy: {
        createdAt: 'desc'
      }
    })`;
      
      case 'findUnique':
        return `
    const ${modelName} = await prisma.${modelName}.findUnique({
      where: ${JSON.stringify(conditions, null, 6).replace(/"/g, '')},${Object.keys(include).length ? `
      include: ${JSON.stringify(include, null, 6).replace(/"/g, '')}` : ''}
    })`;
      
      case 'create':
        return `
    const ${modelName} = await prisma.${modelName}.create({
      data: {
        // Add your fields here
      }
    })`;
      
      case 'update':
        return `
    const ${modelName} = await prisma.${modelName}.update({
      where: ${JSON.stringify(conditions, null, 6).replace(/"/g, '')},
      data: {
        // Add your update fields here
      }
    })`;
      
      case 'delete':
        return `
    await prisma.${modelName}.delete({
      where: ${JSON.stringify(conditions, null, 6).replace(/"/g, '')}
    })`;
      
      default:
        return `// Add your ${operation} logic here`;
    }
  }

  generateSqlQuery(operation, model, conditions = {}) {
    const tableName = model;
    
    switch (operation) {
      case 'findMany':
        return `
    const result = await client.query(\`
      SELECT * FROM "${tableName}"
      ORDER BY "createdAt" DESC
    \`)
    
    const ${model.toLowerCase()}s = result.rows`;
      
      case 'findUnique':
        const whereClause = Object.keys(conditions).map(key => `"${key}" = $1`).join(' AND ');
        const values = Object.values(conditions);
        
        return `
    const result = await client.query(\`
      SELECT * FROM "${tableName}"
      WHERE ${whereClause}
    \`, [${values.map((_, i) => `$${i + 1}`).join(', ')}])
    
    const ${model.toLowerCase()} = result.rows[0]`;
      
      case 'create':
        return `
    const result = await client.query(\`
      INSERT INTO "${tableName}" (id, "createdAt", "updatedAt")
      VALUES ($1, NOW(), NOW())
      RETURNING *
    \`, [generateId()])
    
    const ${model.toLowerCase()} = result.rows[0]`;
      
      default:
        return `// Add your ${operation} SQL logic here`;
    }
  }

  generateUtilityFunctions() {
    const functions = [];
    
    if (this.config.auth === 'simple') {
      functions.push(`
function generateId() {
  return \`\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`
}`);
    }
    
    if (this.resource === 'download' || this.options.multipart) {
      functions.push(`
function getClientIP(req: NextApiRequest): string {
  const forwarded = req.headers['x-forwarded-for']
  const ip = forwarded 
    ? (Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0])
    : req.socket.remoteAddress || 'unknown'
  return ip
}`);
    }
    
    return functions.join('\n');
  }

  generateInterface() {
    return `
/**
 * API Endpoint: ${this.scope}/${this.resource}
 * Generated by TxMedia API Generator
 * 
 * Authentication: ${this.config.auth}
 * Database: ${this.config.auth === 'nextauth' ? 'Prisma' : 'Direct PostgreSQL'}
 */

interface RequestBody {
  // Define your request body interface here
}

interface ResponseData {
  // Define your response data interface here
}`;
  }
}

// Endpoint generators for different types
class EndpointGenerators {
  static generateCRUD(generator) {
    const methods = ['GET', 'POST', 'PUT', 'DELETE'];
    const resourceSingular = generator.resource.slice(0, -1); // Remove 's' for singular
    
    return `${generator.generateInterface()}

${generator.generateImports()}

${generator.generateDatabaseConnection()}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {${generator.generateMethodValidation(methods)}

  try {${generator.generateAuthCheck()}

    switch (req.method) {
      case 'GET':
        // List ${generator.resource}
        ${generator.generateDatabaseQuery('findMany', resourceSingular)}
        
        res.status(200).json({
          ${generator.resource}: ${generator.config.auth === 'nextauth' ? `${generator.resource}` : `${generator.resource}`},
          total: ${generator.resource}.length
        })
        break

      case 'POST':
        // Create new ${resourceSingular}
        const { /* destructure request body */ } = req.body
        
        // Validate required fields
        if (!/* required field */) {
          return res.status(400).json({ message: 'Missing required fields' })
        }
        
        ${generator.generateDatabaseQuery('create', resourceSingular)}
        
        res.status(201).json({
          message: '${resourceSingular} created successfully',
          ${resourceSingular}
        })
        break

      case 'PUT':
        // Update ${resourceSingular}
        const { id } = req.query
        // Add update logic here
        
        res.status(200).json({
          message: '${resourceSingular} updated successfully'
        })
        break

      case 'DELETE':
        // Delete ${resourceSingular}
        const { id: deleteId } = req.query
        // Add delete logic here
        
        res.status(200).json({
          message: '${resourceSingular} deleted successfully'
        })
        break

      default:
        res.status(405).json({ message: 'Method not allowed' })
    }${generator.config.auth === 'simple' ? `
    
    await client.end()` : ''}
${generator.generateErrorHandling()}
}

${generator.generateUtilityFunctions()}`;
  }

  static generateAuth(generator) {
    return `${generator.generateInterface()}
${generator.generateImports()}

${generator.generateDatabaseConnection()}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {${generator.generateMethodValidation('POST')}

  try {
    const { ${generator.scope === 'gallery' ? 'gallerySlug, password' : 'email, password'} } = req.body

    if (!${generator.scope === 'gallery' ? 'gallerySlug || !password' : 'email || !password'}) {
      return res.status(400).json({ 
        success: false, 
        message: '${generator.scope === 'gallery' ? 'Gallery slug and password are required' : 'Email and password are required'}' 
      })
    }

    ${generator.scope === 'gallery' ? 
      generator.generateDatabaseQuery('findUnique', 'Gallery', { slug: 'gallerySlug', isActive: true }) :
      generator.generateDatabaseQuery('findUnique', 'User', { email: 'email' })
    }

    if (!${generator.scope === 'gallery' ? 'gallery' : 'user'}) {
      return res.status(404).json({ 
        success: false, 
        message: '${generator.scope === 'gallery' ? 'Gallery not found or inactive' : 'User not found'}' 
      })
    }

    ${generator.scope === 'gallery' ? `
    // Check if gallery has expired
    if (gallery.expiryDate && new Date() > ${generator.config.auth === 'nextauth' ? 'gallery.expiryDate' : 'new Date(gallery.expiryDate)'}) {
      return res.status(403).json({ 
        success: false, 
        message: 'Gallery has expired' 
      })
    }` : ''}

    // Verify password
    const isValidPassword = await bcrypt.compare(password, ${generator.scope === 'gallery' ? 'gallery' : 'user'}.password)
    
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid password' 
      })
    }

    ${generator.scope === 'gallery' ? `
    // Log gallery access
    ${generator.config.auth === 'nextauth' ? `
    await prisma.galleryAccess.create({
      data: {
        galleryId: gallery.id,
        clientIp: req.socket.remoteAddress || 'unknown',
        userAgent: req.headers['user-agent'] || undefined
      }
    })` : `
    await client.query(\`
      INSERT INTO "GalleryAccess" (id, "galleryId", "clientIp", "userAgent", "accessedAt")
      VALUES ($1, $2, $3, $4, NOW())
    \`, [
      generateId(),
      gallery.id,
      req.socket.remoteAddress || 'unknown',
      req.headers['user-agent'] || null
    ])`}` : ''}

    // Return success with ${generator.scope} info
    res.status(200).json({
      success: true,
      ${generator.scope}: {
        id: ${generator.scope === 'gallery' ? 'gallery' : 'user'}.id,
        ${generator.scope === 'gallery' ? `
        title: gallery.title,
        slug: gallery.slug,
        clientName: gallery.clientName,
        eventType: gallery.eventType,
        eventDate: gallery.eventDate,
        downloadLimit: gallery.downloadLimit` : `
        name: user.name,
        email: user.email`}
      }
    })${generator.config.auth === 'simple' ? `
    
    await client.end()` : ''}
${generator.generateErrorHandling()}
}

${generator.generateUtilityFunctions()}`;
  }

  static generateDownload(generator) {
    return `${generator.generateInterface()}
${generator.generateImports()}

${generator.generateDatabaseConnection()}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { slug, imageId } = req.query${generator.generateMethodValidation('GET')}

  try {${generator.generateAuthCheck(`
    // Verify gallery access through session or authentication
    // This should be implemented based on your authentication strategy`)}

    ${generator.generateDatabaseQuery('findUnique', 'Gallery', 
      { slug: 'slug as string', isActive: true }, 
      { downloads: true, images: { where: { id: 'imageId as string' } } }
    )}

    if (!gallery || gallery.images.length === 0) {
      return res.status(404).json({ message: 'Gallery or image not found' })
    }

    // Check download limit
    if (gallery.downloads.length >= gallery.downloadLimit) {
      return res.status(429).json({ message: 'Download limit exceeded' })
    }

    const image = gallery.images[0]
    const imagePath = path.join(process.cwd(), 'public', 'galleries', slug as string, image.fileName)

    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ message: 'Image file not found' })
    }

    // Track download
    ${generator.config.auth === 'nextauth' ? `
    await prisma.download.create({
      data: {
        galleryId: gallery.id,
        imageId: image.id,
        clientIp: getClientIP(req),
        userAgent: req.headers['user-agent'] || null
      }
    })` : `
    await client.query(\`
      INSERT INTO "Download" (id, "galleryId", "imageId", "clientIp", "userAgent", "downloadedAt")
      VALUES ($1, $2, $3, $4, $5, NOW())
    \`, [
      generateId(),
      gallery.id,
      image.id,
      getClientIP(req),
      req.headers['user-agent'] || null
    ])`}

    // Set headers for file download
    const fileBuffer = fs.readFileSync(imagePath)
    const fileExtension = path.extname(image.fileName)
    const mimeTypes: { [key: string]: string } = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp'
    }

    res.setHeader('Content-Type', mimeTypes[fileExtension.toLowerCase()] || 'application/octet-stream')
    res.setHeader('Content-Disposition', \`attachment; filename="\${image.originalName}"\`)
    res.setHeader('Content-Length', fileBuffer.length)

    res.status(200).send(fileBuffer)${generator.config.auth === 'simple' ? `
    
    await client.end()` : ''}
${generator.generateErrorHandling()}
}

${generator.generateUtilityFunctions()}`;
  }

  static generateUpload(generator) {
    return `${generator.generateInterface()}
${generator.generateImports()}

${generator.generateDatabaseConnection()}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb'
    }
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {${generator.generateMethodValidation('POST')}

  try {${generator.generateAuthCheck()}

    // Handle multipart form data upload
    const { files, gallerySlug } = req.body // Implement proper file parsing

    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'No files provided' })
    }

    if (!gallerySlug) {
      return res.status(400).json({ message: 'Gallery slug is required' })
    }

    // Find gallery
    ${generator.generateDatabaseQuery('findUnique', 'Gallery', { slug: 'gallerySlug' })}

    if (!gallery) {
      return res.status(404).json({ message: 'Gallery not found' })
    }

    const uploadedImages = []
    const galleryDir = path.join(process.cwd(), 'public', 'galleries', gallerySlug)
    const thumbnailDir = path.join(galleryDir, 'thumbnails')

    // Ensure directories exist
    if (!fs.existsSync(galleryDir)) {
      fs.mkdirSync(galleryDir, { recursive: true })
    }
    if (!fs.existsSync(thumbnailDir)) {
      fs.mkdirSync(thumbnailDir, { recursive: true })
    }

    // Process each file
    for (const file of files) {
      // Implement file processing logic
      const fileName = \`\${Date.now()}-\${file.originalName}\`
      const filePath = path.join(galleryDir, fileName)
      
      // Save file logic here
      
      // Create database record
      ${generator.config.auth === 'nextauth' ? `
      const image = await prisma.galleryImage.create({
        data: {
          fileName,
          originalName: file.originalName,
          filePath: \`/galleries/\${gallerySlug}/\${fileName}\`,
          fileSize: file.size,
          width: 0, // Get from image processing
          height: 0, // Get from image processing
          galleryId: gallery.id
        }
      })` : `
      const imageResult = await client.query(\`
        INSERT INTO "GalleryImage" (id, "fileName", "originalName", "filePath", "fileSize", "width", "height", "galleryId", "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
        RETURNING *
      \`, [
        generateId(),
        fileName,
        file.originalName,
        \`/galleries/\${gallerySlug}/\${fileName}\`,
        file.size,
        0, // Get from image processing
        0, // Get from image processing
        gallery.id
      ])
      
      const image = imageResult.rows[0]`}
      
      uploadedImages.push(image)
    }

    res.status(200).json({
      message: 'Images uploaded successfully',
      images: uploadedImages,
      count: uploadedImages.length
    })${generator.config.auth === 'simple' ? `
    
    await client.end()` : ''}
${generator.generateErrorHandling()}
}

${generator.generateUtilityFunctions()}`;
  }

  static generateSimple(generator) {
    return `${generator.generateInterface()}
${generator.generateImports()}

${generator.generateDatabaseConnection()}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {${generator.generateMethodValidation('GET')}

  try {${generator.generateAuthCheck()}

    // Add your endpoint logic here
    ${generator.generateDatabaseQuery('findMany', generator.resource.slice(0, -1))}

    res.status(200).json({
      message: 'Success',
      data: ${generator.resource}
    })${generator.config.auth === 'simple' ? `
    
    await client.end()` : ''}
${generator.generateErrorHandling()}
}

${generator.generateUtilityFunctions()}`;
  }
}

// File system operations
class FileManager {
  static ensureDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  static generateFilePath(scope, resource, options = {}) {
    let basePath = path.join(CONFIG.apiDir, scope);
    
    if (options.nested) {
      // For nested routes like /api/gallery/[slug]/download/[imageId].ts
      basePath = path.join(basePath, '[slug]', resource);
    }
    
    this.ensureDirectory(basePath);
    
    let fileName = resource;
    if (options.simple && !fileName.endsWith('-simple')) {
      fileName += '-simple';
    }
    if (options.dynamic) {
      fileName = '[' + (options.param || 'id') + ']';
    }
    
    return path.join(basePath, fileName + '.ts');
  }

  static writeEndpoint(filePath, content) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Generated: ${filePath}`);
  }

  static checkFileExists(filePath) {
    return fs.existsSync(filePath);
  }
}

// Main CLI handler
class CLIHandler {
  static parse(args) {
    const [,, scope, resource, ...options] = args;
    
    if (!scope || !resource) {
      this.showHelp();
      process.exit(1);
    }

    const parsedOptions = {};
    options.forEach(opt => {
      if (opt.startsWith('--')) {
        const key = opt.slice(2);
        parsedOptions[key] = true;
      }
    });

    return { scope, resource, options: parsedOptions };
  }

  static showHelp() {
    console.log(`
TxMedia API Endpoint Generator

Usage: node api-generator.js <scope> <resource> [options]

Scopes:
  admin     - Admin-only endpoints (uses NextAuth by default)
  gallery   - Gallery/client endpoints (uses simple auth by default)

Resources:
  galleries - Gallery management
  upload    - File upload endpoints
  download  - File download endpoints
  access    - Access control endpoints
  images    - Image management
  [custom]  - Any custom resource name

Options:
  --crud      Generate full CRUD operations (GET, POST, PUT, DELETE)
  --auth      Generate authentication endpoint
  --simple    Force simple authentication (direct PostgreSQL)
  --nextauth  Force NextAuth authentication (Prisma)
  --multipart Enable multipart file upload handling
  --nested    Create nested route structure
  --dynamic   Create dynamic route with [id] parameter

Examples:
  node api-generator.js admin galleries --crud
  node api-generator.js gallery download --auth --simple
  node api-generator.js admin upload --multipart --nextauth
  node api-generator.js gallery access --simple
  node api-generator.js admin users --crud --dynamic
  node api-generator.js gallery images --nested --dynamic

Generated files follow existing patterns in your codebase:
- NextAuth endpoints use Prisma ORM
- Simple endpoints use direct PostgreSQL client
- Proper TypeScript interfaces and error handling
- Photography-specific features (galleries, downloads, favorites)
- Security validation and authentication checks
`);
  }

  static async generate(scope, resource, options) {
    // Validate scope
    if (!['admin', 'gallery'].includes(scope)) {
      console.error(`❌ Invalid scope: ${scope}. Must be 'admin' or 'gallery'`);
      process.exit(1);
    }

    const generator = new TemplateGenerator(scope, resource, options);
    let content = '';
    let filePath = '';

    try {
      // Determine generation strategy
      if (options.crud) {
        content = EndpointGenerators.generateCRUD(generator);
        filePath = FileManager.generateFilePath(scope, resource, options);
      } else if (options.auth) {
        content = EndpointGenerators.generateAuth(generator);
        filePath = FileManager.generateFilePath(scope, 'verify-access', options);
      } else if (resource === 'download') {
        content = EndpointGenerators.generateDownload(generator);
        filePath = FileManager.generateFilePath(scope, resource, { ...options, nested: true, param: 'imageId' });
      } else if (resource === 'upload' || options.multipart) {
        content = EndpointGenerators.generateUpload(generator);
        filePath = FileManager.generateFilePath(scope, resource, options);
      } else {
        content = EndpointGenerators.generateSimple(generator);
        filePath = FileManager.generateFilePath(scope, resource, options);
      }

      // Check if file exists
      if (FileManager.checkFileExists(filePath) && !options.force) {
        console.log(`⚠️  File already exists: ${filePath}`);
        console.log('Use --force to overwrite');
        return;
      }

      // Write the file
      FileManager.writeEndpoint(filePath, content);

      // Generate both versions if not explicitly specified
      if (!options.simple && !options.nextauth && scope === 'admin') {
        const simpleOptions = { ...options, simple: true };
        const simpleGenerator = new TemplateGenerator(scope, resource, simpleOptions);
        const simpleContent = options.crud ? EndpointGenerators.generateCRUD(simpleGenerator) :
                             options.auth ? EndpointGenerators.generateAuth(simpleGenerator) :
                             resource === 'download' ? EndpointGenerators.generateDownload(simpleGenerator) :
                             resource === 'upload' || options.multipart ? EndpointGenerators.generateUpload(simpleGenerator) :
                             EndpointGenerators.generateSimple(simpleGenerator);
        
        const simpleFilePath = FileManager.generateFilePath(scope, resource, simpleOptions);
        
        if (!FileManager.checkFileExists(simpleFilePath)) {
          FileManager.writeEndpoint(simpleFilePath, simpleContent);
          console.log(`📄 Also generated simple version: ${simpleFilePath}`);
        }
      }

      console.log(`
🎉 API endpoint generated successfully!

Generated file: ${filePath}
Scope: ${scope}
Resource: ${resource}
Authentication: ${generator.config.auth}
Database: ${generator.config.auth === 'nextauth' ? 'Prisma' : 'Direct PostgreSQL'}

Next steps:
1. Review the generated code
2. Add your specific business logic
3. Test the endpoint
4. Update the frontend to use the new endpoint
`);

    } catch (error) {
      console.error(`❌ Error generating endpoint: ${error.message}`);
      process.exit(1);
    }
  }
}

// Main execution
if (require.main === module) {
  const { scope, resource, options } = CLIHandler.parse(process.argv);
  CLIHandler.generate(scope, resource, options);
}

module.exports = {
  TemplateGenerator,
  EndpointGenerators,
  FileManager,
  CLIHandler,
  CONFIG
};