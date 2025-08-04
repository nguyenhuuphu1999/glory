import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTablesAndSeedData1704672000001 implements MigrationInterface {
  name = 'CreateTablesAndSeedData1704672000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('🚀 Starting database setup...');

    // Create UUID extension if not exists
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Create location status enum
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."locations_status_enum" AS ENUM('actived', 'unactive');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create locations table if not exists
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "locations" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "location_id" integer NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        "createdById" uuid,
        "updatedById" uuid,
        "deletedById" uuid,
        "location_name" character varying(255) NOT NULL,
        "organization" character varying(100) NOT NULL,
        "status" "public"."locations_status_enum" NOT NULL DEFAULT 'actived',
        CONSTRAINT "PK_locations" PRIMARY KEY ("id")
      )
    `);

    // Create asset status enum
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."assets_status_enum" AS ENUM('actived', 'inactive', 'maintenance', 'retired');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create assets table if not exists
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "assets" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        "createdById" uuid,
        "updatedById" uuid,
        "deletedById" uuid,
        "type" character varying(50) NOT NULL,
        "serial" character varying(50) NOT NULL,
        "status" "public"."assets_status_enum" NOT NULL DEFAULT 'actived',
        "description" text NOT NULL,
        "location_id" uuid NOT NULL,
        CONSTRAINT "PK_assets" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_assets_serial" UNIQUE ("serial")
      )
    `);

    // Create unique index on assets serial
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "IDX_assets_serial" ON "assets" ("serial")
    `);

    // Add foreign key constraint
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "assets" ADD CONSTRAINT "FK_assets_location" 
        FOREIGN KEY ("location_id") REFERENCES "locations"("id") 
        ON DELETE NO ACTION ON UPDATE NO ACTION;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    console.log('✅ Tables created successfully');

    // Check if location data already exists to prevent duplicates
    const existingLocations = await queryRunner.query(`
      SELECT COUNT(*) as count FROM "locations" 
      WHERE "location_name" IN ('Da Nang', 'Ha Noi', 'Ho Chi Minh', 'Nha Trang', 'Can Tho')
      AND "deletedAt" IS NULL
    `);

    if (parseInt(existingLocations[0].count) > 0) {
      console.log('ℹ️  Location data already exists, skipping seed...');
      return;
    }

    // Insert sample location data (only if not exists)
    await queryRunner.query(`
      INSERT INTO "locations" ("location_id","location_name", "organization", "status", "createdAt", "updatedAt") 
      VALUES 
        (1,'Da Nang', 'PNS', 'actived', NOW(), NOW()),
        (2,'Ha Noi', 'PNS', 'unactive', NOW(), NOW()),
        (3,'Ho Chi Minh', 'PNS', 'actived', NOW(), NOW()),
        (4,'Nha Trang', 'PLJ', 'actived', NOW(), NOW()),
        (5,'Can Tho', 'PLJ', 'actived', NOW(), NOW())
    `);

    // Log the inserted data
    const insertedData = await queryRunner.query(`
      SELECT "location_name", "organization", "status" 
      FROM "locations" 
      WHERE "location_name" IN ('Da Nang', 'Ha Noi', 'Ho Chi Minh', 'Nha Trang', 'Can Tho')
      AND "deletedAt" IS NULL
      ORDER BY "location_name"
    `);
    
    console.log('✅ Sample location data seeded successfully:');
    insertedData.forEach((location: any) => {
      console.log(`   - ${location.location_name} (${location.organization}) - ${location.status}`);
    });

    console.log('🎉 Database setup completed successfully!');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('🔄 Reverting database setup...');

    // Remove foreign key constraint
    await queryRunner.query(`ALTER TABLE "assets" DROP CONSTRAINT IF EXISTS "FK_assets_location"`);
    
    // Drop tables
    await queryRunner.query(`DROP TABLE IF EXISTS "assets"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "locations"`);
    
    // Drop enums
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."assets_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."locations_status_enum"`);

    console.log('✅ Database setup reverted successfully');
  }
}