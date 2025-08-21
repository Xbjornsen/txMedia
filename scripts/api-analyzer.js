#!/usr/bin/env node

/**
 * API Pattern Analyzer for TxMedia
 * 
 * Analyzes existing API endpoints to understand patterns and provide insights
 * for the API generator.
 */

const fs = require('fs');
const path = require('path');

class APIAnalyzer {
  constructor() {
    this.apiDir = path.join(__dirname, '..', 'src', 'pages', 'api');
    this.patterns = {
      authentication: [],
      database: [],
      methods: [],
      errorHandling: [],
      imports: []
    };
  }

  async analyze() {
    console.log('🔍 Analyzing existing API patterns...\n');
    
    const files = this.getAllApiFiles();
    
    for (const file of files) {
      await this.analyzeFile(file);
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

  analyzeFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(this.apiDir, filePath);
    
    console.log(`📄 Analyzing: ${relativePath}`);
    
    // Analyze authentication patterns
    if (content.includes('getSession')) {
      this.patterns.authentication.push({
        file: relativePath,
        type: 'NextAuth',
        pattern: 'getSession({ req })'
      });
    }
    
    if (content.includes('bcrypt.compare')) {
      this.patterns.authentication.push({
        file: relativePath,
        type: 'Password Verification',
        pattern: 'bcrypt.compare(password, hash)'
      });
    }
    
    // Analyze database patterns
    if (content.includes('PrismaClient')) {
      this.patterns.database.push({
        file: relativePath,
        type: 'Prisma ORM',
        operations: this.extractPrismaOperations(content)
      });
    }
    
    if (content.includes('new Client') && content.includes('pg')) {
      this.patterns.database.push({
        file: relativePath,
        type: 'Direct PostgreSQL',
        operations: this.extractSqlOperations(content)
      });
    }
    
    // Analyze HTTP methods
    const methods = this.extractHttpMethods(content);
    if (methods.length > 0) {
      this.patterns.methods.push({
        file: relativePath,
        methods: methods
      });
    }
    
    // Analyze imports
    const imports = this.extractImports(content);
    this.patterns.imports.push({
      file: relativePath,
      imports: imports
    });
  }

  extractPrismaOperations(content) {
    const operations = [];
    const prismaRegex = /prisma\.(\w+)\.(\w+)/g;
    let match;
    
    while ((match = prismaRegex.exec(content)) !== null) {
      operations.push(`${match[1]}.${match[2]}`);
    }
    
    return [...new Set(operations)];
  }

  extractSqlOperations(content) {
    const operations = [];
    const sqlRegex = /(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER)\s+/gi;
    let match;
    
    while ((match = sqlRegex.exec(content)) !== null) {
      operations.push(match[1].toUpperCase());
    }
    
    return [...new Set(operations)];
  }

  extractHttpMethods(content) {
    const methods = [];
    const methodRegex = /req\.method\s*[=!]=\s*['"`](\w+)['"`]/g;
    let match;
    
    while ((match = methodRegex.exec(content)) !== null) {
      methods.push(match[1]);
    }
    
    return [...new Set(methods)];
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
    console.log('📊 API PATTERN ANALYSIS REPORT');
    console.log('='.repeat(60));
    
    // Authentication patterns
    console.log('\n🔐 AUTHENTICATION PATTERNS:');
    const authTypes = {};
    this.patterns.authentication.forEach(auth => {
      authTypes[auth.type] = (authTypes[auth.type] || 0) + 1;
    });
    
    Object.entries(authTypes).forEach(([type, count]) => {
      console.log(`  ${type}: ${count} endpoints`);
    });
    
    // Database patterns
    console.log('\n🗄️ DATABASE PATTERNS:');
    const dbTypes = {};
    this.patterns.database.forEach(db => {
      dbTypes[db.type] = (dbTypes[db.type] || 0) + 1;
    });
    
    Object.entries(dbTypes).forEach(([type, count]) => {
      console.log(`  ${type}: ${count} endpoints`);
    });
    
    // Most common Prisma operations
    if (this.patterns.database.some(db => db.type === 'Prisma ORM')) {
      console.log('\n  📋 Common Prisma Operations:');
      const prismaOps = {};
      this.patterns.database
        .filter(db => db.type === 'Prisma ORM')
        .forEach(db => {
          db.operations.forEach(op => {
            prismaOps[op] = (prismaOps[op] || 0) + 1;
          });
        });
      
      Object.entries(prismaOps)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .forEach(([op, count]) => {
          console.log(`    ${op}: ${count} uses`);
        });
    }
    
    // HTTP methods
    console.log('\n🌐 HTTP METHODS:');
    const allMethods = {};
    this.patterns.methods.forEach(endpoint => {
      endpoint.methods.forEach(method => {
        allMethods[method] = (allMethods[method] || 0) + 1;
      });
    });
    
    Object.entries(allMethods)
      .sort(([,a], [,b]) => b - a)
      .forEach(([method, count]) => {
        console.log(`  ${method}: ${count} endpoints`);
      });
    
    // Common imports
    console.log('\n📦 COMMON IMPORTS:');
    const allImports = {};
    this.patterns.imports.forEach(endpoint => {
      endpoint.imports.forEach(imp => {
        allImports[imp] = (allImports[imp] || 0) + 1;
      });
    });
    
    Object.entries(allImports)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 15)
      .forEach(([imp, count]) => {
        console.log(`  ${imp}: ${count} files`);
      });
    
    // Recommendations
    console.log('\n💡 RECOMMENDATIONS FOR API GENERATOR:');
    
    if (authTypes['NextAuth'] && authTypes['Password Verification']) {
      console.log('  ✅ Support both NextAuth and simple authentication patterns');
    }
    
    if (dbTypes['Prisma ORM'] && dbTypes['Direct PostgreSQL']) {
      console.log('  ✅ Support both Prisma ORM and direct PostgreSQL patterns');
    }
    
    if (allMethods['GET'] > allMethods['POST']) {
      console.log('  📈 Focus on GET endpoints - most common pattern');
    }
    
    if (allImports['bcryptjs'] || allImports['bcrypt']) {
      console.log('  🔒 Include bcrypt for password handling');
    }
    
    if (allImports['fs'] && allImports['path']) {
      console.log('  📁 Include file system operations for uploads/downloads');
    }
    
    console.log('\n✨ Analysis complete! Use these insights to improve the API generator.');
  }
}

// CLI execution
if (require.main === module) {
  const analyzer = new APIAnalyzer();
  analyzer.analyze().catch(console.error);
}

module.exports = APIAnalyzer;