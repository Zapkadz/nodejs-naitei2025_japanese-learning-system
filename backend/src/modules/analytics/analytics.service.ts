import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HeatmapService } from '../heatmap/heatmap.service';
import { Test } from '../../entities/tests.entity';
import { TestAttempt } from '../../entities/test_attempts.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly heatmapService: HeatmapService,
    @InjectRepository(Test)
    private readonly testRepo: Repository<Test>,
    @InjectRepository(TestAttempt)
    private readonly testAttemptRepo: Repository<TestAttempt>,
  ) {}

  async getLoginHeatmap() {
    return this.heatmapService.getLoginHeatmap();
  }

  async resetLoginHeatmap() {
    return this.heatmapService.resetLoginHeatmap();
  }

  async getTestFunnel(params: {
    from?: string;
    to?: string;
    level?: string;
    limit?: number;
  }): Promise<{
    from: string;
    to: string;
    items: Array<{
      testId: number;
      title: string;
      started: number;
      completed: number;
      passed: number;
      attemptCount: number;
      passRate: number;
      completionRate: number;
    }>;
  }> {
    // Default time range: 30 ngày gần nhất đến hôm nay
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today

    const defaultFrom = new Date(today);
    defaultFrom.setDate(defaultFrom.getDate() - 30);
    defaultFrom.setHours(0, 0, 0, 0); // Start of day

    const fromDate = params.from
      ? new Date(params.from)
      : defaultFrom;
    fromDate.setHours(0, 0, 0, 0);

    const toDate = params.to ? new Date(params.to) : today;
    toDate.setHours(23, 59, 59, 999);

    const limit = params.limit ? parseInt(String(params.limit), 10) : 20;

    // QueryBuilder: FROM tests t LEFT JOIN test_attempts a
    // Chỉ lấy các test có attempts trong khoảng thời gian
    // Note: TypeORM sẽ tự động map testId -> test_id trong database
    const queryBuilder = this.testRepo
      .createQueryBuilder('t')
      .leftJoin(
        'test_attempts',
        'a',
        'a.testId = t.id AND a.started_at >= :fromDate AND a.started_at <= :toDate',
        { fromDate, toDate },
      )
      .select('t.id', 'testId')
      .addSelect('t.title', 'title')
      .addSelect('COUNT(DISTINCT a.id)', 'started')
      .addSelect(
        'SUM(CASE WHEN a.is_completed = true THEN 1 ELSE 0 END)',
        'completed',
      )
      .addSelect(
        'SUM(CASE WHEN a.is_passed = true THEN 1 ELSE 0 END)',
        'passed',
      )
      .having('COUNT(a.id) > 0') // Chỉ lấy test có ít nhất 1 attempt trong khoảng thời gian
      .groupBy('t.id')
      .addGroupBy('t.title')
      .orderBy('completed', 'DESC')
      .limit(limit);

    // Filter by level if provided
    if (params.level) {
      queryBuilder.andWhere('t.level = :level', { level: params.level });
    }

    const rawResults = await queryBuilder.getRawMany();

    // Map raw results và tính toán metrics
    const items = rawResults.map((row) => {
      const started = parseInt(String(row.started || 0), 10);
      const completed = parseInt(String(row.completed || 0), 10);
      const passed = parseInt(String(row.passed || 0), 10);

      const attemptCount = completed; // = completed (số lượt làm bài)
      const passRate =
        completed > 0 ? (passed / completed) * 100 : 0;
      const completionRate = started > 0 ? (completed / started) * 100 : 0;

      return {
        testId: parseInt(String(row.testId), 10),
        title: String(row.title || ''),
        started,
        completed,
        passed,
        attemptCount,
        passRate: Math.round(passRate * 100) / 100, // Làm tròn 2 chữ số
        completionRate: Math.round(completionRate * 100) / 100, // Làm tròn 2 chữ số
      };
    });

    return {
      from: fromDate.toISOString().split('T')[0], // YYYY-MM-DD
      to: toDate.toISOString().split('T')[0], // YYYY-MM-DD
      items,
    };
  }
}

