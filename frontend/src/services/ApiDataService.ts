import axios, { type AxiosInstance, type AxiosError } from 'axios';
import type {

  IAuthResponse,
  ILoginCredentials,
  IRegisterData,
  IRegisterResponse,
  IUser,
  IUserUpdate,
  ITestAttempt,
  ISectionAttempt,
  ISubmission,
  IResult,
  IPasswordChange,
  IWeeklyActivity,
  IActivityHeatmapDay,
  ITest,
  ITestDetail,
  TestFilter,
} from '../types';
import type { IDataService } from './IDataService';

// API Error response
interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Array<{ field: string; message: string }>;
}

export class ApiDataService implements IDataService {
  private api: AxiosInstance;
  private token: string | null = null;

  constructor(baseURL: string = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api') {
    this.api = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - handle errors only, backend returns data directly
    this.api.interceptors.response.use(
      (response) => {
        // Backend returns data directly like { user: {...} }, { tests: [...] }, etc.
        // No need to unwrap
        return response;
      },
      (error: AxiosError<ApiErrorResponse>) => {
        if (error.response?.status === 401) {
          // Unauthorized - clear token and redirect to login
          this.clearToken();
          window.location.href = '/';
        }
        return Promise.reject(this.handleApiError(error));
      }
    );
  }


  // ============================================================================
  // Authentication
  // ============================================================================

  async login(credentials: ILoginCredentials): Promise<IAuthResponse> {
    const response = await this.api.post<{ user: IUser & { token: string } }>('/auth/login', credentials);
    const { token, ...userWithoutToken } = response.data.user;
    this.setToken(token);
    
    return {
      token,
      user: userWithoutToken as IUser,
    };
  }

  async register(data: IRegisterData): Promise<IRegisterResponse> {
    const response = await this.api.post<{ user: IUser }>('/user', data);
    // Backend doesn't return token on registration, user needs to login
    return { user: response.data.user };
  }

  async getCurrentUser(): Promise<IUser> {
    const response = await this.api.get<{ user: IUser }>('/auth/me');
    return response.data.user;
  }

  async updateUser(data: IUserUpdate): Promise<IUser> {
    const response = await this.api.patch<{ user: IUser }>('/user', data);
    return response.data.user;
  }

  async changePassword(data: IPasswordChange): Promise<void> {
    await this.api.patch('/user', data);
  }

  async uploadAvatar(file: File): Promise<IUser> {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await this.api.post<{ user: IUser }>(
      '/user/avatar',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.user;
  }

  async logout(): Promise<void> {
    this.clearToken();
  }

  // ============================================================================
  // Token Management
  // ============================================================================

  private setToken(token: string): void {
    this.token = token;
    // Sync with both storages
    localStorage.setItem('jlpt_auth_token', token);
    
    // Also update Zustand storage
    try {
      const zustandData = localStorage.getItem('jlpt-auth-storage');
      if (zustandData) {
        const parsed = JSON.parse(zustandData);
        parsed.state.token = token;
        localStorage.setItem('jlpt-auth-storage', JSON.stringify(parsed));
      }
    } catch (e) {
      console.error('Failed to sync token with Zustand storage', e);
    }
  }

  private getToken(): string | null {
    if (!this.token) {
      // Try localStorage first
      this.token = localStorage.getItem('jlpt_auth_token');
      
      // Fallback to Zustand storage
      if (!this.token) {
        try {
          const zustandData = localStorage.getItem('jlpt-auth-storage');
          if (zustandData) {
            const parsed = JSON.parse(zustandData);
            this.token = parsed.state?.token || null;
          }
        } catch (e) {
          console.error('Failed to get token from Zustand storage', e);
        }
      }
    }
    return this.token;
  }

  private clearToken(): void {
    this.token = null;
    localStorage.removeItem('jlpt_auth_token');
    localStorage.removeItem('jlpt-auth-storage');
  }

  // ============================================================================
  // Error Handling
  // ============================================================================

  private handleApiError(error: AxiosError<ApiErrorResponse>): Error {
    if (error.response) {
      // Server responded with error status
      const data = error.response.data;
      let message = data?.message || error.message;
      
      // Append validation errors if available
      if (data?.errors && data.errors.length > 0) {
        const fieldErrors = data.errors.map(e => `${e.field}: ${e.message}`).join(', ');
        message = `${message} (${fieldErrors})`;
      }
      
      return new Error(message);
    } else if (error.request) {
      return new Error('Network Error: No response from server. Please check your connection.');
    } else {
      return new Error(`Request Error: ${error.message}`);
    }
  }
  // ============================================================================
  // Test Attempt Management
  // ============================================================================

  async startTestAttempt(testId: number): Promise<ITestAttempt> {
    // Backend lấy userId từ JWT token
    const response = await this.api.post<{ testAttempt: ITestAttempt }>(
      `/progress/test-attempt/start/${testId}`
    );
    return response.data.testAttempt;
  }

  async getTestAttempt(testAttemptId: number): Promise<ITestAttempt> {
    const response = await this.api.get<{ testAttempt: ITestAttempt }>(
      `/progress/test-attempt/${testAttemptId}`
    );
    return response.data.testAttempt;
  }
  async getTestAttempts(_userId: number, testId?: number): Promise<ITestAttempt[]> {
    // Backend API: GET /progress/test-attempts (returns all attempts for current user from JWT)
    // _userId parameter kept for interface compatibility with srccopy
    const response = await this.api.get<{ testAttempts: ITestAttempt[] }>(
      '/progress/test-attempts'
    );
    const attempts = response.data.testAttempts;
    
    // Filter by testId on frontend if provided
    if (testId) {
      // Backend returns testId (camelCase), but also check test_id for compatibility
      const filtered = attempts.filter(a => {
        const attemptTestId = a.testId || a.test_id;
        return attemptTestId === testId;
      });
      return filtered;
    }
    return attempts;
  }

  async getUserTestAttempts(testId: number): Promise<ITestAttempt[]> {
    const response = await this.api.get<{ testAttempts: ITestAttempt[] }>(
      `/progress/test-attempts-by-test/${testId}`
    );
    return response.data.testAttempts;
  }

  // ============================================================================
  // Section Management
  // ============================================================================

  async getSection(sectionId: number): Promise<ISectionWithParts> {
    const response = await this.api.get<{ section: ISectionWithParts }>(
      `/progress/section/${sectionId}`
    );
    return response.data.section;
  }

  // ============================================================================
  // Section Attempt Management
  // ============================================================================

  async getSectionAttempt(attemptId: number): Promise<ISectionAttempt> {
    const response = await this.api.get<{ sectionAttempt: ISectionAttempt }>(
      `/progress/section-attempt/${attemptId}`
    );
    return response.data.sectionAttempt;
  }

  async updateSectionAttempt(attemptId: number, status: string): Promise<ISectionAttempt> {
    const response = await this.api.patch<{ sectionAttempt: ISectionAttempt }>(
      `/progress/section-attempt/${attemptId}`,
      { status }
    );
    return response.data.sectionAttempt;
  }

  async submitSectionAttempt(attemptId: number, answers: IAnswer[], status: string, timeRemaining: number): Promise<IResult> {
    const response = await this.api.post<{ result: IResult }>(
      `/progress/section-attempt/${attemptId}`,
      { 
        answers, 
        status,
        time_remaining: timeRemaining
      }
    );
    return response.data.result;
  }

    // ============================================================================
  // User Statistics & Activity
  // ============================================================================

  async getUserWeeklyActivity(): Promise<IWeeklyActivity[]> {
    const response = await this.api.get<IWeeklyActivity[]>('/user/weekly-activity');
    return response.data;
  }

  // ============================================================================
  // Admin Methods
  // ============================================================================

  async getAllUsers(search?: string): Promise<IUser[]> {
    const params = new URLSearchParams();
    if (search) params.append('query', search);
    
    const response = await this.api.get<{ users: IUser[] }>('/user/admin/all', { params });
    return response.data.users;
  }

  async getTestStatistics(testId?: number): Promise<Array<{
    testId: number;
    testTitle: string;
    completedAttempts: number;
    totalAttempts: number;
  }>> {
    const url = testId ? `/admin/statistics/test/${testId}` : '/admin/statistics/tests';
    const response = await this.api.get<{ statistics: Array<{
      testId: number;
      testTitle: string;
      completedAttempts: number;
      totalAttempts: number;
    }> }>(url);
    return response.data.statistics;
  }

  // ============================================================================
  // Test Management
  // ============================================================================

  async getTests(filter?: TestFilter): Promise<ITest[]> {
    const params = new URLSearchParams();

    if (filter?.level) params.append('level', filter.level);
    if (filter?.year) params.append('year', filter.year.toString());
    if (filter?.is_active !== undefined) params.append('is_active', filter.is_active.toString());

    const response = await this.api.get<{ tests: ITest[] }>('/tests', { params });
    return response.data.tests;
  }

  async getTestDetail(id: number): Promise<ITestDetail> {
    const response = await this.api.get<{ test: ITestDetail }>(`/tests/${id}`);
    return response.data.test;
  }

  // ============================================================================
  // Section Attempt Management
  // ============================================================================

  // Note: Backend auto-creates 3 section attempts when test attempt is created
}

