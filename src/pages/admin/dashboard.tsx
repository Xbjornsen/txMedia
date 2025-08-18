/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'

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
  const { data: session, status } = useSession()
  const router = useRouter()
  const [galleries, setGalleries] = useState<Gallery[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalGalleries: 0,
    activeGalleries: 0,
    totalImages: 0,
    totalDownloads: 0
  })

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated' || (session?.user as any)?.type !== 'admin') {
      router.push('/admin/login')
      return
    }

    fetchDashboardData()
  }, [session, status, router])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/galleries')
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

  if (status === 'loading' || isLoading) {
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
                  Welcome back, {session?.user?.name}
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
                  onClick={() => signOut({ callbackUrl: '/admin/login' })}
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
              <h2 className="text-xl font-semibold text-[var(--foreground)]">Client Galleries</h2>
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
                        Gallery
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
                          <div>
                            <div className="text-sm font-medium text-[var(--foreground)]">
                              {gallery.title}
                            </div>
                            <div className="text-sm text-[var(--secondary)]">
                              {gallery.slug}
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
      </div>
    </>
  )
}