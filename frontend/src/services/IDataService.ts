/**
 * Data Service Interface
 * Defines the contract for data fetching operations
 * Can be implemented by MockDataService or ApiDataService
 */

import type {
  IAuthResponse,
  ILoginCredentials,
  IRegisterData,
  IRegisterResponse,
  IUser,
  IUserUpdate,
  IPasswordChange,
  ITestAttempt,
  ISectionAttempt,
  ISubmission,
  IResult,
  IWeeklyActivity,
  IActivityHeatmapDay,
  ITest,
  ITestDetail,
  TestFilter,
} from '../types';

export interface IDataService {
  

  // ============================================================================
  // Authentication
  // ============================================================================

  /**
   * Login user
   * @param credentials - Email and password
   * @returns Promise resolving to authentication response with token and user
   */
  login(credentials: ILoginCredentials): Promise<IAuthResponse>;

  /**
   * Register new user
   * @param data - Registration data
   * @returns Promise resolving to user data (no token, requires login)
   */
  register(data: IRegisterData): Promise<IRegisterResponse>;

  /**
   * Get current user profile
   * @returns Promise resolving to user data
   */
  getCurrentUser(): Promise<IUser>;

  /**
   * Update user profile
   * @param data - Updated user data
   * @returns Promise resolving to updated user
   */
  updateUser(data: IUserUpdate): Promise<IUser>;

  /**
   * Change user password
   * @param data - Current and new password
   * @returns Promise resolving when password is changed
   */
  changePassword(data: IPasswordChange): Promise<void>;

  /**
   * Upload user avatar
   * @param file - Avatar image file
   * @returns Promise resolving to updated user with new avatar URL
   */
  uploadAvatar(file: File): Promise<IUser>;

  /**
   * Logout current user and invalidate session tokens
   * @returns Promise resolving when logout is complete
   */
  logout(): Promise<void>; 

  // ============================================================================
  // Test Attempt Management (Parent)
  // ============================================================================

  /**
   * Start a new test attempt (creates parent record)
   * Backend extracts userId from JWT token
   * @param testId - Test ID
   * @returns Promise resolving to created test attempt
   */
  startTestAttempt(testId: number): Promise<ITestAttempt>;

  /**
   * Get test attempt by ID (with all section attempts)
   * @param testAttemptId - Test attempt ID
   * @returns Promise resolving to test attempt with sections
   */
  getTestAttempt(testAttemptId: number): Promise<ITestAttempt>;

  /**
   * Get all test attempts for a user (optionally filtered by test)
   * @param userId - User ID (for interface compatibility, backend gets from JWT)
   * @param testId - Optional test ID filter
   * @returns Promise resolving to array of test attempts
   */
  getTestAttempts(userId: number, testId?: number): Promise<ITestAttempt[]>;

  /**
   * Get user test attempts by test ID
   * @param testId - Test ID
   * @returns Promise resolving to array of test attempts for the test
   */
  getUserTestAttempts(testId: number): Promise<ITestAttempt[]>;

  // ============================================================================
  // Section Management
  // ============================================================================

  /**
   * Get section detail with questions (for exam)
   * @param sectionId - Section ID
   * @returns Promise resolving to section with parts and questions
   */
  getSection(sectionId: number): Promise<ISectionWithParts>;

  // ============================================================================
  // Section Attempt Management
  // ============================================================================

  /**
   * Get section attempt detail (includes user answers and correct answers if completed)
   * @param attemptId - Section attempt ID
   * @returns Promise resolving to section attempt with answers
   */
  getSectionAttempt(attemptId: number): Promise<ISectionAttempt>;

  /**
   * Update section attempt status (e.g., NOT_STARTED → IN_PROGRESS)
   * @param attemptId - Section attempt ID
   * @param status - New status
   * @returns Promise resolving to updated section attempt
   */
  updateSectionAttempt(attemptId: number, status: string): Promise<ISectionAttempt>;

  /**
   * Submit section attempt answers with status (PAUSED/COMPLETED)
   * @param attemptId - Section attempt ID
   * @param answers - User answers array
   * @param status - Submission status (PAUSED/COMPLETED)
   * @param timeRemaining - Remaining time in seconds
   * @returns Promise resolving to result with score
   */
  submitSectionAttempt(attemptId: number, answers: IAnswer[], status: string, timeRemaining: number): Promise<IResult>;

  /**
   * Get attempt result for review
   * @param attemptId - Section attempt ID
   * @returns Promise resolving to detailed result
   */
  getAttemptResult(attemptId: number): Promise<IResult>;

    // ============================================================================
  // User Statistics & Activity
  // ============================================================================

  /**
   * Get user's weekly activity (last 7 days)
   * @returns Promise resolving to array of daily activity data
   */
  getUserWeeklyActivity(): Promise<IWeeklyActivity[]>;

  // ============================================================================
  // Admin Methods
  // ============================================================================

  /**
   * Get all users with optional search
   * @param search - Optional search query for name/email
   * @returns Promise resolving to array of users
   */
  getAllUsers(search?: string): Promise<IUser[]>;

  /**
   * Get test statistics (completed attempts count)
   * @param testId - Optional specific test ID
   * @returns Promise resolving to test statistics
   */
  getTestStatistics(testId?: number): Promise<Array<{
    testId: number;
    testTitle: string;
    completedAttempts: number;
    totalAttempts: number;
  }>>;

   // ============================================================================
  // Test Management
  // ============================================================================

  /**
   * Get list of tests with optional filtering
   * @param filter - Optional filter criteria (level, year, is_active)
   * @returns Promise resolving to array of tests
   */
  getTests(filter?: TestFilter): Promise<ITest[]>;

  /**
   * Get detailed test information including all sections, parts, questions, and options
   * @param id - Test ID
   * @returns Promise resolving to test detail with nested structure
   */
  getTestDetail(id: number): Promise<ITestDetail>;
}
