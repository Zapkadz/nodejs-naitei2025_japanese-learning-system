// src/modules/progress/progress.controller.ts
import {
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Body,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { ProgressService } from './progress.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { TestAttemptResponseDto } from './dto/test-attempt-response.dto';
import { UserAnswerResponseDto } from './dto/user-answer-response.dto';
import { UpdateSectionAttemptDto } from './dto/update-section-attempt.dto';
import { CreateOrUpdateAnswerDto } from './dto/create-or-update-answer.dto';
import { SubmitSectionAttemptDto } from './dto/submit-section-attempt.dto';
import {
  SectionAttemptResponseDto,
  SectionAttemptWithDetailsResponseDto,
} from './dto/section-attempt-response.dto';
import { SectionAttempt } from '../../entities/section_attempts.entity';

interface JwtPayload {
  userId: number;
  email: string;
}

@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @UseGuards(JwtAuthGuard)
  @Get('test-attempts')
  async getTestAttempts(
    @Request() req,
  ): Promise<{ testAttempts: TestAttemptResponseDto[] }> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const userId = req.user.userId;
    const attempts = await this.progressService.getTestAttempts(
      userId as number,
    );
    const test_attempts = attempts.map((a) =>
      this.progressService.buildTestAttemptResponse(a),
    );
    return { testAttempts: test_attempts };
  }

  @UseGuards(JwtAuthGuard)
  @Get('test-attempt/:id')
  async getTestAttempt(
    @Param('id') id: number,
    @Request() req,
  ): Promise<{ testAttempt: TestAttemptResponseDto }> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const userId = req.user.userId;
    const attempt = await this.progressService.getTestAttemptById(
      userId as number,
      id,
    );
    const test_attempt = this.progressService.buildTestAttemptResponse(attempt);
    return { testAttempt: test_attempt };
  }

  @UseGuards(JwtAuthGuard)
  @Post('test-attempt/start/:testId')
  async startTestAttempt(
    @Param('testId') testId: number,
    @Request() req,
  ): Promise<{ testAttempt: TestAttemptResponseDto }> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const userId = (req.user as JwtPayload).userId;
    const attempt = await this.progressService.startTestAttempt({
      userId,
      testId,
    });
    const test_attempt = this.progressService.buildTestAttemptResponse(attempt);
    return { testAttempt: test_attempt };
  }

  @UseGuards(JwtAuthGuard)
  @Get('section-attempt/:id/answers')
  async getAnswersBySectionAttempt(
    @Param('id', ParseIntPipe) sectionAttemptId: number,
    @Request() req,
  ): Promise<{ answers: UserAnswerResponseDto[] }> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const userId = req.user.userId;
    const answers = await this.progressService.getAnswersBySectionAttemptId(
      userId as number,
      sectionAttemptId,
    );
    return { answers };
  }

  @UseGuards(JwtAuthGuard)
  @Get('section-attempt/:id')
  async getSectionAttempt(
    @Param('id', ParseIntPipe) sectionAttemptId: number,
    @Request() req,
  ): Promise<{ sectionAttempt: SectionAttemptWithDetailsResponseDto }> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const userId = req.user.userId;
    const sectionAttempt = await this.progressService.getSectionAttempt(
      userId as number,
      sectionAttemptId,
    );
    const response =
      this.progressService.buildSectionAttemptWithDetailsResponse(
        sectionAttempt,
      );
    return { sectionAttempt: response };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('section-attempt/:id')
  async updateSectionAttempt(
    @Param('id', ParseIntPipe) sectionAttemptId: number,
    @Body() updateDto: UpdateSectionAttemptDto,
    @Request() req,
  ): Promise<{ sectionAttempt: SectionAttemptResponseDto }> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const userId = req.user.userId;
    const sectionAttempt = await this.progressService.updateSectionAttempt(
      userId as number,
      sectionAttemptId,
      updateDto,
    );
    const response =
      this.progressService.buildSectionAttemptResponse(sectionAttempt);
    return { sectionAttempt: response };
  }

  @UseGuards(JwtAuthGuard)
  @Post('section-attempt/:id/submit')
  async submitSectionAttempt(
    @Param('id', ParseIntPipe) sectionAttemptId: number,
    @Body() submitDto: SubmitSectionAttemptDto,
    @Request() req,
  ): Promise<{ sectionAttempt: SectionAttemptResponseDto }> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const userId = req.user.userId;

    // First, save/update all answers
    for (const answer of submitDto.answers) {
      await this.progressService.createOrUpdateAnswer(
        userId as number,
        sectionAttemptId,
        answer,
      );
    }

    // Then submit the section attempt (calculates correct_count and score)
    const sectionAttempt = await this.progressService.submitSectionAttempt(
      userId as number,
      sectionAttemptId,
      submitDto.time_remaining,
    );

    const response =
      this.progressService.buildSectionAttemptResponse(sectionAttempt);
    return { sectionAttempt: response };
  }

  @UseGuards(JwtAuthGuard)
  @Post('section-attempt/:id/answer')
  async createOrUpdateAnswer(
    @Param('id', ParseIntPipe) sectionAttemptId: number,
    @Body() answerDto: CreateOrUpdateAnswerDto,
    @Request() req,
  ): Promise<{ answer: UserAnswerResponseDto }> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const userId = req.user.userId;
    const answer = await this.progressService.createOrUpdateAnswer(
      userId as number,
      sectionAttemptId,
      answerDto,
    );
    return { answer };
  }
}
