import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import GalleryImageModal from '@/components/GalleryImageModal'
import { ImageGridSkeleton } from '@/components/GallerySkeleton'
import { Gallery } from '@/types/gallery'

export default function GalleryView() {
  const router = useRouter()
  const { slug } = router.query
  
  const [gallery, setGallery] = useState<Gallery | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(-1)
  const [view, setView] = useState<'grid' | 'favorites'>('grid')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [galleryAccess, setGalleryAccess] = useState<{slug: string, clientName: string, title: string, accessTime: number} | null>(null)
  const [gridColumns, setGridColumns] = useState<2 | 3 | 4 | 5>(4)

  const fetchGallery = useCallback(async () => {
    if (!slug) return
    
    try {
      const response = await fetch(`/api/gallery/${slug}`)
      if (!response.ok) {
        throw new Error('Gallery not found')
      }
      
      const galleryData = await response.json()
      setGallery(galleryData)
    } catch {
      setError('Failed to load gallery')
    } finally {
      setIsLoading(false)
    }
  }, [slug])

  useEffect(() => {
    console.log('Gallery page useEffect - slug:', slug)
    
    // Check for gallery access in sessionStorage (client-side only)
    if (typeof window === 'undefined') return
    
    const storedAccess = sessionStorage.getItem('galleryAccess')
    console.log('Stored access:', storedAccess)
    
    if (storedAccess) {
      const access = JSON.parse(storedAccess)
      console.log('Parsed access:', access)
      console.log('Current slug:', slug, 'Access slug:', access.slug)
      
      // Check if access is for current gallery and not expired (24 hours)
      if (access.slug === slug && Date.now() - access.accessTime < 24 * 60 * 60 * 1000) {
        console.log('Access valid, setting gallery access')
        setGalleryAccess(access)
        if (slug) {
          fetchGallery()
        }
        return
      } else {
        console.log('Access invalid - slug mismatch or expired')
      }
    } else {
      console.log('No stored access found')
    }

    // No valid access, redirect to login
    if (slug) {
      console.log('Redirecting to login')
      router.push('/gallery/login')
    }
  }, [slug, router, fetchGallery])

  const toggleFavorite = async (imageId: string) => {
    try {
      const response = await fetch(`/api/gallery/${slug}/favorite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageId })
      })

      if (response.ok) {
        // Update local state
        setGallery(prev => prev ? {
          ...prev,
          images: prev.images.map(img => 
            img.id === imageId ? { ...img, isFavorite: !img.isFavorite } : img
          )
        } : null)
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err)
    }
  }

  const downloadImage = async (imageId: string, fileName: string) => {
    try {
      const response = await fetch(`/api/gallery/${slug}/download/${imageId}`)
      
      if (!response.ok) {
        if (response.status === 429) {
          alert('Download limit reached. Please contact us for additional downloads.')
          return
        }
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

      // Update downloads count
      setGallery(prev => prev ? { ...prev, downloadsUsed: prev.downloadsUsed + 1 } : null)
    } catch {
      alert('Failed to download image. Please try again.')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent)] mx-auto mb-4"></div>
          <p className="text-[var(--secondary)]">Loading your gallery...</p>
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
            The gallery you&apos;re looking for doesn&apos;t exist or has expired.
          </p>
          <Link 
            href="/gallery/login"
            className="inline-block px-6 py-3 bg-[var(--accent)] text-[var(--background)] rounded-lg hover:bg-opacity-80 transition-colors"
          >
            Try Another Gallery
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
        <title>{gallery.title} - Gallery - Tx Media</title>
        <meta name="description" content={`Private photo gallery: ${gallery.title}`} />
      </Head>

      <div className="min-h-screen bg-[var(--background)]">
        {/* Header */}
        <header className="bg-[var(--gradient-start)] border-b border-[var(--secondary)]/20">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <Link href="/galleries" className="text-xl font-bold text-[var(--accent)] mb-2 inline-block">
                  Tx Media
                </Link>
                <h1 className="text-2xl font-bold text-[var(--foreground)]">{gallery.title}</h1>
                <p className="text-[var(--secondary)] text-sm">
                  {galleryAccess?.clientName && `Welcome, ${galleryAccess.clientName} • `}
                  {gallery.eventType} • {gallery.images.length} photos
                  {gallery.eventDate && ` • ${new Date(gallery.eventDate).toLocaleDateString()}`}
                </p>
              </div>
              <button
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    sessionStorage.removeItem('galleryAccess')
                  }
                  router.push('/gallery/login')
                }}
                className="px-4 py-2 bg-[var(--secondary)]/20 text-[var(--foreground)] rounded-lg hover:bg-[var(--secondary)]/30 transition-colors"
              >
                Logout
              </button>
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
              <button
                onClick={() => setView('favorites')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  view === 'favorites'
                    ? 'bg-[var(--accent)] text-[var(--background)]'
                    : 'bg-[var(--secondary)]/20 text-[var(--foreground)] hover:bg-[var(--secondary)]/30'
                }`}
              >
                Favorites ({gallery.images.filter(img => img.isFavorite).length})
              </button>
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
                Downloads: {gallery.downloadsUsed}/{gallery.downloadLimit}
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
              <p className="text-[var(--secondary)] text-lg mb-2">
                {view === 'favorites' ? 'No favorites selected yet.' : 'No images in this gallery.'}
              </p>
              {view === 'favorites' && (
                <p className="text-[var(--secondary)] text-sm">
                  Heart images in the grid view to add them to your favorites.
                </p>
              )}
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
                  
                  {/* Favorite indicator */}
                  {image.isFavorite && (
                    <div className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                    </div>
                  )}
                  
                  {/* Overlay with actions */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleFavorite(image.id)
                      }}
                      className={`p-2 rounded-full transition-colors ${
                        image.isFavorite
                          ? 'bg-red-500 text-white'
                          : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                      title={image.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        downloadImage(image.id, image.originalName || image.fileName)
                      }}
                      className="p-2 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors"
                      title="Download image"
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
          onToggleFavorite={toggleFavorite}
          onDownload={downloadImage}
          showActions={true}
          downloadLimit={gallery.downloadLimit}
          downloadsUsed={gallery.downloadsUsed}
        />
      </div>
    </>
  )
}