import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { LocationEntity } from '../entities/location.entity';
import { BasePostgresRepository } from './abstract-repository';

@Injectable()
export class LocationRepository extends BasePostgresRepository<LocationEntity> {
  constructor(
    entityManager: EntityManager,
  ) {
    super(entityManager, LocationEntity);
  }
}