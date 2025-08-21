# txMedia Database Schema Management Agent

A comprehensive Node.js tool for managing database schema, validation, and health monitoring for the txMedia photography portfolio platform.

## Features

### 🔍 Schema Management
- **Validation**: Comprehensive schema and data integrity validation
- **Migration Generation**: Automated Prisma migration creation and application
- **Relationship Analysis**: Deep analysis of User, Gallery, GalleryImage, and Download model relationships
- **Foreign Key Validation**: Ensures all relationships are properly maintained

### 📊 Data Validation
- **Integrity Checks**: Validates data consistency across all tables
- **Business Rules**: Enforces photography-specific business logic
- **Orphaned Records**: Identifies and optionally cleans up orphaned data
- **Download Limits**: Monitors gallery download usage against limits
- **Password Security**: Validates gallery password hashing consistency

### 🏥 Health Monitoring
- **Connection Testing**: Database connectivity and performance monitoring
- **Query Analysis**: Performance analysis of common query patterns
- **Storage Monitoring**: Database size and growth pattern analysis
- **Index Optimization**: Suggests and monitors database indexes

### 🛠️ Development Utilities
- **Test Data Generation**: Creates realistic test data for development
- **Backup & Restore**: Database backup creation and data export
- **Reset Utilities**: Safe database reset for testing environments
- **SQL Query Generation**: Common operation query templates

### 📸 Photography App Specific
- **Gallery Validation**: Ensures gallery passwords and access controls
- **Image Metadata**: Validates image file paths and metadata consistency
- **Download Tracking**: Monitors download accuracy and client access patterns
- **Client Access**: Validates client gallery access patterns

### 🚀 Migration Assistance
- **Environment Migration**: Development to production migration support
- **Supabase Integration**: Validates Supabase vs local PostgreSQL configurations
- **Data Import/Export**: Comprehensive data migration scripts
- **Schema Comparison**: Tools for comparing schema differences

## Installation & Setup

The database agent is already integrated into your txMedia project. No additional installation required.

### Prerequisites
- Node.js 18+
- PostgreSQL or Supabase database
- Prisma configured and connected

## Usage

### Command Line Interface

#### Basic Commands
```bash
# Validate schema and data integrity
npm run db:validate
# or
node db-agent.js validate

# Database health check
npm run db:health
# or 
node db-agent.js health

# Create database backup
npm run db:backup
# or
node db-agent.js backup

# Generate test data for development
npm run db:test-data
# or
node db-agent.js test-data

# Analyze relationships and performance
npm run db:analyze
# or
node db-agent.js analyze

# Clean up orphaned records
npm run db:cleanup
# or
node db-agent.js cleanup

# Export data for migration
npm run db:export
# or
node db-agent.js export
```

#### Advanced Commands
```bash
# Generate and apply migrations
node db-agent.js migrate

# Reset database (development only)
node db-agent.js reset
```

### Programmatic Usage

```javascript
const {
  validateSchema,
  performHealthCheck,
  generateTestData,
  createBackup,
  analyzeRelationships
} = require('./db-agent')

// Validate database schema
await validateSchema()

// Perform health check
await performHealthCheck()

// Generate test data
await generateTestData()

// Create backup
const backupFile = await createBackup()

// Analyze relationships
await analyzeRelationships()
```

## Commands Reference

### `validate` - Schema Validation
Performs comprehensive validation including:
- Foreign key relationship integrity
- Data consistency checks
- Business rule validation
- Orphaned record detection
- Gallery password validation
- Download limit compliance

**Example Output:**
```
🔍 Schema Validation
==================================================
ℹ️  Validating foreign key relationships...
✅ All foreign key relationships are valid
ℹ️  Validating data integrity...
✅ Data integrity validation passed
ℹ️  Checking for orphaned records...
✅ No orphaned records found
ℹ️  Validating business rules...
✅ All business rules validation passed
✅ Schema validation completed successfully
```

### `health` - Database Health Check
Monitors database performance and health:
- Connection response times
- Query performance analysis
- Storage usage monitoring
- Index effectiveness
- Common query patterns

**Example Output:**
```
🔍 Database Health Check
==================================================
=== CONNECTION ===
Status: healthy
Response Time: 45ms

=== PERFORMANCE ===
Average Query Time: 23.50ms
Status: good
  User count: 12ms
  Gallery count: 15ms
  Image count: 28ms
  Gallery with images: 39ms

=== STORAGE ===
Total Database Size: 156.7 MB

=== QUERY ANALYSIS ===
Gallery detail with images: 45ms (read)
Recent downloads with relations: 67ms (read)
Gallery statistics aggregation: 123ms (analytics)
```

### `backup` - Create Database Backup
Creates comprehensive JSON backups:
- All user data with relationships
- Complete gallery structures
- Image metadata and relationships
- Download and favorite records
- Access logs and analytics

**Backup Location:** `./backups/txmedia-backup-[timestamp].json`

### `test-data` - Generate Test Data
Creates realistic test data for development:
- Test user accounts
- Sample galleries with various event types
- Test images with realistic metadata
- Download and favorite records
- Access logs for testing

**Configuration:**
```javascript
const CONFIG = {
  testDataCount: {
    galleries: 5,
    imagesPerGallery: 20,
    downloadsPerGallery: 10,
    favoritesPerGallery: 5
  }
}
```

### `analyze` - Relationship Analysis
Provides detailed analysis of:
- User to Gallery relationships
- Gallery to Image statistics
- Download usage patterns
- Storage utilization
- Popular galleries and images

**Example Output:**
```
🔍 Relationship Analysis
==================================================
User → Gallery relationships:
  Xavier Bjornsen (xavier@txmedia.com): 12 galleries (10 active)
  Test User (test@txmedia.com): 5 galleries (5 active)

Gallery → Image relationships (top 10):
  Wedding Gallery 2024: 156 images, 2.3 GB total
  Portrait Session: 87 images, 1.1 GB total

Download usage patterns (top 10):
  Wedding Gallery 2024: 45/50 (90.00% used)
  Corporate Event: 23/30 (76.67% used)
```

### `cleanup` - Clean Orphaned Records
Safely removes orphaned records:
- Accounts without users
- Sessions without users
- Favorites without galleries/images
- Downloads without galleries/images
- Access logs without galleries

### `export` - Data Export
Exports data for migration:
- Separate JSON files per table
- Timestamped exports
- Migration-ready format
- Relationship preservation

**Export Location:** `./exports/[table]-[timestamp].json`

## Configuration

The agent includes several configuration options:

```javascript
const CONFIG = {
  backupDir: './backups',
  testDataCount: {
    galleries: 5,
    imagesPerGallery: 20,
    downloadsPerGallery: 10,
    favoritesPerGallery: 5
  },
  healthThresholds: {
    maxQueryTime: 1000, // ms
    maxTableSize: 1000000, // rows
    minDiskSpace: 1048576 // 1GB in KB
  }
}
```

## Environment Support

### Development
- Full feature access
- Test data generation
- Database reset capabilities
- Comprehensive logging

### Production
- Read-only operations by default
- Backup and export capabilities
- Health monitoring
- Migration assistance
- Database reset disabled for safety

## Database Support

### Primary Support
- **PostgreSQL** - Full feature support including advanced analytics
- **Supabase** - Complete integration with cloud PostgreSQL features

### Limited Support
- **SQLite** - Basic operations (some advanced features unavailable)

## Security Features

- **Production Safety**: Database reset disabled in production
- **Password Validation**: Ensures proper bcrypt hashing
- **Access Control**: Validates gallery access patterns
- **Data Integrity**: Comprehensive validation before operations

## Error Handling

The agent includes comprehensive error handling:
- Graceful database disconnection
- Detailed error messages with solutions
- Rollback capabilities for failed operations
- Connection retry logic

## Integration with txMedia

### Gallery Management
- Validates gallery password security
- Monitors download limits and usage
- Tracks client access patterns
- Ensures image file consistency

### User Management
- Validates NextAuth integration
- Monitors user account relationships
- Tracks user gallery ownership

### Image Processing
- Validates image metadata
- Checks file path consistency
- Monitors storage usage
- Tracks image relationships

### Download Tracking
- Validates download records
- Monitors usage against limits
- Tracks client IP and user agents
- Ensures download security

## Troubleshooting

### Common Issues

**Database Connection Failed**
```bash
npm run db:health
# Check DATABASE_URL in .env
# Ensure database is running
# Verify network connectivity
```

**Schema Validation Errors**
```bash
npm run db:validate
# Review foreign key relationships
# Check for orphaned records
# Validate business rules
```

**Performance Issues**
```bash
npm run db:analyze
# Review query patterns
# Check index usage
# Monitor table sizes
```

### Getting Help

1. Run health check: `npm run db:health`
2. Validate schema: `npm run db:validate`
3. Analyze relationships: `npm run db:analyze`
4. Check logs for detailed error messages
5. Review Prisma schema for relationship issues

## Contributing

To extend the database agent:

1. Add new commands to the main switch statement
2. Implement corresponding functions
3. Update the help text and documentation
4. Add npm scripts to package.json
5. Test in development environment

## License

Part of the txMedia photography portfolio platform.