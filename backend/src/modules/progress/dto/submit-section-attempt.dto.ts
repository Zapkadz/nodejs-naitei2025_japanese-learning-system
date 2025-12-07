import { IsInt, IsOptional, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class AnswerSubmissionDto {
  @IsInt()
  question_id: number;

  @IsOptional()
  @IsInt()
  selected_option_id?: number | null;

  @IsOptional()
  is_marked?: boolean;
}

export class SubmitSectionAttemptDto {
  @IsEnum(['PAUSED', 'COMPLETED'])
  status: 'PAUSED' | 'COMPLETED';

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerSubmissionDto)
  answers: AnswerSubmissionDto[];

  @IsOptional()
  @IsInt()
  time_remaining?: number;
}

