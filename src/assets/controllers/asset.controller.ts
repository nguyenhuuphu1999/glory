import { Controller, Post, Get, Param, Query, HttpStatus, HttpException, InternalServerErrorException, BadRequestException, HttpCode } from '@nestjs/common';
import { AssetSchedule } from '../assets.schedule';

@Controller('assets')
export class AssetController {
  constructor(
    private readonly assetSchedule: AssetSchedule,
  ) { }

  @Post('sync')
  @HttpCode(HttpStatus.OK)
  async syncAssets(): Promise<{ message: string; success: boolean }> {
    try {
      await this.assetSchedule.manualSync();
      return {
        message: 'Asset synchronization completed successfully',
        success: true,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Asset synchronization failed`,
      );
    }
  }
} 