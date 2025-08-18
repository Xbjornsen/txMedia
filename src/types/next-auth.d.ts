declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      gallerySlug?: string
      galleryTitle?: string
    }
  }

  interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    gallerySlug?: string
    galleryTitle?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    gallerySlug?: string
    galleryTitle?: string
  }
}