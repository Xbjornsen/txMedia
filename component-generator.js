#!/usr/bin/env node

/**
 * txMedia React Component Generator
 * 
 * A comprehensive component generator for the txMedia photography portfolio project.
 * Generates React components following established patterns and design system.
 * 
 * Usage:
 *   node component-generator.js admin gallery-edit --auth
 *   node component-generator.js gallery client-view --password
 *   node component-generator.js ui image-modal --reusable
 *   node component-generator.js admin dashboard --stats
 * 
 * Features:
 * - Follows established Tailwind CSS custom variable patterns
 * - Implements proper authentication checks
 * - Generates TypeScript interfaces and proper typing
 * - Includes comprehensive error handling and loading states
 * - Creates responsive, accessible components
 * - Matches existing design system
 */

const fs = require('fs');
const path = require('path');

// Configuration and templates
const config = {
  srcDir: './src',
  pagesDir: './src/pages',
  componentsDir: './src/components',
  cssVariables: {
    background: 'var(--background)',
    foreground: 'var(--foreground)',
    accent: 'var(--accent)',
    secondary: 'var(--secondary)',
    secondaryAlt: 'var(--secondary-alt)',
    gradientStart: 'var(--gradient-start)',
    gradientEnd: 'var(--gradient-end)',
    neutralLight: 'var(--neutral-light)',
    warmCoral: 'var(--warm-coral)',
    mutedTeal: 'var(--muted-teal)',
  }
};

// Component templates
const templates = {
  adminAuth: `import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

export const useAdminAuth = () => {
  const router = useRouter()
  const [adminSession, setAdminSession] = useState<{user: {name: string, email: string}} | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const storedSession = sessionStorage.getItem('adminSession')
    if (!storedSession) {
      router.push('/admin/login')
      return
    }
    
    try {
      const session = JSON.parse(storedSession)
      setAdminSession(session)
    } catch (error) {
      console.error('Invalid admin session:', error)
      router.push('/admin/login')
    } finally {
      setIsLoading(false)
    }
  }, [router])

  return { adminSession, isLoading }
}`,

  galleryAuth: `import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

export const useGalleryAuth = (expectedSlug?: string) => {
  const router = useRouter()
  const [galleryAccess, setGalleryAccess] = useState<{
    slug: string
    clientName: string
    title: string
    accessTime: number
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const storedAccess = sessionStorage.getItem('galleryAccess')
    if (!storedAccess) {
      router.push('/gallery/login')
      return
    }
    
    try {
      const access = JSON.parse(storedAccess)
      
      // Check if access is valid and not expired (24 hours)
      const isExpired = Date.now() - access.accessTime > 24 * 60 * 60 * 1000
      const isWrongGallery = expectedSlug && access.slug !== expectedSlug
      
      if (isExpired || isWrongGallery) {
        sessionStorage.removeItem('galleryAccess')
        router.push('/gallery/login')
        return
      }
      
      setGalleryAccess(access)
    } catch (error) {
      console.error('Invalid gallery access:', error)
      router.push('/gallery/login')
    } finally {
      setIsLoading(false)
    }
  }, [router, expectedSlug])

  return { galleryAccess, isLoading }
}`,

  loadingSpinner: `interface LoadingSpinnerProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function LoadingSpinner({ 
  message = 'Loading...', 
  size = 'md' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12', 
    lg: 'h-16 w-16'
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
      <div className="text-center">
        <div className={\`animate-spin rounded-full border-b-2 border-[var(--accent)] mx-auto mb-4 \${sizeClasses[size]}\`}></div>
        <p className="text-[var(--secondary)]">{message}</p>
      </div>
    </div>
  )
}`,

  errorBoundary: `import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-[var(--foreground)] mb-4">
                Something went wrong
              </h1>
              <p className="text-[var(--secondary)] mb-6">
                An unexpected error occurred. Please refresh the page or try again later.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-[var(--accent)] text-[var(--background)] rounded-lg hover:bg-opacity-80 transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}`,

  button: `import { ReactNode, ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  fullWidth?: boolean
}

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isLoading = false,
  fullWidth = false,
  className = '', 
  disabled,
  ...props 
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 active:scale-95 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed'
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[36px] min-w-[36px]',
    md: 'px-4 py-3 text-base min-h-[44px] min-w-[44px]',
    lg: 'px-6 py-4 text-lg min-h-[48px] min-w-[48px]'
  }
  
  const variantClasses = {
    primary: 'bg-[var(--accent)] text-[var(--background)] hover:bg-opacity-80',
    secondary: 'bg-[var(--gradient-start)] text-[var(--foreground)] hover:bg-[var(--accent)]/20 border border-[var(--secondary)]/20',
    ghost: 'text-[var(--foreground)] hover:bg-[var(--accent)]/10',
    danger: 'bg-red-600 text-white hover:bg-red-700'
  }
  
  const widthClass = fullWidth ? 'w-full' : ''
  
  const combinedClasses = \`\${baseClasses} \${sizeClasses[size]} \${variantClasses[variant]} \${widthClass} \${className}\`
  
  return (
    <button 
      className={combinedClasses} 
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin h-4 w-4 mr-2"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
            />
          </svg>
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  )
}`,

  modal: `import { useEffect, ReactNode } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export default function Modal({ 
  isOpen, 
  onClose, 
  children, 
  title, 
  size = 'md' 
}: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className={\`bg-[var(--gradient-start)] rounded-xl border border-[var(--secondary)]/20 w-full \${sizeClasses[size]} max-h-full overflow-y-auto\`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-[var(--secondary)]/20">
            <h2 className="text-xl font-semibold text-[var(--foreground)]">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 text-[var(--secondary)] hover:text-[var(--foreground)] transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  )
}`,

  imageGrid: `import { useState } from 'react'
import Image from 'next/image'

interface ImageItem {
  id: string
  src: string
  alt: string
  title?: string
  description?: string
}

interface ImageGridProps {
  images: ImageItem[]
  onImageClick?: (image: ImageItem) => void
  columns?: {
    mobile: number
    tablet: number
    desktop: number
  }
  showOverlay?: boolean
}

export default function ImageGrid({ 
  images, 
  onImageClick, 
  columns = { mobile: 2, tablet: 3, desktop: 4 },
  showOverlay = true
}: ImageGridProps) {
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set())

  const handleImageLoad = (imageId: string) => {
    setLoadingImages(prev => {
      const newSet = new Set(prev)
      newSet.delete(imageId)
      return newSet
    })
  }

  const gridClasses = \`grid gap-4 grid-cols-\${columns.mobile} sm:grid-cols-\${columns.tablet} lg:grid-cols-\${columns.desktop}\`

  return (
    <div className={gridClasses}>
      {images.map((image) => (
        <div key={image.id} className="relative group">
          <div 
            className="aspect-square bg-gray-200 rounded-lg overflow-hidden cursor-pointer"
            onClick={() => onImageClick?.(image)}
          >
            {loadingImages.has(image.id) && (
              <div className="absolute inset-0 flex items-center justify-center bg-[var(--background)]">
                <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            <Image
              src={image.src}
              alt={image.alt}
              width={300}
              height={300}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onLoad={() => handleImageLoad(image.id)}
              onLoadStart={() => setLoadingImages(prev => new Set(prev).add(image.id))}
            />
          </div>
          
          {showOverlay && (
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
              <div className="text-white text-center p-4">
                {image.title && (
                  <h3 className="font-semibold mb-1">{image.title}</h3>
                )}
                {image.description && (
                  <p className="text-sm text-gray-300">{image.description}</p>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}`,

  form: `import { useState, FormEvent } from 'react'

interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'textarea' | 'select'
  required?: boolean
  placeholder?: string
  options?: { value: string; label: string }[]
  validation?: (value: string) => string | null
}

interface FormProps {
  fields: FormField[]
  onSubmit: (data: Record<string, string>) => Promise<void>
  submitText?: string
  isLoading?: boolean
  error?: string
  initialData?: Record<string, string>
}

export default function Form({ 
  fields, 
  onSubmit, 
  submitText = 'Submit',
  isLoading = false,
  error,
  initialData = {}
}: FormProps) {
  const [formData, setFormData] = useState<Record<string, string>>(initialData)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    fields.forEach(field => {
      const value = formData[field.name] || ''
      
      if (field.required && !value.trim()) {
        newErrors[field.name] = \`\${field.label} is required\`
      } else if (field.validation) {
        const validationError = field.validation(value)
        if (validationError) {
          newErrors[field.name] = validationError
        }
      }
    })
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    try {
      await onSubmit(formData)
    } catch (err) {
      console.error('Form submission error:', err)
    }
  }

  const renderField = (field: FormField) => {
    const value = formData[field.name] || ''
    const hasError = errors[field.name]
    
    const baseInputClasses = \`w-full px-3 py-3 bg-[var(--gradient-start)] border rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] disabled:opacity-50 \${
      hasError ? 'border-red-500' : 'border-[var(--secondary)]/20'
    }\`

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            disabled={isLoading}
            rows={4}
            className={\`\${baseInputClasses} resize-none\`}
          />
        )
      
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            required={field.required}
            disabled={isLoading}
            className={baseInputClasses}
          >
            <option value="">Select {field.label}</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )
      
      default:
        return (
          <input
            type={field.type}
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            disabled={isLoading}
            className={baseInputClasses}
          />
        )
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-300 rounded-lg p-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {fields.map(field => (
        <div key={field.name}>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {renderField(field)}
          {errors[field.name] && (
            <p className="text-red-500 text-sm mt-1">{errors[field.name]}</p>
          )}
        </div>
      ))}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 px-4 bg-[var(--accent)] text-[var(--background)] rounded-lg hover:bg-opacity-80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
              />
            </svg>
            Processing...
          </>
        ) : (
          submitText
        )}
      </button>
    </form>
  )
}`
};

// Component generators
const generators = {
  admin: {
    'dashboard': (name, options) => {
      return {
        path: path.join(config.pagesDir, 'admin', `${name}.tsx`),
        content: generateAdminDashboard(name, options)
      }
    },
    'gallery-edit': (name, options) => {
      return {
        path: path.join(config.pagesDir, 'admin', `${name}.tsx`),
        content: generateAdminGalleryEdit(name, options)
      }
    },
    'gallery-create': (name, options) => {
      return {
        path: path.join(config.pagesDir, 'admin', `${name}.tsx`),
        content: generateAdminGalleryCreate(name, options)
      }
    },
    'user-management': (name, options) => {
      return {
        path: path.join(config.pagesDir, 'admin', `${name}.tsx`),
        content: generateAdminUserManagement(name, options)
      }
    },
    'settings': (name, options) => {
      return {
        path: path.join(config.pagesDir, 'admin', `${name}.tsx`),
        content: generateAdminSettings(name, options)
      }
    }
  },
  gallery: {
    'client-view': (name, options) => {
      return {
        path: path.join(config.pagesDir, 'gallery', `${name}.tsx`),
        content: generateGalleryClientView(name, options)
      }
    },
    'favorites': (name, options) => {
      return {
        path: path.join(config.pagesDir, 'gallery', `${name}.tsx`),
        content: generateGalleryFavorites(name, options)
      }
    },
    'download-history': (name, options) => {
      return {
        path: path.join(config.pagesDir, 'gallery', `${name}.tsx`),
        content: generateGalleryDownloadHistory(name, options)
      }
    }
  },
  ui: {
    'image-modal': (name, options) => {
      return {
        path: path.join(config.componentsDir, `${toPascalCase(name)}.tsx`),
        content: generateUIImageModal(name, options)
      }
    },
    'button': (name, options) => {
      return {
        path: path.join(config.componentsDir, `${toPascalCase(name)}.tsx`),
        content: templates.button
      }
    },
    'modal': (name, options) => {
      return {
        path: path.join(config.componentsDir, `${toPascalCase(name)}.tsx`),
        content: templates.modal
      }
    },
    'form': (name, options) => {
      return {
        path: path.join(config.componentsDir, `${toPascalCase(name)}.tsx`),
        content: templates.form
      }
    },
    'loading-spinner': (name, options) => {
      return {
        path: path.join(config.componentsDir, `${toPascalCase(name)}.tsx`),
        content: templates.loadingSpinner
      }
    },
    'error-boundary': (name, options) => {
      return {
        path: path.join(config.componentsDir, `${toPascalCase(name)}.tsx`),
        content: templates.errorBoundary
      }
    },
    'image-grid': (name, options) => {
      return {
        path: path.join(config.componentsDir, `${toPascalCase(name)}.tsx`),
        content: templates.imageGrid
      }
    },
    'gallery-uploader': (name, options) => {
      return {
        path: path.join(config.componentsDir, `${toPascalCase(name)}.tsx`),
        content: generateUIGalleryUploader(name, options)
      }
    },
    'stats-card': (name, options) => {
      return {
        path: path.join(config.componentsDir, `${toPascalCase(name)}.tsx`),
        content: generateUIStatsCard(name, options)
      }
    }
  }
};

// Utility functions
function toPascalCase(str) {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

function toKebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase();
}

function ensureDirectoryExists(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Generator functions
function generateAdminDashboard(name, options) {
  const componentName = toPascalCase(name);
  const hasStats = options.includes('--stats');
  
  return `import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

interface ${componentName}Data {
  // Define your data interface here
  totalGalleries: number
  activeGalleries: number
  totalImages: number
  totalDownloads: number
}

export default function ${componentName}() {
  const router = useRouter()
  const [adminSession, setAdminSession] = useState<{user: {name: string, email: string}} | null>(null)
  const [data, setData] = useState<${componentName}Data | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

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
      
      // Fetch dashboard data
      fetchData()
    } catch (error) {
      console.error('Invalid admin session:', error)
      router.push('/admin/login')
    }
  }, [router])

  const fetchData = async () => {
    try {
      const response = await fetch('/api/admin/${toKebabCase(name)}')
      if (response.ok) {
        const result = await response.json()
        setData(result)
      } else {
        setError('Failed to load dashboard data')
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
      setError('Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
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
        <title>${componentName} - Admin - Tx Media</title>
        <meta name="description" content="Admin dashboard for ${name}" />
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
                <h1 className="text-2xl font-bold text-[var(--foreground)]">${componentName}</h1>
                <p className="text-[var(--secondary)] text-sm">
                  Welcome back, {adminSession?.user?.name}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Link
                  href="/admin/dashboard"
                  className="px-4 py-2 bg-[var(--secondary)]/20 text-[var(--foreground)] rounded-lg hover:bg-[var(--secondary)]/30 transition-colors"
                >
                  Dashboard
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
          {error && (
            <div className="mb-6 bg-red-100 border border-red-300 rounded-lg p-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          ${hasStats ? `
          {/* Stats Cards */}
          {data && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-[var(--gradient-start)] p-6 rounded-xl border border-[var(--secondary)]/20">
                <h3 className="text-sm font-medium text-[var(--secondary)] mb-2">Total Galleries</h3>
                <p className="text-3xl font-bold text-[var(--foreground)]">{data.totalGalleries}</p>
              </div>
              <div className="bg-[var(--gradient-start)] p-6 rounded-xl border border-[var(--secondary)]/20">
                <h3 className="text-sm font-medium text-[var(--secondary)] mb-2">Active Galleries</h3>
                <p className="text-3xl font-bold text-[var(--accent)]">{data.activeGalleries}</p>
              </div>
              <div className="bg-[var(--gradient-start)] p-6 rounded-xl border border-[var(--secondary)]/20">
                <h3 className="text-sm font-medium text-[var(--secondary)] mb-2">Total Images</h3>
                <p className="text-3xl font-bold text-[var(--foreground)]">{data.totalImages}</p>
              </div>
              <div className="bg-[var(--gradient-start)] p-6 rounded-xl border border-[var(--secondary)]/20">
                <h3 className="text-sm font-medium text-[var(--secondary)] mb-2">Downloads</h3>
                <p className="text-3xl font-bold text-[var(--foreground)]">{data.totalDownloads}</p>
              </div>
            </div>
          )}
          ` : ''}

          {/* Main Content */}
          <div className="bg-[var(--gradient-start)] rounded-xl border border-[var(--secondary)]/20 p-6">
            <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">${componentName} Content</h2>
            <p className="text-[var(--secondary)]">
              Add your ${name} functionality here.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}`;
}

function generateAdminGalleryEdit(name, options) {
  const componentName = toPascalCase(name);
  const hasAuth = options.includes('--auth');
  
  return `import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Image from 'next/image'

interface Gallery {
  id: string
  title: string
  slug: string
  clientName: string
  clientEmail: string
  eventType: string
  eventDate: string
  description?: string
  isActive: boolean
  downloadLimit: number
  images: GalleryImage[]
}

interface GalleryImage {
  id: string
  fileName: string
  originalName: string
  thumbnailPath: string
  filePath: string
  width: number
  height: number
}

export default function ${componentName}() {
  const router = useRouter()
  const { id } = router.query
  const [adminSession, setAdminSession] = useState<{user: {name: string, email: string}} | null>(null)
  const [gallery, setGallery] = useState<Gallery | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    ${hasAuth ? `
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
      
      if (id) {
        fetchGallery()
      }
    } catch (error) {
      console.error('Invalid admin session:', error)
      router.push('/admin/login')
    }
    ` : `
    if (id) {
      fetchGallery()
    }
    `}
  }, [router, id])

  const fetchGallery = async () => {
    try {
      const response = await fetch(\`/api/admin/galleries/\${id}\`)
      if (response.ok) {
        const galleryData = await response.json()
        setGallery(galleryData)
      } else {
        setError('Gallery not found')
      }
    } catch (error) {
      console.error('Failed to fetch gallery:', error)
      setError('Failed to load gallery')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGalleryUpdate = async (updates: Partial<Gallery>) => {
    setIsSaving(true)
    try {
      const response = await fetch(\`/api/admin/galleries/\${id}\`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      if (response.ok) {
        const updatedGallery = await response.json()
        setGallery(updatedGallery)
      } else {
        setError('Failed to update gallery')
      }
    } catch (error) {
      console.error('Failed to update gallery:', error)
      setError('Failed to update gallery')
    } finally {
      setIsSaving(false)
    }
  }

  const deleteImage = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return

    try {
      const response = await fetch(\`/api/admin/gallery/\${id}/image/\${imageId}\`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setGallery(prev => prev ? {
          ...prev,
          images: prev.images.filter(img => img.id !== imageId)
        } : null)
      } else {
        setError('Failed to delete image')
      }
    } catch (error) {
      console.error('Failed to delete image:', error)
      setError('Failed to delete image')
    }
  }

  if (isLoading ${hasAuth ? '|| !adminSession' : ''}) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent)] mx-auto mb-4"></div>
          <p className="text-[var(--secondary)]">Loading gallery...</p>
        </div>
      </div>
    )
  }

  if (error || !gallery) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--foreground)] mb-4">Gallery Not Found</h1>
          <p className="text-[var(--secondary)] mb-6">{error}</p>
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

  return (
    <>
      <Head>
        <title>Edit {gallery.title} - Admin - Tx Media</title>
        <meta name="description" content={\`Edit gallery: \${gallery.title}\`} />
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
                <h1 className="text-2xl font-bold text-[var(--foreground)]">Edit Gallery</h1>
                <p className="text-[var(--secondary)] text-sm">{gallery.title}</p>
              </div>
              <div className="flex items-center gap-4">
                <Link
                  href={\`/gallery/\${gallery.slug}\`}
                  target="_blank"
                  className="px-4 py-2 bg-[var(--secondary)]/20 text-[var(--foreground)] rounded-lg hover:bg-[var(--secondary)]/30 transition-colors"
                >
                  View Gallery
                </Link>
                <button
                  onClick={() => handleGalleryUpdate({ isActive: !gallery.isActive })}
                  disabled={isSaving}
                  className={\`px-4 py-2 rounded-lg transition-colors \${
                    gallery.isActive
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }\`}
                >
                  {gallery.isActive ? 'Active' : 'Inactive'}
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {error && (
            <div className="mb-6 bg-red-100 border border-red-300 rounded-lg p-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Gallery Info */}
          <div className="bg-[var(--gradient-start)] rounded-xl border border-[var(--secondary)]/20 p-6 mb-8">
            <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">Gallery Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-[var(--secondary)]">Client</p>
                <p className="text-[var(--foreground)]">{gallery.clientName}</p>
                <p className="text-sm text-[var(--secondary)]">{gallery.clientEmail}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--secondary)]">Event Type</p>
                <p className="text-[var(--foreground)]">{gallery.eventType}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--secondary)]">Event Date</p>
                <p className="text-[var(--foreground)]">{gallery.eventDate ? new Date(gallery.eventDate).toLocaleDateString() : 'Not set'}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--secondary)]">Images</p>
                <p className="text-[var(--foreground)]">{gallery.images.length} photos</p>
              </div>
            </div>
          </div>

          {/* Images Grid */}
          <div className="bg-[var(--gradient-start)] rounded-xl border border-[var(--secondary)]/20 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[var(--foreground)]">Gallery Images</h2>
              <Link
                href={\`/admin/gallery/\${gallery.id}/upload\`}
                className="px-4 py-2 bg-[var(--accent)] text-[var(--background)] rounded-lg hover:bg-opacity-80 transition-colors"
              >
                Upload Images
              </Link>
            </div>

            {gallery.images.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-[var(--secondary)] mb-4">No images uploaded yet</p>
                <Link
                  href={\`/admin/gallery/\${gallery.id}/upload\`}
                  className="inline-block px-6 py-3 bg-[var(--accent)] text-[var(--background)] rounded-lg hover:bg-opacity-80 transition-colors"
                >
                  Upload First Images
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {gallery.images.map((image) => (
                  <div key={image.id} className="relative group">
                    <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                      <Image
                        src={image.thumbnailPath || image.filePath}
                        alt={image.originalName}
                        width={200}
                        height={200}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Overlay with delete button */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                      <button
                        onClick={() => deleteImage(image.id)}
                        className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        title="Delete image"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}`;
}

function generateGalleryClientView(name, options) {
  const componentName = toPascalCase(name);
  const hasPassword = options.includes('--password');
  
  return `import { useState, useEffect } from 'react'
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

export default function ${componentName}() {
  const router = useRouter()
  const { slug } = router.query
  
  const [gallery, setGallery] = useState<Gallery | null>(null)
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)
  const [view, setView] = useState<'grid' | 'favorites'>('grid')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [galleryAccess, setGalleryAccess] = useState<{
    slug: string
    clientName: string
    title: string
    accessTime: number
  } | null>(null)

  useEffect(() => {
    ${hasPassword ? `
    // Check for gallery access in sessionStorage
    if (typeof window === 'undefined') return
    
    const storedAccess = sessionStorage.getItem('galleryAccess')
    if (!storedAccess) {
      router.push('/gallery/login')
      return
    }
    
    try {
      const access = JSON.parse(storedAccess)
      
      // Check if access is for current gallery and not expired (24 hours)
      if (access.slug === slug && Date.now() - access.accessTime < 24 * 60 * 60 * 1000) {
        setGalleryAccess(access)
        if (slug) {
          fetchGallery()
        }
        return
      }
    } catch (error) {
      console.error('Invalid gallery access:', error)
    }

    // No valid access, redirect to login
    if (slug) {
      router.push('/gallery/login')
    }
    ` : `
    if (slug) {
      fetchGallery()
    }
    `}
  }, [slug, router])

  const fetchGallery = async () => {
    try {
      const response = await fetch(\`/api/gallery/\${slug}\`)
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
  }

  const toggleFavorite = async (imageId: string) => {
    try {
      const response = await fetch(\`/api/gallery/\${slug}/favorite\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageId })
      })

      if (response.ok) {
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
      const response = await fetch(\`/api/gallery/\${slug}/download/\${imageId}\`)
      
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
            The gallery you're looking for doesn't exist or has expired.
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
        <meta name="description" content={\`Private photo gallery: \${gallery.title}\`} />
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
                  ${hasPassword ? `{galleryAccess?.clientName && \`Welcome, \${galleryAccess.clientName} • \`}` : ''}
                  {gallery.eventType} • {gallery.images.length} photos
                  {gallery.eventDate && \` • \${new Date(gallery.eventDate).toLocaleDateString()}\`}
                </p>
              </div>
              ${hasPassword ? `
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
              ` : ''}
            </div>
          </div>
        </header>

        {/* Navigation */}
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-2">
              <button
                onClick={() => setView('grid')}
                className={\`px-4 py-2 rounded-lg transition-colors \${
                  view === 'grid'
                    ? 'bg-[var(--accent)] text-[var(--background)]'
                    : 'bg-[var(--secondary)]/20 text-[var(--foreground)] hover:bg-[var(--secondary)]/30'
                }\`}
              >
                All Photos ({gallery.images.length})
              </button>
              <button
                onClick={() => setView('favorites')}
                className={\`px-4 py-2 rounded-lg transition-colors \${
                  view === 'favorites'
                    ? 'bg-[var(--accent)] text-[var(--background)]'
                    : 'bg-[var(--secondary)]/20 text-[var(--foreground)] hover:bg-[var(--secondary)]/30'
                }\`}
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
                      className={\`p-2 rounded-full transition-colors \${
                        image.isFavorite
                          ? 'bg-red-500 text-white'
                          : 'bg-white/20 text-white hover:bg-white/30'
                      }\`}
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
                  className={\`px-4 py-2 rounded-lg transition-colors \${
                    selectedImage.isFavorite
                      ? 'bg-red-500 text-white'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }\`}
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
}`;
}

function generateUIImageModal(name, options) {
  const componentName = toPascalCase(name);
  const isReusable = options.includes('--reusable');
  
  return `import Image from "next/image"
import { useEffect, useState } from "react"

interface ${componentName}Props {
  isOpen: boolean
  onClose: () => void
  src: string
  alt: string
  title?: string
  description?: string
  ${isReusable ? `
  width?: number
  height?: number
  showActions?: boolean
  onDownload?: () => void
  onFavorite?: () => void
  isFavorite?: boolean
  ` : ''}
}

export default function ${componentName}({ 
  isOpen, 
  onClose, 
  src, 
  alt, 
  title, 
  description,
  ${isReusable ? `
  width = 1920,
  height = 1280,
  showActions = false,
  onDownload,
  onFavorite,
  isFavorite = false
  ` : ''}
}: ${componentName}Props) {
  const [isImageLoading, setIsImageLoading] = useState(true)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
      setIsImageLoading(true) // Reset loading state when modal opens
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const handleImageLoad = () => {
    setIsImageLoading(false)
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="relative max-w-7xl max-h-full w-full h-full flex flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-white hover:text-[var(--accent)] transition-colors p-3 bg-black/50 rounded-full min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Close modal"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Image container */}
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Loading spinner */}
          {isImageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                <p className="text-white text-sm">Loading full resolution...</p>
              </div>
            </div>
          )}
          
          <Image
            src={src}
            alt={alt}
            width={${isReusable ? 'width' : '1920'}}
            height={${isReusable ? 'height' : '1280'}}
            className={\`object-contain max-w-full max-h-full transition-opacity duration-300 \${
              isImageLoading ? 'opacity-0' : 'opacity-100'
            }\`}
            sizes="100vw"
            priority
            onLoad={handleImageLoad}
          />
        </div>

        ${title || description ? `
        {/* Image info */}
        {(title || description) && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
            {title && <h3 className="text-xl font-semibold mb-2">{title}</h3>}
            {description && <p className="text-sm text-gray-300">{description}</p>}
          </div>
        )}
        ` : ''}

        ${isReusable ? `
        {/* Action buttons */}
        {showActions && (onDownload || onFavorite) && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
            {onFavorite && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onFavorite()
                }}
                className={\`px-4 py-2 rounded-lg transition-colors \${
                  isFavorite
                    ? 'bg-red-500 text-white'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }\`}
              >
                {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
              </button>
            )}
            
            {onDownload && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDownload()
                }}
                className="px-4 py-2 bg-[var(--accent)] text-[var(--background)] rounded-lg hover:bg-opacity-80 transition-colors"
              >
                Download
              </button>
            )}
          </div>
        )}
        ` : ''}

        {/* Navigation hint - desktop only */}
        <div className="absolute bottom-4 right-4 text-white/70 text-sm hidden md:block">
          Press ESC to close
        </div>
      </div>
    </div>
  )
}`;
}

function generateUIGalleryUploader(name, options) {
  const componentName = toPascalCase(name);
  
  return `import { useState, useRef, DragEvent, ChangeEvent } from 'react'

interface UploadProgress {
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'completed' | 'error'
  error?: string
}

interface ${componentName}Props {
  galleryId: string
  onUploadComplete?: (uploadedFiles: string[]) => void
  onError?: (error: string) => void
  maxFiles?: number
  maxFileSize?: number // in MB
  acceptedTypes?: string[]
}

export default function ${componentName}({ 
  galleryId,
  onUploadComplete,
  onError,
  maxFiles = 50,
  maxFileSize = 10, // 10MB default
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
}: ${componentName}Props) {
  const [uploadQueue, setUploadQueue] = useState<UploadProgress[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return \`Invalid file type. Accepted types: \${acceptedTypes.join(', ')}\`
    }
    if (file.size > maxFileSize * 1024 * 1024) {
      return \`File too large. Maximum size: \${maxFileSize}MB\`
    }
    return null
  }

  const handleFiles = (files: FileList) => {
    const validFiles: File[] = []
    const errors: string[] = []

    Array.from(files).forEach(file => {
      const error = validateFile(file)
      if (error) {
        errors.push(\`\${file.name}: \${error}\`)
      } else if (validFiles.length < maxFiles) {
        validFiles.push(file)
      } else {
        errors.push(\`\${file.name}: Maximum \${maxFiles} files allowed\`)
      }
    })

    if (errors.length > 0) {
      onError?.(errors.join('\\n'))
    }

    if (validFiles.length > 0) {
      const newUploads: UploadProgress[] = validFiles.map(file => ({
        file,
        progress: 0,
        status: 'pending'
      }))
      
      setUploadQueue(prev => [...prev, ...newUploads])
    }
  }

  const uploadFile = async (upload: UploadProgress): Promise<void> => {
    const formData = new FormData()
    formData.append('file', upload.file)
    formData.append('galleryId', galleryId)

    try {
      setUploadQueue(prev => prev.map(u => 
        u.file === upload.file ? { ...u, status: 'uploading' } : u
      ))

      const xhr = new XMLHttpRequest()
      
      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100)
            setUploadQueue(prev => prev.map(u => 
              u.file === upload.file ? { ...u, progress } : u
            ))
          }
        })

        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            setUploadQueue(prev => prev.map(u => 
              u.file === upload.file ? { ...u, status: 'completed', progress: 100 } : u
            ))
            resolve()
          } else {
            const error = 'Upload failed'
            setUploadQueue(prev => prev.map(u => 
              u.file === upload.file ? { ...u, status: 'error', error } : u
            ))
            reject(new Error(error))
          }
        })

        xhr.addEventListener('error', () => {
          const error = 'Network error'
          setUploadQueue(prev => prev.map(u => 
            u.file === upload.file ? { ...u, status: 'error', error } : u
          ))
          reject(new Error(error))
        })

        xhr.open('POST', '/api/admin/upload-images')
        xhr.send(formData)
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setUploadQueue(prev => prev.map(u => 
        u.file === upload.file ? { ...u, status: 'error', error: errorMessage } : u
      ))
      throw error
    }
  }

  const startUpload = async () => {
    if (isUploading) return

    setIsUploading(true)
    const pendingUploads = uploadQueue.filter(u => u.status === 'pending')
    const uploadedFiles: string[] = []
    
    try {
      for (const upload of pendingUploads) {
        await uploadFile(upload)
        uploadedFiles.push(upload.file.name)
      }
      
      onUploadComplete?.(uploadedFiles)
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  const removeFile = (file: File) => {
    setUploadQueue(prev => prev.filter(u => u.file !== file))
  }

  const clearCompleted = () => {
    setUploadQueue(prev => prev.filter(u => u.status !== 'completed'))
  }

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFiles(files)
    }
  }

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFiles(files)
    }
  }

  const getStatusColor = (status: UploadProgress['status']) => {
    switch (status) {
      case 'pending': return 'text-[var(--secondary)]'
      case 'uploading': return 'text-[var(--accent)]'
      case 'completed': return 'text-green-500'
      case 'error': return 'text-red-500'
      default: return 'text-[var(--secondary)]'
    }
  }

  const pendingCount = uploadQueue.filter(u => u.status === 'pending').length
  const completedCount = uploadQueue.filter(u => u.status === 'completed').length
  const errorCount = uploadQueue.filter(u => u.status === 'error').length

  return (
    <div className="bg-[var(--gradient-start)] rounded-xl border border-[var(--secondary)]/20 p-6">
      <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">Upload Images</h3>
      
      {/* Drop Zone */}
      <div
        className={\`border-2 border-dashed rounded-lg p-8 text-center transition-colors \${
          isDragging 
            ? 'border-[var(--accent)] bg-[var(--accent)]/10' 
            : 'border-[var(--secondary)]/20 hover:border-[var(--accent)]/50'
        }\`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <div className="flex flex-col items-center gap-4">
          <svg className="w-12 h-12 text-[var(--secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          
          <div>
            <p className="text-[var(--foreground)] font-medium mb-2">
              Drag and drop images here, or{' '}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-[var(--accent)] hover:underline"
              >
                browse files
              </button>
            </p>
            <p className="text-sm text-[var(--secondary)]">
              Supports: {acceptedTypes.join(', ')} • Max {maxFileSize}MB per file • Up to {maxFiles} files
            </p>
          </div>
        </div>
      </div>

      {/* Upload Queue */}
      {uploadQueue.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-[var(--foreground)]">
              Upload Queue ({uploadQueue.length} files)
            </h4>
            <div className="flex gap-2">
              {completedCount > 0 && (
                <button
                  onClick={clearCompleted}
                  className="text-sm text-[var(--secondary)] hover:text-[var(--foreground)] transition-colors"
                >
                  Clear Completed
                </button>
              )}
              {pendingCount > 0 && (
                <button
                  onClick={startUpload}
                  disabled={isUploading}
                  className="px-4 py-2 bg-[var(--accent)] text-[var(--background)] rounded-lg hover:bg-opacity-80 transition-colors disabled:opacity-50"
                >
                  {isUploading ? 'Uploading...' : \`Upload \${pendingCount} Files\`}
                </button>
              )}
            </div>
          </div>

          {/* Status Summary */}
          <div className="flex gap-4 text-sm mb-4">
            <span className="text-[var(--secondary)]">Pending: {pendingCount}</span>
            <span className="text-green-500">Completed: {completedCount}</span>
            {errorCount > 0 && <span className="text-red-500">Errors: {errorCount}</span>}
          </div>

          {/* File List */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {uploadQueue.map((upload, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-[var(--background)] rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--foreground)] truncate">
                    {upload.file.name}
                  </p>
                  <p className="text-xs text-[var(--secondary)]">
                    {(upload.file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
                
                {upload.status === 'uploading' && (
                  <div className="flex-1 max-w-32">
                    <div className="w-full bg-[var(--secondary)]/20 rounded-full h-2">
                      <div 
                        className="bg-[var(--accent)] h-2 rounded-full transition-all duration-300"
                        style={{ width: \`\${upload.progress}%\` }}
                      />
                    </div>
                    <p className="text-xs text-[var(--secondary)] mt-1">{upload.progress}%</p>
                  </div>
                )}
                
                <div className={\`text-sm font-medium \${getStatusColor(upload.status)}\`}>
                  {upload.status === 'pending' && 'Pending'}
                  {upload.status === 'uploading' && 'Uploading...'}
                  {upload.status === 'completed' && 'Complete'}
                  {upload.status === 'error' && 'Error'}
                </div>
                
                {upload.status === 'pending' && (
                  <button
                    onClick={() => removeFile(upload.file)}
                    className="p-1 text-[var(--secondary)] hover:text-red-500 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}`;
}

function generateUIStatsCard(name, options) {
  const componentName = toPascalCase(name);
  
  return `interface ${componentName}Props {
  title: string
  value: string | number
  description?: string
  icon?: React.ReactNode
  trend?: {
    value: number
    label: string
    isPositive: boolean
  }
  variant?: 'default' | 'accent' | 'success' | 'warning' | 'danger'
}

export default function ${componentName}({ 
  title, 
  value, 
  description, 
  icon, 
  trend,
  variant = 'default'
}: ${componentName}Props) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'accent':
        return {
          card: 'bg-[var(--accent)]/10 border-[var(--accent)]/20',
          value: 'text-[var(--accent)]',
          title: 'text-[var(--accent)]'
        }
      case 'success':
        return {
          card: 'bg-green-500/10 border-green-500/20',
          value: 'text-green-500',
          title: 'text-green-400'
        }
      case 'warning':
        return {
          card: 'bg-yellow-500/10 border-yellow-500/20',
          value: 'text-yellow-500',
          title: 'text-yellow-400'
        }
      case 'danger':
        return {
          card: 'bg-red-500/10 border-red-500/20',
          value: 'text-red-500',
          title: 'text-red-400'
        }
      default:
        return {
          card: 'bg-[var(--gradient-start)] border-[var(--secondary)]/20',
          value: 'text-[var(--foreground)]',
          title: 'text-[var(--secondary)]'
        }
    }
  }

  const styles = getVariantStyles()

  return (
    <div className={\`p-6 rounded-xl border \${styles.card}\`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {icon && <div className={\`\${styles.title}\`}>{icon}</div>}
            <h3 className={\`text-sm font-medium \${styles.title}\`}>{title}</h3>
          </div>
          
          <p className={\`text-3xl font-bold \${styles.value} mb-1\`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          
          {description && (
            <p className="text-sm text-[var(--secondary)]">{description}</p>
          )}
        </div>
        
        {trend && (
          <div className={\`flex items-center gap-1 text-sm \${
            trend.isPositive ? 'text-green-500' : 'text-red-500'
          }\`}>
            <svg 
              className={\`w-4 h-4 \${trend.isPositive ? '' : 'rotate-180'}\`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
            </svg>
            <span className="font-medium">
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
          </div>
        )}
      </div>
      
      {trend && (
        <p className="text-xs text-[var(--secondary)] mt-2">{trend.label}</p>
      )}
    </div>
  )
}`;
}

// Add more generator functions as needed...
function generateAdminGalleryCreate(name, options) {
  // Implementation similar to existing create-gallery.tsx but customizable
  return generateAdminDashboard(name, options); // Placeholder
}

function generateAdminUserManagement(name, options) {
  // Implementation for user management page
  return generateAdminDashboard(name, options); // Placeholder
}

function generateAdminSettings(name, options) {
  // Implementation for settings page
  return generateAdminDashboard(name, options); // Placeholder
}

function generateGalleryFavorites(name, options) {
  // Implementation for favorites page
  return generateGalleryClientView(name, options); // Placeholder
}

function generateGalleryDownloadHistory(name, options) {
  // Implementation for download history
  return generateGalleryClientView(name, options); // Placeholder
}

// Main CLI logic
function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log(`
txMedia React Component Generator

Usage:
  node component-generator.js <category> <component-name> [options]

Categories:
  admin    - Admin panel components (requires --auth)
  gallery  - Client gallery components (supports --password)
  ui       - Reusable UI components (supports --reusable)

Examples:
  node component-generator.js admin dashboard --stats
  node component-generator.js admin gallery-edit --auth
  node component-generator.js gallery client-view --password
  node component-generator.js ui image-modal --reusable
  node component-generator.js ui button
  node component-generator.js ui stats-card

Options:
  --auth      Add authentication checks (admin components)
  --password  Add password protection (gallery components)
  --reusable  Make component more flexible (ui components)
  --stats     Include stats/analytics features
  --help      Show this help message
    `);
    return;
  }

  const [category, componentName, ...options] = args;

  if (options.includes('--help')) {
    console.log('Help message would go here...');
    return;
  }

  const generator = generators[category]?.[componentName];
  if (!generator) {
    console.error(`Unknown component: ${category}/${componentName}`);
    console.log(`Available ${category} components:`, Object.keys(generators[category] || {}));
    return;
  }

  try {
    const result = generator(componentName, options);
    
    // Ensure directory exists
    ensureDirectoryExists(result.path);
    
    // Write the component file
    fs.writeFileSync(result.path, result.content);
    
    console.log(`✅ Generated ${category} component: ${result.path}`);
    console.log(`📝 Component: ${toPascalCase(componentName)}`);
    console.log(`🎨 Features: ${options.join(', ') || 'none'}`);
    
    // Generate hooks if needed
    if (options.includes('--auth') && category === 'admin') {
      const hooksDir = path.join(config.srcDir, 'hooks');
      ensureDirectoryExists(path.join(hooksDir, 'useAdminAuth.ts'));
      
      if (!fs.existsSync(path.join(hooksDir, 'useAdminAuth.ts'))) {
        fs.writeFileSync(path.join(hooksDir, 'useAdminAuth.ts'), templates.adminAuth);
        console.log(`🔐 Generated auth hook: ${path.join(hooksDir, 'useAdminAuth.ts')}`);
      }
    }
    
    if (options.includes('--password') && category === 'gallery') {
      const hooksDir = path.join(config.srcDir, 'hooks');
      ensureDirectoryExists(path.join(hooksDir, 'useGalleryAuth.ts'));
      
      if (!fs.existsSync(path.join(hooksDir, 'useGalleryAuth.ts'))) {
        fs.writeFileSync(path.join(hooksDir, 'useGalleryAuth.ts'), templates.galleryAuth);
        console.log(`🔐 Generated gallery auth hook: ${path.join(hooksDir, 'useGalleryAuth.ts')}`);
      }
    }

    // Show next steps
    console.log(`
Next steps:
1. Review the generated component at ${result.path}
2. Add any custom business logic
3. Create corresponding API endpoints if needed
4. Test the component in your application
5. Update your imports and routing as needed
    `);

  } catch (error) {
    console.error('❌ Error generating component:', error.message);
    process.exit(1);
  }
}

// Run the CLI
if (require.main === module) {
  main();
}

module.exports = {
  generators,
  templates,
  config
};