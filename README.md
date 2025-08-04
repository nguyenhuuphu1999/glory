# Glory - QR Order Backend

A NestJS backend application for managing locations and assets with PostgreSQL and TypeORM. This system synchronizes asset data from BR Company API and manages location-based asset tracking.

## Features

- **Location Management**: CRUD operations for locations with organization tracking
- **Asset Management**: Comprehensive asset tracking with location relationships
- **BR Company Integration**: Automated asset synchronization from external API
- **Scheduled Tasks**: Daily sync jobs and health monitoring
- **Database Relations**: PostgreSQL with TypeORM for robust data management
- **Clean Architecture**: Repository pattern with proper separation of concerns

## Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Scheduling**: @nestjs/schedule
- **HTTP Client**: @nestjs/axios
- **Language**: TypeScript

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- pnpm (recommended) or npm

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd glory
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your database credentials:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=your_password
   DB_NAME=glory
   NODE_ENV=development
   PORT=3000
   ```

4. **Database Setup**
   
   Create the database:
   ```sql
   CREATE DATABASE qrorder;
   ```

5. **Start the application**
   ```bash
   # Development mode
   pnpm run start:dev
   
   # Production mode
   pnpm run build
   pnpm run start:prod
   ```

## Database Schema

### Locations Table
- `id` (Primary Key)
- `location_id` (Unique identifier)
- `location_name` (Location name)
- `organization` (Organization code: PNS, PLJ, etc.)
- `status` (active/inactive)
- `created_at`, `updated_at`

### Assets Table
- `id` (Primary Key)
- `type` (Asset type)
- `serial` (Unique serial number)
- `description` (Asset description)
- `location_id` (Foreign key to locations)
- `status` (active/inactive/maintenance/retired)
- `created_at`, `updated_at`

## API Endpoints
 
### Asset Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/assets/sync` | Sync assets from BR Company | 

## Asset Synchronization

The system automatically syncs assets from BR Company API with the following logic:

### Sync Rules
- **Daily Sync**: Runs every day at 3 AM
- **Active Assets Only**: Only syncs assets with `status = 'actived'` from BR Company
- **Past Assets Only**: Only syncs assets created in the past (any time before now)
- **Active Locations Only**: Only syncs assets for locations with `status = 'actived'`
- **Location Existence**: Only syncs assets when the corresponding location exists in the database
- **Duplicate Prevention**: Skips assets that already exist (based on serial number)
- **Status Mapping**: Maps BR Company status to internal asset status

### Synchronization Criteria
Assets are synchronized only when **ALL** of the following conditions are met:

1. ✅ **Asset status is active** (`STATUS_BR_ASSET_ENUM.ACTIVED`)
2. ✅ **Asset was created in the past** (any time before current timestamp)
3. ✅ **Location exists in the database** (matching `location_id`)
4. ✅ **Location is active** (`status === 'actived'`)
5. ✅ **Asset doesn't already exist** (based on serial number)

### Manual Sync
You can trigger manual sync using:
```bash
curl -X POST http://localhost:3000/assets/sync
```

### Sync Response
```json
{
  "total": 50,
  "active": 45,
  "synced": 10,
  "skipped": 35,
  "errors": 0,
  "details": {
    "already_exists": 20,
    "location_not_found": 10,
    "location_inactive": 5
  }
}
```

### Performance Features
- **Batch Processing**: Processes assets in chunks of 10 for optimal performance
- **Parallel Processing**: Uses Promise.allSettled for concurrent asset processing
- **Early Filtering**: Filters active assets before database operations
- **Comprehensive Logging**: Detailed logs for monitoring and debugging

## Scheduled Tasks

### Location Schedules
- **Daily Stats** (2 AM): Log location statistics
- **Hourly Health Check**: Monitor inactive locations

### Asset Schedules
- **Daily Sync** (3 AM): Sync assets from BR Company
- **Statistics** (Every 6 hours): Log asset statistics
- **Location Validation** (Every 2 hours): Validate asset locations
- **Weekly Report** (Monday 8 AM): Comprehensive asset report

## Sample Data

### Seed Locations
```bash
curl -X POST http://localhost:3000/locations/seed
```

This creates the following sample locations:
- Da Nang (PNS) - Active
- Ha Noi (PNS) - Inactive  
- Ho Chi Minh (PNS) - Active
- Nha Trang (PLJ) - Active
- Can Tho (PLJ) - Active

## Development

### Project Structure
```
src/
├── location/
│   ├── entities/          # TypeORM entities
│   ├── interfaces/        # TypeScript interfaces
│   ├── repositories/      # Data access layer
│   ├── schedules/         # Cron jobs
│   ├── seeders/          # Database seeders
│   ├── location.controller.ts
│   ├── location.service.ts
│   └── location.module.ts
├── asset/
│   ├── entities/
│   ├── interfaces/
│   ├── repositories/
│   ├── schedules/
│   ├── asset.controller.ts
│   ├── asset.service.ts
│   └── asset.module.ts
└── app.module.ts
```

### Running Tests
```bash
# Unit tests
pnpm run test

# E2E tests
pnpm run test:e2e

# Test coverage
pnpm run test:cov
```

### Code Quality
```bash
# Linting
pnpm run lint

# Formatting
pnpm run format
```

## Production Deployment

1. **Environment Variables**
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5440
   DB_USERNAME=postgres
   DB_PASSWORD=password
   DB_NAME=glory

   # Application Configuration
   NODE_ENV=development
   PORT=3002

   # BR Company API Configuration
   BR_API_URL=https://669ce22d15704bb0e304842d.mockapi.io/assets
   BR_API_TIMEOUT=10000
   ```

2. **Database Migration**
   - Set `synchronize: false` in production
   - Use proper database migrations

3. **Build and Deploy**
   ```bash
   pnpm run build
   pnpm run start:prod
   ```

## Monitoring

The application provides comprehensive logging for:
- Asset synchronization results with detailed filtering statistics
- Location health checks
- Database operations
- API requests and errors
- Scheduled task execution
- Asset processing performance metrics

## Error Handling

- **Validation**: Input validation with proper error messages
- **Database Errors**: Proper handling of constraint violations
- **API Errors**: Graceful handling of external API failures
- **Logging**: Comprehensive error logging with context
- **Asset Sync Errors**: Detailed tracking of sync failures and reasons

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the UNLICENSED license.