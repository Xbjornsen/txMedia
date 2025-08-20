# txMedia React Component Generator

A comprehensive component generator for the txMedia photography portfolio project that creates React components following established patterns, design system, and architectural conventions.

## Features

- 🎨 **Design System Consistency**: Automatically uses established Tailwind CSS custom variables
- 🔐 **Authentication Patterns**: Built-in admin and gallery authentication patterns
- 📱 **Responsive Design**: Mobile-first approach matching existing components
- 🛡️ **TypeScript Support**: Generates proper interfaces and type safety
- ⚡ **Performance Optimized**: Includes loading states, error boundaries, and Next.js optimizations
- 📸 **Photography Focused**: Specialized components for gallery management and client access
- 🧩 **Modular Architecture**: Reusable components following established patterns

## Installation & Setup

The generator is ready to use - simply run it from your project root:

```bash
node component-generator.js <category> <component-name> [options]
```

## Categories

### 1. Admin Components (`admin`)
Components for admin panel functionality with built-in authentication.

**Available Components:**
- `dashboard` - Admin dashboard with stats and overview
- `gallery-edit` - Gallery management and editing interface
- `gallery-create` - New gallery creation form
- `user-management` - User administration interface
- `settings` - Admin settings and configuration

**Common Options:**
- `--auth` - Add sessionStorage authentication checks
- `--stats` - Include statistics and analytics features

### 2. Gallery Components (`gallery`)
Client-facing gallery components with password protection.

**Available Components:**
- `client-view` - Main gallery viewing interface for clients
- `favorites` - Client favorites management
- `download-history` - Download tracking and history

**Common Options:**
- `--password` - Add gallery password protection
- `--auth` - Add authentication flow

### 3. UI Components (`ui`)
Reusable UI components following the design system.

**Available Components:**
- `button` - Touch-friendly button with variants
- `modal` - Accessible modal component
- `form` - Dynamic form builder
- `loading-spinner` - Loading states
- `error-boundary` - Error handling
- `image-grid` - Responsive image grid
- `image-modal` - Full-screen image viewer
- `gallery-uploader` - Drag & drop image uploader
- `stats-card` - Statistics display card

**Common Options:**
- `--reusable` - Make component more flexible and configurable

## Usage Examples

### Admin Components

```bash
# Create admin dashboard with statistics
node component-generator.js admin dashboard --auth --stats

# Create gallery editing interface
node component-generator.js admin gallery-edit --auth

# Create user management page
node component-generator.js admin user-management --auth
```

### Gallery Components

```bash
# Create client gallery view with password protection
node component-generator.js gallery client-view --password

# Create favorites management
node component-generator.js gallery favorites --password

# Create download history page
node component-generator.js gallery download-history --password
```

### UI Components

```bash
# Create reusable image modal
node component-generator.js ui image-modal --reusable

# Create basic button component
node component-generator.js ui button

# Create gallery uploader
node component-generator.js ui gallery-uploader

# Create statistics card
node component-generator.js ui stats-card
```

## Generated Component Structure

### Admin Components
```typescript
// Generated with --auth flag
import { useAdminAuth } from '@/hooks/useAdminAuth'

export default function AdminComponent() {
  const { adminSession, isLoading } = useAdminAuth()
  
  // Authentication check and loading state
  if (isLoading || !adminSession) {
    return <LoadingSpinner />
  }
  
  // Component JSX with:
  // - Consistent header with logout
  // - Error handling
  // - Responsive layout
  // - Custom CSS variables
}
```

### Gallery Components
```typescript
// Generated with --password flag
import { useGalleryAuth } from '@/hooks/useGalleryAuth'

export default function GalleryComponent() {
  const { galleryAccess, isLoading } = useGalleryAuth(slug)
  
  // Password protection and session management
  // Image grid with favorites and download functionality
  // Mobile-responsive design
}
```

### UI Components
```typescript
// Fully typed with comprehensive props
interface ComponentProps {
  // TypeScript interfaces
  // Proper event handlers
  // Accessibility attributes
}

export default function UIComponent(props: ComponentProps) {
  // Reusable, configurable component
  // Follows design system
  // Includes error states and loading
}
```

## Design System Integration

All generated components automatically include:

### CSS Variables
```css
--background: #1a2633
--foreground: #e0e7ff
--accent: #00d4ff
--secondary: #7e91ad
--secondary-alt: #f28c38
--gradient-start: #1a2633
--gradient-end: #2d4059
```

### Component Patterns
- Loading spinners with consistent styling
- Error boundaries and error states
- Responsive layouts (mobile-first)
- Touch-friendly button sizes (min 44px)
- Accessible focus states and ARIA labels
- Consistent spacing and typography

### Authentication Patterns
- sessionStorage for admin authentication
- Gallery access tokens with expiration
- Automatic redirects to login pages
- Session validation and cleanup

## File Structure

Generated components are placed in appropriate directories:

```
src/
├── pages/
│   ├── admin/           # Admin components
│   └── gallery/         # Gallery components
├── components/          # UI components
└── hooks/              # Generated auth hooks
    ├── useAdminAuth.ts
    └── useGalleryAuth.ts
```

## Customization

### Adding New Component Types

1. Add to the `generators` object in `component-generator.js`:
```javascript
generators.newCategory = {
  'component-name': (name, options) => ({
    path: path.join(config.pagesDir, 'newCategory', `${name}.tsx`),
    content: generateNewComponent(name, options)
  })
}
```

2. Create the generator function:
```javascript
function generateNewComponent(name, options) {
  const componentName = toPascalCase(name)
  // Return component template string
}
```

### Modifying Templates

Edit the `templates` object to modify base templates:
```javascript
templates.newTemplate = `
// Your template content here
// Use ${componentName} for dynamic naming
// Include proper TypeScript interfaces
`
```

## Best Practices

### Generated Component Guidelines
1. **Always review** generated components before use
2. **Add business logic** specific to your use case
3. **Test thoroughly** with your existing codebase
4. **Update imports** and routing as needed
5. **Follow established patterns** when customizing

### Authentication Security
- Admin authentication uses sessionStorage (not persistent)
- Gallery access includes 24-hour expiration
- Always validate on the server side
- Implement proper CSRF protection

### Performance Considerations
- Generated components include Next.js Image optimization
- Loading states prevent layout shift
- Error boundaries protect the application
- Responsive images with proper sizing

## Troubleshooting

### Common Issues

**Component not generating:**
- Check category and component name spelling
- Ensure you're in the project root directory
- Verify Node.js is installed

**TypeScript errors:**
- Run `npm run lint` to check for issues
- Ensure all imports are correct
- Check that interfaces match your data structures

**Authentication not working:**
- Verify API endpoints exist
- Check sessionStorage in browser dev tools
- Ensure proper redirects are configured

**Styling issues:**
- Confirm Tailwind CSS is properly configured
- Check that CSS variables are defined
- Verify responsive breakpoints

### Getting Help

1. Check the generated component comments
2. Review existing similar components
3. Refer to the main project documentation
4. Test with a minimal example first

## Contributing

To add new components or improve existing ones:

1. Study existing component patterns
2. Follow the established naming conventions
3. Include proper TypeScript interfaces
4. Add comprehensive error handling
5. Test with various options and edge cases
6. Update this documentation

## License

This component generator is part of the txMedia project and follows the same license terms.