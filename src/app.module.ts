import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RepositoryModule } from './repositories/repository.module';
import { AssetsModule } from './assets/assets.module';
import { DatabaseStartupService } from './database/database-startup.service';
import { LocationEntity } from './entities/location.entity';
import { AssetEntity } from './entities/asset.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'qrorder',
      synchronize: false, // Disabled to use migrations instead
      migrationsRun: true, // Automatically run migrations on startup
      logging: process.env.NODE_ENV === 'development',
      entities: [LocationEntity, AssetEntity],
      migrations: [__dirname + '/migrations/*{.ts,.js}'],
      autoLoadEntities: true,
    }),
    ScheduleModule.forRoot(),
    RepositoryModule,
    AssetsModule,
  ],
  controllers: [AppController],
  providers: [AppService, DatabaseStartupService],
})
export class AppModule { }
