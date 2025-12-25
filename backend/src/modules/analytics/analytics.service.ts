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

// Skill enum và helper
export enum SkillKey {
  VOCAB_GRAMMAR = 'VOCAB_GRAMMAR',
  READING = 'READING',
  LISTENING = 'LISTENING',
}

const SKILL_LABELS: Record<SkillKey, string> = {
  [SkillKey.VOCAB_GRAMMAR]: 'Từ vựng - Ngữ pháp',
  [SkillKey.READING]: 'Đọc hiểu',
  [SkillKey.LISTENING]: 'Nghe hiểu',
};

/**
 * Normalize section name/type thành skill key
 */
function normalizeSkill(sectionName: string, orderIndex?: number): SkillKey {
  const nameLower = sectionName.toLowerCase();
  
  // Check for listening keywords
  if (
    nameLower.includes('listen') ||
    nameLower.includes('聴解') ||
    nameLower.includes('choukai') ||
    nameLower.includes('nghe')
  ) {
    return SkillKey.LISTENING;
  }
  
  // Check for reading keywords
  if (
    nameLower.includes('read') ||
    nameLower.includes('読解') ||
    nameLower.includes('dokkai') ||
    nameLower.includes('đọc')
  ) {
    return SkillKey.READING;
  }
  
  // Default to vocab/grammar
  return SkillKey.VOCAB_GRAMMAR;
}

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

  async getWeakSkillPie(params: {
    levels?: string[];
    from?: string;
    to?: string;
  }): Promise<{
    from: string;
    to: string;
    levels: Array<{
      level: string;
      totalAnswers: number;
      slices: Array<{
        skill: string;
        label: string;
        value: number;
        wrongRate: number;
        total: number;
        wrong: number;
      }>;
    }>;
  }> {
    // Default time range: 30 ngày gần nhất đến hôm nay
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const defaultFrom = new Date(today);
    defaultFrom.setDate(defaultFrom.getDate() - 30);
    defaultFrom.setHours(0, 0, 0, 0);

    const fromDate = params.from ? new Date(params.from) : defaultFrom;
    fromDate.setHours(0, 0, 0, 0);

    const toDate = params.to ? new Date(params.to) : today;
    toDate.setHours(23, 59, 59, 999);

    // Default levels: N3, N4, N5
    const levels = params.levels && params.levels.length > 0
      ? params.levels
      : ['N3', 'N4', 'N5'];

    // QueryBuilder: FROM user_answers ua
    // JOIN section_attempt sa, test_attempt ta, test t, section s
    // WHERE ta.is_completed = true
    // AND COALESCE(ta.started_at, ta.createdAt) between :fromDate and :toDate
    // AND t.level IN (:...levels)
    const rawResults = await this.userAnswerRepo
      .createQueryBuilder('ua')
      .innerJoin('ua.section_attempt', 'sa')
      .innerJoin('sa.test_attempt', 'ta')
      .innerJoin('ta.test', 't')
      .innerJoin('sa.section', 's')
      .select('t.level', 'level')
      .addSelect('s.name', 'sectionName')
      .addSelect('s.order_index', 'orderIndex')
      .addSelect('COUNT(ua.id)', 'total')
      .addSelect(
        'SUM(CASE WHEN ua.is_correct = false THEN 1 ELSE 0 END)',
        'wrong',
      )
      .where('ta.is_completed = true')
      .andWhere(
        'COALESCE(ta.started_at, ta.createdAt) >= :fromDate',
        { fromDate },
      )
      .andWhere(
        'COALESCE(ta.started_at, ta.createdAt) <= :toDate',
        { toDate },
      )
      .andWhere('t.level IN (:...levels)', { levels })
      .groupBy('t.level')
      .addGroupBy('s.id')
      .addGroupBy('s.name')
      .addGroupBy('s.order_index')
      .getRawMany();

    // Aggregate by level + skill
    interface SkillAggregate {
      total: number;
      wrong: number;
    }

    const levelSkillMap = new Map<
      string,
      Map<SkillKey, SkillAggregate>
    >();

    for (const row of rawResults) {
      const level = String(row.level);
      const sectionName = String(row.sectionName || '');
      const orderIndex = row.orderIndex ? Number(row.orderIndex) : undefined;
      const total = parseInt(String(row.total || 0), 10);
      const wrong = parseInt(String(row.wrong || 0), 10);

      const skillKey = normalizeSkill(sectionName, orderIndex);

      if (!levelSkillMap.has(level)) {
        levelSkillMap.set(level, new Map());
      }

      const skillMap = levelSkillMap.get(level)!;
      if (!skillMap.has(skillKey)) {
        skillMap.set(skillKey, { total: 0, wrong: 0 });
      }

      const agg = skillMap.get(skillKey)!;
      agg.total += total;
      agg.wrong += wrong;
    }

    // Calculate wrongRate and pie shares for each level
    const result: Array<{
      level: string;
      totalAnswers: number;
      slices: Array<{
        skill: string;
        label: string;
        value: number;
        wrongRate: number;
        total: number;
        wrong: number;
      }>;
    }> = [];

    for (const [level, skillMap] of levelSkillMap.entries()) {
      const slices: Array<{
        skill: string;
        label: string;
        value: number;
        wrongRate: number;
        total: number;
        wrong: number;
      }> = [];

      let totalAnswers = 0;
      const wrongRates: Array<{ skill: SkillKey; wrongRate: number }> = [];

      // Calculate wrongRate for each skill
      for (const [skillKey, agg] of skillMap.entries()) {
        totalAnswers += agg.total;
        const wrongRate = agg.total > 0 ? agg.wrong / agg.total : 0;
        wrongRates.push({ skill: skillKey, wrongRate });
      }

      // Calculate sum of wrongRates
      const sumWrongRate = wrongRates.reduce(
        (sum, item) => sum + item.wrongRate,
        0,
      );

      // Calculate pie share (value) for each skill
      for (const { skill: skillKey, wrongRate } of wrongRates) {
        const agg = skillMap.get(skillKey)!;
        const value =
          sumWrongRate > 0 ? (wrongRate / sumWrongRate) * 100 : 0;

        slices.push({
          skill: skillKey,
          label: SKILL_LABELS[skillKey],
          value: Math.round(value * 100) / 100, // Làm tròn 2 chữ số
          wrongRate: Math.round(wrongRate * 10000) / 10000, // Làm tròn 4 chữ số
          total: agg.total,
          wrong: agg.wrong,
        });
      }

      // Sort slices by value descending
      slices.sort((a, b) => b.value - a.value);

      result.push({
        level,
        totalAnswers,
        slices,
      });
    }

    // Sort by level (N3, N4, N5...)
    result.sort((a, b) => a.level.localeCompare(b.level));

    return {
      from: fromDate.toISOString().split('T')[0],
      to: toDate.toISOString().split('T')[0],
      levels: result,
    };
  }
}
