import { IsInt, IsOptional, IsArray, ValidateNested } from 'class-validator';
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
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerSubmissionDto)
  answers: AnswerSubmissionDto[];

  @IsOptional()
  @IsInt()
  time_remaining?: number;
}

