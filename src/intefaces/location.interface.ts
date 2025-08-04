import { IBase } from "./base.interface";
import { LOCATION_STATUS_ENUM } from "src/entities/entity.constant";
export interface ILocation extends IBase {
  locationId: number;
  locationName: string;
  organization: string;
  status: LOCATION_STATUS_ENUM;
}
