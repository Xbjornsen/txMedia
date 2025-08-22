import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { PublicGallery, GalleryListResponse } from '@/types/gallery'
import GallerySkeleton from '@/components/GallerySkeleton'

export default function Galleries() {
  const [galleries, setGalleries] = useState<PublicGallery[]>([])
  const [filteredGalleries, setFilteredGalleries] = useState<PublicGallery[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEventType, setSelectedEventType] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest')

  const fetchGalleries = async () => {
    try {
      const response = await fetch('/api/galleries')
      if (!response.ok) {
        throw new Error('Failed to fetch galleries')
      }
      
      const data: GalleryListResponse = await response.json()
      setGalleries(data.galleries)
    } catch (err) {
      setError('Failed to load galleries. Please try again later.')
      console.error('Error fetching galleries:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const filterAndSortGalleries = useCallback(() => {
    let filtered = [...galleries]

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(gallery =>
        gallery.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gallery.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gallery.eventType.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by event type
    if (selectedEventType !== 'all') {
      filtered = filtered.filter(gallery => gallery.eventType === selectedEventType)
    }

    // Sort galleries
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'title':
          return a.title.localeCompare(b.title)
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

    setFilteredGalleries(filtered)
  }, [galleries, searchTerm, selectedEventType, sortBy])

  useEffect(() => {
    fetchGalleries()
  }, [])

  useEffect(() => {
    filterAndSortGalleries()
  }, [filterAndSortGalleries])

  const getEventTypeDisplayName = (eventType: string) => {
    const displayNames: Record<string, string> = {
      wedding: 'Wedding',
      portrait: 'Portrait',
      drone: 'Drone',
      business: 'Business',
      family: 'Family',
      landscape: 'Landscape',
      event: 'Event',
      other: 'Other'
    }
    return displayNames[eventType] || eventType.charAt(0).toUpperCase() + eventType.slice(1)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <>
        <Head>
          <title>Photo Galleries - Tx Media</title>
          <meta name="description" content="Browse our collection of professional photography galleries showcasing weddings, portraits, drone photography and more." />
        </Head>
        
        <div className="min-h-screen bg-[var(--background)]">
          <div className="section-container">
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent)] mx-auto mb-4"></div>
              <p className="text-[var(--secondary)]">Loading galleries...</p>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Head>
          <title>Photo Galleries - Tx Media</title>
        </Head>
        
        <div className="min-h-screen bg-[var(--background)]">
          <div className="section-container">
            <div className="text-center py-20">
              <h1 className="text-3xl font-bold text-[var(--foreground)] mb-4">Unable to Load Galleries</h1>
              <p className="text-[var(--secondary)] mb-6">{error}</p>
              <button
                onClick={() => {
                  setError('')
                  setIsLoading(true)
                  fetchGalleries()
                }}
                className="px-6 py-3 bg-[var(--accent)] text-[var(--background)] rounded-lg hover:bg-opacity-80 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </>
    )
  }

  const uniqueEventTypes = Array.from(new Set(galleries.map(g => g.eventType)))

  return (
    <>
      <Head>
        <title>Photo Galleries - Tx Media</title>
        <meta name="description" content="Browse our collection of professional photography galleries showcasing weddings, portraits, drone photography and more." />
        <meta name="keywords" content="photography, galleries, wedding photography, portrait photography, drone photography" />
      </Head>

      <div className="min-h-screen bg-[var(--background)]">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-[var(--gradient-start)] to-[var(--gradient-end)] py-20">
          <div className="section-container text-center">
            <h1 className="text-4xl md:text-6xl font-bold aerial-text mb-6">
              Photo Galleries
            </h1>
            <p className="text-xl text-[var(--secondary)] max-w-3xl mx-auto mb-8">
              Explore our collection of professional photography showcasing memorable moments, 
              stunning landscapes, and creative perspectives captured through our lens.
            </p>
            <div className="text-[var(--accent)] text-lg font-semibold">
              {galleries.length} {galleries.length === 1 ? 'Gallery' : 'Galleries'} Available
            </div>
          </div>
        </section>

        {/* Filters and Search */}
        <section className="bg-[var(--gradient-start)] border-b border-[var(--secondary)]/20">
          <div className="section-container py-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              {/* Search */}
              <div className="flex-1 max-w-md">
                <label htmlFor="search" className="sr-only">Search galleries</label>
                <div className="relative">
                  <input
                    id="search"
                    type="text"
                    placeholder="Search galleries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 pl-10 bg-[var(--secondary)]/10 border border-[var(--secondary)]/20 rounded-lg text-[var(--foreground)] placeholder-[var(--secondary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                  />
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-4">
                {/* Event Type Filter */}
                <div>
                  <label htmlFor="eventType" className="sr-only">Filter by event type</label>
                  <select
                    id="eventType"
                    value={selectedEventType}
                    onChange={(e) => setSelectedEventType(e.target.value)}
                    className="px-4 py-2 bg-[var(--secondary)]/10 border border-[var(--secondary)]/20 rounded-lg text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                  >
                    <option value="all">All Types</option>
                    {uniqueEventTypes.map(eventType => (
                      <option key={eventType} value={eventType}>
                        {getEventTypeDisplayName(eventType)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort */}
                <div>
                  <label htmlFor="sortBy" className="sr-only">Sort galleries</label>
                  <select
                    id="sortBy"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'title')}
                    className="px-4 py-2 bg-[var(--secondary)]/10 border border-[var(--secondary)]/20 rounded-lg text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="title">Alphabetical</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Galleries Grid */}
        <section className="section-container py-12">
          {isLoading ? (
            <GallerySkeleton count={8} />
          ) : filteredGalleries.length === 0 ? (
            <div className="text-center py-20">
              <svg className="w-16 h-16 text-[var(--secondary)] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">No galleries found</h3>
              <p className="text-[var(--secondary)]">
                {searchTerm || selectedEventType !== 'all' 
                  ? 'Try adjusting your search or filters.' 
                  : 'Check back soon for new galleries.'}
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-[var(--foreground)]">
                  {filteredGalleries.length} {filteredGalleries.length === 1 ? 'Gallery' : 'Galleries'}
                  {searchTerm && ` matching "${searchTerm}"`}
                  {selectedEventType !== 'all' && ` in ${getEventTypeDisplayName(selectedEventType)}`}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredGalleries.map((gallery) => (
                  <Link
                    key={gallery.id}
                    href={`/gallery/${gallery.slug}`}
                    className="group bg-[var(--gradient-start)] rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-[var(--secondary)]/10 hover:border-[var(--accent)]/30"
                  >
                    {/* Gallery Thumbnail */}
                    <div className="aspect-square bg-[var(--secondary)]/10 relative overflow-hidden">
                      {gallery.thumbnail ? (
                        <Image
                          src={gallery.thumbnail.thumbnailPath || gallery.thumbnail.filePath}
                          alt={gallery.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-16 h-16 text-[var(--secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Event type badge */}
                      <div className="absolute top-3 left-3">
                        <span className="px-3 py-1 bg-[var(--accent)] text-[var(--background)] text-sm font-medium rounded-full">
                          {getEventTypeDisplayName(gallery.eventType)}
                        </span>
                      </div>
                      
                      {/* Image count */}
                      <div className="absolute top-3 right-3">
                        <span className="px-2 py-1 bg-black/50 text-white text-sm rounded-full flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {gallery.imageCount}
                        </span>
                      </div>
                    </div>

                    {/* Gallery Info */}
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2 group-hover:text-[var(--accent)] transition-colors">
                        {gallery.title}
                      </h3>
                      
                      {gallery.description && (
                        <p className="text-[var(--secondary)] text-sm mb-3 line-clamp-2">
                          {gallery.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between text-sm text-[var(--secondary)]">
                        {gallery.eventDate && (
                          <span>{formatDate(gallery.eventDate)}</span>
                        )}
                        <span className="text-[var(--accent)] font-medium">
                          View Gallery →
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </section>

        {/* Call to Action */}
        {filteredGalleries.length > 0 && (
          <section className="bg-[var(--gradient-start)] border-t border-[var(--secondary)]/20">
            <div className="section-container py-16 text-center">
              <h2 className="text-3xl font-bold text-[var(--foreground)] mb-4">
                Ready to Create Your Own Gallery?
              </h2>
              <p className="text-[var(--secondary)] text-lg mb-8 max-w-2xl mx-auto">
                Let us capture your special moments and create a beautiful gallery 
                that you&apos;ll treasure forever.
              </p>
              <Link
                href="/contact"
                className="inline-block px-8 py-4 bg-[var(--accent)] text-[var(--background)] rounded-lg hover:bg-opacity-80 transition-colors font-semibold"
              >
                Get in Touch
              </Link>
            </div>
          </section>
        )}
      </div>
    </>
  )
}