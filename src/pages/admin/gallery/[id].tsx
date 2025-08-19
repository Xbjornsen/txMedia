import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'

interface Gallery {
  id: string
  title: string
  slug: string
  clientName: string
  clientEmail: string
  eventType: string
  eventDate: string | null
  description: string | null
  downloadLimit: number
  isActive: boolean
  expiryDate: string
  images: GalleryImage[]
}

interface GalleryImage {
  id: string
  fileName: string
  originalName: string
  filePath: string
  thumbnailPath: string | null
  fileSize: number
  width: number
  height: number
  order: number
  isPublic: boolean
}

interface AdminSession {
  user: {
    id: string
    name: string
    email: string
    type: string
  }
  loginTime: number
}

export default function AdminGalleryEdit() {
  const router = useRouter()
  const { id } = router.query
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  
  const [gallery, setGallery] = useState<Gallery | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const [error, setError] = useState('')

  const fetchGallery = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/gallery/${id}`)
      if (response.ok) {
        const data = await response.json()
        setGallery(data.gallery)
      } else {
        setError('Gallery not found')
      }
    } catch (error) {
      console.error('Failed to fetch gallery:', error)
      setError('Failed to load gallery')
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const checkAdminAuth = () => {
      const storedSession = sessionStorage.getItem('adminSession')
      if (!storedSession) {
        router.push('/admin/login')
        return
      }

      try {
        const session = JSON.parse(storedSession)
        // Check if session is still valid (24 hours)
        const isExpired = Date.now() - session.loginTime > 24 * 60 * 60 * 1000
        if (isExpired) {
          sessionStorage.removeItem('adminSession')
          router.push('/admin/login')
          return
        }

        setAdminSession(session)
        setIsAuthLoading(false)
      } catch (error) {
        console.error('Session parse error:', error)
        sessionStorage.removeItem('adminSession')
        router.push('/admin/login')
      }
    }

    checkAdminAuth()
  }, [router])

  useEffect(() => {
    if (!isAuthLoading && adminSession && id) {
      fetchGallery()
    }
  }, [isAuthLoading, adminSession, id, fetchGallery])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      // Validate file types
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      const invalidFiles = Array.from(files).filter(file => !validTypes.includes(file.type))
      
      if (invalidFiles.length > 0) {
        setError('Please select only JPEG, PNG, or WebP images')
        return
      }

      // Check file sizes (max 10MB each)
      const oversizedFiles = Array.from(files).filter(file => file.size > 10 * 1024 * 1024)
      if (oversizedFiles.length > 0) {
        setError('Please select files smaller than 10MB each')
        return
      }

      setSelectedFiles(files)
      setError('')
    }
  }

  const handleUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) return

    setIsUploading(true)
    setUploadProgress(0)
    setError('')

    try {
      const formData = new FormData()
      formData.append('galleryId', id as string)
      
      Array.from(selectedFiles).forEach((file) => {
        formData.append(`images`, file)
      })

      const response = await fetch('/api/admin/upload-images', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        await response.json()
        setSelectedFiles(null)
        // Reset file input
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
        if (fileInput) fileInput.value = ''
        
        // Refresh gallery data
        await fetchGallery()
        setUploadProgress(100)
      } else {
        const result = await response.json()
        setError(result.message || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      setError('Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
      setTimeout(() => setUploadProgress(0), 2000)
    }
  }

  const deleteImage = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return

    try {
      const response = await fetch(`/api/admin/gallery/${id}/image/${imageId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchGallery()
      } else {
        setError('Failed to delete image')
      }
    } catch (error) {
      console.error('Delete error:', error)
      setError('Failed to delete image')
    }
  }

  if (isAuthLoading || isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent)] mx-auto mb-4"></div>
          <p className="text-[var(--secondary)]">Loading gallery...</p>
        </div>
      </div>
    )
  }

  if (error && !gallery) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Link
            href="/admin/dashboard"
            className="px-4 py-2 bg-[var(--accent)] text-[var(--background)] rounded-lg hover:bg-opacity-80 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Edit Gallery - {gallery?.title} - Admin - Tx Media</title>
        <meta name="description" content="Manage gallery images and settings" />
      </Head>

      <div className="min-h-screen bg-[var(--background)]">
        {/* Header */}
        <header className="bg-[var(--gradient-start)] border-b border-[var(--secondary)]/20">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <Link href="/admin/dashboard" className="text-[var(--accent)] hover:underline text-sm mb-2 inline-block">
                  ← Back to Dashboard
                </Link>
                <h1 className="text-2xl font-bold text-[var(--foreground)]">
                  {gallery?.title}
                </h1>
                <p className="text-[var(--secondary)] text-sm">
                  {gallery?.clientName} • {gallery?.eventType}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Link
                  href={`/gallery/${gallery?.slug}`}
                  target="_blank"
                  className="px-4 py-2 bg-[var(--secondary)]/20 text-[var(--foreground)] rounded-lg hover:bg-[var(--secondary)]/30 transition-colors"
                >
                  View Gallery
                </Link>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Gallery Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-[var(--gradient-start)] p-6 rounded-xl border border-[var(--secondary)]/20">
              <h3 className="text-sm font-medium text-[var(--secondary)] mb-2">Total Images</h3>
              <p className="text-3xl font-bold text-[var(--foreground)]">{gallery?.images.length || 0}</p>
            </div>
            <div className="bg-[var(--gradient-start)] p-6 rounded-xl border border-[var(--secondary)]/20">
              <h3 className="text-sm font-medium text-[var(--secondary)] mb-2">Gallery Status</h3>
              <p className={`text-lg font-semibold ${gallery?.isActive ? 'text-green-500' : 'text-red-500'}`}>
                {gallery?.isActive ? 'Active' : 'Inactive'}
              </p>
            </div>
            <div className="bg-[var(--gradient-start)] p-6 rounded-xl border border-[var(--secondary)]/20">
              <h3 className="text-sm font-medium text-[var(--secondary)] mb-2">Download Limit</h3>
              <p className="text-3xl font-bold text-[var(--foreground)]">{gallery?.downloadLimit}</p>
            </div>
            <div className="bg-[var(--gradient-start)] p-6 rounded-xl border border-[var(--secondary)]/20">
              <h3 className="text-sm font-medium text-[var(--secondary)] mb-2">Expires</h3>
              <p className="text-sm text-[var(--foreground)]">
                {gallery?.expiryDate ? new Date(gallery.expiryDate).toLocaleDateString() : 'Never'}
              </p>
            </div>
          </div>

          {/* Upload Section */}
          <div className="bg-[var(--gradient-start)] rounded-xl border border-[var(--secondary)]/20 p-6 mb-8">
            <h2 className="text-xl font-semibold text-[var(--foreground)] mb-6">Upload Images</h2>
            
            {error && (
              <div className="mb-4 bg-red-100 border border-red-300 rounded-lg p-4">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileSelect}
                  disabled={isUploading}
                  className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--secondary)]/20 rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-[var(--accent)] file:text-[var(--background)] file:text-sm file:font-medium"
                />
                <p className="text-sm text-[var(--secondary)] mt-2">
                  Select JPEG, PNG, or WebP images (max 10MB each)
                </p>
              </div>

              {selectedFiles && selectedFiles.length > 0 && (
                <div>
                  <p className="text-sm text-[var(--foreground)] mb-2">
                    Selected: {selectedFiles.length} file(s)
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleUpload}
                      disabled={isUploading}
                      className="px-6 py-2 bg-[var(--accent)] text-[var(--background)] rounded-lg hover:bg-opacity-80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUploading ? 'Uploading...' : 'Upload Images'}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedFiles(null)
                        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
                        if (fileInput) fileInput.value = ''
                      }}
                      disabled={isUploading}
                      className="px-6 py-2 bg-[var(--secondary)]/20 text-[var(--foreground)] rounded-lg hover:bg-[var(--secondary)]/30 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {uploadProgress > 0 && (
                <div className="w-full bg-[var(--secondary)]/20 rounded-full h-2">
                  <div 
                    className="bg-[var(--accent)] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}
            </div>
          </div>

          {/* Images Grid */}
          <div className="bg-[var(--gradient-start)] rounded-xl border border-[var(--secondary)]/20 p-6">
            <h2 className="text-xl font-semibold text-[var(--foreground)] mb-6">Gallery Images</h2>
            
            {!gallery?.images || gallery.images.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-[var(--secondary)] mb-4">No images uploaded yet</p>
                <p className="text-sm text-[var(--secondary)]">Upload some images to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {gallery.images.map((image) => (
                  <div key={image.id} className="relative group">
                    <div className="aspect-square bg-[var(--secondary)]/10 rounded-lg overflow-hidden">
                      <Image
                        src={image.thumbnailPath || image.filePath}
                        alt={image.originalName}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
                        className="object-cover"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <button
                        onClick={() => deleteImage(image.id)}
                        className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-xs text-[var(--secondary)] mt-2 truncate">
                      {image.originalName}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}