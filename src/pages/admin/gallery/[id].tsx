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
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [isReordering, setIsReordering] = useState(false)
  const [draggedImageId, setDraggedImageId] = useState<string | null>(null)
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
        setSelectedImages(prev => prev.filter(id => id !== imageId))
      } else {
        setError('Failed to delete image')
      }
    } catch (error) {
      console.error('Delete error:', error)
      setError('Failed to delete image')
    }
  }

  const handleImageSelect = (imageId: string) => {
    setSelectedImages(prev => {
      if (prev.includes(imageId)) {
        return prev.filter(id => id !== imageId)
      } else {
        return [...prev, imageId]
      }
    })
  }

  const handleSelectAll = () => {
    if (selectedImages.length === gallery?.images.length) {
      setSelectedImages([])
    } else {
      setSelectedImages(gallery?.images.map(img => img.id) || [])
    }
  }

  const handleBulkOperation = async (operation: string) => {
    if (selectedImages.length === 0) return

    let confirmMessage = ''
    switch (operation) {
      case 'delete':
        confirmMessage = `Delete ${selectedImages.length} selected images?`
        break
      case 'set_public':
        confirmMessage = `Make ${selectedImages.length} images public?`
        break
      case 'set_private':
        confirmMessage = `Make ${selectedImages.length} images private?`
        break
      default:
        return
    }

    if (!confirm(confirmMessage)) return

    try {
      const response = await fetch(`/api/admin/gallery/${id}/bulk-operations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation,
          imageIds: selectedImages
        })
      })

      if (response.ok) {
        await fetchGallery()
        setSelectedImages([])
      } else {
        setError(`Failed to ${operation} images`)
      }
    } catch (error) {
      console.error('Bulk operation error:', error)
      setError(`Failed to ${operation} images`)
    }
  }

  const handleDragStart = (imageId: string) => {
    setDraggedImageId(imageId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (e: React.DragEvent, targetImageId: string) => {
    e.preventDefault()
    
    if (!draggedImageId || draggedImageId === targetImageId || !gallery) return

    const images = [...gallery.images]
    const draggedIndex = images.findIndex(img => img.id === draggedImageId)
    const targetIndex = images.findIndex(img => img.id === targetImageId)

    if (draggedIndex === -1 || targetIndex === -1) return

    // Reorder images array
    const [draggedImage] = images.splice(draggedIndex, 1)
    images.splice(targetIndex, 0, draggedImage)

    // Update order values
    const imageOrders = images.map((img, index) => ({
      imageId: img.id,
      order: index
    }))

    setIsReordering(true)

    try {
      const response = await fetch(`/api/admin/gallery/${id}/reorder-images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageOrders })
      })

      if (response.ok) {
        await fetchGallery()
      } else {
        setError('Failed to reorder images')
      }
    } catch (error) {
      console.error('Reorder error:', error)
      setError('Failed to reorder images')
    } finally {
      setIsReordering(false)
      setDraggedImageId(null)
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
                  href={`/admin/gallery/${id}/settings`}
                  className="px-4 py-2 bg-[var(--accent)] text-[var(--background)] rounded-lg hover:bg-opacity-80 transition-colors"
                >
                  Gallery Settings
                </Link>
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
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[var(--foreground)]">Gallery Images</h2>
              
              {/* Bulk Operations */}
              {gallery?.images && gallery.images.length > 0 && (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedImages.length === gallery.images.length}
                      onChange={handleSelectAll}
                      className="rounded border-[var(--secondary)]/20"
                    />
                    <span className="text-sm text-[var(--secondary)]">
                      {selectedImages.length > 0 ? `${selectedImages.length} selected` : 'Select all'}
                    </span>
                  </div>
                  
                  {selectedImages.length > 0 && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleBulkOperation('delete')}
                        className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
                      >
                        Delete ({selectedImages.length})
                      </button>
                      <button
                        onClick={() => handleBulkOperation('set_public')}
                        className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
                      >
                        Make Public
                      </button>
                      <button
                        onClick={() => handleBulkOperation('set_private')}
                        className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition-colors"
                      >
                        Make Private
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {!gallery?.images || gallery.images.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-[var(--secondary)] mb-4">No images uploaded yet</p>
                <p className="text-sm text-[var(--secondary)]">Upload some images to get started</p>
              </div>
            ) : (
              <>
                {isReordering && (
                  <div className="mb-4 p-3 bg-blue-100 border border-blue-300 rounded-lg">
                    <p className="text-blue-700 text-sm">Reordering images...</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {gallery.images
                    .sort((a, b) => a.order - b.order)
                    .map((image) => (
                    <div 
                      key={image.id} 
                      className={`relative group cursor-move ${
                        selectedImages.includes(image.id) ? 'ring-2 ring-[var(--accent)]' : ''
                      } ${draggedImageId === image.id ? 'opacity-50' : ''}`}
                      draggable={true}
                      onDragStart={() => handleDragStart(image.id)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, image.id)}
                    >
                      {/* Selection Checkbox */}
                      <div className="absolute top-2 left-2 z-10">
                        <input
                          type="checkbox"
                          checked={selectedImages.includes(image.id)}
                          onChange={() => handleImageSelect(image.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 rounded border-2 border-white bg-white/80 checked:bg-[var(--accent)] checked:border-[var(--accent)]"
                        />
                      </div>

                      {/* Visibility Indicator */}
                      <div className="absolute top-2 right-2 z-10">
                        <span className={`inline-block w-3 h-3 rounded-full ${
                          image.isPublic ? 'bg-green-500' : 'bg-gray-500'
                        }`} title={image.isPublic ? 'Public' : 'Private'}></span>
                      </div>

                      <div className="aspect-square bg-[var(--secondary)]/10 rounded-lg overflow-hidden">
                        <Image
                          src={image.thumbnailPath || image.filePath}
                          alt={image.originalName}
                          fill
                          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
                          className="object-cover"
                        />
                      </div>
                      
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                        <button
                          onClick={() => deleteImage(image.id)}
                          className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          title="Delete image"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              const response = await fetch(`/api/admin/gallery/${id}/bulk-operations`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  operation: image.isPublic ? 'set_private' : 'set_public',
                                  imageIds: [image.id]
                                })
                              })
                              if (response.ok) {
                                await fetchGallery()
                              }
                            } catch (error) {
                              console.error('Toggle visibility error:', error)
                            }
                          }}
                          className={`p-2 text-white rounded-lg transition-colors ${
                            image.isPublic ? 'bg-gray-500 hover:bg-gray-600' : 'bg-green-500 hover:bg-green-600'
                          }`}
                          title={image.isPublic ? 'Make private' : 'Make public'}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {image.isPublic ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            )}
                          </svg>
                        </button>
                      </div>
                      
                      <p className="text-xs text-[var(--secondary)] mt-2 truncate">
                        {image.originalName}
                      </p>
                      <p className="text-xs text-[var(--secondary)]/60">
                        Order: {image.order}
                      </p>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 p-3 bg-[var(--secondary)]/10 rounded-lg">
                  <p className="text-sm text-[var(--secondary)]">
                    💡 <strong>Tip:</strong> Drag images to reorder them. Use checkboxes for bulk operations.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}