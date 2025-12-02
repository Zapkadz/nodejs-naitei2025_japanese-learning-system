/**
 * Type definitions for JLPT Practice Application
 * Note: title, content, and explanation fields support HTML strings (including <ruby> tags for Furigana)
 */

// ============================================================================
// Enums and Literal Types
// ============================================================================

export type JLPTLevel = 'N1' | 'N2' | 'N3' | 'N4' | 'N5';

export type UserRole = 'ADMIN' | 'USER';

export type AttemptStatus = 'NOT_STARTED' | 'PAUSED' | 'COMPLETED' | 'IN_PROGRESS';

export type SectionType = 'VOCAB' | 'GRAMMAR_READING' | 'LISTENING';

// ============================================================================
// Core Entity Interfaces
// ============================================================================

export interface ITest {
  id: number;
  title: string; // HTML supported
  level: JLPTLevel;
  year: number;
  month: number;
  is_active: boolean;
  is_attempted?: boolean; // Has user started this test?
  created_at?: string;
  updated_at?: string;
}

export interface ISection {
  id: number;
  test_id: number;
  name: string;
  audio_url: string | null;
  time_limit: number; // in minutes
  order_index: number; // 1: Vocab, 2: Grammar/Reading, 3: Listening
  created_at?: string;
  updated_at?: string;
}

export interface IPart {
  id: number;
  section_id: number;
  part_number: number;
  title: string; // HTML supported (e.g., "問題1: <ruby>漢字<rt>かんじ</rt></ruby>")
  created_at?: string;
  updated_at?: string;
}

export interface IPassage {
  id: number;
  part_id: number;
  title: string | null; // HTML supported
  content: string; // HTML supported (reading passages with furigana)
  image_url: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface IQuestion {
  id: number;
  part_id: number;
  passage_id: number | null;
  question_number: number;
  content: string; // HTML supported
  image_url: string | null;
  audio_url: string | null;
  explanation: string | null; // HTML supported
  created_at?: string;
  updated_at?: string;
}

export interface IOption {
  id: number;
  question_id: number;
  content: string; // HTML supported
  order_index: number;
  is_correct: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface IUser {
  id: number;
  email: string;
  password?: string; // Optional (not returned in API responses)
  full_name: string;
  urlAvatar: string | null;
  role: UserRole;
  created_at?: string;
  updated_at?: string;
}

// Test Attempt (includes all 3 sections)
export interface ITestAttempt {
  id: number;
  user_id: number;
  test_id: number;
  test_title: string;
  level: JLPTLevel;
  is_completed: boolean;
  is_passed: boolean | null;
  total_score: number | null;
  started_at: string;
  completed_at: string | null;
  sections: ISectionAttemptWithDetails[]; // Array of 3 section attempts
}

export interface ISectionAttemptWithDetails extends ISectionAttempt {
  section_name: string;
  time_limit: number;
}

export interface ISectionAttempt {
  id: number;
  test_attempt_id: number; // FK to test_attempts
  section_id: number;
  status: AttemptStatus;
  score: number | null;
  correct_count: number | null;
  question_count: number; // Total number of questions in this section
  time_remaining: number | null; // in seconds
  created_at: string;
  updated_at: string;
}

export interface IUserAnswer {
  id: number;
  section_attempt_id: number;
  question_id: number;
  selected_option_id: number | null;
  is_correct: boolean | null;
  is_marked: boolean; // Flag for review
  created_at?: string;
  updated_at?: string;
}

// ============================================================================
// Nested/Composite Interfaces for API Responses
// ============================================================================

export interface IQuestionWithOptions extends IQuestion {
  options: IOption[];
}

export interface IPartWithQuestions extends IPart {
  questions: IQuestionWithOptions[];
  passage?: IPassage; // Optional: only if this part has a reading passage
}

export interface ISectionWithParts extends ISection {
  parts: IPartWithQuestions[];
}

export interface ITestDetail extends ITest {
  sections: ISectionWithParts[];
}

// ============================================================================
// Request/Response DTOs
// ============================================================================

export interface TestFilter {
  level?: JLPTLevel;
  year?: number;
  is_active?: boolean;
}

export interface IAnswerSubmission {
  question_id: number;
  selected_option_id: number | null;
  is_marked: boolean;
}

export interface ISubmission {
  section_attempt_id: number;
  answers: IAnswerSubmission[];
  time_remaining?: number; // in seconds
}

export interface IQuestionResult {
  question_id: number;
  question_number: number;
  selected_option_id: number | null;
  correct_option_id: number;
  is_correct: boolean;
  is_marked: boolean;
  explanation: string | null;
}

export interface IResult {
  section_attempt_id: number;
  score: number;
  correct_count: number;
  total_questions: number;
  percentage: number;
  questions: IQuestionResult[];
}


// ============================================================================
// User Session/Authentication
// ============================================================================

export interface ILoginCredentials {
  email: string;
  password: string;
}

export interface IRegisterData {
  email: string;
  password: string;
  confirm_password: string;
  full_name: string;
  urlAvatar?: string | null;
}

export interface IAuthResponse {
  token: string;
  user: IUser;
}

export interface IRegisterResponse {
  user: IUser;
}

export interface IRegisterResponse {
  user: IUser;
}

// ============================================================================
// User Profile Update
// ============================================================================

export interface IUserUpdate {
  full_name?: string;
  urlAvatar?: string | null;
}

export interface IPasswordChange {
  currentPassword: string;
  password: string; // Backend expects `password` in UpdateUserDto
}

// ============================================================================
// UI State Types
// ============================================================================

export interface IAnswerState {
  [questionId: number]: {
    selected_option_id: number | null;
    is_marked: boolean;
  };
}

export interface ISectionProgress {
  answered: number;
  marked: number;
  total: number;
}


export interface ITestAttempt {
  id: number;
  user_id: number;
  test_id: number;
  test_title: string;
  level: JLPTLevel;
  is_completed: boolean;
  is_passed: boolean | null;
  total_score: number | null;
  started_at: string;
  completed_at: string | null;
  sections: ISectionAttemptWithDetails[]; // Array of 3 section attempts
}

// ============================================================================
// User Statistics & Activity
// ============================================================================

export interface IWeeklyActivity {
  day: string; // 'Sun', 'Mon', 'Tue', etc.
  completed: number; // number of completed tests
  date: string; // ISO date string
}

export interface IActivityHeatmapDay {
  date: string; // 'YYYY-MM-DD'
  count: number; // number of activities (completed tests/sections)
  level: 0 | 1 | 2 | 3 | 4; // intensity level for color coding
}

// ============================================================================
// Request/Response DTOs
// ============================================================================

export interface TestFilter {
  level?: JLPTLevel;
  year?: number;
  is_active?: boolean;
}

export interface IAnswerSubmission {
  question_id: number;
  selected_option_id: number | null;
  is_marked: boolean;
}

export interface ISubmission {
  section_attempt_id: number;
  answers: IAnswerSubmission[];
  time_remaining?: number; // in seconds
}

export interface IQuestionResult {
  question_id: number;
  question_number: number;
  selected_option_id: number | null;
  correct_option_id: number;
  is_correct: boolean;
  is_marked: boolean;
  explanation: string | null;
}

export interface IResult {
  section_attempt_id: number;
  score: number;
  correct_count: number;
  total_questions: number;
  percentage: number;
  questions: IQuestionResult[];
}
