import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { IBrAsset } from '../../intefaces/br-asset.interface';

@Injectable()
export class BrApiService {
  private readonly logger = new Logger(BrApiService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}
  
  public async getAllAssets(): Promise<IBrAsset[]> {
    const apiUrl = this.configService.get<string>('BR_API_URL') || 'https://669ce22d15704bb0e304842d.mockapi.io/assets';
    const timeout = this.configService.get<number>('BR_API_TIMEOUT', 10000);

    try {
      this.logger.log(`Fetching all assets from BR Company API`);
      
      const response = await firstValueFrom(
        this.httpService.get<IBrAsset[]>(apiUrl, {
          timeout,
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );

      this.logger.log(`Successfully fetched ${response.data.length} assets from BR Company API`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to fetch assets from BR Company API: ${error.message}`);
      throw new InternalServerErrorException(`BR API fetch failed`);
    }
  }
} 