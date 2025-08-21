#!/usr/bin/env node

/**
 * txMedia Code Reviewer Agent
 * 
 * A comprehensive code review tool for the txMedia photography portfolio project.
 * Analyzes TypeScript/JavaScript files for code quality, style consistency,
 * architecture compliance, and photography app-specific patterns.
 * 
 * Usage: node review-code.js [file-path] [--verbose] [--fix]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class CodeReviewer {
  constructor() {
    this.issues = [];
    this.warnings = [];
    this.suggestions = [];
    this.verbose = false;
    this.projectRoot = process.cwd();
    
    // Project-specific patterns
    this.patterns = {
      // API route patterns
      apiRoutes: /^src\/pages\/api\//,
      adminRoutes: /^src\/pages\/api\/admin\//,
      galleryRoutes: /^src\/pages\/api\/gallery\//,
      
      // Component patterns
      components: /^src\/(components|pages)\//,
      
      // Database patterns
      prismaImport: /import.*{.*prisma.*}.*from.*['"`].*lib\/prisma['"`]/,
      directPrismaClient: /new PrismaClient\(\)/,
      
      // Security patterns
      envVars: /process\.env\./,
      passwordCompare: /bcrypt\.compare/,
      
      // React patterns
      reactImport: /import.*React/,
      useEffect: /useEffect/,
      useState: /useState/,
      
      // Next.js patterns
      nextImage: /next\/image/,
      nextAuth: /next-auth/,
      
      // Tailwind patterns
      tailwindClasses: /className=["'`][^"'`]*["'`]/g,
      customCssVars: /var\(--[^)]+\)/g,
      
      // Photography app specific
      imageUpload: /(multer|upload|FormData)/,
      galleryAuth: /(gallery.*password|password.*gallery)/i,
      downloadTracking: /(download|track.*download)/i,
    };
    
    // Known security issues to flag
    this.securityPatterns = {
      sqlInjection: /(`|\$\{.*\}|'.*\+.*')/,
      directQuery: /(query|exec|raw)\s*\(/,
      noSqlInjection: /\$where|\$regex/,
      xss: /innerHTML|dangerouslySetInnerHTML/,
      secrets: /(api_key|secret|password|token).*=.*['"`][^'"`]{10,}/i,
      hardcodedCreds: /(password|secret).*=.*['"`]\w+['"`]/i,
    };
    
    // Expected project structure
    this.expectedStructure = {
      apiAuth: ['src/pages/api/auth/[...nextauth].js'],
      adminApi: ['src/pages/api/admin/', 'src/pages/api/admin/galleries.ts'],
      galleryApi: ['src/pages/api/gallery/', 'src/pages/api/gallery/[slug].ts'],
      prismaLib: ['src/lib/prisma.ts'],
      components: ['src/components/', 'src/pages/'],
    };
  }

  /**
   * Main entry point for code review
   */
  async reviewFile(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        this.addIssue('error', `File not found: ${filePath}`);
        return this.generateReport();
      }

      const content = fs.readFileSync(filePath, 'utf8');
      const fileExt = path.extname(filePath);
      const relativePath = path.relative(this.projectRoot, filePath);
      
      this.log(`\n🔍 Reviewing: ${relativePath}`);
      
      // Skip node_modules and other irrelevant files
      if (this.shouldSkipFile(filePath)) {
        this.log('⏭️  Skipping file (node_modules, .git, etc.)');
        return this.generateReport();
      }

      // Run different checks based on file type
      if (['.ts', '.tsx', '.js', '.jsx'].includes(fileExt)) {
        await this.reviewCodeFile(filePath, content, relativePath);
      } else if (fileExt === '.json') {
        this.reviewJsonFile(content, relativePath);
      } else {
        this.log('ℹ️  File type not supported for code review');
      }

      return this.generateReport();
    } catch (error) {
      this.addIssue('error', `Failed to review file: ${error.message}`);
      return this.generateReport();
    }
  }

  /**
   * Comprehensive code file review
   */
  async reviewCodeFile(filePath, content, relativePath) {
    // 1. Code Quality Checks
    await this.checkCodeQuality(content, relativePath);
    
    // 2. TypeScript/JavaScript Checks  
    this.checkTypeScript(content, relativePath);
    
    // 3. React Patterns
    this.checkReactPatterns(content, relativePath);
    
    // 4. Security Checks
    this.checkSecurity(content, relativePath);
    
    // 5. Architecture Compliance
    this.checkArchitecture(content, relativePath);
    
    // 6. Style Consistency
    this.checkStyleConsistency(content, relativePath);
    
    // 7. Performance & Best Practices
    this.checkPerformance(content, relativePath);
    
    // 8. Photography App Specific
    this.checkPhotographyAppPatterns(content, relativePath);
    
    // 9. API Route Specific Checks
    if (this.patterns.apiRoutes.test(relativePath)) {
      this.checkApiRoutes(content, relativePath);
    }
    
    // 10. Component Specific Checks
    if (this.patterns.components.test(relativePath)) {
      this.checkComponentPatterns(content, relativePath);
    }
  }

  /**
   * Code quality checks using ESLint and TypeScript compiler
   */
  async checkCodeQuality(content, relativePath) {
    try {
      // Check for TypeScript errors
      if (relativePath.endsWith('.ts') || relativePath.endsWith('.tsx')) {
        try {
          execSync(`npx tsc --noEmit --skipLibCheck ${relativePath}`, { 
            cwd: this.projectRoot,
            stdio: 'pipe' 
          });
          this.addSuggestion(`✅ TypeScript compilation passed for ${relativePath}`);
        } catch (error) {
          const output = error.stdout?.toString() || error.stderr?.toString() || '';
          if (output.includes('error TS')) {
            const errors = output.split('\n')
              .filter(line => line.includes('error TS'))
              .slice(0, 5); // Limit to first 5 errors
            
            errors.forEach(err => {
              this.addIssue('error', `TypeScript Error: ${err.trim()}`);
            });
          }
        }
      }

      // Run ESLint
      try {
        execSync(`npx eslint ${relativePath} --format json`, { 
          cwd: this.projectRoot,
          stdio: 'pipe' 
        });
        this.addSuggestion(`✅ ESLint passed for ${relativePath}`);
      } catch (error) {
        const output = error.stdout?.toString();
        if (output) {
          try {
            const results = JSON.parse(output);
            results.forEach(result => {
              result.messages.forEach(msg => {
                const severity = msg.severity === 2 ? 'error' : 'warning';
                this.addIssue(severity, 
                  `${msg.ruleId}: ${msg.message} (line ${msg.line}:${msg.column})`);
              });
            });
          } catch (parseErr) {
            this.addWarning('Could not parse ESLint output');
          }
        }
      }
    } catch (error) {
      this.addWarning(`Could not run code quality checks: ${error.message}`);
    }
  }

  /**
   * TypeScript specific checks
   */
  checkTypeScript(content, relativePath) {
    const lines = content.split('\n');
    
    // Check for proper typing
    if (content.includes('@typescript-eslint/no-explicit-any')) {
      this.addWarning('File contains explicit any types suppression - consider proper typing');
    }

    // Check for proper import types
    const importTypeRegex = /import type\s+{[^}]+}\s+from/g;
    const regularImportRegex = /import\s+{[^}]+}\s+from.*['"`][^'"`]*types?['"`]/;
    
    if (regularImportRegex.test(content) && !importTypeRegex.test(content)) {
      this.addSuggestion('Consider using "import type" for type-only imports');
    }

    // Check for proper React component typing
    if (relativePath.endsWith('.tsx') && content.includes('function ')) {
      if (!content.includes(': React.FC') && !content.includes(': FC') && 
          !content.includes('): JSX.Element') && !content.includes('): ReactElement')) {
        this.addSuggestion('Consider adding proper return type annotations for React components');
      }
    }

    // Check for proper API handler typing
    if (this.patterns.apiRoutes.test(relativePath)) {
      if (!content.includes('NextApiRequest') || !content.includes('NextApiResponse')) {
        this.addIssue('error', 'API routes should use proper NextApiRequest and NextApiResponse types');
      }
    }
  }

  /**
   * React patterns and hooks usage
   */
  checkReactPatterns(content, relativePath) {
    if (!relativePath.endsWith('.tsx') && !relativePath.endsWith('.jsx')) {
      return;
    }

    const lines = content.split('\n');

    // Check for proper React imports
    if (content.includes('JSX') || content.includes('<') || content.includes('useState') || content.includes('useEffect')) {
      if (!content.includes("import React") && !content.includes("import { ") && !content.includes("from 'react'")) {
        this.addIssue('error', 'React components should import React or required hooks');
      }
    }

    // Check useEffect dependencies
    const useEffectMatches = content.match(/useEffect\s*\(\s*\(\s*\)\s*=>\s*{[\s\S]*?},\s*\[([\s\S]*?)\]/g);
    if (useEffectMatches) {
      useEffectMatches.forEach(match => {
        if (match.includes('[]') && (match.includes('state.') || match.includes('props.'))) {
          this.addWarning('useEffect with empty dependencies but uses state/props - potential missing dependency');
        }
      });
    }

    // Check for proper key props in lists
    if (content.includes('.map(') && content.includes('<')) {
      const mapRegex = /\.map\s*\([^}]*<[^>]*>/g;
      const mapMatches = content.match(mapRegex);
      if (mapMatches) {
        mapMatches.forEach(match => {
          if (!match.includes('key=')) {
            this.addWarning('Missing key prop in mapped JSX elements');
          }
        });
      }
    }

    // Check for inline functions in JSX
    const inlineFunctionRegex = /(?:onClick|onChange|onSubmit|onFocus|onBlur)={\s*\([^)]*\)\s*=>/g;
    if (inlineFunctionRegex.test(content)) {
      this.addSuggestion('Consider using useCallback for event handlers to prevent unnecessary re-renders');
    }
  }

  /**
   * Security vulnerability checks
   */
  checkSecurity(content, relativePath) {
    // Check for potential SQL injection
    Object.entries(this.securityPatterns).forEach(([type, pattern]) => {
      if (pattern.test(content)) {
        switch (type) {
          case 'sqlInjection':
            this.addIssue('error', 'Potential SQL injection vulnerability - use parameterized queries');
            break;
          case 'directQuery':
            this.addWarning('Direct database query found - ensure it\'s properly sanitized');
            break;
          case 'xss':
            this.addIssue('error', 'Potential XSS vulnerability - avoid innerHTML and dangerouslySetInnerHTML');
            break;
          case 'secrets':
            this.addIssue('error', 'Potential hardcoded secret/API key found');
            break;
          case 'hardcodedCreds':
            this.addIssue('error', 'Hardcoded credentials found - use environment variables');
            break;
        }
      }
    });

    // Check for environment variable usage
    if (this.patterns.envVars.test(content)) {
      if (!content.includes('process.env.NODE_ENV') && 
          (content.includes('process.env.DATABASE_URL') || 
           content.includes('process.env.NEXTAUTH_SECRET'))) {
        this.addSuggestion('Ensure sensitive environment variables are properly validated');
      }
    }

    // Check API routes for authentication
    if (this.patterns.apiRoutes.test(relativePath)) {
      if (!content.includes('getSession') && !content.includes('authorization') && 
          !content.includes('authenticate') && !relativePath.includes('auth')) {
        this.addWarning('API route may be missing authentication checks');
      }
    }

    // Check for proper password handling
    if (content.includes('password') && !content.includes('bcrypt')) {
      this.addWarning('Password handling detected - ensure proper hashing with bcrypt');
    }
  }

  /**
   * Architecture compliance checks
   */
  checkArchitecture(content, relativePath) {
    // Check Prisma usage patterns
    if (content.includes('PrismaClient')) {
      if (this.patterns.directPrismaClient.test(content) && !relativePath.includes('lib/prisma')) {
        this.addIssue('error', 'Do not instantiate PrismaClient directly - use the shared instance from lib/prisma');
      }
    }

    // Check database imports
    if (content.includes('prisma.')) {
      if (!this.patterns.prismaImport.test(content) && !relativePath.includes('lib/prisma')) {
        this.addWarning('Import prisma from lib/prisma for consistency');
      }
    }

    // Check Pages Router structure
    if (relativePath.startsWith('src/pages/')) {
      if (relativePath.endsWith('.tsx') || relativePath.endsWith('.jsx')) {
        if (!content.includes('export default')) {
          this.addIssue('error', 'Pages must have a default export');
        }
      }
    }

    // Check API route structure
    if (this.patterns.apiRoutes.test(relativePath)) {
      if (!content.includes('export default async function handler') && 
          !content.includes('export default function handler')) {
        this.addIssue('error', 'API routes must export a default handler function');
      }

      // Check method handling
      if (!content.includes('req.method')) {
        this.addWarning('API route should validate HTTP method');
      }
    }

    // Check component file organization
    if (this.patterns.components.test(relativePath)) {
      const componentName = path.basename(relativePath, path.extname(relativePath));
      if (!content.includes(`function ${componentName}`) && 
          !content.includes(`const ${componentName}`) &&
          !content.includes(`export { ${componentName}`)) {
        this.addSuggestion(`Component file should export a component named ${componentName}`);
      }
    }
  }

  /**
   * Style consistency checks
   */
  checkStyleConsistency(content, relativePath) {
    // Check Tailwind CSS patterns
    const tailwindMatches = content.match(this.patterns.tailwindClasses);
    if (tailwindMatches) {
      tailwindMatches.forEach(match => {
        // Check for custom CSS variables usage
        const customVarMatches = match.match(this.patterns.customCssVars);
        if (customVarMatches) {
          const expectedVars = ['--background', '--foreground', '--accent', '--secondary', 
                              '--secondary-alt', '--gradient-start', '--gradient-end'];
          customVarMatches.forEach(cssVar => {
            const varName = cssVar.replace('var(', '').replace(')', '');
            if (!expectedVars.includes(varName)) {
              this.addWarning(`Custom CSS variable ${varName} not found in expected variables list`);
            }
          });
        }
        
        // Check for inline styles
        if (match.includes('style=')) {
          this.addSuggestion('Consider using Tailwind classes instead of inline styles');
        }
      });
    }

    // Check import organization
    const importLines = content.split('\n').filter(line => line.trim().startsWith('import'));
    if (importLines.length > 0) {
      let hasReactImports = false;
      let hasNextImports = false;
      let hasRelativeImports = false;
      
      importLines.forEach((line, index) => {
        if (line.includes("from 'react'") || line.includes('from "react"')) {
          hasReactImports = true;
          if (index > 0) {
            this.addSuggestion('React imports should come first');
          }
        }
        if (line.includes("from 'next/") || line.includes('from "next/')) {
          hasNextImports = true;
        }
        if (line.includes("from './") || line.includes('from "../')) {
          hasRelativeImports = true;
        }
      });
      
      // Suggest import order: React -> Next.js -> External -> Relative
      if (hasReactImports && hasNextImports && hasRelativeImports) {
        this.addSuggestion('Consider organizing imports: React -> Next.js -> External libraries -> Relative imports');
      }
    }
  }

  /**
   * Performance and best practices
   */
  checkPerformance(content, relativePath) {
    // Check for Next.js Image component usage
    if (content.includes('<img') && !content.includes('next/image')) {
      this.addSuggestion('Consider using Next.js Image component for better performance');
    }

    // Check for proper loading states
    if (content.includes('fetch(') || content.includes('axios.') || content.includes('api')) {
      if (!content.includes('loading') && !content.includes('isLoading') && 
          !content.includes('pending') && !content.includes('skeleton')) {
        this.addSuggestion('Consider adding loading states for API calls');
      }
    }

    // Check for error handling
    if (content.includes('fetch(') || content.includes('axios.') || content.includes('prisma.')) {
      if (!content.includes('try') && !content.includes('catch') && !content.includes('.catch(')) {
        this.addWarning('Missing error handling for async operations');
      }
    }

    // Check for proper memoization
    if (content.includes('useMemo') || content.includes('useCallback')) {
      this.addSuggestion('✅ Good use of React performance optimizations');
    }

    // Check for accessibility
    if (content.includes('<button') || content.includes('<input') || content.includes('<a')) {
      if (!content.includes('aria-') && !content.includes('role=') && !content.includes('alt=')) {
        this.addSuggestion('Consider adding accessibility attributes (aria-*, role, alt)');
      }
    }
  }

  /**
   * Photography app specific checks
   */
  checkPhotographyAppPatterns(content, relativePath) {
    // Check image upload patterns
    if (this.patterns.imageUpload.test(content)) {
      if (!content.includes('sharp') && !content.includes('image/') && !content.includes('resize')) {
        this.addSuggestion('Consider using Sharp for image processing and optimization');
      }
      
      if (!content.includes('fileSize') && !content.includes('size')) {
        this.addWarning('Image uploads should validate file size');
      }
    }

    // Check gallery authentication
    if (this.patterns.galleryAuth.test(content)) {
      if (!content.includes('bcrypt') && content.includes('password')) {
        this.addIssue('error', 'Gallery passwords should be hashed with bcrypt');
      }
      
      if (content.includes('expiryDate') && !content.includes('new Date()')) {
        this.addSuggestion('Ensure gallery expiry dates are properly validated');
      }
    }

    // Check download tracking
    if (this.patterns.downloadTracking.test(content)) {
      if (!content.includes('downloadLimit') && !content.includes('downloads.length')) {
        this.addWarning('Download tracking should respect gallery download limits');
      }
      
      if (content.includes('clientIp') && !content.includes('x-forwarded-for')) {
        this.addSuggestion('Consider proper IP detection for downloads (including proxies)');
      }
    }

    // Check gallery slug patterns
    if (content.includes('slug') && relativePath.includes('gallery')) {
      if (!content.includes('slug as string') && content.includes('req.query')) {
        this.addSuggestion('Cast query parameters to string for type safety');
      }
    }

    // Check favorite functionality
    if (content.includes('favorite') || content.includes('Favorite')) {
      if (!content.includes('clientIp') && !content.includes('unique')) {
        this.addWarning('Favorites should be unique per client IP');
      }
    }
  }

  /**
   * API route specific checks
   */
  checkApiRoutes(content, relativePath) {
    // Check proper error responses
    if (!content.includes('res.status(') || !content.includes('.json(')) {
      this.addIssue('error', 'API routes should return proper HTTP status codes and JSON responses');
    }

    // Check CORS handling if needed
    if (!content.includes('cors') && relativePath.includes('admin')) {
      this.addSuggestion('Consider CORS handling for admin API routes if accessed from different origins');
    }

    // Check rate limiting for public APIs
    if (!relativePath.includes('admin') && !content.includes('rate') && !content.includes('limit')) {
      this.addSuggestion('Consider adding rate limiting for public API endpoints');
    }

    // Check request validation
    if (content.includes('req.body') && !content.includes('validation') && !content.includes('validate')) {
      this.addWarning('API routes should validate request bodies');
    }

    // Check admin authentication
    if (this.patterns.adminRoutes.test(relativePath)) {
      if (!content.includes("type === 'admin'") && !content.includes('admin')) {
        this.addWarning('Admin routes should properly check for admin user type');
      }
    }
  }

  /**
   * Component pattern checks
   */
  checkComponentPatterns(content, relativePath) {
    // Check for proper prop types
    if (relativePath.endsWith('.tsx') && content.includes('interface') && content.includes('Props')) {
      this.addSuggestion('✅ Good use of TypeScript interfaces for props');
    }

    // Check for proper component exports
    if (!content.includes('export default') && !content.includes('export {')) {
      this.addWarning('Components should be properly exported');
    }

    // Check for component naming conventions
    const componentName = path.basename(relativePath, path.extname(relativePath));
    if (componentName[0] !== componentName[0].toUpperCase()) {
      this.addWarning('Component file names should start with uppercase');
    }
  }

  /**
   * JSON file review
   */
  reviewJsonFile(content, relativePath) {
    try {
      JSON.parse(content);
      this.addSuggestion(`✅ Valid JSON format for ${relativePath}`);
      
      if (relativePath.includes('package.json')) {
        const pkg = JSON.parse(content);
        
        // Check for security vulnerabilities in dependencies
        this.addSuggestion('Consider running npm audit to check for vulnerabilities');
        
        // Check for proper scripts
        if (!pkg.scripts || !pkg.scripts.build) {
          this.addWarning('package.json should include build script');
        }
      }
    } catch (error) {
      this.addIssue('error', `Invalid JSON format: ${error.message}`);
    }
  }

  /**
   * Utility methods
   */
  shouldSkipFile(filePath) {
    const skipPatterns = [
      /node_modules/,
      /\.git/,
      /\.next/,
      /dist/,
      /build/,
      /coverage/,
      /\.env/,
      /\.log$/,
      /\.lock$/,
    ];
    
    return skipPatterns.some(pattern => pattern.test(filePath));
  }

  addIssue(type, message) {
    this.issues.push({ type, message });
    if (this.verbose) {
      console.log(`❌ ${type.toUpperCase()}: ${message}`);
    }
  }

  addWarning(message) {
    this.warnings.push(message);
    if (this.verbose) {
      console.log(`⚠️  WARNING: ${message}`);
    }
  }

  addSuggestion(message) {
    this.suggestions.push(message);
    if (this.verbose) {
      console.log(`💡 SUGGESTION: ${message}`);
    }
  }

  log(message) {
    if (this.verbose) {
      console.log(message);
    }
  }

  /**
   * Generate comprehensive report
   */
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        errors: this.issues.filter(i => i.type === 'error').length,
        warnings: this.warnings.length,
        suggestions: this.suggestions.length,
        totalIssues: this.issues.length + this.warnings.length
      },
      details: {
        errors: this.issues.filter(i => i.type === 'error'),
        warnings: this.warnings.map(w => ({ message: w })),
        suggestions: this.suggestions.map(s => ({ message: s }))
      }
    };

    return report;
  }

  /**
   * Print formatted report to console
   */
  printReport(report) {
    console.log('\n' + '='.repeat(60));
    console.log('📋 TXMEDIA CODE REVIEW REPORT');
    console.log('='.repeat(60));
    
    // Summary
    console.log(`\n📊 SUMMARY:`);
    console.log(`   Errors: ${report.summary.errors}`);
    console.log(`   Warnings: ${report.summary.warnings}`);
    console.log(`   Suggestions: ${report.summary.suggestions}`);
    console.log(`   Total Issues: ${report.summary.totalIssues}`);

    // Errors
    if (report.details.errors.length > 0) {
      console.log(`\n❌ ERRORS (${report.details.errors.length}):`);
      report.details.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error.message}`);
      });
    }

    // Warnings
    if (report.details.warnings.length > 0) {
      console.log(`\n⚠️  WARNINGS (${report.details.warnings.length}):`);
      report.details.warnings.forEach((warning, index) => {
        console.log(`   ${index + 1}. ${warning.message}`);
      });
    }

    // Suggestions
    if (report.details.suggestions.length > 0) {
      console.log(`\n💡 SUGGESTIONS (${report.details.suggestions.length}):`);
      report.details.suggestions.forEach((suggestion, index) => {
        console.log(`   ${index + 1}. ${suggestion.message}`);
      });
    }

    // Overall assessment
    console.log('\n🎯 OVERALL ASSESSMENT:');
    if (report.summary.errors === 0 && report.summary.warnings === 0) {
      console.log('   ✅ Excellent! No errors or warnings found.');
    } else if (report.summary.errors === 0) {
      console.log('   👍 Good! No errors found, but consider addressing warnings.');
    } else {
      console.log('   🔧 Needs attention. Please fix errors before proceeding.');
    }

    console.log('\n' + '='.repeat(60));
    
    // Exit code based on issues
    return report.summary.errors > 0 ? 1 : 0;
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
📋 txMedia Code Reviewer Agent

Usage: node review-code.js [file-path] [options]

Options:
  --verbose, -v    Show detailed output during review
  --help, -h      Show this help message

Examples:
  node review-code.js src/pages/api/admin/galleries.ts
  node review-code.js src/components/ImageModal.tsx --verbose
  
The script will analyze the file for:
  • Code quality and TypeScript errors
  • React component patterns and hooks usage  
  • Security vulnerabilities
  • Architecture compliance
  • Style consistency with Tailwind CSS patterns
  • Performance and accessibility best practices
  • Photography app specific patterns
  • API route security and structure

Exit codes:
  0 - Success (no errors)
  1 - Errors found (warnings and suggestions don't affect exit code)
`);
    process.exit(0);
  }

  const filePath = args[0];
  const verbose = args.includes('--verbose') || args.includes('-v');
  
  const reviewer = new CodeReviewer();
  reviewer.verbose = verbose;
  
  const report = await reviewer.reviewFile(path.resolve(filePath));
  const exitCode = reviewer.printReport(report);
  
  process.exit(exitCode);
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('\n❌ Unexpected error occurred:');
  console.error(error.message);
  console.error('\nPlease check the file path and try again.');
  process.exit(1);
});

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });
}

module.exports = { CodeReviewer };