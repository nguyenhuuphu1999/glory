import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { ENTITY_NAME, ASSET_STATUS_ENUM } from './entity.constant';
import { BaseEntity } from './base.entity';
import { IAsset } from 'src/intefaces/asset.interface';
import { LocationEntity } from './location.entity';

@Entity(ENTITY_NAME.ASSET)
@Index(['serial'], { unique: true })
export class AssetEntity extends BaseEntity implements IAsset {
  @Column({ type: 'varchar', length: 50, name: 'type' })
  public type: string;

  @Column({ type: 'varchar', length: 50, name: 'serial', unique: true })
  public serial: string;

  @Column({
    type: 'enum',
    enum: ASSET_STATUS_ENUM,
    default: ASSET_STATUS_ENUM.ACTIVED,
    name: 'status',
  })
  public status: ASSET_STATUS_ENUM;

  @Column({ type: 'text', name: 'description' })
  public description: string;

  @Column({ name: 'location_id' })
  public locationId: string;

  @ManyToOne(() => LocationEntity, { nullable: false })
  @JoinColumn({ name: 'location_id' })
  public location: LocationEntity;
} 