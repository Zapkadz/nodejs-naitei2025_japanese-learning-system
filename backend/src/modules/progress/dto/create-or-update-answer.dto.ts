import { IsInt, IsBoolean, IsOptional } from 'class-validator';

export class CreateOrUpdateAnswerDto {
  @IsInt()
  question_id: number;

  @IsOptional()
  @IsInt()
  selected_option_id?: number | null;

  @IsOptional()
  @IsBoolean()
  is_marked?: boolean;
}
