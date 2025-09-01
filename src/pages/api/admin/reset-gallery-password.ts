import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Check authentication
    const session = await getSession({ req })
    if (!session?.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { galleryId, newPassword } = req.body

    // Validate input
    if (!galleryId || typeof galleryId !== 'string') {
      return res.status(400).json({ error: 'Gallery ID is required' })
    }

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 4) {
      return res.status(400).json({ error: 'New password is required (minimum 4 characters)' })
    }

    // Check if gallery exists
    const gallery = await prisma.gallery.findUnique({
      where: { id: galleryId },
      select: {
        id: true,
        title: true,
        slug: true
      }
    })

    if (!gallery) {
      return res.status(404).json({ error: 'Gallery not found' })
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // Update the gallery password
    await prisma.gallery.update({
      where: { id: galleryId },
      data: {
        password: hashedPassword
      }
    })

    return res.status(200).json({
      success: true,
      message: `Password reset successfully for "${gallery.title}"`,
      gallery: {
        id: gallery.id,
        title: gallery.title,
        slug: gallery.slug
      },
      newPassword: newPassword // In production, you might not want to return this
    })

  } catch (error) {
    console.error('Error resetting gallery password:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('Record to update not found')) {
        return res.status(404).json({ error: 'Gallery not found' })
      }
    }

    return res.status(500).json({ 
      error: 'Internal server error occurred while resetting password' 
    })
  }
}

// TypeScript interfaces
export interface ResetPasswordRequest {
  galleryId: string
  newPassword: string
}

export interface ResetPasswordResponse {
  success: boolean
  message: string
  gallery?: {
    id: string
    title: string
    slug: string
  }
  newPassword?: string
  error?: string
}