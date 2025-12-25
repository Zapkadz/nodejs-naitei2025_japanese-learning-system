import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HeatmapService } from '../heatmap/heatmap.service';
import { Test } from '../../entities/tests.entity';
import { TestAttempt } from '../../entities/test_attempts.entity';
import { BadRequestException, Injectable } from '@nestjs/common';
import { UserAnswer } from 'src/entities/user_answers.entity';
import { UserService } from '../user/user.service';
import { TestStatisticsResponseDto } from './dto/test-statistics-response.dto';
import { Section } from 'src/entities/sections.entity';

interface RawTestStatistic {
  section_id: number;
  section_name: string;
  question_number: number;
  total_count: string;
  correct_count: string;
}

interface QuestionStat {
  questionNumber: number;
  correctCount: number;
  totalCount: number;
  correctRate: number;
}

interface SectionStat {
  sectionName: string;
  sectionTotalQuestion: number;
  questions: QuestionStat[];
}

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly heatmapService: HeatmapService,
    @InjectRepository(Test)
    private readonly testRepo: Repository<Test>,
    @InjectRepository(TestAttempt)
    private readonly testAttemptRepo: Repository<TestAttempt>,
    private readonly userService: UserService,

    @InjectRepository(UserAnswer)
    private readonly userAnswerRepo: Repository<UserAnswer>,
    @InjectRepository(Section)
    private readonly sectionRepo: Repository<Section>,
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

    const fromDate = params.from ? new Date(params.from) : defaultFrom;
    fromDate.setHours(0, 0, 0, 0);

    const toDate = params.to ? new Date(params.to) : today;
    toDate.setHours(23, 59, 59, 999);

    const limit = params.limit ? parseInt(String(params.limit), 10) : 20;

    // QueryBuilder: FROM tests t LEFT JOIN test_attempts a
    // Chỉ lấy các test có attempts trong khoảng thời gian
    // Chỉ lấy các đề JLPT (skill = 'all'), không lấy Goi, Bunpou, etc.
    // Note: TypeORM sẽ tự động map testId -> test_id trong database
    const queryBuilder = this.testRepo
      .createQueryBuilder('t')
      .leftJoin(
        'test_attempts',
        'a',
        'a.testId = t.id AND a.started_at >= :fromDate AND a.started_at <= :toDate',
        { fromDate, toDate },
      )
      .where("t.skill = 'all'") // Chỉ lấy các đề JLPT, không lấy Goi, Bunpou, etc.
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
      const passRate = completed > 0 ? (passed / completed) * 100 : 0;
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

  async getTestStatistics(
    testId: number,
    userId: number,
  ): Promise<TestStatisticsResponseDto> {
    const isAdmin = await this.userService.is_admin(userId);
    if (!isAdmin) {
      throw new BadRequestException('Only admin can access this resource');
    }

    const sections = await this.sectionRepo.find({
      where: { test: { id: testId } },
      relations: ['parts', 'parts.questions'],
    });

    const sectionQuestionCountMap = new Map<number, number>();

    for (const section of sections) {
      const questionCount = section.parts.reduce(
        (sum, part) => sum + (part.questions?.length || 0),
        0,
      );
      sectionQuestionCountMap.set(section.id, questionCount);
    }

    const rawStats = await this.userAnswerRepo
      .createQueryBuilder('ua')
      .innerJoin('ua.question', 'q')
      .innerJoin('q.part', 'p')
      .innerJoin('p.section', 's')
      .innerJoin('ua.section_attempt', 'sa')
      .innerJoin('sa.test_attempt', 'ta')
      .select([
        's.id AS section_id',
        's.name AS section_name',
        'q.question_number AS question_number',
        // Tổng số người làm câu này
        'COUNT(DISTINCT ta.id) AS total_count',
        // Tổng số người làm đúng câu này
        `
        COUNT(DISTINCT CASE
          WHEN ua.is_correct = true THEN ta.id
          ELSE NULL
        END) AS correct_count
        `,
      ])
      .where('ta.testId = :testId', { testId })
      .groupBy('s.id')
      .addGroupBy('q.id')
      .addGroupBy('q.question_number')
      .orderBy('s.id', 'ASC')
      .addOrderBy('q.question_number', 'ASC')
      .getRawMany<RawTestStatistic>();

    const sectionMap = new Map<number, SectionStat>();

    for (const row of rawStats) {
      if (!sectionMap.has(row.section_id)) {
        sectionMap.set(row.section_id, {
          sectionName: row.section_name,
          sectionTotalQuestion:
            sectionQuestionCountMap.get(row.section_id) ?? 0,
          questions: [],
        });
      }

      sectionMap.get(row.section_id)!.questions.push({
        questionNumber: row.question_number,
        correctCount: Number(row.correct_count),
        totalCount: Number(row.total_count),
        correctRate:
          Number(row.total_count) === 0
            ? 0
            : Number(row.correct_count) / Number(row.total_count),
      });
    }

    return {
      testId,
      sections: Array.from(sectionMap.values()),
    };
  }
}
