import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { AssetEntity } from '../../entities/asset.entity';
import { LocationEntity } from '../../entities/location.entity';
import { IBrAsset, STATUS_BR_ASSET_ENUM } from '../../intefaces/br-asset.interface';
import { ASSET_STATUS_ENUM } from '../../entities/entity.constant';
import { AssetRepository } from 'src/repositories/asset.repository';
import { LocationRepository } from 'src/repositories/location.repository';
import { BrApiService } from './br-api.service';

@Injectable()
export class AssetService {
    private readonly logger = new Logger(AssetService.name);

    constructor(
        private readonly assetRepository: AssetRepository,
        private readonly locationRepository: LocationRepository,
        private readonly brApiService: BrApiService,
        private readonly entityManager: EntityManager,
    ) { }

    /**
     * Synchronize assets from BR Company API
     * Only syncs assets that meet the following criteria:
     * - Asset status is active
     * - Asset was created in the past (any time in the past)
     * - Location exists in the database and is active
     */
    public async synchronizeAssets(): Promise<void> {
        this.logger.log(`Starting synchronization of assets from BR Company API`);
        
        try {
            // Get all assets from BR API in a single call
            const allAssets = await this.brApiService.getAllAssets();
            this.logger.log(`Fetched ${allAssets.length} assets from BR Company API`);

            // Filter assets by status first (only active assets)
            const activeAssets = allAssets.filter(asset => asset.status === STATUS_BR_ASSET_ENUM.ACTIVED);
            this.logger.log(`Found ${activeAssets.length} active assets out of ${allAssets.length} total assets`);

            // Process filtered assets
            const result = await this.processAssetBatch(activeAssets);
            
            this.logger.log(`Synchronization completed: ${result.synced} synced, ${result.skipped} skipped, ${result.errors} errors`);
        } catch (error) {
            this.logger.error(`Synchronization failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * Process a batch of assets
     */
    private async processAssetBatch(assets: IBrAsset[]): Promise<{ synced: number; skipped: number; errors: number }> {
        let syncedCount = 0;
        let skippedCount = 0;
        let errorCount = 0;

        // Process assets in parallel with concurrency limit
        const concurrencyLimit = 10;
        const chunks = this.chunkArray(assets, concurrencyLimit);

        for (const chunk of chunks) {
            const promises = chunk.map(asset => this.syncSingleAsset(asset));
            const results = await Promise.allSettled(promises);

            for (const result of results) {
                if (result.status === 'fulfilled') {
                    if (result.value.synced) {
                        syncedCount++;
                    } else {
                        skippedCount++;
                        this.logger.debug(`Asset skipped: ${result.value.reason}`);
                    }
                } else {
                    errorCount++;
                    this.logger.error(`Asset sync failed: ${result.reason}`);
                }
            }
        }

        return { synced: syncedCount, skipped: skippedCount, errors: errorCount };
    }
 

    /**
     * Sync a single asset from BR Company API
     * Only syncs assets that meet the following criteria:
     * - Asset status is active (filtered at batch level)
     * - Asset was created in the past (any time in the past)
     * - Location exists in the database and is active
     */
    private async syncSingleAsset(brAsset: IBrAsset): Promise<{ synced: boolean; reason?: string }> {
        // Check if asset already exists
        const existingAsset = await this.assetRepository.findOne(
            this.entityManager,
            { where: { serial: brAsset.serial } as any }
        );

        if (existingAsset) {
            return { synced: false, reason: 'Asset already exists' };
        }

        // Check if asset was created in the past (any time in the past)
        const assetCreatedAt = new Date(brAsset.created_at * 1000); // Convert timestamp to Date
        const now = new Date();

        if (assetCreatedAt > now) {
            return { synced: false, reason: 'Asset created in the future' };
        }

        // Find the specific location that matches the BR asset's location_id
        const matchingLocation = await this.locationRepository.findOne(
            this.entityManager,
            { where: { locationId: brAsset.location_id } as any }
        );

        if (!matchingLocation) {
            return { 
                synced: false, 
                reason: `No matching location found for location_id: ${brAsset.location_id}` 
            };
        }

        // Check if the location is active (only sync assets to active locations)
        if (matchingLocation.status !== 'actived') {
            return { 
                synced: false, 
                reason: `Location ${matchingLocation.locationName} is not active (status: ${matchingLocation.status})` 
            };
        }

        // Create new asset using insert method
        const assetData = {
            type: brAsset.type,
            serial: brAsset.serial,
            status: this.mapBrStatusToEnum(brAsset.status),
            description: brAsset.description,
            locationId: matchingLocation.id, // Use the UUID of the location entity
        };

        await this.assetRepository.insert(this.entityManager, assetData);
        this.logger.log(`Successfully synced asset: ${brAsset.serial} to location: ${matchingLocation.locationName} (locationId: ${matchingLocation.locationId})`);

        return { synced: true };
    }

    /**
     * Map BR Company status to our enum
     */
    private mapBrStatusToEnum(brStatus: string): ASSET_STATUS_ENUM {
        switch (brStatus) {
            case STATUS_BR_ASSET_ENUM.ACTIVED:
                return ASSET_STATUS_ENUM.ACTIVED;
            case STATUS_BR_ASSET_ENUM.INACTIVE:
                return ASSET_STATUS_ENUM.INACTIVE;
            default:
                return ASSET_STATUS_ENUM.ACTIVED; // Default to active
        }
    }

    /**
     * Get all assets with location information
     */
    public async getAllAssets(): Promise<AssetEntity[]> {
        return this.assetRepository.queries(
            this.entityManager,
            { 
                where: {},
                relations: ['location'],
                order: { createdAt: 'DESC' } as any
            }
        ) as Promise<AssetEntity[]>;
    }

    /**
     * Get asset by serial number
     */
    public async getAssetBySerial(serial: string): Promise<AssetEntity | null> {
        return this.assetRepository.findOne(
            this.entityManager,
            { where: { serial } as any },
            undefined,
            ['location']
        ) as Promise<AssetEntity | null>;
    }

    /**
     * Utility method to chunk array for parallel processing
     */
    private chunkArray<T>(array: T[], size: number): T[][] {
        const chunks: T[][] = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }
} 