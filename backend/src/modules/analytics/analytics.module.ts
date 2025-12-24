import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { HeatmapModule } from '../heatmap/heatmap.module';
import { UserModule } from '../user/user.module';
import { RateLimitGuard } from 'src/guards/rate-limit.guard';

@Module({
  controllers: [AnalyticsController],
  providers: [AnalyticsService, RateLimitGuard],
  imports: [HeatmapModule, UserModule],
})
export class AnalyticsModule {}

