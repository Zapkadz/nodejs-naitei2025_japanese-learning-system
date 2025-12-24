import { Injectable } from '@nestjs/common';
import { HeatmapService } from '../heatmap/heatmap.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly heatmapService: HeatmapService) {}

  async getLoginHeatmap() {
    return this.heatmapService.getLoginHeatmap();
  }

  async resetLoginHeatmap() {
    return this.heatmapService.resetLoginHeatmap();
  }
}

