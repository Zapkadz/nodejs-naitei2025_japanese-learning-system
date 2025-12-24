import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { HeatmapService } from '../modules/heatmap/heatmap.service';

@Injectable()
export class LoginHeatmapMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LoginHeatmapMiddleware.name);

  constructor(private readonly heatmapService: HeatmapService) {}

  use(req: Request, res: Response, next: NextFunction) {
    // Gọi increment heatmap bất đồng bộ, không chặn luồng
    // Kể cả login fail thì vẫn ghi nhận request
    this.heatmapService
      .incrementLoginHeatmap(new Date())
      .catch((error) => {
        // Log lỗi nhưng không throw để không làm hỏng login flow
        this.logger.error(
          `Failed to record login heatmap: ${error instanceof Error ? error.message : String(error)}`,
        );
      });

    // Tiếp tục luồng bình thường
    next();
  }
}

