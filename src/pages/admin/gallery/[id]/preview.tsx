import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import GalleryImageModal from '@/components/GalleryImageModal'
import { ImageGridSkeleton } from '@/components/GallerySkeleton'
import { Gallery } from '@/types/gallery'

interface AdminSession {
  user: {
    id: string
    name: string
    email: string
    type: string
  }
  loginTime: number
}

export default function AdminGalleryPreview() {
  const router = useRouter()
  const { id } = router.query
  
  const [gallery, setGallery] = useState<Gallery | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(-1)
  const [view, setView] = useState<'grid' | 'favorites'>('grid')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null)
  const [gridColumns, setGridColumns] = useState<2 | 3 | 4 | 5>(4)

  const fetchGallery = useCallback(async () => {
    if (!id) return
    
    try {
      const response = await fetch(`/api/admin/gallery/${id}`)
      if (!response.ok) {
        throw new Error('Gallery not found')
      }
      
      const data = await response.json()
      
      // Transform admin gallery data to match Gallery interface
      const galleryData: Gallery = {
        ...data.gallery,
        images: data.gallery.images.map((img: any) => ({
          ...img,
          isFavorite: false // Admin preview doesn't need favorites functionality
        })),
        downloadsUsed: data.gallery.downloadCount || 0
      }
      
      setGallery(galleryData)
    } catch {
      setError('Failed to load gallery')
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (typeof window === 'undefined') return
    
    // Check for admin session
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
      if (id) {
        fetchGallery()
      }
    } catch (error) {
      console.error('Invalid admin session:', error)
      router.push('/admin/login')
    }
  }, [id, router, fetchGallery])

  const downloadImage = async (imageId: string, fileName: string) => {
    try {
      // For admin preview, use direct download without limits
      const response = await fetch(`/api/admin/gallery/${id}/image/${imageId}/download`)
      
      if (!response.ok) {
        throw new Error('Download failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch {
      alert('Failed to download image. Please try again.')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent)] mx-auto mb-4"></div>
          <p className="text-[var(--secondary)]">Loading gallery preview...</p>
        </div>
      </div>
    )
  }

  if (error || !gallery) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--foreground)] mb-4">Gallery Not Found</h1>
          <p className="text-[var(--secondary)] mb-6">
            The gallery you're looking for doesn't exist.
          </p>
          <Link 
            href="/admin/dashboard"
            className="inline-block px-6 py-3 bg-[var(--accent)] text-[var(--background)] rounded-lg hover:bg-opacity-80 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const filteredImages = view === 'favorites' 
    ? gallery.images.filter(img => img.isFavorite)
    : gallery.images

  return (
    <>
      <Head>
        <title>{gallery.title} - Admin Preview - Tx Media</title>
        <meta name="description" content={`Admin preview: ${gallery.title}`} />
      </Head>

      <div className="min-h-screen bg-[var(--background)]">
        {/* Header */}
        <header className="bg-[var(--gradient-start)] border-b border-[var(--secondary)]/20">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <Link href="/admin/dashboard" className="text-xl font-bold text-[var(--accent)] mb-2 inline-block">
                  Tx Media Admin
                </Link>
                <h1 className="text-2xl font-bold text-[var(--foreground)]">{gallery.title}</h1>
                <p className="text-[var(--secondary)] text-sm">
                  Admin Preview • {adminSession?.user?.name && `${adminSession.user.name} • `}
                  {gallery.eventType} • {gallery.images.length} photos
                  {gallery.eventDate && ` • ${new Date(gallery.eventDate).toLocaleDateString()}`}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Link
                  href={`/admin/gallery/${id}`}
                  className="px-4 py-2 bg-[var(--accent)] text-[var(--background)] rounded-lg hover:bg-opacity-80 transition-colors"
                >
                  Edit Gallery
                </Link>
                <Link
                  href="/admin/dashboard"
                  className="px-4 py-2 bg-[var(--secondary)]/20 text-[var(--foreground)] rounded-lg hover:bg-[var(--secondary)]/30 transition-colors"
                >
                  Dashboard
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 gap-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setView('grid')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  view === 'grid'
                    ? 'bg-[var(--accent)] text-[var(--background)]'
                    : 'bg-[var(--secondary)]/20 text-[var(--foreground)] hover:bg-[var(--secondary)]/30'
                }`}
              >
                All Photos ({gallery.images.length})
              </button>
              <div className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm">
                Admin Preview Mode
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Grid size control */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-[var(--secondary)] hidden sm:inline">Grid:</span>
                <div className="flex gap-1">
                  {[2, 3, 4, 5].map((cols) => (
                    <button
                      key={cols}
                      onClick={() => setGridColumns(cols as 2 | 3 | 4 | 5)}
                      className={`w-8 h-8 text-xs rounded transition-colors ${
                        gridColumns === cols
                          ? 'bg-[var(--accent)] text-[var(--background)]'
                          : 'bg-[var(--secondary)]/20 text-[var(--foreground)] hover:bg-[var(--secondary)]/30'
                      }`}
                    >
                      {cols}
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-sm text-[var(--secondary)]">
                Download Limit: {gallery.downloadLimit}
              </div>
            </div>
          </div>

          {/* Image Grid */}
          {isLoading ? (
            <ImageGridSkeleton columns={gridColumns} count={16} />
          ) : filteredImages.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-[var(--secondary)] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-[var(--secondary)] text-lg mb-2">No images in this gallery.</p>
            </div>
          ) : (
            <div className={`grid gap-4 ${
              gridColumns === 2 ? 'grid-cols-2' :
              gridColumns === 3 ? 'grid-cols-2 sm:grid-cols-3' :
              gridColumns === 4 ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' :
              'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
            }`}>
              {filteredImages.map((image) => (
                <div key={image.id} className="relative group">
                  <div 
                    className="aspect-square bg-[var(--secondary)]/10 rounded-lg overflow-hidden cursor-pointer"
                    onClick={() => setSelectedImageIndex(filteredImages.findIndex(img => img.id === image.id))}
                  >
                    <Image
                      src={image.thumbnailPath || image.filePath}
                      alt={image.originalName || image.fileName}
                      width={300}
                      height={300}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes={`(max-width: 640px) 50vw, (max-width: 1024px) ${100/gridColumns}vw, ${100/gridColumns}vw`}
                    />
                  </div>
                  
                  {/* Admin indicator */}
                  <div className="absolute top-2 right-2 p-1 bg-blue-500 text-white rounded text-xs">
                    Admin
                  </div>
                  
                  {/* Overlay with actions */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        downloadImage(image.id, image.originalName || image.fileName)
                      }}
                      className="p-2 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors"
                      title="Download image (Admin)"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Enhanced Image Modal */}
        <GalleryImageModal
          isOpen={selectedImageIndex >= 0}
          onClose={() => setSelectedImageIndex(-1)}
          images={filteredImages}
          currentIndex={selectedImageIndex}
          onNavigate={setSelectedImageIndex}
          onToggleFavorite={() => {}} // Disabled in admin preview
          onDownload={downloadImage}
          showActions={true}
          downloadLimit={gallery.downloadLimit}
          downloadsUsed={0} // Admin has unlimited downloads
        />
      </div>
    </>
  )
}