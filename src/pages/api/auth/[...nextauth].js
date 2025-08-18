import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

export default NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Gallery Access",
      credentials: {
        gallerySlug: { label: "Gallery ID", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.gallerySlug || !credentials?.password) {
          return null
        }

        try {
          const gallery = await prisma.gallery.findUnique({
            where: {
              slug: credentials.gallerySlug,
              isActive: true
            }
          })

          if (!gallery) {
            return null
          }

          // Check if gallery has expired
          if (gallery.expiryDate && new Date() > gallery.expiryDate) {
            return null
          }

          // Verify password
          const isValidPassword = await bcrypt.compare(credentials.password, gallery.password)
          
          if (!isValidPassword) {
            return null
          }

          // Return user object for session
          return {
            id: gallery.id,
            name: gallery.clientName,
            email: gallery.clientEmail,
            gallerySlug: gallery.slug,
            galleryTitle: gallery.title
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.gallerySlug = user.gallerySlug
        token.galleryTitle = user.galleryTitle
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.gallerySlug = token.gallerySlug
        session.user.galleryTitle = token.galleryTitle
      }
      return session
    }
  },
  pages: {
    signIn: '/gallery/login',
    error: '/gallery/login'
  }
})