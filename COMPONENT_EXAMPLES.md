# Component Generator Examples

This file provides practical examples of using the txMedia Component Generator for various scenarios.

## Quick Start Examples

### 1. Create a Basic Button Component
```bash
npm run component:generate ui button
# Creates: src/components/Button.tsx
```

### 2. Create Admin Dashboard with Authentication
```bash
npm run component:generate admin dashboard --auth --stats
# Creates: src/pages/admin/dashboard.tsx
# Also creates: src/hooks/useAdminAuth.ts (if doesn't exist)
```

### 3. Create Client Gallery View with Password Protection
```bash
npm run component:generate gallery client-view --password
# Creates: src/pages/gallery/client-view.tsx
# Also creates: src/hooks/useGalleryAuth.ts (if doesn't exist)
```

### 4. Create Reusable Image Modal
```bash
npm run component:generate ui image-modal --reusable
# Creates: src/components/ImageModal.tsx
```

## Real-World Scenarios

### Scenario 1: Building an Admin Panel

```bash
# 1. Create admin dashboard with stats
npm run component:generate admin dashboard --auth --stats

# 2. Create gallery management page
npm run component:generate admin gallery-edit --auth

# 3. Create user management interface
npm run component:generate admin user-management --auth

# 4. Create settings page
npm run component:generate admin settings --auth
```

**Result:** Complete admin panel with:
- Authentication across all pages
- Consistent header/navigation
- Statistics dashboard
- Gallery and user management
- Settings configuration

### Scenario 2: Enhanced Client Gallery Experience

```bash
# 1. Create main gallery view
npm run component:generate gallery client-view --password

# 2. Create favorites page
npm run component:generate gallery favorites --password

# 3. Create download history
npm run component:generate gallery download-history --password

# 4. Create reusable image components
npm run component:generate ui image-grid
npm run component:generate ui image-modal --reusable
```

**Result:** Complete client experience with:
- Password-protected access
- Image viewing and favoriting
- Download tracking
- Responsive design across devices

### Scenario 3: Building a Component Library

```bash
# Create reusable UI components
npm run component:generate ui button
npm run component:generate ui modal
npm run component:generate ui form
npm run component:generate ui loading-spinner
npm run component:generate ui error-boundary
npm run component:generate ui stats-card
```

**Result:** Consistent component library with:
- Design system integration
- TypeScript support
- Accessibility features
- Touch-friendly interactions

### Scenario 4: Photography-Specific Tools

```bash
# Create gallery uploader
npm run component:generate ui gallery-uploader

# Create image processing components
npm run component:generate ui image-modal --reusable

# Create gallery management
npm run component:generate admin gallery-edit --auth

# Create client interface
npm run component:generate gallery client-view --password
```

**Result:** Photography workflow tools with:
- Drag & drop image upload
- Progress tracking
- Image viewing and management
- Client access control

## Generated Component Features

### Authentication Components (--auth flag)

Features included:
- sessionStorage authentication check
- Automatic redirect to login
- Session validation and cleanup
- Loading states during auth check
- Consistent logout functionality

Example admin component structure:
```typescript
export default function AdminComponent() {
  const [adminSession, setAdminSession] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    // Authentication logic
    const storedSession = sessionStorage.getItem('adminSession')
    if (!storedSession) {
      router.push('/admin/login')
      return
    }
    // ... validation logic
  }, [router])

  if (isLoading || !adminSession) {
    return <LoadingSpinner />
  }

  return (
    // Admin interface with logout button
    // Error handling
    // Responsive design
  )
}
```

### Password Protected Components (--password flag)

Features included:
- Gallery access token validation
- 24-hour session expiration
- Slug-specific access control
- Automatic cleanup of expired sessions

Example gallery component structure:
```typescript
export default function GalleryComponent() {
  const [galleryAccess, setGalleryAccess] = useState(null)
  
  useEffect(() => {
    const storedAccess = sessionStorage.getItem('galleryAccess')
    // Validate access token and expiration
    // Check slug match
    // Redirect if invalid
  }, [slug])

  return (
    // Protected gallery content
    // Image grid with favorites
    // Download functionality
  )
}
```

### Reusable Components (--reusable flag)

Features included:
- Configurable props interface
- Multiple variants/sizes
- Flexible styling options
- Comprehensive event handling

Example reusable component:
```typescript
interface ComponentProps {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
  onClick?: () => void
  // ... more configurable props
}

export default function Component({ 
  variant = 'primary',
  size = 'md',
  // ... with sensible defaults
}: ComponentProps) {
  // Flexible implementation
  // Multiple style variants
  // Accessibility features
}
```

### Statistics Components (--stats flag)

Features included:
- Stats card layouts
- Data fetching patterns
- Error handling for API calls
- Responsive grid layouts

Example stats integration:
```typescript
const [stats, setStats] = useState({
  totalGalleries: 0,
  activeGalleries: 0,
  totalImages: 0,
  totalDownloads: 0
})

// Automatic data fetching
// Loading states
// Error handling
// Responsive stat cards
```

## Customization Examples

### Adding Business Logic

After generating a component, customize for your needs:

```typescript
// Generated component
export default function AdminDashboard() {
  // ... generated authentication and basic structure

  // Add your custom business logic here:
  const handleExportData = async () => {
    try {
      const response = await fetch('/api/admin/export')
      const blob = await response.blob()
      // Handle file download
    } catch (error) {
      setError('Export failed')
    }
  }

  const handleBulkActions = async (galleryIds: string[]) => {
    // Implement bulk operations
  }

  // ... rest of component
}
```

### Extending UI Components

```typescript
// Extend generated button component
import BaseButton from './Button'

export default function PhotoButton({ 
  photo, 
  onPhotoAction,
  ...props 
}: PhotoButtonProps) {
  return (
    <BaseButton 
      onClick={() => onPhotoAction(photo)}
      {...props}
    >
      <CameraIcon className="w-4 h-4 mr-2" />
      {props.children}
    </BaseButton>
  )
}
```

## Best Practices

### 1. Start with Basic Components
```bash
# Start simple
npm run component:generate ui button

# Then build more complex ones
npm run component:generate admin dashboard --auth --stats
```

### 2. Use Consistent Naming
```bash
# Good: Descriptive, kebab-case
npm run component:generate ui image-upload-modal
npm run component:generate admin gallery-bulk-editor

# Avoid: Generic or confusing names
npm run component:generate ui modal
npm run component:generate admin page
```

### 3. Leverage Existing Patterns
```bash
# Follow established patterns
npm run component:generate gallery client-view --password  # Uses gallery auth
npm run component:generate admin user-edit --auth          # Uses admin auth
npm run component:generate ui data-table --reusable       # Flexible component
```

### 4. Test Generated Components
```bash
# Generate component
npm run component:generate ui stats-card

# Test immediately
npm run dev
# Visit component in browser
# Check responsive design
# Test interactions
```

## Integration with Existing Code

### Using Generated Components

```typescript
// In your pages or components
import Button from '@/components/Button'
import StatsCard from '@/components/StatsCard'
import { useAdminAuth } from '@/hooks/useAdminAuth'

export default function MyPage() {
  const { adminSession, isLoading } = useAdminAuth()

  return (
    <div>
      <StatsCard 
        title="Total Photos"
        value={1250}
        variant="accent"
      />
      
      <Button 
        variant="primary" 
        size="lg"
        onClick={handleAction}
      >
        Upload Photos
      </Button>
    </div>
  )
}
```

### API Integration

Generated components expect certain API endpoints:

```typescript
// Admin components expect:
// GET /api/admin/dashboard
// GET /api/admin/galleries
// GET /api/admin/user-management

// Gallery components expect:
// GET /api/gallery/[slug]
// POST /api/gallery/[slug]/favorite
// GET /api/gallery/[slug]/download/[imageId]

// Create these endpoints or modify component fetch URLs
```

## Troubleshooting Generated Components

### Common Issues and Solutions

1. **TypeScript Errors**
   ```bash
   # Check generated interfaces match your data
   # Update API response types
   # Add missing imports
   ```

2. **Authentication Not Working**
   ```bash
   # Verify sessionStorage in browser
   # Check API endpoints exist
   # Ensure proper redirects
   ```

3. **Styling Issues**
   ```bash
   # Confirm Tailwind CSS variables are defined
   # Check responsive breakpoints
   # Verify custom CSS classes
   ```

4. **Component Not Rendering**
   ```bash
   # Check file paths and imports
   # Verify component exports
   # Check for console errors
   ```

## Contributing New Component Types

To add new component categories or types:

1. **Study existing patterns** in the codebase
2. **Follow naming conventions** (kebab-case for files, PascalCase for components)
3. **Include proper TypeScript** interfaces and types
4. **Add comprehensive error handling** and loading states
5. **Test with various options** and edge cases
6. **Update documentation** with examples

Example new component addition:
```javascript
// In component-generator.js
generators.newCategory = {
  'new-component': (name, options) => ({
    path: path.join(config.componentsDir, `${toPascalCase(name)}.tsx`),
    content: generateNewComponent(name, options)
  })
}
```

This comprehensive component generator provides a solid foundation for rapidly building consistent, well-architected React components that perfectly match your txMedia photography portfolio design system and patterns.