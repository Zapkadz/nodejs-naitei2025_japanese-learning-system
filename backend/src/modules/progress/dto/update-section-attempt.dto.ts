import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';

export type AttemptStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED';

export class UpdateSectionAttemptDto {
  @IsOptional()
  @IsEnum(['NOT_STARTED', 'IN_PROGRESS', 'PAUSED', 'COMPLETED'])
  status?: AttemptStatus;

  @IsOptional()
  @IsInt()
  @Min(0)
  score?: number | null;

  // correct_count is calculated automatically, not updated manually

  @IsOptional()
  @IsInt()
  @Min(0)
  time_remaining?: number;
}

