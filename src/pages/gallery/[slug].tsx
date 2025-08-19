import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'

interface GalleryImage {
  id: string
  fileName: string
  originalName: string
  thumbnailPath: string
  filePath: string
  width: number
  height: number
  isFavorite?: boolean
}

interface Gallery {
  id: string
  title: string
  description?: string
  clientName: string
  eventDate?: string
  eventType: string
  downloadLimit: number
  images: GalleryImage[]
  downloadsUsed: number
}

export default function GalleryView() {
  const router = useRouter()
  const { slug } = router.query
  
  const [gallery, setGallery] = useState<Gallery | null>(null)
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)
  const [view, setView] = useState<'grid' | 'favorites'>('grid')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [galleryAccess, setGalleryAccess] = useState<any>(null)

  const fetchGallery = useCallback(async () => {
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
    
    // Check for gallery access in sessionStorage
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

  if (status === 'loading' || isLoading) {
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
                <Link href="/" className="text-xl font-bold text-[var(--accent)] mb-2 inline-block">
                  Tx Media
                </Link>
                <h1 className="text-2xl font-bold text-[var(--foreground)]">{gallery.title}</h1>
                <p className="text-[var(--secondary)] text-sm">
                  {gallery.eventType} • {gallery.images.length} photos
                  {gallery.eventDate && ` • ${new Date(gallery.eventDate).toLocaleDateString()}`}
                </p>
              </div>
              <button
                onClick={() => {
                  sessionStorage.removeItem('galleryAccess')
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
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-2">
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

            <div className="text-sm text-[var(--secondary)]">
              Downloads: {gallery.downloadsUsed}/{gallery.downloadLimit}
            </div>
          </div>

          {/* Image Grid */}
          {filteredImages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[var(--secondary)]">
                {view === 'favorites' ? 'No favorites selected yet.' : 'No images in this gallery.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredImages.map((image) => (
                <div key={image.id} className="relative group">
                  <div 
                    className="aspect-square bg-gray-200 rounded-lg overflow-hidden cursor-pointer"
                    onClick={() => setSelectedImage(image)}
                  >
                    <Image
                      src={image.thumbnailPath || image.filePath}
                      alt={image.originalName}
                      width={300}
                      height={300}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  
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
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        downloadImage(image.id, image.originalName)
                      }}
                      className="p-2 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors"
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

        {/* Image Modal */}
        {selectedImage && (
          <div 
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative max-w-6xl max-h-full">
              <Image
                src={selectedImage.filePath}
                alt={selectedImage.originalName}
                width={selectedImage.width}
                height={selectedImage.height}
                className="max-w-full max-h-full object-contain"
                onClick={(e) => e.stopPropagation()}
              />
              
              {/* Close button */}
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Action buttons */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleFavorite(selectedImage.id)
                  }}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedImage.isFavorite
                      ? 'bg-red-500 text-white'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  {selectedImage.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    downloadImage(selectedImage.id, selectedImage.originalName)
                  }}
                  className="px-4 py-2 bg-[var(--accent)] text-[var(--background)] rounded-lg hover:bg-opacity-80 transition-colors"
                >
                  Download
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}