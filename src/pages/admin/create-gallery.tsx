import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'

export default function CreateGallery() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    title: '',
    clientName: '',
    clientEmail: '',
    eventType: 'wedding',
    eventDate: '',
    description: '',
    downloadLimit: 50,
    password: '',
    expiryMonths: 12
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent)]"></div>
      </div>
    )
  }

  if (status === 'unauthenticated' || (session?.user as any)?.type !== 'admin') {
    router.push('/admin/login')
    return null
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'downloadLimit' || name === 'expiryMonths' ? parseInt(value) : value
    }))
  }

  const generateSlug = (title: string, clientName: string) => {
    const cleanTitle = title.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-')
    const cleanName = clientName.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-')
    const year = new Date().getFullYear()
    return `${cleanTitle}-${cleanName}-${year}`.substring(0, 50)
  }

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
    let password = ''
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormData(prev => ({ ...prev, password }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/admin/create-gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (response.ok) {
        router.push(`/admin/gallery/${result.gallery.id}`)
      } else {
        setError(result.message || 'Failed to create gallery')
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
        <title>Create Gallery - Admin - Tx Media</title>
        <meta name="description" content="Create a new client gallery" />
      </Head>

      <div className="min-h-screen bg-[var(--background)]">
        {/* Header */}
        <header className="bg-[var(--gradient-start)] border-b border-[var(--secondary)]/20">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <Link href="/admin/dashboard" className="text-[var(--accent)] hover:underline text-sm mb-2 inline-block">
                  ← Back to Dashboard
                </Link>
                <h1 className="text-2xl font-bold text-[var(--foreground)]">Create New Gallery</h1>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <form onSubmit={handleSubmit} className="bg-[var(--gradient-start)] rounded-xl border border-[var(--secondary)]/20 p-6">
            {error && (
              <div className="mb-6 bg-red-100 border border-red-300 rounded-lg p-4">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Gallery Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">Gallery Details</h3>
                
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Gallery Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--secondary)]/20 rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    placeholder="e.g., Smith Wedding 2024"
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
                    className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--secondary)]/20 rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  >
                    <option value="wedding">Wedding</option>
                    <option value="portrait">Portrait Session</option>
                    <option value="drone">Drone Photography</option>
                    <option value="event">Event</option>
                    <option value="commercial">Commercial</option>
                  </select>
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
                    className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--secondary)]/20 rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--secondary)]/20 rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] resize-none"
                    placeholder="Brief description of the shoot..."
                  />
                </div>
              </div>

              {/* Client Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">Client Details</h3>
                
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    name="clientName"
                    value={formData.clientName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--secondary)]/20 rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    placeholder="John & Sarah Smith"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Client Email *
                  </label>
                  <input
                    type="email"
                    name="clientEmail"
                    value={formData.clientEmail}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--secondary)]/20 rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    placeholder="client@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Gallery Password *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="flex-1 px-3 py-2 bg-[var(--background)] border border-[var(--secondary)]/20 rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      onClick={generatePassword}
                      className="px-4 py-2 bg-[var(--secondary)]/20 text-[var(--foreground)] rounded-lg hover:bg-[var(--secondary)]/30 transition-colors"
                    >
                      Generate
                    </button>
                  </div>
                </div>

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
                    max="500"
                    className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--secondary)]/20 rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Gallery Expires (Months)
                  </label>
                  <input
                    type="number"
                    name="expiryMonths"
                    value={formData.expiryMonths}
                    onChange={handleInputChange}
                    min="1"
                    max="24"
                    className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--secondary)]/20 rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  />
                </div>
              </div>
            </div>

            {/* Preview */}
            {formData.title && formData.clientName && (
              <div className="mt-6 p-4 bg-[var(--background)] rounded-lg border border-[var(--secondary)]/20">
                <h4 className="text-sm font-medium text-[var(--foreground)] mb-2">Gallery Preview:</h4>
                <p className="text-sm text-[var(--secondary)]">
                  <strong>URL:</strong> /gallery/{generateSlug(formData.title, formData.clientName)}
                </p>
                <p className="text-sm text-[var(--secondary)]">
                  <strong>Password:</strong> {formData.password || '(not set)'}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <div className="mt-8 flex justify-end gap-4">
              <Link
                href="/admin/dashboard"
                className="px-6 py-2 bg-[var(--secondary)]/20 text-[var(--foreground)] rounded-lg hover:bg-[var(--secondary)]/30 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isLoading || !formData.title || !formData.clientName || !formData.clientEmail || !formData.password}
                className="px-6 py-2 bg-[var(--accent)] text-[var(--background)] rounded-lg hover:bg-opacity-80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  'Create Gallery'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}