// src/modules/progress/progress.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TestAttempt } from '../../entities/test_attempts.entity';
import { SectionAttempt } from '../../entities/section_attempts.entity';
import { UserAnswer } from '../../entities/user_answers.entity';
import { Test } from '../../entities/tests.entity';
import { User } from '../../entities/users.entity';
import { Question } from '../../entities/questions.entity';
import { Option } from '../../entities/options.entity';
import { CreateTestAttemptDto } from './dto/create-test-attempt.dto';
import { UpdateSectionAttemptDto } from './dto/update-section-attempt.dto';
import { CreateOrUpdateAnswerDto } from './dto/create-or-update-answer.dto';
import { UserAnswerResponseDto } from './dto/user-answer-response.dto';
import {
  SectionAttemptResponseDto,
  SectionAttemptWithDetailsResponseDto,
} from './dto/section-attempt-response.dto';
import { Section } from '../../entities/sections.entity';
import { Part } from '../../entities/parts.entity';

@Injectable()
export class ProgressService {
  constructor(
    @InjectRepository(TestAttempt)
    private readonly testAttemptRepo: Repository<TestAttempt>,
    @InjectRepository(SectionAttempt)
    private readonly sectionAttemptRepo: Repository<SectionAttempt>,
    @InjectRepository(UserAnswer)
    private readonly userAnswerRepo: Repository<UserAnswer>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Test)
    private readonly testRepo: Repository<Test>,
    @InjectRepository(Question)
    private readonly questionRepo: Repository<Question>,
    @InjectRepository(Option)
    private readonly optionRepo: Repository<Option>,
  ) {}

  buildTestAttemptResponse(attempt: TestAttempt) {
    return {
      id: attempt.id,
      testId: attempt.test.id,
      is_completed: attempt.is_completed,
      is_passed: attempt.is_passed,
      total_score: attempt.total_score,
      started_at: attempt.started_at || undefined,
      completed_at: attempt.completed_at || undefined,
      section_attempts: attempt.section_attempts?.map((s) => ({
        id: s.id,
        sectionId: s.section.id,
        status: s.status,
        score: s.score ?? null,
        correct_count: s.correct_count ?? 0,
        time_remaining: s.time_remaining ?? 0,
      })) || [],
    };
  }

  buildSectionAttemptResponse(
    sectionAttempt: SectionAttempt,
  ): SectionAttemptResponseDto {
    return {
      id: sectionAttempt.id,
      test_attempt_id: sectionAttempt.test_attempt.id,
      section_id: sectionAttempt.section.id,
      status: sectionAttempt.status,
      score: sectionAttempt.score ?? null,
      correct_count: sectionAttempt.correct_count ?? null,
      question_count: sectionAttempt.question_count,
      time_remaining: sectionAttempt.time_remaining ?? null,
      created_at: sectionAttempt.createdAt.toISOString(),
      updated_at: sectionAttempt.updatedAt.toISOString(),
    };
  }

  buildSectionAttemptWithDetailsResponse(
    sectionAttempt: SectionAttempt,
  ): SectionAttemptWithDetailsResponseDto {
    const base = this.buildSectionAttemptResponse(sectionAttempt);
    return {
      ...base,
      section_name: sectionAttempt.section.name,
      time_limit: sectionAttempt.section.time_limit,
    };
  }

  private async checkAndCompleteTestAttempt(attempt: TestAttempt) {
    const allCompleted = attempt.section_attempts.every(
      (s) => s.status === 'COMPLETED',
    );

    if (allCompleted && !attempt.is_completed) {
      attempt.is_completed = true;
      await this.testAttemptRepo.save(attempt);
    }

    return attempt;
  }

  async startTestAttempt(dto: CreateTestAttemptDto): Promise<TestAttempt> {
    const user = await this.userRepo.findOne({ where: { id: dto.userId } });
    if (!user) throw new NotFoundException('User not found');

    const test = await this.testRepo.findOne({
      where: { id: dto.testId },
      relations: ['sections', 'sections.parts', 'sections.parts.questions'],
    });
    if (!test) throw new NotFoundException('Test not found');

    const testAttempt = this.testAttemptRepo.create({
      user,
      test,
      is_completed: false,
      started_at: new Date(),
    });
    await this.testAttemptRepo.save(testAttempt);

    const sectionAttempts = test.sections.map((section) => {
      // Calculate total questions in this section
      const questionCount = section.parts.reduce(
        (sum, part) => sum + (part.questions?.length || 0),
        0,
      );

      return this.sectionAttemptRepo.create({
        test_attempt: testAttempt,
        section,
        question_count: questionCount,
        time_remaining: section.time_limit * 60,
      });
    });

    await this.sectionAttemptRepo.save(sectionAttempts);

    testAttempt.section_attempts = sectionAttempts;

    return testAttempt;
  }

  async getTestAttempts(userId: number): Promise<TestAttempt[]> {
    const attempts = await this.testAttemptRepo.find({
      where: { user: { id: userId } },
      relations: [
        'user',
        'test',
        'section_attempts',
        'section_attempts.section',
      ],
    });

    if (!attempts || attempts.length === 0) {
      throw new NotFoundException('No Test attempts found!');
    }

    await Promise.all(
      attempts.map((attempt) => this.checkAndCompleteTestAttempt(attempt)),
    );

    return attempts;
  }

  async getTestAttemptById(
    userId: number,
    attemptId: number,
  ): Promise<TestAttempt> {
    const attempt = await this.testAttemptRepo.findOne({
      where: { id: attemptId, user: { id: userId } },
      relations: [
        'user',
        'test',
        'section_attempts',
        'section_attempts.section',
      ],
    });

    if (!attempt) {
      throw new NotFoundException('Test attempt not found');
    }

    return this.checkAndCompleteTestAttempt(attempt);
  }

  async getAnswersBySectionAttemptId(
    userId: number,
    sectionAttemptId: number,
  ): Promise<UserAnswerResponseDto[]> {
    // Verify section attempt belongs to user
    const sectionAttempt = await this.sectionAttemptRepo.findOne({
      where: { id: sectionAttemptId },
      relations: ['test_attempt', 'test_attempt.user'],
    });

    if (!sectionAttempt) {
      throw new NotFoundException('Section attempt not found');
    }

    if (sectionAttempt.test_attempt.user.id !== userId) {
      throw new ForbiddenException(
        'You do not have permission to access this section attempt',
      );
    }

    const answers = await this.userAnswerRepo.find({
      where: { section_attempt: { id: sectionAttemptId } },
      relations: ['question', 'selected_option'],
      order: { id: 'ASC' },
    });

    return answers.map((answer) => ({
      id: answer.id,
      section_attempt_id: sectionAttemptId,
      question_id: answer.question.id,
      selected_option_id: answer.selected_option?.id ?? null,
      is_correct: answer.is_correct,
      is_marked: answer.is_marked,
      createdAt: answer.createdAt,
      updatedAt: answer.updatedAt,
    }));
  }

  async getSectionAttempt(
    userId: number,
    sectionAttemptId: number,
  ): Promise<SectionAttempt> {
    const sectionAttempt = await this.sectionAttemptRepo.findOne({
      where: { id: sectionAttemptId },
      relations: [
        'test_attempt',
        'test_attempt.user',
        'test_attempt.test',
        'section',
      ],
    });

    if (!sectionAttempt) {
      throw new NotFoundException('Section attempt not found');
    }

    if (sectionAttempt.test_attempt.user.id !== userId) {
      throw new ForbiddenException(
        'You do not have permission to access this section attempt',
      );
    }

    return sectionAttempt;
  }

  async updateSectionAttempt(
    userId: number,
    sectionAttemptId: number,
    updateDto: UpdateSectionAttemptDto,
  ): Promise<SectionAttempt> {
    // Verify section attempt belongs to user
    const sectionAttempt = await this.sectionAttemptRepo.findOne({
      where: { id: sectionAttemptId },
      relations: ['test_attempt', 'test_attempt.user', 'section'],
    });

    if (!sectionAttempt) {
      throw new NotFoundException('Section attempt not found');
    }

    if (sectionAttempt.test_attempt.user.id !== userId) {
      throw new ForbiddenException(
        'You do not have permission to update this section attempt',
      );
    }

    // Check if status is being set to COMPLETED
    const isCompleting =
      updateDto.status === 'COMPLETED' &&
      sectionAttempt.status !== 'COMPLETED';

    // Update fields (correct_count is calculated automatically, not updated manually)
    if (updateDto.status !== undefined) {
      sectionAttempt.status = updateDto.status;
    }
    if (updateDto.time_remaining !== undefined) {
      sectionAttempt.time_remaining = updateDto.time_remaining;
    }

    // If completing, automatically calculate correct_count and score
    if (isCompleting) {
      const correctCount = await this.calculateCorrectCount(sectionAttemptId);
      const totalQuestions = sectionAttempt.question_count || 0;
      const score =
        totalQuestions > 0
          ? Math.round((correctCount / totalQuestions) * 100)
          : 0;

      sectionAttempt.correct_count = correctCount;
      sectionAttempt.score = score;
    } else if (updateDto.score !== undefined) {
      // Only allow manual score update if not completing
      sectionAttempt.score = updateDto.score;
    }

    const updated = await this.sectionAttemptRepo.save(sectionAttempt);

    // Check if test attempt should be completed
    if (updated.status === 'COMPLETED') {
      const testAttempt = await this.testAttemptRepo.findOne({
        where: { id: updated.test_attempt.id },
        relations: ['section_attempts'],
      });
      if (testAttempt) {
        await this.checkAndCompleteTestAttempt(testAttempt);
      }
    }

    // Reload with all necessary relations for response
    const reloaded = await this.sectionAttemptRepo.findOne({
      where: { id: updated.id },
      relations: ['test_attempt', 'section'],
    });

    return reloaded || updated;
  }

  /**
   * Calculate correct_count from user answers for a section attempt
   */
  private async calculateCorrectCount(
    sectionAttemptId: number,
  ): Promise<number> {
    const answers = await this.userAnswerRepo.find({
      where: { section_attempt: { id: sectionAttemptId } },
    });

    return answers.filter((answer) => answer.is_correct === true).length;
  }

  /**
   * Submit section attempt - calculates score and correct_count automatically
   */
  async submitSectionAttempt(
    userId: number,
    sectionAttemptId: number,
    timeRemaining?: number,
  ): Promise<SectionAttempt> {
    const sectionAttempt = await this.sectionAttemptRepo.findOne({
      where: { id: sectionAttemptId },
      relations: [
        'test_attempt',
        'test_attempt.user',
        'section',
        'section.parts',
        'section.parts.questions',
        'section.parts.questions.options',
      ],
    });

    if (!sectionAttempt) {
      throw new NotFoundException('Section attempt not found');
    }

    if (sectionAttempt.test_attempt.user.id !== userId) {
      throw new ForbiddenException(
        'You do not have permission to submit this section attempt',
      );
    }

    // Calculate correct_count from answers
    const correctCount = await this.calculateCorrectCount(sectionAttemptId);

    // Calculate score (percentage)
    const totalQuestions = sectionAttempt.question_count || 0;
    const score =
      totalQuestions > 0
        ? Math.round((correctCount / totalQuestions) * 100)
        : 0;

    // Update section attempt
    sectionAttempt.status = 'COMPLETED';
    sectionAttempt.score = score;
    sectionAttempt.correct_count = correctCount;
    if (timeRemaining !== undefined) {
      sectionAttempt.time_remaining = timeRemaining;
    }

    const updated = await this.sectionAttemptRepo.save(sectionAttempt);

    // Check if test attempt should be completed
    const testAttempt = await this.testAttemptRepo.findOne({
      where: { id: updated.test_attempt.id },
      relations: ['section_attempts'],
    });
    if (testAttempt) {
      const allCompleted = testAttempt.section_attempts.every(
        (s) => s.status === 'COMPLETED',
      );

      if (allCompleted && !testAttempt.is_completed) {
        // Calculate average score
        const avgScore = Math.round(
          testAttempt.section_attempts.reduce(
            (sum, s) => sum + (s.score || 0),
            0,
          ) / testAttempt.section_attempts.length,
        );
        testAttempt.is_completed = true;
        testAttempt.total_score = avgScore;
        testAttempt.is_passed = avgScore >= 60;
        testAttempt.completed_at = new Date();
        await this.testAttemptRepo.save(testAttempt);
      }
    }

    return updated;
  }

  async createOrUpdateAnswer(
    userId: number,
    sectionAttemptId: number,
    answerDto: CreateOrUpdateAnswerDto,
  ): Promise<UserAnswerResponseDto> {
    // Verify section attempt belongs to user
    const sectionAttempt = await this.sectionAttemptRepo.findOne({
      where: { id: sectionAttemptId },
      relations: ['test_attempt', 'test_attempt.user'],
    });

    if (!sectionAttempt) {
      throw new NotFoundException('Section attempt not found');
    }

    if (sectionAttempt.test_attempt.user.id !== userId) {
      throw new ForbiddenException(
        'You do not have permission to modify answers for this section attempt',
      );
    }

    // Verify question exists
    const question = await this.questionRepo.findOne({
      where: { id: answerDto.question_id },
      relations: ['options'],
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    // Check if answer already exists
    let userAnswer = await this.userAnswerRepo.findOne({
      where: {
        section_attempt: { id: sectionAttemptId },
        question: { id: answerDto.question_id },
      },
      relations: ['selected_option'],
    });

    // Determine if answer is correct
    let isCorrect = false;
    if (answerDto.selected_option_id !== null && answerDto.selected_option_id !== undefined) {
      const selectedOption = await this.optionRepo.findOne({
        where: { id: answerDto.selected_option_id },
        relations: ['question'],
      });

      if (!selectedOption) {
        throw new NotFoundException('Selected option not found');
      }

      // Verify option belongs to question
      if (selectedOption.question.id !== answerDto.question_id) {
        throw new BadRequestException(
          'Selected option does not belong to this question',
        );
      }

      isCorrect = selectedOption.is_correct;
    }

    if (userAnswer) {
      // Update existing answer
      if (answerDto.selected_option_id !== undefined) {
        const selectedOption = answerDto.selected_option_id
          ? await this.optionRepo.findOne({
              where: { id: answerDto.selected_option_id },
              relations: ['question'],
            })
          : null;
        userAnswer.selected_option = selectedOption;
        userAnswer.is_correct = isCorrect;
      }
      if (answerDto.is_marked !== undefined) {
        userAnswer.is_marked = answerDto.is_marked;
      }
      await this.userAnswerRepo.save(userAnswer);
    } else {
      // Create new answer
      const selectedOption = answerDto.selected_option_id
        ? await this.optionRepo.findOne({
            where: { id: answerDto.selected_option_id },
            relations: ['question'],
          })
        : null;

      userAnswer = this.userAnswerRepo.create({
        section_attempt: sectionAttempt,
        question,
        selected_option: selectedOption,
        is_correct: isCorrect,
        is_marked: answerDto.is_marked ?? false,
      });
      await this.userAnswerRepo.save(userAnswer);
    }

    return {
      id: userAnswer.id,
      section_attempt_id: sectionAttemptId,
      question_id: question.id,
      selected_option_id: userAnswer.selected_option?.id ?? null,
      is_correct: userAnswer.is_correct,
      is_marked: userAnswer.is_marked,
      createdAt: userAnswer.createdAt,
      updatedAt: userAnswer.updatedAt,
    };
  }
}
