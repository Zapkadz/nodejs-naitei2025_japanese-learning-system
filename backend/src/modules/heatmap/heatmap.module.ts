import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HeatmapService } from './heatmap.service';
import { LoginHeatmap } from '../../entities/login-heatmap.entity';
import { WeekdayDim } from '../../entities/weekday-dim.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LoginHeatmap, WeekdayDim])],
  providers: [HeatmapService],
  exports: [HeatmapService],
})
export class HeatmapModule {}

