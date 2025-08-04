import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { AssetEntity } from '../entities/asset.entity';
import { LocationEntity } from '../entities/location.entity';
import { AssetService } from './services/asset.service';
import { BrApiService } from './services/br-api.service';
import { AssetSchedule } from './assets.schedule';
import { AssetController } from './controllers/asset.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([AssetEntity, LocationEntity]),
    HttpModule,
    ConfigModule,
  ],
  controllers: [AssetController],
  providers: [AssetService, BrApiService, AssetSchedule],
  exports: [AssetService, BrApiService, AssetSchedule],
})
export class AssetsModule {}
