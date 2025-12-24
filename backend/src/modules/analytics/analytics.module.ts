import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { HeatmapModule } from '../heatmap/heatmap.module';
import { UserModule } from '../user/user.module';
import { RateLimitGuard } from 'src/guards/rate-limit.guard';
import { Test } from '../../entities/tests.entity';
import { TestAttempt } from '../../entities/test_attempts.entity';

@Module({
  controllers: [AnalyticsController],
  providers: [AnalyticsService, RateLimitGuard],
  imports: [
    HeatmapModule,
    UserModule,
    TypeOrmModule.forFeature([Test, TestAttempt]),
  ],
})
export class AnalyticsModule {}

