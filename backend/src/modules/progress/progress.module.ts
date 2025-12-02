import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgressService } from './progress.service';
import { ProgressController } from './progress.controller';
import { TestAttempt } from '../../entities/test_attempts.entity';
import { SectionAttempt } from '../../entities/section_attempts.entity';
import { UserAnswer } from '../../entities/user_answers.entity';
import { User } from '../../entities/users.entity';
import { Test } from '../../entities/tests.entity';
import { Question } from '../../entities/questions.entity';
import { Option } from '../../entities/options.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TestAttempt,
      SectionAttempt,
      UserAnswer,
      User,
      Test,
      Question,
      Option,
    ]),
  ],
  controllers: [ProgressController],
  providers: [ProgressService],
  exports: [ProgressService],
})
export class ProgressModule {}
