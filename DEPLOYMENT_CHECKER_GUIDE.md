# TxMedia Deployment Checker Guide

## Overview

The TxMedia Deployment Checker is a comprehensive validation system designed specifically for the photography portfolio project. It ensures your application is production-ready by validating everything from TypeScript compilation to photography-specific features like gallery access and image upload systems.

## Quick Start

### Basic Usage

```bash
# Quick deployment readiness check
npm run deploy:utils:quick

# Full pre-deployment validation
npm run deploy:check

# Complete comprehensive check
npm run deploy:check:full

# Safe deployment with built-in checks
npm run deploy:safe
```

### Check Deployment Status

```bash
# Is the app ready for deployment?
npm run deploy:utils:ready

# Get deployment recommendations
npm run deploy:utils:recommendations

# View deployment checklist
npm run deploy:utils:checklist
```

## Available Commands

### Core Deployment Checks

| Command | Description | When to Use |
|---------|-------------|-------------|
| `npm run deploy:check` | Pre-deployment validation | Before every deployment |
| `npm run deploy:check:full` | All checks including production tests | Before production releases |
| `npm run deploy:check:build` | Monitor build process | During CI/CD pipeline |
| `npm run deploy:check:security` | Security and configuration checks | Weekly security audits |
| `npm run deploy:check:api` | API endpoint validation | After API changes |
| `npm run deploy:check:photography` | Photography app specific checks | After gallery/image features |
| `npm run deploy:check:performance` | Performance and optimization | Before major releases |
| `npm run deploy:check:production` | Production environment tests | Production deployment only |

### Utility Commands

| Command | Description | Exit Code |
|---------|-------------|-----------|
| `npm run deploy:utils:quick` | Fast readiness check | 0 = ready, 1 = not ready |
| `npm run deploy:utils:ready` | Check latest report status | 0 = ready, 1 = not ready |
| `npm run deploy:utils:status` | Get status badge | - |
| `npm run deploy:utils:recommendations` | Get actionable recommendations | - |
| `npm run deploy:utils:rollback` | Get rollback plan | - |
| `npm run deploy:utils:checklist` | Show deployment checklist | - |
| `npm run deploy:utils:guide` | Environment deployment guide | - |

## What Gets Checked

### 1. Pre-Deployment Validation

#### Project Structure
- ✅ Required files exist (`package.json`, `next.config.ts`, `tsconfig.json`, etc.)
- ✅ Required directories present (`src/pages`, `src/pages/api`, `prisma`, etc.)
- ✅ Configuration files properly formatted

#### Environment Configuration
- ✅ `.env` file exists and properly configured
- ✅ All required environment variables present
- ✅ No placeholder values in production
- ✅ Secure password lengths
- ❌ Secrets scanning in source code

#### Dependencies
- ✅ `node_modules` installed
- ✅ No critical/high severity vulnerabilities
- ⚠️ Outdated package warnings
- ✅ Package compatibility checks

#### Code Quality
- ✅ TypeScript compilation successful
- ⚠️ ESLint issues (non-blocking)
- ✅ No syntax errors

### 2. Build Process Monitoring

#### Compilation
- ✅ Next.js build successful
- ✅ All pages compile without errors
- ✅ Static generation working
- ⚠️ Build performance metrics

#### Bundle Analysis
- ⚠️ Total bundle size monitoring
- ⚠️ Large bundle detection (>100KB)
- ⚠️ Asset optimization checks
- ✅ Build artifact validation

### 3. Security & Configuration

#### Next.js Security
- ⚠️ Security headers configuration
- ⚠️ `X-Powered-By` header disabled
- ✅ React strict mode enabled
- ✅ Production configuration

#### Authentication
- ✅ NextAuth properly configured
- ✅ Session configuration present
- ✅ Authentication secret configured
- ✅ Admin user validation

#### CORS & API Security
- ⚠️ CORS configuration validation
- ✅ API route security headers
- ✅ Input validation checks

### 4. Database & API Validation

#### Database
- ✅ Connection successful
- ✅ Prisma schema validation
- ✅ Database queries working
- ✅ Migration status

#### API Endpoints
- ✅ Health check endpoint (`/api/hello`)
- ✅ Admin login functionality
- ✅ Gallery access verification
- ✅ Response status validation

### 5. Photography App Specific

#### Image Upload System
- ✅ Upload API present
- ⚠️ Storage service configured (Supabase/Vercel Blob)
- ✅ Image processing capabilities
- ⚠️ Public directory size monitoring

#### Gallery System
- ✅ Gallery pages present
- ✅ Gallery API endpoints
- ✅ Password protection
- ✅ Prisma models (Gallery, GalleryImage, etc.)

#### Download Tracking
- ✅ Download API endpoint
- ✅ Download limit configuration
- ✅ Tracking database structure
- ✅ Client IP logging

### 6. Performance & Optimization

#### Bundle Optimization
- ⚠️ Total bundle size analysis
- ⚠️ Large bundle identification
- ⚠️ Code splitting validation
- ⚠️ Dynamic import usage

#### Image Optimization
- ⚠️ Large image detection (>500KB)
- ⚠️ Next.js image optimization config
- ⚠️ WebP/modern format usage
- ⚠️ Image compression levels

#### Caching Strategy
- ⚠️ Static generation usage
- ⚠️ Cache headers configuration
- ⚠️ Asset caching strategy
- ⚠️ API response caching

## Report Analysis

### Understanding Exit Codes

| Exit Code | Meaning | Action Required |
|-----------|---------|-----------------|
| 0 | Success - Ready to deploy | Proceed with deployment |
| 1 | Failure - Critical issues | Fix errors before deployment |

### Report Structure

The deployment checker generates a detailed JSON report:

```json
{
  "errors": [],           // Blocking issues
  "warnings": [],         // Non-blocking issues
  "info": [],            // Informational messages
  "performance": {},     // Performance metrics
  "security": {},        // Security analysis
  "database": {},        // Database status
  "api": {},            // API test results
  "build": {},          // Build analysis
  "summary": {
    "isDeploymentReady": true,
    "duration": 15000,
    "timestamp": "2025-01-20T10:30:00.000Z"
  }
}
```

### Status Levels

#### ❌ Errors (Blocking)
- Missing required files
- Environment variable issues
- TypeScript compilation failures
- Database connection problems
- Critical security vulnerabilities

#### ⚠️ Warnings (Non-blocking)
- Performance concerns
- Large bundle sizes
- Outdated dependencies
- Missing optimization opportunities

#### ℹ️ Info (Informational)
- Configuration recommendations
- Best practice suggestions
- Performance tips

## CI/CD Integration

### GitHub Actions

The deployment checker integrates with GitHub Actions for automated validation:

```yaml
# .github/workflows/deployment-check.yml
# Automatically runs on:
# - Push to main/develop
# - Pull requests
# - Manual trigger
```

### Pre-commit Hooks

Husky pre-commit hooks prevent committing code that fails basic checks:

```bash
# .husky/pre-commit
# Runs: npm run deploy:check
# Blocks commit if critical errors found
```

### Vercel Integration

Use with Vercel's build process:

```json
{
  "buildCommand": "npm run deploy:check:build && npm run build",
  "installCommand": "npm install"
}
```

## Environment-Specific Deployment

### Development

```bash
npm run deploy:utils:guide development
```

- Basic environment setup
- Local database configuration
- Development server startup

### Staging

```bash
npm run deploy:utils:guide staging
```

- Full validation suite
- Performance testing
- User acceptance testing

### Production

```bash
npm run deploy:utils:guide production
```

- Comprehensive security review
- Database backup
- Monitoring setup
- Rollback preparation

## Troubleshooting

### Common Issues

#### "TypeScript compilation failed"
```bash
# Check for syntax errors
npx tsc --noEmit

# Fix import issues
# Check file paths and exports
```

#### "Database connection failed"
```bash
# Verify DATABASE_URL
echo $DATABASE_URL

# Test connection manually
npx prisma db push --force-reset
```

#### "Missing environment variables"
```bash
# Copy from example
cp .env.example .env

# Fill in actual values
# Never commit .env file
```

#### "Large bundle size detected"
```bash
# Analyze bundle
npm run build
npx @next/bundle-analyzer

# Implement code splitting
# Use dynamic imports
```

### Getting Help

1. **Check the report**: `deployment-report.json`
2. **Run recommendations**: `npm run deploy:utils:recommendations`
3. **View checklist**: `npm run deploy:utils:checklist`
4. **Get rollback plan**: `npm run deploy:utils:rollback`

## Best Practices

### Development Workflow

1. **Before coding**: Run `npm run deploy:utils:quick`
2. **Before committing**: Pre-commit hook automatically runs
3. **Before PR**: Run `npm run deploy:check`
4. **Before deployment**: Run `npm run deploy:check:full`

### Performance Optimization

1. Monitor bundle sizes regularly
2. Optimize images before adding to public directory
3. Use static generation where possible
4. Implement proper caching headers

### Security Practices

1. Never commit secrets to version control
2. Use strong passwords (8+ characters)
3. Keep dependencies updated
4. Regular security audits with `npm run deploy:check:security`

### Photography App Specific

1. Test gallery access flows regularly
2. Monitor download tracking functionality
3. Validate image upload limits
4. Check storage service quotas

## Configuration

### Customizing Checks

Edit `deploy-config.json` to customize behavior:

```json
{
  "deploymentChecker": {
    "environments": {
      "production": {
        "allowWarnings": false,
        "securityRequirements": {
          "minSecurityScore": 90
        }
      }
    }
  }
}
```

### Environment Variables

Required for all environments:
- `NEXTAUTH_SECRET` (32+ characters)
- `NEXTAUTH_URL` (production URL)
- `DATABASE_URL` (database connection)
- `ADMIN_EMAIL` (admin login)
- `ADMIN_PASSWORD` (8+ characters)

Optional for enhanced features:
- `SUPABASE_URL` (image storage)
- `SUPABASE_ANON_KEY` (Supabase access)
- `BLOB_READ_WRITE_TOKEN` (Vercel Blob storage)

## Advanced Usage

### Custom Checks

Extend the deployment checker for project-specific needs:

```javascript
// custom-checks.js
const DeploymentChecker = require('./deploy-checker.js')

class CustomChecker extends DeploymentChecker {
  async checkCustomFeature() {
    // Your custom validation logic
  }
}
```

### Integration with Other Tools

- **Playwright**: End-to-end testing
- **Lighthouse**: Performance audits
- **Snyk**: Security scanning
- **Bundle Analyzer**: Detailed bundle analysis

## Support

For issues or questions:

1. Check this documentation
2. Review `deployment-report.json`
3. Run `npm run deploy:utils:recommendations`
4. Check GitHub Issues
5. Contact the development team

---

**Remember**: The deployment checker is your safety net. Trust its recommendations, and always resolve critical errors before deploying to production.