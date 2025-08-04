import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { AssetEntity } from '../entities/asset.entity';
import { BasePostgresRepository } from './abstract-repository';

@Injectable()
export class AssetRepository extends BasePostgresRepository<AssetEntity> {
  constructor(
    entityManager: EntityManager,
  ) {
    super(entityManager, AssetEntity);
  }
} 