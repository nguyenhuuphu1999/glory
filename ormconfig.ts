import { DataSource } from 'typeorm';
import { LocationEntity } from './src/entities/location.entity';
import { AssetEntity } from './src/entities/asset.entity';

export default new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5440,
  username: 'postgres',
  password: 'password',
  database: 'glory',
  entities: [LocationEntity, AssetEntity],
  migrations: ['src/migrations/*.ts'],
  migrationsTableName: 'migrations',
  synchronize: false, // Set to false when using migrations
  logging: true,
});