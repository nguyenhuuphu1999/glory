import { Global, Module } from "@nestjs/common";
import { LocationRepository } from "./location.repository";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LocationEntity } from "src/entities/location.entity";
import { AssetEntity } from "src/entities/asset.entity";
import { AssetRepository } from "./asset.repository";

@Global()
@Module({
    imports: [TypeOrmModule.forFeature([
        LocationEntity,
        AssetEntity
    ])],
    providers: [LocationRepository, AssetRepository],
    exports: [LocationRepository, AssetRepository]
})
export class RepositoryModule { }