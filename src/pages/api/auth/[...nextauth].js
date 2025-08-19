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
      id: "admin",
      name: "Admin Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Check admin credentials from environment
          const adminEmail = process.env.ADMIN_EMAIL
          const adminPassword = process.env.ADMIN_PASSWORD

          if (credentials.email === adminEmail && credentials.password === adminPassword) {
            // Find admin user in database
            const adminUser = await prisma.user.findUnique({
              where: { email: adminEmail }
            })

            if (adminUser) {
              return {
                id: adminUser.id,
                name: adminUser.name,
                email: adminUser.email,
                type: 'admin'
              }
            }
          }

          return null
        } catch (error) {
          console.error("Admin auth error:", error)
          return null
        }
      }
    }),
    CredentialsProvider({
      id: "gallery",
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
            galleryTitle: gallery.title,
            type: 'client'
          }
        } catch (error) {
          console.error("Gallery auth error:", error)
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
        token.type = user.type
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.gallerySlug = token.gallerySlug
        session.user.galleryTitle = token.galleryTitle
        session.user.type = token.type
      }
      return session
    }
  }
})