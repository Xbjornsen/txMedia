# Code Review Guide for txMedia

This document explains how to use the automated code reviewer agent for the txMedia photography portfolio project.

## Quick Start

```bash
# Review a specific file
npm run review src/pages/api/admin/galleries.ts

# Review with detailed output
npm run review:verbose src/pages/api/admin/galleries.ts

# Review all files in src/
npm run review:all

# Review all API routes
npm run review:api

# Review all components
npm run review:components

# Or use directly
node review-code.js src/pages/api/admin/galleries.ts --verbose
node review-multiple.js src/pages/api/ --summary-only
```

## What the Code Reviewer Checks

### 1. Code Quality
- TypeScript compilation errors
- ESLint violations
- Proper type annotations
- Import/export patterns

### 2. Security
- SQL injection vulnerabilities
- XSS vulnerabilities
- Hardcoded secrets and credentials
- Missing authentication checks
- Proper password hashing

### 3. React Patterns
- Proper React imports
- Hook dependencies
- Key props in lists
- Component structure
- Performance optimizations

### 4. Architecture Compliance
- Prisma client usage (must use shared instance from lib/prisma)
- Pages Router structure
- API route patterns
- Component organization

### 5. Style Consistency
- Tailwind CSS patterns
- Custom CSS variables usage
- Import organization
- File naming conventions

### 6. Photography App Specific
- Image upload patterns
- Gallery authentication
- Download tracking
- Client access patterns
- Favorite functionality

### 7. Performance & Best Practices
- Next.js Image component usage
- Loading states
- Error handling
- Accessibility attributes

## Common Issues and Fixes

### Database Usage
❌ **Wrong:**
```typescript
const prisma = new PrismaClient()
```

✅ **Correct:**
```typescript
import { prisma } from '@/lib/prisma'
```

### API Route Structure
❌ **Wrong:**
```typescript
export default function handler(req, res) {
  // Missing type annotations and method validation
}
```

✅ **Correct:**
```typescript
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }
  // Implementation...
}
```

### Authentication Checks
❌ **Wrong:**
```typescript
// Missing authentication in admin API
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Direct data access without auth check
}
```

✅ **Correct:**
```typescript
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req })
  
  if (!session || session.user?.type !== 'admin') {
    return res.status(401).json({ message: 'Unauthorized' })
  }
  // Implementation...
}
```

### Password Handling
❌ **Wrong:**
```typescript
if (password === storedPassword) {
  // Plain text comparison
}
```

✅ **Correct:**
```typescript
import bcrypt from 'bcryptjs'

const isValid = await bcrypt.compare(password, hashedPassword)
if (isValid) {
  // Secure comparison
}
```

## Integration with Development Workflow

### Pre-commit Hook
Add to your pre-commit workflow:
```bash
# Check files before commit
git diff --cached --name-only | grep -E '\.(ts|tsx|js|jsx)$' | xargs npm run review
```

### VS Code Integration
Add to `.vscode/tasks.json`:
```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Review Current File",
      "type": "shell",
      "command": "npm",
      "args": ["run", "review", "${file}"],
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "panel": "new"
      }
    }
  ]
}
```

## Exit Codes

- `0`: Success (no errors found)
- `1`: Errors found (requires fixing)

Warnings and suggestions don't affect the exit code but should be addressed for code quality.

## Customization

The code reviewer can be customized by modifying `review-code.js`:

- Add new patterns to check for
- Modify severity levels
- Add project-specific rules
- Integrate with additional tools

## Best Practices

1. **Run before committing**: Always review your code before committing
2. **Address errors first**: Fix all errors before warnings and suggestions
3. **Use verbose mode**: Use `--verbose` for detailed feedback during development
4. **Review API routes carefully**: Pay special attention to authentication and security
5. **Check new components**: Ensure they follow established patterns

## Troubleshooting

### Common Issues

1. **File not found**: Ensure the file path is correct relative to project root
2. **TypeScript errors**: Make sure TypeScript is properly configured
3. **ESLint errors**: Check ESLint configuration in project

### Getting Help

```bash
node review-code.js --help
```

For project-specific questions, refer to the main project documentation.