import {
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RateLimitGuard } from 'src/guards/rate-limit.guard';
import { UserService } from '../user/user.service';

@Controller('admin/analytics')
export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly userService: UserService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('heatmap/login')
  async getLoginHeatmap(@Request() req) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const userId = req.user.userId as number;

    // Kiểm tra quyền admin
    const isAdmin = await this.userService.is_admin(userId);
    if (!isAdmin) {
      throw new BadRequestException('Only admin can access this resource');
    }

    return this.analyticsService.getLoginHeatmap();
  }

  @UseGuards(RateLimitGuard, JwtAuthGuard)
  @Post('heatmap/login/reset')
  async resetLoginHeatmap(@Request() req) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const userId = req.user.userId as number;

    // Kiểm tra quyền admin
    const isAdmin = await this.userService.is_admin(userId);
    if (!isAdmin) {
      throw new BadRequestException('Only admin can access this resource');
    }

    await this.analyticsService.resetLoginHeatmap();
    return { message: 'Login heatmap has been reset successfully' };
  }
}

