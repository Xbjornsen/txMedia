/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (req.method === 'PATCH') {
    try {
      const session = await getSession({ req })
      
      if (!session || (session.user as any)?.type !== 'admin') {
        return res.status(401).json({ message: 'Unauthorized' })
      }

      const { isActive } = req.body

      const updatedGallery = await prisma.gallery.update({
        where: { id: id as string },
        data: { isActive }
      })

      res.status(200).json({ 
        message: 'Gallery updated successfully',
        gallery: {
          id: updatedGallery.id,
          isActive: updatedGallery.isActive
        }
      })
    } catch (error) {
      console.error('Gallery update error:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  } else if (req.method === 'DELETE') {
    try {
      const session = await getSession({ req })
      
      if (!session || (session.user as any)?.type !== 'admin') {
        return res.status(401).json({ message: 'Unauthorized' })
      }

      await prisma.gallery.delete({
        where: { id: id as string }
      })

      res.status(200).json({ message: 'Gallery deleted successfully' })
    } catch (error) {
      console.error('Gallery delete error:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}