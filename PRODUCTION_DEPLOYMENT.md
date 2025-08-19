# 🚀 Production Deployment Guide

## 🗄️ **Database Migration Steps**

### **Step 1: Export Current Data**
```bash
npm run db:export
# Creates data-export.json with all your galleries and images
```

### **Step 2: Choose Production Database**

#### **Option A: Supabase (Recommended)**
1. Go to [supabase.com](https://supabase.com) → Create project
2. Get connection string: `postgresql://postgres:[password]@[host]:5432/postgres`
3. Add to Vercel environment: `DATABASE_URL`

#### **Option B: Neon (Simple)**
1. Go to [neon.tech](https://neon.tech) → Create project  
2. Get connection string: `postgresql://[user]:[pass]@[host]/[db]?sslmode=require`
3. Add to Vercel environment: `DATABASE_URL`

### **Step 3: Deploy Schema**
```bash
# Set production DATABASE_URL in .env
DATABASE_URL="postgresql://user:pass@host:5432/db"

# Deploy to production
npm run db:setup-prod
```

### **Step 4: Import Data**
```bash
npm run db:import
# Imports all your galleries, images, users
```

## 📸 **Photo Storage Migration**

### **Current Problem**
- Photos in `/public` folder (3.6MB for 3 images)
- Lost on every deployment
- No optimization or CDN

### **Solution: Vercel Blob Storage**

#### **Setup Vercel Blob**
1. Install: `npm install @vercel/blob`
2. Enable in Vercel dashboard → Storage → Blob
3. Get token: Automatically available in Vercel

#### **Migration Script**
```javascript
// scripts/migrate-photos-to-blob.js
import { put } from '@vercel/blob'
import fs from 'fs'

async function migratePhotos() {
  const galleries = await prisma.gallery.findMany({ include: { images: true }})
  
  for (const gallery of galleries) {
    for (const image of gallery.images) {
      // Upload original
      const file = fs.readFileSync(`public${image.filePath}`)
      const blob = await put(image.fileName, file, { access: 'public' })
      
      // Update database with new URL
      await prisma.galleryImage.update({
        where: { id: image.id },
        data: { filePath: blob.url }
      })
    }
  }
}
```

## 🔧 **Environment Variables for Vercel**

```env
# Database
DATABASE_URL="postgresql://user:pass@host:5432/db"

# Auth
NEXTAUTH_SECRET="your-32-char-secret-key"
NEXTAUTH_URL="https://your-domain.vercel.app"

# Admin
ADMIN_EMAIL="xavier@txmedia.com"
ADMIN_PASSWORD="your-secure-password"

# Blob Storage (auto-configured by Vercel)
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."
```

## 📋 **Complete Migration Checklist**

### **Local Setup**
- [ ] `npm run db:check` - Verify current data
- [ ] `npm run db:export` - Export data
- [ ] Test gallery access works locally

### **Production Database**
- [ ] Create Supabase/Neon project
- [ ] Add `DATABASE_URL` to Vercel
- [ ] `npm run db:setup-prod` - Deploy schema
- [ ] `npm run db:import` - Import data

### **Photo Storage**
- [ ] Enable Vercel Blob Storage
- [ ] Update upload code to use Blob
- [ ] Migrate existing photos
- [ ] Test upload/download works

### **Deployment**
- [ ] Deploy to Vercel
- [ ] Test admin login
- [ ] Test gallery creation
- [ ] Test client gallery access
- [ ] Test photo upload/download

## 🎯 **Recommended Order**

1. **Start with Database**: Supabase for full features
2. **Photo Storage**: Vercel Blob for best integration
3. **Deploy**: Test everything works
4. **Migrate Photos**: Move existing photos to Blob

## 💰 **Cost Estimate**

**Free Tier:**
- Supabase: 500MB DB + 1GB storage
- Vercel: 1GB blob storage  
- **Total**: Free for small galleries

**Paid Tier:**
- Supabase Pro: $25/month
- Vercel Pro: $20/month  
- Blob storage: $0.15/GB
- **Total**: ~$45/month for professional use

Would you like me to implement any of these steps?