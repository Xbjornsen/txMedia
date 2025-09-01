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

    const { slug, newPassword } = req.body

    // Validate input
    if (!slug || typeof slug !== 'string') {
      return res.status(400).json({ error: 'Gallery slug is required' })
    }

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 4) {
      return res.status(400).json({ error: 'New password is required (minimum 4 characters)' })
    }

    // Check if gallery exists
    const gallery = await prisma.gallery.findUnique({
      where: { slug: slug },
      select: {
        id: true,
        title: true,
        slug: true,
        clientName: true,
        clientEmail: true
      }
    })

    if (!gallery) {
      return res.status(404).json({ error: 'Gallery not found' })
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // Update the gallery password
    await prisma.gallery.update({
      where: { slug: slug },
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
        slug: gallery.slug,
        clientName: gallery.clientName,
        clientEmail: gallery.clientEmail
      },
      newPassword: newPassword
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
export interface ResetPasswordBySlugRequest {
  slug: string
  newPassword: string
}

export interface ResetPasswordBySlugResponse {
  success: boolean
  message: string
  gallery?: {
    id: string
    title: string
    slug: string
    clientName: string
    clientEmail: string
  }
  newPassword?: string
  error?: string
}