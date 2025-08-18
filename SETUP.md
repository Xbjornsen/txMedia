# Gallery System Setup Guide

## Prerequisites
- Node.js 18+ installed
- SQLite (comes with Node.js)

## Quick Setup

1. **Clone and install dependencies:**
   ```bash
   git clone <repo-url>
   cd txMedia
   npm install
   ```

2. **Environment Configuration:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your values:
   ```env
   NEXTAUTH_SECRET=your-secret-key-here-32-chars-min
   NEXTAUTH_URL=http://localhost:3000
   DATABASE_URL="file:./dev.db"
   ADMIN_EMAIL=xavier@txmedia.com
   ADMIN_PASSWORD=your-secure-password
   ```

3. **Database Setup:**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

4. **Start Development Server:**
   ```bash
   npm run dev
   ```

## Access Points

### Admin Access
- URL: `http://localhost:3000/admin/login`
- Login with `ADMIN_EMAIL` and `ADMIN_PASSWORD` from your `.env`
- Create galleries, upload images, manage clients

### Client Gallery Access  
- URL: `http://localhost:3000/gallery/login`
- Login with gallery slug and password (created by admin)
- View, favorite, and download images

### Navigation
- **Client Gallery** link added to main navigation
- **Admin Dashboard** accessible via `/admin/login`

## First Steps

1. Access admin at `/admin/login`
2. Create your first gallery in the dashboard
3. Upload some test images
4. Test client access with the gallery slug and password
5. Share gallery credentials with clients

## Troubleshooting

- **Database errors:** Run `npx prisma migrate reset` then `npx prisma migrate dev`
- **Auth errors:** Check your `NEXTAUTH_SECRET` is set (32+ characters)
- **File upload errors:** Ensure `public/galleries/` directory is writable
- **Missing images:** Check gallery slug matches exactly

## Production Deployment

For Vercel deployment, add these environment variables:
- `NEXTAUTH_SECRET` 
- `NEXTAUTH_URL` (your domain)
- `DATABASE_URL` (external DB)
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`