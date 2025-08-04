import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AssetService } from './services/asset.service';

@Injectable()
export class AssetSchedule {
  private readonly logger = new Logger(AssetSchedule.name);

  constructor(
    private readonly assetService: AssetService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  public async handleAssetSync() {
    this.logger.log('Starting daily asset synchronization from BR Company API');

    try {
      await this.assetService.synchronizeAssets();
      
      this.logger.log('Daily asset synchronization completed successfully');
    } catch (error) {
      this.logger.error(`Daily asset synchronization failed: ${error.message}`);
      // In production, you might want to send notifications or alerts here
    }
  }

  /**
   * Manual synchronization trigger (for testing or manual runs)
   */
  public async manualSync(): Promise<void> {
    this.logger.log('Manual asset synchronization triggered');

    try {
      await this.assetService.synchronizeAssets();
      
      this.logger.log('Manual asset synchronization completed successfully');
    } catch (error) {
      this.logger.error(`Manual asset synchronization failed: ${error.message}`);
      throw new InternalServerErrorException("Manual asset synchronization failed");
    }
  }
}
