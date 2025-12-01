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
  getTestAttempts(userId: number, testId?: number): Promise<ITestAttempt[]>;

}
