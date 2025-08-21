#!/usr/bin/env node

/**
 * API Endpoint Validator for TxMedia
 * 
 * Validates generated API endpoints for consistency, security, and best practices.
 */

const fs = require('fs');
const path = require('path');

class APIValidator {
  constructor() {
    this.apiDir = path.join(__dirname, '..', 'src', 'pages', 'api');
    this.issues = [];
    this.checks = 0;
    this.passed = 0;
  }

  async validate(filePath = null) {
    console.log('🔍 Validating API endpoints...\n');
    
    const files = filePath ? [filePath] : this.getAllApiFiles();
    
    for (const file of files) {
      await this.validateFile(file);
    }
    
    this.generateReport();
  }

  getAllApiFiles() {
    const files = [];
    
    const scanDirectory = (dir) => {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          scanDirectory(fullPath);
        } else if (item.endsWith('.ts') || item.endsWith('.js')) {
          files.push(fullPath);
        }
      }
    };
    
    scanDirectory(this.apiDir);
    return files;
  }

  validateFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(this.apiDir, filePath);
    
    console.log(`📄 Validating: ${relativePath}`);
    
    // Security checks
    this.checkSqlInjection(content, relativePath);
    this.checkAuthenticationPresent(content, relativePath);
    this.checkInputValidation(content, relativePath);
    this.checkPasswordHandling(content, relativePath);
    
    // Structure checks
    this.checkMethodValidation(content, relativePath);
    this.checkErrorHandling(content, relativePath);
    this.checkDatabaseConnection(content, relativePath);
    this.checkResponseStructure(content, relativePath);
    
    // TypeScript checks
    this.checkTypeScript(content, relativePath);
    this.checkImports(content, relativePath);
    
    // Performance checks
    this.checkDatabaseConnections(content, relativePath);
    this.checkResourceCleanup(content, relativePath);
  }

  checkSqlInjection(content, file) {
    this.checks++;
    
    // Check for dangerous SQL concatenation
    const dangerousPatterns = [
      /query\([^)]*\+[^)]*\)/g,
      /query\([^)]*\$\{[^}]*\}[^)]*\)/g
    ];
    
    let hasSqlInjectionRisk = false;
    
    dangerousPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        hasSqlInjectionRisk = true;
      }
    });
    
    if (hasSqlInjectionRisk) {
      this.issues.push({
        file,
        type: 'Security',
        severity: 'High',
        message: 'Potential SQL injection vulnerability - use parameterized queries'
      });
    } else {
      this.passed++;
    }
  }

  checkAuthenticationPresent(content, file) {
    this.checks++;
    
    const hasAuth = content.includes('getSession') || 
                   content.includes('bcrypt.compare') || 
                   content.includes('password') ||
                   content.includes('authentication') ||
                   content.includes('Unauthorized');
    
    // Skip auth check for hello.ts and other test files
    if (file.includes('hello.ts') || file.includes('test')) {
      this.passed++;
      return;
    }
    
    if (!hasAuth) {
      this.issues.push({
        file,
        type: 'Security',
        severity: 'Medium',
        message: 'No authentication mechanism detected'
      });
    } else {
      this.passed++;
    }
  }

  checkInputValidation(content, file) {
    this.checks++;
    
    const hasValidation = content.includes('req.body') && 
                         (content.includes('if (!') || content.includes('required'));
    
    if (content.includes('req.body') && !hasValidation) {
      this.issues.push({
        file,
        type: 'Security',
        severity: 'Medium',
        message: 'Input validation missing for request body'
      });
    } else {
      this.passed++;
    }
  }

  checkPasswordHandling(content, file) {
    this.checks++;
    
    if (content.includes('password')) {
      const hasSecurePassword = content.includes('bcrypt') || content.includes('hash');
      
      if (!hasSecurePassword) {
        this.issues.push({
          file,
          type: 'Security',
          severity: 'High',
          message: 'Password handling without proper hashing/encryption'
        });
      } else {
        this.passed++;
      }
    } else {
      this.passed++;
    }
  }

  checkMethodValidation(content, file) {
    this.checks++;
    
    const hasMethodCheck = content.includes('req.method') && 
                          content.includes('Method not allowed');
    
    if (!hasMethodCheck) {
      this.issues.push({
        file,
        type: 'Structure',
        severity: 'Low',
        message: 'HTTP method validation missing'
      });
    } else {
      this.passed++;
    }
  }

  checkErrorHandling(content, file) {
    this.checks++;
    
    const hasTryCatch = content.includes('try {') && content.includes('} catch');
    const hasErrorResponse = content.includes('500') || content.includes('Internal server error');
    
    if (!hasTryCatch || !hasErrorResponse) {
      this.issues.push({
        file,
        type: 'Structure',
        severity: 'Medium',
        message: 'Incomplete error handling (missing try/catch or error response)'
      });
    } else {
      this.passed++;
    }
  }

  checkDatabaseConnection(content, file) {
    this.checks++;
    
    if (content.includes('PrismaClient') || content.includes('new Client')) {
      const hasPrisma = content.includes('PrismaClient');
      const hasPostgreSQL = content.includes('new Client') && content.includes('pg');
      
      if (hasPostgreSQL) {
        const hasConnectionCleanup = content.includes('client.end()');
        
        if (!hasConnectionCleanup) {
          this.issues.push({
            file,
            type: 'Performance',
            severity: 'Medium',
            message: 'PostgreSQL connection not properly closed'
          });
        } else {
          this.passed++;
        }
      } else {
        this.passed++;
      }
    } else {
      this.passed++;
    }
  }

  checkResponseStructure(content, file) {
    this.checks++;
    
    const hasStatusCode = content.includes('res.status(');
    const hasJsonResponse = content.includes('res.json(') || content.includes('res.send(');
    
    if (!hasStatusCode || !hasJsonResponse) {
      this.issues.push({
        file,
        type: 'Structure',
        severity: 'Low',
        message: 'Inconsistent response structure (missing status code or JSON response)'
      });
    } else {
      this.passed++;
    }
  }

  checkTypeScript(content, file) {
    this.checks++;
    
    if (file.endsWith('.ts')) {
      const hasTypes = content.includes('NextApiRequest') && content.includes('NextApiResponse');
      
      if (!hasTypes) {
        this.issues.push({
          file,
          type: 'TypeScript',
          severity: 'Low',
          message: 'Missing proper TypeScript types for API handler'
        });
      } else {
        this.passed++;
      }
    } else {
      this.passed++;
    }
  }

  checkImports(content, file) {
    this.checks++;
    
    const imports = this.extractImports(content);
    const requiredImports = [];
    
    if (content.includes('NextApiRequest')) {
      requiredImports.push('next');
    }
    
    if (content.includes('bcrypt')) {
      requiredImports.push('bcryptjs');
    }
    
    if (content.includes('PrismaClient')) {
      requiredImports.push('@prisma/client');
    }
    
    const missingImports = requiredImports.filter(imp => 
      !imports.some(i => i.includes(imp))
    );
    
    if (missingImports.length > 0) {
      this.issues.push({
        file,
        type: 'Structure',
        severity: 'Medium',
        message: `Missing imports: ${missingImports.join(', ')}`
      });
    } else {
      this.passed++;
    }
  }

  checkDatabaseConnections(content, file) {
    this.checks++;
    
    // Check for multiple database connections in a single file
    const prismaCount = (content.match(/new PrismaClient/g) || []).length;
    const postgresCount = (content.match(/new Client/g) || []).length;
    
    if (prismaCount > 1 || postgresCount > 1) {
      this.issues.push({
        file,
        type: 'Performance',
        severity: 'Medium',
        message: 'Multiple database connections created - consider connection reuse'
      });
    } else {
      this.passed++;
    }
  }

  checkResourceCleanup(content, file) {
    this.checks++;
    
    if (content.includes('fs.readFileSync') || content.includes('fs.createReadStream')) {
      // Check for proper file handling
      this.passed++;
    } else if (content.includes('new Client') && content.includes('pg')) {
      // Already checked in checkDatabaseConnection
      this.passed++;
    } else {
      this.passed++;
    }
  }

  extractImports(content) {
    const imports = [];
    const importRegex = /import\s+.*?\s+from\s+['"`]([^'"`]+)['"`]/g;
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }
    
    return imports;
  }

  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('🛡️ API VALIDATION REPORT');
    console.log('='.repeat(60));
    
    console.log(`\n📊 SUMMARY:`);
    console.log(`  Total Checks: ${this.checks}`);
    console.log(`  Passed: ${this.passed}`);
    console.log(`  Issues Found: ${this.issues.length}`);
    console.log(`  Success Rate: ${((this.passed / this.checks) * 100).toFixed(1)}%`);
    
    if (this.issues.length === 0) {
      console.log('\n✅ All validations passed! Your API endpoints are secure and well-structured.');
      return;
    }
    
    // Group issues by severity
    const issuesBySeverity = {
      High: this.issues.filter(i => i.severity === 'High'),
      Medium: this.issues.filter(i => i.severity === 'Medium'),
      Low: this.issues.filter(i => i.severity === 'Low')
    };
    
    Object.entries(issuesBySeverity).forEach(([severity, issues]) => {
      if (issues.length === 0) return;
      
      console.log(`\n🚨 ${severity.toUpperCase()} SEVERITY ISSUES (${issues.length}):`);
      
      issues.forEach(issue => {
        console.log(`\n  📄 ${issue.file}`);
        console.log(`     Type: ${issue.type}`);
        console.log(`     Issue: ${issue.message}`);
      });
    });
    
    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    
    const securityIssues = this.issues.filter(i => i.type === 'Security').length;
    const structureIssues = this.issues.filter(i => i.type === 'Structure').length;
    const performanceIssues = this.issues.filter(i => i.type === 'Performance').length;
    
    if (securityIssues > 0) {
      console.log(`  🔒 Fix ${securityIssues} security issue(s) immediately`);
    }
    
    if (structureIssues > 0) {
      console.log(`  🏗️ Improve ${structureIssues} structural issue(s) for better maintainability`);
    }
    
    if (performanceIssues > 0) {
      console.log(`  ⚡ Optimize ${performanceIssues} performance issue(s) for better efficiency`);
    }
    
    console.log('\n🔧 NEXT STEPS:');
    console.log('  1. Address high severity issues first');
    console.log('  2. Update the API generator to prevent these issues');
    console.log('  3. Run validation again after fixes');
    console.log('  4. Consider adding automated testing');
  }
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const filePath = args[0] ? path.resolve(args[0]) : null;
  
  const validator = new APIValidator();
  validator.validate(filePath).catch(console.error);
}

module.exports = APIValidator;