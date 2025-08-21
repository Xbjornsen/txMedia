#!/usr/bin/env node

/**
 * Multi-file Code Reviewer for txMedia
 * 
 * Reviews multiple files or directories at once
 * 
 * Usage: node review-multiple.js [pattern] [--verbose] [--summary-only]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { CodeReviewer } = require('./review-code.js');

class MultiFileReviewer {
  constructor() {
    this.allResults = [];
    this.verbose = false;
    this.summaryOnly = false;
  }

  async reviewPattern(pattern) {
    const files = this.findFiles(pattern);
    
    if (files.length === 0) {
      console.log(`❌ No files found matching pattern: ${pattern}`);
      return;
    }

    console.log(`🔍 Found ${files.length} files to review...\n`);

    let totalErrors = 0;
    let totalWarnings = 0;
    let totalSuggestions = 0;
    let filesWithIssues = 0;

    for (const file of files) {
      if (this.verbose && !this.summaryOnly) {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`📄 Reviewing: ${path.relative(process.cwd(), file)}`);
        console.log('='.repeat(60));
      }

      const reviewer = new CodeReviewer();
      reviewer.verbose = this.verbose && !this.summaryOnly;
      
      const report = await reviewer.reviewFile(file);
      this.allResults.push({
        file: path.relative(process.cwd(), file),
        report
      });

      totalErrors += report.summary.errors;
      totalWarnings += report.summary.warnings;
      totalSuggestions += report.summary.suggestions;
      
      if (report.summary.totalIssues > 0) {
        filesWithIssues++;
      }

      if (!this.summaryOnly) {
        if (report.summary.totalIssues > 0) {
          console.log(`❌ ${path.relative(process.cwd(), file)}: ${report.summary.errors} errors, ${report.summary.warnings} warnings`);
        } else {
          console.log(`✅ ${path.relative(process.cwd(), file)}: No issues`);
        }
      }
    }

    this.printSummary(files.length, totalErrors, totalWarnings, totalSuggestions, filesWithIssues);
    this.printDetailedResults();

    return totalErrors > 0 ? 1 : 0;
  }

  findFiles(pattern) {
    if (fs.existsSync(pattern) && fs.statSync(pattern).isFile()) {
      return [pattern];
    }

    if (fs.existsSync(pattern) && fs.statSync(pattern).isDirectory()) {
      return this.findFilesInDirectory(pattern);
    }

    // Use glob pattern
    try {
      const output = execSync(`npx glob "${pattern}"`, { encoding: 'utf8', cwd: process.cwd() });
      return output.trim().split('\n').filter(f => f.length > 0);
    } catch (error) {
      console.warn(`Warning: Could not use glob pattern: ${error.message}`);
      return [];
    }
  }

  findFilesInDirectory(dir) {
    const files = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory() && !this.shouldSkipDirectory(entry.name)) {
        files.push(...this.findFilesInDirectory(fullPath));
      } else if (entry.isFile() && this.isCodeFile(entry.name)) {
        files.push(fullPath);
      }
    }

    return files;
  }

  shouldSkipDirectory(name) {
    const skipDirs = ['node_modules', '.git', '.next', 'dist', 'build', 'coverage'];
    return skipDirs.includes(name);
  }

  isCodeFile(filename) {
    const codeExtensions = ['.ts', '.tsx', '.js', '.jsx', '.json'];
    return codeExtensions.includes(path.extname(filename));
  }

  printSummary(totalFiles, totalErrors, totalWarnings, totalSuggestions, filesWithIssues) {
    console.log('\n' + '='.repeat(80));
    console.log('📊 MULTI-FILE REVIEW SUMMARY');
    console.log('='.repeat(80));
    
    console.log(`\n📈 STATISTICS:`);
    console.log(`   Files reviewed: ${totalFiles}`);
    console.log(`   Files with issues: ${filesWithIssues}`);
    console.log(`   Clean files: ${totalFiles - filesWithIssues}`);
    
    console.log(`\n🎯 ISSUE BREAKDOWN:`);
    console.log(`   Total errors: ${totalErrors}`);
    console.log(`   Total warnings: ${totalWarnings}`);
    console.log(`   Total suggestions: ${totalSuggestions}`);
    console.log(`   Total issues: ${totalErrors + totalWarnings}`);

    const successRate = ((totalFiles - filesWithIssues) / totalFiles * 100).toFixed(1);
    console.log(`\n📋 OVERALL HEALTH:`);
    console.log(`   Success rate: ${successRate}%`);
    
    if (totalErrors === 0 && totalWarnings === 0) {
      console.log(`   Status: ✅ Excellent! All files passed review.`);
    } else if (totalErrors === 0) {
      console.log(`   Status: 👍 Good! No errors found, but consider addressing warnings.`);
    } else {
      console.log(`   Status: 🔧 Needs attention. ${totalErrors} errors require fixing.`);
    }
  }

  printDetailedResults() {
    const problemFiles = this.allResults.filter(r => r.report.summary.totalIssues > 0);
    
    if (problemFiles.length === 0) {
      return;
    }

    console.log(`\n📝 DETAILED ISSUES BY FILE:`);
    console.log('='.repeat(80));

    problemFiles
      .sort((a, b) => b.report.summary.errors - a.report.summary.errors)
      .forEach(result => {
        const { file, report } = result;
        
        console.log(`\n📄 ${file}`);
        console.log(`   Errors: ${report.summary.errors}, Warnings: ${report.summary.warnings}, Suggestions: ${report.summary.suggestions}`);
        
        // Show top 3 errors
        if (report.details.errors.length > 0) {
          console.log(`   Top errors:`);
          report.details.errors.slice(0, 3).forEach((error, i) => {
            console.log(`     ${i + 1}. ${error.message}`);
          });
          if (report.details.errors.length > 3) {
            console.log(`     ... and ${report.details.errors.length - 3} more`);
          }
        }
      });
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
📋 txMedia Multi-File Code Reviewer

Usage: node review-multiple.js [pattern] [options]

Patterns:
  src/                    Review all files in src directory
  src/pages/api/          Review all API routes
  src/components/         Review all components
  "src/**/*.ts"          Review all TypeScript files
  file.ts                Review single file

Options:
  --verbose, -v          Show detailed output for each file
  --summary-only, -s     Show only final summary
  --help, -h            Show this help message

Examples:
  node review-multiple.js src/pages/api/
  node review-multiple.js "src/**/*.tsx" --verbose
  node review-multiple.js src/components/ --summary-only

The script will review all matching files and provide:
  • Individual file results
  • Aggregated statistics
  • Detailed issue breakdown
  • Overall codebase health assessment
`);
    process.exit(0);
  }

  const pattern = args[0];
  const verbose = args.includes('--verbose') || args.includes('-v');
  const summaryOnly = args.includes('--summary-only') || args.includes('-s');
  
  const reviewer = new MultiFileReviewer();
  reviewer.verbose = verbose;
  reviewer.summaryOnly = summaryOnly;
  
  const exitCode = await reviewer.reviewPattern(pattern);
  process.exit(exitCode);
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });
}

module.exports = { MultiFileReviewer };