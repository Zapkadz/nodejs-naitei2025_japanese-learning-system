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
import { SubmitSectionAttemptDto } from './dto/submit-section-attempt.dto';
import {
  SectionAttemptResponseDto,
  SectionAttemptWithDetailsResponseDto,
} from './dto/section-attempt-response.dto';
import { SectionResponseDto } from './dto/section-response.dto';

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
  @Get('section/:id')
  async getSection(
    @Param('id', ParseIntPipe) sectionId: number,
  ): Promise<{ section: SectionResponseDto }> {
    const section = await this.progressService.getSection(sectionId);
    return { section };
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
    return { sectionAttempt };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('section-attempt/:id')
  async updateSectionAttemptToInProgress(
    @Param('id', ParseIntPipe) sectionAttemptId: number,
    @Request() req,
  ): Promise<{ sectionAttempt: SectionAttemptResponseDto }> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const userId = req.user.userId;
    const sectionAttempt = await this.progressService.updateSectionAttemptToInProgress(
      userId as number,
      sectionAttemptId,
    );
    const response =
      this.progressService.buildSectionAttemptResponse(sectionAttempt);
    return { sectionAttempt: response };
  }

  @UseGuards(JwtAuthGuard)
  @Post('section-attempt/:id')
  async submitSectionAttempt(
    @Param('id', ParseIntPipe) sectionAttemptId: number,
    @Body() submitDto: SubmitSectionAttemptDto,
    @Request() req,
  ): Promise<{ sectionAttempt: SectionAttemptResponseDto }> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const userId = req.user.userId;

    // Submit the section attempt (saves answers and updates status)
    const sectionAttempt = await this.progressService.submitSectionAttempt(
      userId as number,
      sectionAttemptId,
      submitDto,
    );

    const response =
      this.progressService.buildSectionAttemptResponse(sectionAttempt);
    return { sectionAttempt: response };
  }
}
