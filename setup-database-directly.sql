-- Create tables for Tx Media Gallery System
-- Run this directly in Supabase SQL editor

-- Account table for NextAuth
CREATE TABLE "Account" (
    id TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    type TEXT NOT NULL,
    provider TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    refresh_token TEXT,
    access_token TEXT,
    expires_at INTEGER,
    token_type TEXT,
    scope TEXT,
    id_token TEXT,
    session_state TEXT,
    UNIQUE(provider, "providerAccountId")
);

-- Session table for NextAuth
CREATE TABLE "Session" (
    id TEXT PRIMARY KEY,
    "sessionToken" TEXT UNIQUE NOT NULL,
    "userId" TEXT NOT NULL,
    expires TIMESTAMP NOT NULL
);

-- User table
CREATE TABLE "User" (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE,
    "emailVerified" TIMESTAMP,
    image TEXT,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- VerificationToken table for NextAuth
CREATE TABLE "VerificationToken" (
    identifier TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires TIMESTAMP NOT NULL,
    UNIQUE(identifier, token)
);

-- Gallery table
CREATE TABLE "Gallery" (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    slug TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "clientEmail" TEXT NOT NULL,
    "eventDate" TIMESTAMP,
    "eventType" TEXT NOT NULL,
    "isActive" BOOLEAN DEFAULT true,
    "expiryDate" TIMESTAMP,
    "downloadLimit" INTEGER DEFAULT 50,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- GalleryImage table
CREATE TABLE "GalleryImage" (
    id TEXT PRIMARY KEY,
    "fileName" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "thumbnailPath" TEXT,
    "watermarkPath" TEXT,
    "fileSize" INTEGER NOT NULL,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    "order" INTEGER DEFAULT 0,
    "isPublic" BOOLEAN DEFAULT true,
    "galleryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Download table
CREATE TABLE "Download" (
    id TEXT PRIMARY KEY,
    "clientIp" TEXT NOT NULL,
    "userAgent" TEXT,
    "galleryId" TEXT NOT NULL,
    "imageId" TEXT NOT NULL,
    "downloadedAt" TIMESTAMP DEFAULT NOW()
);

-- Favorite table
CREATE TABLE "Favorite" (
    id TEXT PRIMARY KEY,
    "clientIp" TEXT NOT NULL,
    "galleryId" TEXT NOT NULL,
    "imageId" TEXT NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    UNIQUE("clientIp", "imageId")
);

-- GalleryAccess table
CREATE TABLE "GalleryAccess" (
    id TEXT PRIMARY KEY,
    "galleryId" TEXT NOT NULL,
    "clientIp" TEXT NOT NULL,
    "userAgent" TEXT,
    "accessedAt" TIMESTAMP DEFAULT NOW()
);

-- Add foreign key constraints
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE;
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE;
ALTER TABLE "Gallery" ADD CONSTRAINT "Gallery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE;
ALTER TABLE "GalleryImage" ADD CONSTRAINT "GalleryImage_galleryId_fkey" FOREIGN KEY ("galleryId") REFERENCES "Gallery"(id) ON DELETE CASCADE;
ALTER TABLE "Download" ADD CONSTRAINT "Download_galleryId_fkey" FOREIGN KEY ("galleryId") REFERENCES "Gallery"(id) ON DELETE CASCADE;
ALTER TABLE "Download" ADD CONSTRAINT "Download_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "GalleryImage"(id) ON DELETE CASCADE;
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_galleryId_fkey" FOREIGN KEY ("galleryId") REFERENCES "Gallery"(id) ON DELETE CASCADE;
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "GalleryImage"(id) ON DELETE CASCADE;

-- Add indexes for performance
CREATE INDEX "GalleryAccess_galleryId_idx" ON "GalleryAccess"("galleryId");
CREATE INDEX "GalleryAccess_clientIp_idx" ON "GalleryAccess"("clientIp");

-- Create function to generate UUIDs (using gen_random_uuid if available)
-- This is a fallback for cuid() function
CREATE OR REPLACE FUNCTION generate_cuid() RETURNS TEXT AS $$
BEGIN
    RETURN 'c' || encode(gen_random_bytes(12), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Set default values for ID fields
ALTER TABLE "Account" ALTER COLUMN id SET DEFAULT generate_cuid();
ALTER TABLE "Session" ALTER COLUMN id SET DEFAULT generate_cuid();
ALTER TABLE "User" ALTER COLUMN id SET DEFAULT generate_cuid();
ALTER TABLE "Gallery" ALTER COLUMN id SET DEFAULT generate_cuid();
ALTER TABLE "GalleryImage" ALTER COLUMN id SET DEFAULT generate_cuid();
ALTER TABLE "Download" ALTER COLUMN id SET DEFAULT generate_cuid();
ALTER TABLE "Favorite" ALTER COLUMN id SET DEFAULT generate_cuid();
ALTER TABLE "GalleryAccess" ALTER COLUMN id SET DEFAULT generate_cuid();