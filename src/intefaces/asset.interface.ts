import { IBase } from "./base.interface";

export interface IAsset extends IBase {
  type: string;
  serial: string;
  status: string;
  description: string;
  locationId?: string; // Optional since it will be handled by the relationship
} 