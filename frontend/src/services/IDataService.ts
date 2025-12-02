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
  IWeeklyActivity,
  IActivityHeatmapDay,
  ITest,
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
   * @param userId - User ID
   * @param testId - Optional test ID filter
   * @returns Promise resolving to array of test attempts
   */
  getTestAttempts(testId?: number): Promise<ITestAttempt[]>;

    // ============================================================================
  // User Statistics & Activity
  // ============================================================================

  /**
   * Get user's weekly activity (last 7 days)
   * @param userId - User ID
   * @returns Promise resolving to array of daily activity data
   */
  getUserWeeklyActivity(): Promise<IWeeklyActivity[]>;

  /**
   * Get user's activity heatmap data (last 365 days)
   * @param userId - User ID
   * @param year - Optional year filter (defaults to current year)
   * @returns Promise resolving to array of daily activity data
   */
  getUserActivityHeatmap(year?: number): Promise<IActivityHeatmapDay[]>;


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

}
