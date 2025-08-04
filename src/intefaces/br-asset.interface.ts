export enum STATUS_BR_ASSET_ENUM {
  ACTIVED = 'actived',
  INACTIVE = 'inactive'
}

export interface IBrAsset {
  id: string;
  type: string;
  serial: string;
  status: STATUS_BR_ASSET_ENUM;
  description: string;
  created_at: number;
  updated_at: number;
  location_id: number;
} 