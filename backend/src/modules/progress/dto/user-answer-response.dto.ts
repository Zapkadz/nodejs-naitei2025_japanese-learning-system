export class UserAnswerResponseDto {
  id: number;
  section_attempt_id: number;
  question_id: number;
  selected_option_id?: number | null;
  is_correct: boolean;
  is_marked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

