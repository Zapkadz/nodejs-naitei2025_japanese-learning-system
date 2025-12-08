import { UserAnswerResponseDto } from './user-answer-response.dto';

// DTO for Section Attempt Response matching frontend ISectionAttempt
export class SectionAttemptResponseDto {
  id: number;
  test_attempt_id: number;
  section_id: number;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED';
  score: number | null;
  correct_count: number | null;
  question_count: number;
  time_remaining: number | null;
  created_at: string;
  updated_at: string;
}

// DTO for Section Attempt with Details matching frontend ISectionAttemptWithDetails
export class SectionAttemptWithDetailsResponseDto extends SectionAttemptResponseDto {
  section_name: string;
  time_limit: number;
  user_answers?: UserAnswerResponseDto[]; // Only included when status is PAUSED or COMPLETED
}
