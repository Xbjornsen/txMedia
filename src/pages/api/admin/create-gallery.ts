/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const session = await getSession({ req })
    
    if (!session || (session.user as any)?.type !== 'admin') {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const {
      title,
      clientName,
      clientEmail,
      eventType,
      eventDate,
      description,
      downloadLimit,
      password,
      expiryMonths
    } = req.body

    // Validate required fields
    if (!title || !clientName || !clientEmail || !password) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    // Generate slug
    const generateSlug = (title: string, clientName: string) => {
      const cleanTitle = title.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-')
      const cleanName = clientName.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-')
      const year = new Date().getFullYear()
      return `${cleanTitle}-${cleanName}-${year}`.substring(0, 50)
    }

    const slug = generateSlug(title, clientName)

    // Check if slug already exists
    const existingGallery = await prisma.gallery.findUnique({
      where: { slug }
    })

    if (existingGallery) {
      return res.status(400).json({ message: 'A gallery with this name already exists' })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Calculate expiry date
    const expiryDate = new Date()
    expiryDate.setMonth(expiryDate.getMonth() + (expiryMonths || 12))

    // Get or create user
    let user = await prisma.user.findUnique({
      where: { email: process.env.ADMIN_EMAIL! }
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: 'Xavier Thorbjornsen',
          email: process.env.ADMIN_EMAIL!
        }
      })
    }

    // Create gallery
    const gallery = await prisma.gallery.create({
      data: {
        title,
        slug,
        password: hashedPassword,
        clientName,
        clientEmail,
        eventType,
        eventDate: eventDate ? new Date(eventDate) : null,
        description,
        downloadLimit: downloadLimit || 50,
        expiryDate,
        userId: user.id
      }
    })

    // Create gallery directories
    const galleryDir = path.join(process.cwd(), 'public', 'galleries', slug)
    const thumbnailDir = path.join(galleryDir, 'thumbnails')
    
    if (!fs.existsSync(galleryDir)) {
      fs.mkdirSync(galleryDir, { recursive: true })
    }
    if (!fs.existsSync(thumbnailDir)) {
      fs.mkdirSync(thumbnailDir, { recursive: true })
    }

    res.status(201).json({
      message: 'Gallery created successfully',
      gallery: {
        id: gallery.id,
        title: gallery.title,
        slug: gallery.slug,
        clientName: gallery.clientName,
        clientEmail: gallery.clientEmail
      }
    })
  } catch (error) {
    console.error('Create gallery error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}