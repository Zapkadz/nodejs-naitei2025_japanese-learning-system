import axios, { type AxiosInstance, type AxiosError } from 'axios';
import type {

  IAuthResponse,
  ILoginCredentials,
  IRegisterData,
  IRegisterResponse,
  IUser,
  IUserUpdate,
  ITestAttempt,
  IPasswordChange,
  IWeeklyActivity,
  IActivityHeatmapDay,
  ITest,
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

    // Response interceptor - unwrap data và handle errors
    this.api.interceptors.response.use(
      (response) => {
        // Unwrap { success, message, data } -> return data directly
        if (response.data && 'data' in response.data) {
          response.data = response.data.data;
        }
        return response;
      },
      (error: AxiosError<ApiErrorResponse>) => {
        if (error.response?.status === 401) {
          // Unauthorized - clear token and redirect to login
          this.clearToken();
          window.location.href = '/login';
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
    const response = await this.api.post<IRegisterResponse>('/user', data);
    // Backend doesn't return token on registration, user needs to login
    return response.data;
  }

  async getCurrentUser(): Promise<IUser> {
    const response = await this.api.get<IUser>('/auth/me');
    return response.data;
  }

  async updateUser(data: IUserUpdate): Promise<IUser> {
    const response = await this.api.patch<IUser>('/user', data);
    return response.data;
  }

  async changePassword(data: IPasswordChange): Promise<void> {
    await this.api.patch('/user', data);
  }

  async uploadAvatar(file: File): Promise<IUser> {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await this.api.post<IUser>(
      '/user/avatar',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  async logout(): Promise<void> {
    this.clearToken();
  }

  // ============================================================================
  // Token Management
  // ============================================================================

  private setToken(token: string): void {
    this.token = token;
    localStorage.setItem('jlpt_auth_token', token);
  }

  private getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('jlpt_auth_token');
    }
    return this.token;
  }

  private clearToken(): void {
    this.token = null;
    localStorage.removeItem('jlpt_auth_token');
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
    const response = await this.api.post<ITestAttempt>('/test-attempts', {
      test_id: testId,
    });
    return response.data;
  }

  async getTestAttempt(testAttemptId: number): Promise<ITestAttempt> {
    const response = await this.api.get<ITestAttempt>(`/test-attempts/${testAttemptId}`);
    return response.data;
  }
  async getTestAttempts(testId?: number): Promise<ITestAttempt[]> {
    const params = new URLSearchParams();
    if (testId) params.append('test_id', testId.toString());
    const response = await this.api.get<ITestAttempt[]>(`/test-attempts`, { params });
    return response.data;
  }

    // ============================================================================
  // User Statistics & Activity
  // ============================================================================

  async getUserWeeklyActivity(): Promise<IWeeklyActivity[]> {
    const response = await this.api.get<IWeeklyActivity[]>(`/weekly-activity`);
    return response.data;
  }

  async getUserActivityHeatmap(year?: number): Promise<IActivityHeatmapDay[]> {
    const params = year ? { year } : {};
    const response = await this.api.get<IActivityHeatmapDay[]>(
      `/activity-heatmap`,
      { params }
    );
    return response.data;
  }

  // ============================================================================
  // Test Management
  // ============================================================================

  async getTests(filter?: TestFilter): Promise<ITest[]> {
    const params = new URLSearchParams();

    if (filter?.level) params.append('level', filter.level);
    if (filter?.year) params.append('year', filter.year.toString());
    if (filter?.is_active !== undefined) params.append('is_active', filter.is_active.toString());

    const response = await this.api.get<any>('/tests', { params });
    const data = response.data;
    if (Array.isArray(data)) return data as ITest[];
    if (data && Array.isArray(data.tests)) return data.tests as ITest[];
    return [];
  }
}

