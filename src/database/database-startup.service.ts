import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { LocationEntity } from '../entities/location.entity';

@Injectable()
export class DatabaseStartupService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DatabaseStartupService.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.initializeDatabase();
  }

  private async initializeDatabase(): Promise<void> {
    try {
      this.logger.log('🔍 Checking database state on startup...');

      // Check if we have existing data
      const hasData = await this.checkIfDataExists();

      if (hasData) {
        this.logger.log('✅ Database already contains data, skipping migrations');
        await this.logDatabaseStats();
        return;
      }

      this.logger.log('📦 No data found, running migrations to set up database...');
      await this.runMigrationsIfNeeded();

    } catch (error) {
      this.logger.error(`❌ Database initialization failed: ${error.message}`);
      // Log error but don't crash the application
    }
  }

  private async checkIfDataExists(): Promise<boolean> {
    try {
      // First check if the locations table exists
      const queryRunner = this.dataSource.createQueryRunner();
      const hasLocationsTable = await queryRunner.hasTable('locations');
      await queryRunner.release();

      if (!hasLocationsTable) {
        this.logger.log('📋 Locations table does not exist');
        return false;
      }

      // Check if we have any location data
      const locationRepository = this.dataSource.getRepository(LocationEntity);
      const locationCount = await locationRepository.count({
        where: { deletedAt: null as any }
      });

      this.logger.log(`📊 Found ${locationCount} locations in database`);
      return locationCount > 0;

    } catch (error) {
      this.logger.warn(`⚠️  Could not check data existence: ${error.message}`);
      return false;
    }
  }

  private async runMigrationsIfNeeded(): Promise<void> {
    try {
      this.logger.log('🚀 Running database migrations...');
      
      const migrations = await this.dataSource.runMigrations();
      
      if (migrations.length > 0) {
        this.logger.log(`✅ Successfully ran ${migrations.length} migrations:`);
        migrations.forEach(migration => {
          this.logger.log(`   - ${migration.name}`);
        });
      } else {
        this.logger.log('ℹ️  No pending migrations found');
      }

      this.logger.log('🎉 Database setup completed successfully!');
      await this.logDatabaseStats();

    } catch (error) {
      this.logger.error(`❌ Failed to run migrations: ${error.message}`);
      throw error;
    }
  }

  private async logDatabaseStats(): Promise<void> {
    try {
      const locationRepository = this.dataSource.getRepository(LocationEntity);

      const locations = await locationRepository.find({
        where: { deletedAt: null as any },
        select: ['locationName', 'organization', 'status']
      });

      const totalCount = locations.length;
      const activeCount = locations.filter(loc => loc.status === 'actived').length;
      const inactiveCount = locations.filter(loc => loc.status === 'unactive').length;

      // Group by organization
      const orgStats = locations.reduce((acc, loc) => {
        if (!acc[loc.organization]) {
          acc[loc.organization] = { total: 0, active: 0, inactive: 0 };
        }
        acc[loc.organization].total++;
        if (loc.status === 'actived') {
          acc[loc.organization].active++;
        } else {
          acc[loc.organization].inactive++;
        }
        return acc;
      }, {} as Record<string, { total: number; active: number; inactive: number }>);

      this.logger.log('📊 Database Statistics:');
      this.logger.log(`   📍 Total Locations: ${totalCount}`);
      this.logger.log(`   ✅ Active: ${activeCount}`);
      this.logger.log(`   ❌ Inactive: ${inactiveCount}`);
      
      if (Object.keys(orgStats).length > 0) {
        this.logger.log('   🏢 By Organization:');
        Object.entries(orgStats).forEach(([org, stats]) => {
          this.logger.log(`      ${org}: ${stats.total} total (${stats.active} active, ${stats.inactive} inactive)`);
        });
      }

    } catch (error) {
      this.logger.warn(`⚠️  Could not retrieve database stats: ${error.message}`);
    }
  }

  // Public method for manual database initialization
  async manualInitialize(): Promise<{ success: boolean; message: string; stats?: any }> {
    try {
      await this.initializeDatabase();
      
      const locationRepository = this.dataSource.getRepository(LocationEntity);
      const locationCount = await locationRepository.count({
        where: { deletedAt: null as any }
      });

      return {
        success: true,
        message: 'Database initialization completed successfully',
        stats: {
          locations: locationCount
        }
      };

    } catch (error) {
      return {
        success: false,
        message: `Database initialization failed: ${error.message}`
      };
    }
  }
}