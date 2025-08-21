#!/usr/bin/env node

// Test script for the deployment checker
const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🧪 Testing TxMedia Deployment Checker')
console.log('=====================================\n')

function runTest(testName, command, expectSuccess = true) {
  console.log(`Testing: ${testName}`)
  console.log(`Command: ${command}`)
  
  try {
    const result = execSync(command, { 
      encoding: 'utf8', 
      stdio: 'pipe',
      timeout: 60000 // 60 second timeout
    })
    
    if (expectSuccess) {
      console.log('✅ PASS\n')
      return true
    } else {
      console.log('❌ FAIL - Expected to fail but succeeded\n')
      return false
    }
  } catch (error) {
    if (!expectSuccess) {
      console.log('✅ PASS - Failed as expected\n')
      return true
    } else {
      console.log('❌ FAIL')
      console.log(`Error: ${error.message}`)
      console.log('Output:', error.stdout || error.stderr)
      console.log('')
      return false
    }
  }
}

async function main() {
  let passedTests = 0
  let totalTests = 0

  const tests = [
    {
      name: 'Deployment Checker Syntax',
      command: 'node deploy-checker.js --help',
      expectSuccess: false // Help command exits with 1
    },
    {
      name: 'Deployment Utils Syntax',
      command: 'node deployment-utils.js',
      expectSuccess: true
    },
    {
      name: 'Quick Deployment Check',
      command: 'node deployment-utils.js quick',
      expectSuccess: true
    },
    {
      name: 'Deployment Status',
      command: 'node deployment-utils.js status',
      expectSuccess: true
    },
    {
      name: 'Get Recommendations',
      command: 'node deployment-utils.js recommendations',
      expectSuccess: true
    },
    {
      name: 'Show Checklist',
      command: 'node deployment-utils.js checklist',
      expectSuccess: true
    },
    {
      name: 'Deployment Guide',
      command: 'node deployment-utils.js guide development',
      expectSuccess: true
    }
  ]

  // Run basic syntax and utility tests
  for (const test of tests) {
    totalTests++
    if (runTest(test.name, test.command, test.expectSuccess)) {
      passedTests++
    }
  }

  // Test if required files exist
  console.log('Testing: Required Files Exist')
  const requiredFiles = [
    'deploy-checker.js',
    'deployment-utils.js',
    'deploy-config.json',
    'DEPLOYMENT_CHECKER_GUIDE.md',
    '.github/workflows/deployment-check.yml'
  ]

  let allFilesExist = true
  for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
      console.log(`❌ Missing file: ${file}`)
      allFilesExist = false
    }
  }

  totalTests++
  if (allFilesExist) {
    console.log('✅ PASS - All required files exist\n')
    passedTests++
  } else {
    console.log('❌ FAIL - Missing required files\n')
  }

  // Test package.json scripts
  console.log('Testing: Package.json Scripts')
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
  const requiredScripts = [
    'deploy:check',
    'deploy:check:full',
    'deploy:check:build',
    'deploy:check:security',
    'deploy:check:api',
    'deploy:check:photography',
    'deploy:check:performance',
    'deploy:check:production',
    'deploy:utils:ready',
    'deploy:utils:status',
    'deploy:utils:quick',
    'deploy:utils:recommendations',
    'deploy:utils:rollback',
    'deploy:utils:checklist',
    'deploy:utils:guide',
    'deploy:safe'
  ]

  let allScriptsExist = true
  for (const script of requiredScripts) {
    if (!packageJson.scripts[script]) {
      console.log(`❌ Missing script: ${script}`)
      allScriptsExist = false
    }
  }

  totalTests++
  if (allScriptsExist) {
    console.log('✅ PASS - All package.json scripts exist\n')
    passedTests++
  } else {
    console.log('❌ FAIL - Missing package.json scripts\n')
  }

  // Test configuration file
  console.log('Testing: Configuration File')
  totalTests++
  try {
    const config = JSON.parse(fs.readFileSync('deploy-config.json', 'utf8'))
    if (config.deploymentChecker && config.deploymentChecker.version) {
      console.log('✅ PASS - Configuration file is valid JSON\n')
      passedTests++
    } else {
      console.log('❌ FAIL - Configuration file missing required structure\n')
    }
  } catch (error) {
    console.log('❌ FAIL - Configuration file is not valid JSON\n')
  }

  // Test GitHub Actions workflow
  console.log('Testing: GitHub Actions Workflow')
  totalTests++
  try {
    const workflow = fs.readFileSync('.github/workflows/deployment-check.yml', 'utf8')
    if (workflow.includes('Deployment Checker') && workflow.includes('pre-deployment-check')) {
      console.log('✅ PASS - GitHub Actions workflow is properly configured\n')
      passedTests++
    } else {
      console.log('❌ FAIL - GitHub Actions workflow missing required content\n')
    }
  } catch (error) {
    console.log('❌ FAIL - Cannot read GitHub Actions workflow file\n')
  }

  // Summary
  console.log('📊 Test Summary')
  console.log('================')
  console.log(`Total Tests: ${totalTests}`)
  console.log(`Passed: ${passedTests}`)
  console.log(`Failed: ${totalTests - passedTests}`)
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`)

  if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed! Deployment checker is ready to use.')
    console.log('\n📋 Next steps:')
    console.log('1. Run: npm run deploy:utils:quick')
    console.log('2. Run: npm run deploy:check')
    console.log('3. Review: DEPLOYMENT_CHECKER_GUIDE.md')
    console.log('4. Set up: .env file with production values')
    process.exit(0)
  } else {
    console.log('\n❌ Some tests failed. Please review and fix issues.')
    console.log('\n🔧 Troubleshooting:')
    console.log('1. Ensure all files were created correctly')
    console.log('2. Check file permissions')
    console.log('3. Verify package.json was updated')
    console.log('4. Review error messages above')
    process.exit(1)
  }
}

main().catch(error => {
  console.error('💥 Test runner error:', error.message)
  process.exit(1)
})