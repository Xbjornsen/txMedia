// Public gallery types for frontend consumption

export interface GalleryImage {
  id: string
  fileName: string
  originalName?: string
  thumbnailPath: string
  filePath: string
  width: number
  height: number
  isFavorite?: boolean
  order?: number
}

export interface GalleryThumbnail {
  id: string
  fileName: string
  thumbnailPath: string
  filePath: string
  width: number
  height: number
}

export interface PublicGallery {
  id: string
  title: string
  description?: string
  slug: string
  eventType: string
  eventDate?: string
  imageCount: number
  thumbnail?: GalleryThumbnail | null
  createdAt: string
}

export interface Gallery {
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

export interface GalleryListResponse {
  galleries: PublicGallery[]
  total: number
}

export interface GalleryResponse {
  gallery: Gallery
}

// Loading and error states
export interface GalleryState {
  galleries: PublicGallery[]
  selectedGallery: Gallery | null
  isLoading: boolean
  error: string | null
}

// Event types enum for better type safety
export enum EventType {
  WEDDING = 'wedding',
  PORTRAIT = 'portrait',
  DRONE = 'drone',
  BUSINESS = 'business',
  FAMILY = 'family',
  LANDSCAPE = 'landscape',
  EVENT = 'event',
  OTHER = 'other'
}

// Gallery filter options
export interface GalleryFilters {
  eventType?: EventType | string
  sortBy?: 'newest' | 'oldest' | 'title'
  search?: string
}