import { useState, useEffect, useCallback } from 'react'
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
  eventDate: string | null
  description: string | null
  downloadLimit: number
  isActive: boolean
  expiryDate: string | null
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

export default function GallerySettings() {
  const router = useRouter()
  const { id } = router.query
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  
  const [gallery, setGallery] = useState<Gallery | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    clientName: '',
    clientEmail: '',
    eventType: '',
    eventDate: '',
    downloadLimit: 50,
    isActive: true,
    expiryDate: ''
  })

  const fetchGallery = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/gallery/${id}`)
      if (response.ok) {
        const data = await response.json()
        setGallery(data.gallery)
        
        // Update form data
        setFormData({
          title: data.gallery.title || '',
          description: data.gallery.description || '',
          clientName: data.gallery.clientName || '',
          clientEmail: data.gallery.clientEmail || '',
          eventType: data.gallery.eventType || '',
          eventDate: data.gallery.eventDate ? data.gallery.eventDate.split('T')[0] : '',
          downloadLimit: data.gallery.downloadLimit || 50,
          isActive: data.gallery.isActive,
          expiryDate: data.gallery.expiryDate ? data.gallery.expiryDate.split('T')[0] : ''
        })
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? parseInt(value) || 0 : 
              value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`/api/admin/gallery/${id}/update-settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setSuccess('Gallery settings updated successfully!')
        await fetchGallery()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        const result = await response.json()
        setError(result.message || 'Failed to update gallery settings')
      }
    } catch (error) {
      console.error('Update error:', error)
      setError('Failed to update gallery settings')
    } finally {
      setIsSaving(false)
    }
  }

  if (isAuthLoading || isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent)] mx-auto mb-4"></div>
          <p className="text-[var(--secondary)]">Loading settings...</p>
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
        <title>Gallery Settings - {gallery?.title} - Admin - Tx Media</title>
        <meta name="description" content="Edit gallery settings and configuration" />
      </Head>

      <div className="min-h-screen bg-[var(--background)]">
        {/* Header */}
        <header className="bg-[var(--gradient-start)] border-b border-[var(--secondary)]/20">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <Link href={`/admin/gallery/${id}`} className="text-[var(--accent)] hover:underline text-sm mb-2 inline-block">
                  ← Back to Gallery
                </Link>
                <h1 className="text-2xl font-bold text-[var(--foreground)]">
                  Gallery Settings
                </h1>
                <p className="text-[var(--secondary)] text-sm">
                  {gallery?.title}
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Status Messages */}
            {error && (
              <div className="bg-red-100 border border-red-300 rounded-lg p-4">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-100 border border-green-300 rounded-lg p-4">
                <p className="text-green-700 text-sm">{success}</p>
              </div>
            )}

            {/* Basic Information */}
            <div className="bg-[var(--gradient-start)] rounded-xl border border-[var(--secondary)]/20 p-6">
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-6">Basic Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Gallery Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-3 bg-[var(--background)] border border-[var(--secondary)]/20 rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Event Type
                  </label>
                  <select
                    name="eventType"
                    value={formData.eventType}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-3 bg-[var(--background)] border border-[var(--secondary)]/20 rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  >
                    <option value="">Select event type</option>
                    <option value="wedding">Wedding</option>
                    <option value="engagement">Engagement</option>
                    <option value="portrait">Portrait</option>
                    <option value="corporate">Corporate</option>
                    <option value="event">Event</option>
                    <option value="family">Family</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-3 bg-[var(--background)] border border-[var(--secondary)]/20 rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    placeholder="Optional description for the gallery"
                  />
                </div>
              </div>
            </div>

            {/* Client Information */}
            <div className="bg-[var(--gradient-start)] rounded-xl border border-[var(--secondary)]/20 p-6">
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-6">Client Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Client Name
                  </label>
                  <input
                    type="text"
                    name="clientName"
                    value={formData.clientName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-3 bg-[var(--background)] border border-[var(--secondary)]/20 rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Client Email
                  </label>
                  <input
                    type="email"
                    name="clientEmail"
                    value={formData.clientEmail}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-3 bg-[var(--background)] border border-[var(--secondary)]/20 rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Event Date
                  </label>
                  <input
                    type="date"
                    name="eventDate"
                    value={formData.eventDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-3 bg-[var(--background)] border border-[var(--secondary)]/20 rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-3 bg-[var(--background)] border border-[var(--secondary)]/20 rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  />
                </div>
              </div>
            </div>

            {/* Gallery Settings */}
            <div className="bg-[var(--gradient-start)] rounded-xl border border-[var(--secondary)]/20 p-6">
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-6">Gallery Settings</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Download Limit
                  </label>
                  <input
                    type="number"
                    name="downloadLimit"
                    value={formData.downloadLimit}
                    onChange={handleInputChange}
                    min="1"
                    max="1000"
                    className="w-full px-3 py-3 bg-[var(--background)] border border-[var(--secondary)]/20 rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  />
                </div>

                <div className="flex items-center pt-8">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded border-[var(--secondary)]/20 text-[var(--accent)] focus:ring-[var(--accent)]"
                  />
                  <label className="ml-2 text-sm font-medium text-[var(--foreground)]">
                    Gallery is active (clients can access)
                  </label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-3 bg-[var(--accent)] text-[var(--background)] rounded-lg hover:bg-opacity-80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isSaving ? 'Saving...' : 'Save Settings'}
              </button>
              
              <Link
                href={`/admin/gallery/${id}`}
                className="px-6 py-3 bg-[var(--secondary)]/20 text-[var(--foreground)] rounded-lg hover:bg-[var(--secondary)]/30 transition-colors font-medium"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}