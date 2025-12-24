import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { seedHeatmapData } from './seed-heatmap';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit() {
    try {
      this.logger.log('Starting database seed...');
      await seedHeatmapData(this.dataSource);
      this.logger.log('Database seed completed successfully');
    } catch (error) {
      this.logger.error(
        `Failed to seed database: ${error instanceof Error ? error.message : String(error)}`,
      );
      // Không throw error để app vẫn chạy được nếu seed fail
    }
  }
}

