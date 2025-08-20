#!/usr/bin/env node

// Deployment utilities for TxMedia project
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

class DeploymentUtils {
  constructor() {
    this.projectRoot = process.cwd()
    this.configPath = path.join(this.projectRoot, 'deploy-config.json')
    this.reportPath = path.join(this.projectRoot, 'deployment-report.json')
  }

  // Load deployment configuration
  loadConfig() {
    try {
      if (fs.existsSync(this.configPath)) {
        return JSON.parse(fs.readFileSync(this.configPath, 'utf8'))
      }
      return this.getDefaultConfig()
    } catch (error) {
      console.error('Error loading deployment config:', error.message)
      return this.getDefaultConfig()
    }
  }

  getDefaultConfig() {
    return {
      deploymentChecker: {
        version: "1.0.0",
        environments: {
          development: {
            skipChecks: ["production-test"],
            allowWarnings: true
          }
        }
      }
    }
  }

  // Load latest deployment report
  loadReport() {
    try {
      if (fs.existsSync(this.reportPath)) {
        return JSON.parse(fs.readFileSync(this.reportPath, 'utf8'))
      }
      return null
    } catch (error) {
      console.error('Error loading deployment report:', error.message)
      return null
    }
  }

  // Check if deployment is ready based on latest report
  isDeploymentReady() {
    const report = this.loadReport()
    if (!report) {
      console.log('❌ No deployment report found. Run deployment checker first.')
      return false
    }

    const hasErrors = report.errors && report.errors.length > 0
    const summary = report.summary

    if (hasErrors) {
      console.log('❌ Deployment blocked due to errors')
      return false
    }

    if (summary && summary.isDeploymentReady === false) {
      console.log('❌ Deployment not ready according to latest report')
      return false
    }

    console.log('✅ Deployment ready according to latest report')
    return true
  }

  // Generate deployment status badge
  generateStatusBadge() {
    const report = this.loadReport()
    if (!report) return 'unknown'

    const hasErrors = report.errors && report.errors.length > 0
    const hasWarnings = report.warnings && report.warnings.length > 0

    if (hasErrors) return 'failing'
    if (hasWarnings) return 'warning'
    return 'passing'
  }

  // Get deployment recommendations
  getRecommendations() {
    const report = this.loadReport()
    if (!report) {
      return ['Run deployment checker to get recommendations']
    }

    const recommendations = []

    // Error-based recommendations
    if (report.errors && report.errors.length > 0) {
      recommendations.push('🚨 Critical: Fix all deployment errors before proceeding')
      report.errors.forEach(error => {
        recommendations.push(`   • ${error.message}`)
      })
    }

    // Warning-based recommendations
    if (report.warnings && report.warnings.length > 0) {
      recommendations.push('⚠️  Warnings to address:')
      report.warnings.forEach(warning => {
        recommendations.push(`   • ${warning.message}`)
      })
    }

    // Performance recommendations
    if (report.performance) {
      if (report.performance.totalBundleSize > 1000) {
        recommendations.push('📦 Consider optimizing bundle size (currently ' + 
          report.performance.totalBundleSize.toFixed(1) + 'kB)')
      }

      if (report.performance.largeImages && report.performance.largeImages.length > 0) {
        recommendations.push('🖼️  Optimize ' + report.performance.largeImages.length + ' large images')
      }
    }

    // Security recommendations
    if (report.security && report.security.score < 80) {
      recommendations.push('🔒 Improve security configuration (current score: ' + 
        report.security.score + '/100)')
    }

    // General recommendations
    if (recommendations.length === 0) {
      recommendations.push('✅ All checks passed! Ready for deployment')
      recommendations.push('📋 Post-deployment: Monitor logs and performance')
    }

    return recommendations
  }

  // Quick deployment readiness check
  quickCheck() {
    console.log('🚀 Quick Deployment Readiness Check')
    console.log('====================================\n')

    // Check if required files exist
    const requiredFiles = [
      'package.json',
      '.env',
      'next.config.ts',
      'prisma/schema.prisma'
    ]

    let missingFiles = []
    for (const file of requiredFiles) {
      if (!fs.existsSync(path.join(this.projectRoot, file))) {
        missingFiles.push(file)
      }
    }

    if (missingFiles.length > 0) {
      console.log('❌ Missing required files:')
      missingFiles.forEach(file => console.log(`   • ${file}`))
      return false
    }

    // Check environment variables
    const envPath = path.join(this.projectRoot, '.env')
    const envContent = fs.readFileSync(envPath, 'utf8')
    
    const requiredVars = [
      'NEXTAUTH_SECRET',
      'DATABASE_URL',
      'ADMIN_EMAIL',
      'ADMIN_PASSWORD'
    ]

    let missingVars = []
    for (const varName of requiredVars) {
      if (!envContent.includes(`${varName}=`) || 
          envContent.includes(`${varName}=your-`) ||
          envContent.includes(`${varName}=change-me`)) {
        missingVars.push(varName)
      }
    }

    if (missingVars.length > 0) {
      console.log('❌ Missing or placeholder environment variables:')
      missingVars.forEach(varName => console.log(`   • ${varName}`))
      return false
    }

    // Check if dependencies are installed
    if (!fs.existsSync(path.join(this.projectRoot, 'node_modules'))) {
      console.log('❌ Dependencies not installed. Run: npm install')
      return false
    }

    // Check if Prisma client is generated
    if (!fs.existsSync(path.join(this.projectRoot, 'node_modules/.prisma/client'))) {
      console.log('❌ Prisma client not generated. Run: npx prisma generate')
      return false
    }

    console.log('✅ Quick check passed!')
    console.log('📋 Run full deployment checker for comprehensive validation')
    return true
  }

  // Rollback recommendations
  getRollbackPlan() {
    const report = this.loadReport()
    
    console.log('🔄 Deployment Rollback Plan')
    console.log('============================\n')

    if (!report || !report.errors || report.errors.length === 0) {
      console.log('ℹ️  No rollback needed - no critical errors detected')
      return
    }

    console.log('🚨 Critical errors detected - rollback recommended')
    console.log('\n📋 Rollback Steps:')
    console.log('1. Stop current deployment process')
    console.log('2. Revert to previous stable version')
    console.log('3. Verify database integrity')
    console.log('4. Check service health')
    console.log('5. Notify stakeholders')

    console.log('\n🔍 Issues to resolve before retry:')
    report.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error.message}`)
    })

    console.log('\n⚡ Quick rollback commands:')
    console.log('   git log --oneline -10  # Find last stable commit')
    console.log('   git checkout <stable-commit>')
    console.log('   vercel --prod  # Redeploy stable version')
  }

  // Generate deployment checklist
  generateChecklist() {
    console.log('📋 Pre-Deployment Checklist')
    console.log('=============================\n')

    const checklist = [
      { task: 'Environment variables configured', command: 'Check .env file' },
      { task: 'Dependencies installed', command: 'npm install' },
      { task: 'TypeScript compilation', command: 'npx tsc --noEmit' },
      { task: 'ESLint passing', command: 'npm run lint' },
      { task: 'Build successful', command: 'npm run build' },
      { task: 'Database schema valid', command: 'npx prisma validate' },
      { task: 'API endpoints working', command: 'npm run deploy:check:api' },
      { task: 'Security checks passing', command: 'npm run deploy:check:security' },
      { task: 'Performance optimized', command: 'npm run deploy:check:performance' },
      { task: 'Photography features working', command: 'npm run deploy:check:photography' }
    ]

    checklist.forEach((item, index) => {
      console.log(`${index + 1}. [ ] ${item.task}`)
      console.log(`       ${item.command}`)
    })

    console.log('\n🚀 Final deployment:')
    console.log('     npm run deploy:check:full')
    console.log('     vercel --prod')
  }

  // Environment-specific deployment guide
  getDeploymentGuide(environment = 'production') {
    console.log(`🌐 ${environment.toUpperCase()} Deployment Guide`)
    console.log('='.repeat(environment.length + 20) + '\n')

    const guides = {
      development: [
        '1. Create .env file with development settings',
        '2. Run: npm install',
        '3. Run: npx prisma generate',
        '4. Run: npx prisma db push',
        '5. Run: npm run dev',
        '6. Test core functionality'
      ],
      staging: [
        '1. Ensure staging environment variables are set',
        '2. Run full deployment checker: npm run deploy:check:full',
        '3. Deploy to staging: vercel',
        '4. Run database migrations: npx prisma migrate deploy',
        '5. Test all user flows',
        '6. Performance testing',
        '7. Security validation'
      ],
      production: [
        '1. Final security review',
        '2. Backup production database',
        '3. Run comprehensive checks: npm run deploy:check:full',
        '4. Deploy: vercel --prod',
        '5. Run production migrations: npx prisma migrate deploy',
        '6. Smoke test critical paths',
        '7. Monitor error logs',
        '8. Verify performance metrics',
        '9. Update documentation',
        '10. Notify stakeholders'
      ]
    }

    const steps = guides[environment] || guides.development

    steps.forEach((step, index) => {
      console.log(step)
    })

    console.log('\n💡 Pro Tips:')
    console.log('• Always test in staging first')
    console.log('• Have rollback plan ready')
    console.log('• Monitor logs during deployment')
    console.log('• Keep stakeholders informed')
  }
}

// CLI interface
function main() {
  const args = process.argv.slice(2)
  const command = args[0]
  const utils = new DeploymentUtils()

  switch (command) {
    case 'ready':
      const ready = utils.isDeploymentReady()
      process.exit(ready ? 0 : 1)
      break

    case 'status':
      const status = utils.generateStatusBadge()
      console.log(status)
      break

    case 'recommendations':
      const recommendations = utils.getRecommendations()
      recommendations.forEach(rec => console.log(rec))
      break

    case 'quick':
      const quickResult = utils.quickCheck()
      process.exit(quickResult ? 0 : 1)
      break

    case 'rollback':
      utils.getRollbackPlan()
      break

    case 'checklist':
      utils.generateChecklist()
      break

    case 'guide':
      const env = args[1] || 'production'
      utils.getDeploymentGuide(env)
      break

    default:
      console.log('🚀 TxMedia Deployment Utils')
      console.log('============================\n')
      console.log('Available commands:')
      console.log('  ready          - Check if deployment is ready')
      console.log('  status         - Get deployment status badge')
      console.log('  recommendations- Get deployment recommendations')
      console.log('  quick          - Quick readiness check')
      console.log('  rollback       - Get rollback plan')
      console.log('  checklist      - Show deployment checklist')
      console.log('  guide [env]    - Environment-specific deployment guide')
      console.log('\nExamples:')
      console.log('  node deployment-utils.js ready')
      console.log('  node deployment-utils.js guide staging')
      console.log('  node deployment-utils.js recommendations')
  }
}

if (require.main === module) {
  main()
}

module.exports = DeploymentUtils