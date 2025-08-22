/* eslint-disable @typescript-eslint/no-explicit-any */
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

interface Gallery {
  id: string
  title: string
  slug: string
  clientName: string
  clientEmail: string
  eventType: string
  eventDate: string
  isActive: boolean
  downloadLimit: number
  imageCount: number
  downloadCount: number
  createdAt: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const [adminSession, setAdminSession] = useState<any>(null)
  const [galleries, setGalleries] = useState<Gallery[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedGalleries, setSelectedGalleries] = useState<string[]>([])
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [galleryToDelete, setGalleryToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [stats, setStats] = useState({
    totalGalleries: 0,
    activeGalleries: 0,
    totalImages: 0,
    totalDownloads: 0
  })

  useEffect(() => {
    // Check for admin session in sessionStorage
    if (typeof window === 'undefined') return
    
    const storedSession = sessionStorage.getItem('adminSession')
    if (!storedSession) {
      router.push('/admin/login')
      return
    }
    
    try {
      const session = JSON.parse(storedSession)
      setAdminSession(session)
      
      // Fetch dashboard data inline
      const fetchData = async () => {
        try {
          const response = await fetch('/api/admin/galleries-simple')
          if (response.ok) {
            const data = await response.json()
            setGalleries(data.galleries)
            setStats(data.stats)
          }
        } catch (error) {
          console.error('Failed to fetch dashboard data:', error)
        } finally {
          setIsLoading(false)
        }
      }
      
      fetchData()
    } catch (error) {
      console.error('Invalid admin session:', error)
      router.push('/admin/login')
    }
  }, [router])

  const toggleGalleryStatus = async (galleryId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/galleries/${galleryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive })
      })

      if (response.ok) {
        setGalleries(prev => prev.map(gallery => 
          gallery.id === galleryId 
            ? { ...gallery, isActive: !isActive }
            : gallery
        ))
      }
    } catch (error) {
      console.error('Failed to toggle gallery status:', error)
    }
  }

  const deleteGallery = async (galleryId: string) => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/admin/gallery/${galleryId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setGalleries(prev => prev.filter(gallery => gallery.id !== galleryId))
        setShowDeleteModal(false)
        setGalleryToDelete(null)
        
        // Update stats
        setStats(prev => ({
          ...prev,
          totalGalleries: prev.totalGalleries - 1,
          activeGalleries: prev.activeGalleries - (galleries.find(g => g.id === galleryId)?.isActive ? 1 : 0)
        }))
      } else {
        console.error('Failed to delete gallery')
      }
    } catch (error) {
      console.error('Failed to delete gallery:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const bulkDeleteGalleries = async () => {
    setIsDeleting(true)
    try {
      const deletePromises = selectedGalleries.map(galleryId =>
        fetch(`/api/admin/gallery/${galleryId}`, { method: 'DELETE' })
      )
      
      const results = await Promise.all(deletePromises)
      const successfulDeletes = results.filter(result => result.ok).length
      
      if (successfulDeletes > 0) {
        setGalleries(prev => prev.filter(gallery => !selectedGalleries.includes(gallery.id)))
        setSelectedGalleries([])
        
        // Update stats
        setStats(prev => ({
          ...prev,
          totalGalleries: prev.totalGalleries - successfulDeletes,
          activeGalleries: prev.activeGalleries - selectedGalleries.filter(id => 
            galleries.find(g => g.id === id)?.isActive
          ).length
        }))
      }
    } catch (error) {
      console.error('Failed to bulk delete galleries:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const toggleSelectGallery = (galleryId: string) => {
    setSelectedGalleries(prev => 
      prev.includes(galleryId)
        ? prev.filter(id => id !== galleryId)
        : [...prev, galleryId]
    )
  }

  const selectAllGalleries = () => {
    setSelectedGalleries(galleries.map(g => g.id))
  }

  const clearSelection = () => {
    setSelectedGalleries([])
  }

  if (isLoading || !adminSession) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent)] mx-auto mb-4"></div>
          <p className="text-[var(--secondary)]">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Admin Dashboard - Tx Media</title>
        <meta name="description" content="Manage client galleries and uploads" />
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
                <h1 className="text-2xl font-bold text-[var(--foreground)]">Admin Dashboard</h1>
                <p className="text-[var(--secondary)] text-sm">
                  Welcome back, {adminSession?.user?.name}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Link
                  href="/admin/create-gallery"
                  className="px-4 py-2 bg-[var(--accent)] text-[var(--background)] rounded-lg hover:bg-opacity-80 transition-colors"
                >
                  New Gallery
                </Link>
                <button
                  onClick={() => {
                    sessionStorage.removeItem('adminSession')
                    router.push('/admin/login')
                  }}
                  className="px-4 py-2 bg-[var(--secondary)]/20 text-[var(--foreground)] rounded-lg hover:bg-[var(--secondary)]/30 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-[var(--gradient-start)] p-6 rounded-xl border border-[var(--secondary)]/20">
              <h3 className="text-sm font-medium text-[var(--secondary)] mb-2">Total Galleries</h3>
              <p className="text-3xl font-bold text-[var(--foreground)]">{stats.totalGalleries}</p>
            </div>
            <div className="bg-[var(--gradient-start)] p-6 rounded-xl border border-[var(--secondary)]/20">
              <h3 className="text-sm font-medium text-[var(--secondary)] mb-2">Active Galleries</h3>
              <p className="text-3xl font-bold text-[var(--accent)]">{stats.activeGalleries}</p>
            </div>
            <div className="bg-[var(--gradient-start)] p-6 rounded-xl border border-[var(--secondary)]/20">
              <h3 className="text-sm font-medium text-[var(--secondary)] mb-2">Total Images</h3>
              <p className="text-3xl font-bold text-[var(--foreground)]">{stats.totalImages}</p>
            </div>
            <div className="bg-[var(--gradient-start)] p-6 rounded-xl border border-[var(--secondary)]/20">
              <h3 className="text-sm font-medium text-[var(--secondary)] mb-2">Downloads</h3>
              <p className="text-3xl font-bold text-[var(--foreground)]">{stats.totalDownloads}</p>
            </div>
          </div>

          {/* Galleries List */}
          <div className="bg-[var(--gradient-start)] rounded-xl border border-[var(--secondary)]/20 overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--secondary)]/20">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-[var(--foreground)]">Client Galleries</h2>
                
                {selectedGalleries.length > 0 && (
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-[var(--secondary)]">
                      {selectedGalleries.length} selected
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={clearSelection}
                        className="px-3 py-1 text-sm bg-[var(--secondary)]/20 text-[var(--foreground)] rounded hover:bg-[var(--secondary)]/30 transition-colors"
                      >
                        Clear
                      </button>
                      <button
                        onClick={() => setShowDeleteModal(true)}
                        disabled={isDeleting}
                        className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors disabled:opacity-50"
                      >
                        {isDeleting ? 'Deleting...' : 'Delete Selected'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {galleries.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-[var(--secondary)] mb-4">No galleries created yet</p>
                <Link
                  href="/admin/create-gallery"
                  className="inline-block px-6 py-3 bg-[var(--accent)] text-[var(--background)] rounded-lg hover:bg-opacity-80 transition-colors"
                >
                  Create Your First Gallery
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[var(--secondary)]/10">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[var(--secondary)] uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedGalleries.length === galleries.length && galleries.length > 0}
                            onChange={(e) => e.target.checked ? selectAllGalleries() : clearSelection()}
                            className="rounded border-[var(--secondary)] text-[var(--accent)] focus:ring-[var(--accent)]"
                          />
                          <span>Gallery</span>
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[var(--secondary)] uppercase tracking-wider">
                        Client
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[var(--secondary)] uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[var(--secondary)] uppercase tracking-wider">
                        Images
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[var(--secondary)] uppercase tracking-wider">
                        Downloads
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[var(--secondary)] uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[var(--secondary)] uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--secondary)]/20">
                    {galleries.map((gallery) => (
                      <tr key={gallery.id} className="hover:bg-[var(--secondary)]/10">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={selectedGalleries.includes(gallery.id)}
                              onChange={() => toggleSelectGallery(gallery.id)}
                              className="rounded border-[var(--secondary)] text-[var(--accent)] focus:ring-[var(--accent)]"
                            />
                            <div>
                              <div className="text-sm font-medium text-[var(--foreground)]">
                                {gallery.title}
                              </div>
                              <div className="text-sm text-[var(--secondary)]">
                                {gallery.slug}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-[var(--foreground)]">
                              {gallery.clientName}
                            </div>
                            <div className="text-sm text-[var(--secondary)]">
                              {gallery.clientEmail}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-[var(--foreground)]">
                          {gallery.eventType}
                        </td>
                        <td className="px-6 py-4 text-sm text-[var(--foreground)]">
                          {gallery.imageCount}
                        </td>
                        <td className="px-6 py-4 text-sm text-[var(--foreground)]">
                          {gallery.downloadCount}/{gallery.downloadLimit}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            gallery.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {gallery.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/admin/gallery/${gallery.id}`}
                              className="text-[var(--accent)] hover:underline"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => toggleGalleryStatus(gallery.id, gallery.isActive)}
                              className="text-[var(--secondary)] hover:text-[var(--foreground)] transition-colors"
                            >
                              {gallery.isActive ? 'Disable' : 'Enable'}
                            </button>
                            <Link
                              href={`/gallery/${gallery.slug}`}
                              target="_blank"
                              className="text-[var(--secondary)] hover:text-[var(--foreground)] transition-colors"
                            >
                              View
                            </Link>
                            <button
                              onClick={() => {
                                setGalleryToDelete(gallery.id)
                                setShowDeleteModal(true)
                              }}
                              className="text-red-500 hover:text-red-700 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-[var(--background)] rounded-xl max-w-md w-full p-6 border border-[var(--secondary)]/20">
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
                {galleryToDelete ? 'Delete Gallery' : 'Delete Selected Galleries'}
              </h3>
              
              <p className="text-[var(--secondary)] mb-6">
                {galleryToDelete 
                  ? 'Are you sure you want to delete this gallery? This action cannot be undone and will permanently remove all images and data associated with this gallery.'
                  : `Are you sure you want to delete ${selectedGalleries.length} selected galleries? This action cannot be undone and will permanently remove all images and data associated with these galleries.`
                }
              </p>

              <div className="flex items-center gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowDeleteModal(false)
                    setGalleryToDelete(null)
                  }}
                  className="px-4 py-2 bg-[var(--secondary)]/20 text-[var(--foreground)] rounded-lg hover:bg-[var(--secondary)]/30 transition-colors"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={galleryToDelete ? () => deleteGallery(galleryToDelete) : bulkDeleteGalleries}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}