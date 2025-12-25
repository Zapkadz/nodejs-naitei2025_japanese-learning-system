import {
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
  BadRequestException,
  Query,
  Param,
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const userId = req.user.userId as number;

    // Kiểm tra quyền admin
    const isAdmin = await this.userService.is_admin(userId);
    if (!isAdmin) {
      throw new BadRequestException('Only admin can access this resource');
    }

    await this.analyticsService.resetLoginHeatmap();
    return { message: 'Login heatmap has been reset successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('funnel/tests')
  async getTestFunnel(
    @Request() req,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('level') level?: string,
    @Query('limit') limit?: string,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const userId = req.user.userId as number;

    // Kiểm tra quyền admin
    const isAdmin = await this.userService.is_admin(userId);
    if (!isAdmin) {
      throw new BadRequestException('Only admin can access this resource');
    }

    // Parse limit an toàn
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    if (limitNum !== undefined && (isNaN(limitNum) || limitNum < 1)) {
      throw new BadRequestException('Invalid limit parameter');
    }

    return this.analyticsService.getTestFunnel({
      from,
      to,
      level,
      limit: limitNum,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('test/:testId/statistics')
  async getStatistics(@Param('testId') testId: string, @Request() req) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const userId = req.user.userId as number;
    return this.analyticsService.getTestStatistics(Number(testId), userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('content-quality/weak-skill-pie')
  async getWeakSkillPie(
    @Request() req,
    @Query('levels') levels?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const userId = req.user.userId as number;

    // Kiểm tra quyền admin
    const isAdmin = await this.userService.is_admin(userId);
    if (!isAdmin) {
      throw new BadRequestException('Only admin can access this resource');
    }

    // Parse levels từ query string (comma-separated)
    const levelsArray = levels
      ? levels.split(',').map((l) => l.trim()).filter((l) => l.length > 0)
      : undefined;

    return this.analyticsService.getWeakSkillPie({
      levels: levelsArray,
      from,
      to,
    });
  }
}
