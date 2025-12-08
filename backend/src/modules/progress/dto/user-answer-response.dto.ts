export class UserAnswerResponseDto {
  id: number;
  section_attempt_id: number;
  question_id: number;
  selected_option_id?: number | null;
  option_correct_id?: number | null; // ID of the correct option (only if status is COMPLETED)
  is_marked: boolean;
  createdAt: Date;
  updatedAt: Date;
}
