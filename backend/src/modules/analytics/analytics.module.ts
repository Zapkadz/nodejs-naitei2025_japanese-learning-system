import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { HeatmapModule } from '../heatmap/heatmap.module';
import { UserModule } from '../user/user.module';
import { RateLimitGuard } from 'src/guards/rate-limit.guard';
import { Test } from '../../entities/tests.entity';
import { TestAttempt } from '../../entities/test_attempts.entity';
import { UserAnswer } from 'src/entities/user_answers.entity';
import { Section } from 'src/entities/sections.entity';

@Module({
  controllers: [AnalyticsController],
  providers: [AnalyticsService, RateLimitGuard],
  imports: [
    HeatmapModule,
    UserModule,
    TypeOrmModule.forFeature([Test, TestAttempt, UserAnswer, Section]),
  ],
})
export class AnalyticsModule {}
