import { Entity, Column, Index } from 'typeorm';
import { ENTITY_NAME, LOCATION_STATUS_ENUM } from './entity.constant';
import { BaseEntity } from './base.entity';
import { ILocation } from 'src/intefaces/location.interface';

@Entity(ENTITY_NAME.LOCATION)
@Index(['locationId'], { unique: true })
export class LocationEntity extends BaseEntity implements ILocation {
  @Column({ type: 'int', unique: true, name: 'location_id' })
  public locationId: number;

  @Column({ type: 'varchar', length: 255, name: 'location_name' })
  public locationName: string;

  @Column({ type: 'varchar', length: 100, name: 'organization' })
  public organization: string;

  @Column({
    type: 'enum',
    enum: LOCATION_STATUS_ENUM,
    default: LOCATION_STATUS_ENUM.ACTIVED,
    name: 'status',
  })
  public status: LOCATION_STATUS_ENUM;
}