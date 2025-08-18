import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'

export default function GalleryLogin() {
  const [gallerySlug, setGallerySlug] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        gallerySlug,
        password,
        redirect: false
      })

      if (result?.error) {
        setError('Invalid gallery ID or password. Please check your details and try again.')
      } else {
        // Redirect to gallery
        router.push(`/gallery/${gallerySlug}`)
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Gallery Access - Tx Media</title>
        <meta name="description" content="Access your private photo gallery from Tx Media" />
      </Head>
      
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Link href="/" className="inline-block mb-8">
              <h1 className="text-3xl font-bold text-[var(--accent)]">Tx Media</h1>
            </Link>
            <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">
              Access Your Gallery
            </h2>
            <p className="text-[var(--secondary)]">
              Enter your gallery details to view your photos
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-100 border border-red-300 rounded-lg p-4">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <div>
              <label 
                htmlFor="gallerySlug" 
                className="block text-sm font-medium text-[var(--foreground)] mb-2"
              >
                Gallery ID
              </label>
              <input
                type="text"
                id="gallerySlug"
                value={gallerySlug}
                onChange={(e) => setGallerySlug(e.target.value)}
                required
                disabled={isLoading}
                className="w-full px-3 py-3 bg-[var(--gradient-start)] border border-[var(--secondary)]/20 rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] disabled:opacity-50"
                placeholder="e.g., wedding-smith-2024"
              />
            </div>

            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-medium text-[var(--foreground)] mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="w-full px-3 py-3 bg-[var(--gradient-start)] border border-[var(--secondary)]/20 rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] disabled:opacity-50"
                placeholder="Enter your gallery password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !gallerySlug || !password}
              className="w-full py-3 px-4 bg-[var(--accent)] text-[var(--background)] rounded-lg hover:bg-opacity-80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
                    ></path>
                  </svg>
                  Accessing Gallery...
                </>
              ) : (
                'Access Gallery'
              )}
            </button>
          </form>

          <div className="text-center">
            <p className="text-sm text-[var(--secondary)]">
              Don&apos;t have your gallery details?{' '}
              <Link href="/contact" className="text-[var(--accent)] hover:underline">
                Contact us
              </Link>
            </p>
          </div>

          <div className="text-center pt-6 border-t border-[var(--secondary)]/20">
            <Link 
              href="/" 
              className="text-sm text-[var(--secondary)] hover:text-[var(--accent)] transition-colors"
            >
              ← Back to Tx Media
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}