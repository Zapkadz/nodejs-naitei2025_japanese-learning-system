/**
 * Admin Page
 * Manage users, tests, and view statistics
 */

import { useState, useEffect } from 'react';
import { Users, FileText, BarChart3 } from 'lucide-react';
import { dataService } from '../services';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { AdminLayout } from '../layouts/AdminLayout';
import { StatisticsTab } from '../components/admin/StatisticsTab';
import { UsersTab } from '../components/admin/UsersTab';
import { TestsTab } from '../components/admin/TestsTab';
import { API_BASE_URL } from '../services/config';
import { useAuthStore } from '../store/useAuthStore';
import type { IUser, ITest } from '../types';

type TabType = 'users' | 'tests' | 'statistics';

export function AdminPage() {
  const { token } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>('statistics');
  const [loading, setLoading] = useState(false);

  // Users
  const [users, setUsers] = useState<IUser[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Tests
  const [tests, setTests] = useState<ITest[]>([]);

  // Statistics
  const [statistics, setStatistics] = useState<Array<{
    testId: number;
    testTitle: string;
    testLevel: string;
    completedAttempts: number;
    averageScore: number;
    recentAttempts: Array<{
      id: number;
      total_score: number;
      is_passed: boolean;
      started_at: string;
      user: {
        id: number;
        full_name: string;
        email: string;
        image: string | null;
      };
    }>;
  }>>([]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(userSearch);
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timer);
  }, [userSearch]);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'tests') {
      fetchTests();
    } else if (activeTab === 'statistics') {
      fetchStatistics();
    }
  }, [activeTab, debouncedSearch]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await dataService.getAllUsers(debouncedSearch || undefined);
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTests = async () => {
    setLoading(true);
    try {
      const data = await dataService.getTests({ skill: 'all' });
      setTests(data);
    } catch (error) {
      console.error('Failed to fetch tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      // Step 1: Get all tests first
      const allTests = await dataService.getTests({ skill: 'all' });
      console.log('[AdminPage] Fetched tests:', allTests.length);
      
      // Step 2: Fetch completed attempts for each test using correct API
      const statisticsPromises = allTests.map(async (test) => {
        try {
          // Get token from auth store or localStorage
          const authToken = token || localStorage.getItem('token');
          if (!authToken) {
            throw new Error('No token found in auth store or localStorage');
          }

          // Call the correct API: /user/admin/{testId}/completed-attempts
          const url = `${API_BASE_URL}/user/admin/${test.id}/completed-attempts`;
          console.log(`[AdminPage] Fetching stats for test ${test.id}:`, url);
          
          const response = await fetch(url, {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error(`[AdminPage] Error for test ${test.id}:`, response.status, errorText);
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          console.log(`[AdminPage] Stats data for test ${test.id}:`, data);
          
          const attempts = data.attempts || [];
          
          // Calculate statistics
          const completedCount = attempts.filter((a: any) => a.is_completed).length;
          
          // Calculate average score from completed attempts
          const totalScore = attempts
            .filter((a: any) => a.is_completed)
            .reduce((sum: number, a: any) => sum + (a.total_score || 0), 0);
          const avgScore = completedCount > 0 ? totalScore / completedCount : 0;
          
          // Get recent attempts (last 3)
          const recentAttempts = attempts.slice(0, 3);
          
          return {
            testId: test.id,
            testTitle: test.title,
            testLevel: test.level,
            completedAttempts: completedCount,
            averageScore: Math.round(avgScore * 10) / 10,
            recentAttempts: recentAttempts.map((a: any) => ({
              id: a.id,
              total_score: a.total_score || 0,
              is_passed: a.is_passed || false,
              started_at: a.started_at,
              user: a.user || {
                id: 0,
                full_name: 'Unknown',
                email: '',
                image: null,
              },
            })),
          };
        } catch (error) {
          console.error(`[AdminPage] Failed to fetch stats for test ${test.id}:`, error);
          return {
            testId: test.id,
            testTitle: test.title,
            testLevel: test.level,
            completedAttempts: 0,
            averageScore: 0,
            recentAttempts: [],
          };
        }
      });
      
      const enrichedStats = await Promise.all(statisticsPromises);
      console.log('[AdminPage] Final statistics:', enrichedStats);
      setStatistics(enrichedStats);
    } catch (error) {
      console.error('[AdminPage] Failed to fetch statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('statistics')}
          className={`px-6 py-3 font-semibold transition-colors relative ${
            activeTab === 'statistics'
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            <span>Thống kê</span>
          </div>
          {activeTab === 'statistics' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 dark:bg-emerald-400" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-6 py-3 font-semibold transition-colors relative ${
            activeTab === 'users'
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            <span>Người dùng</span>
          </div>
          {activeTab === 'users' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 dark:bg-emerald-400" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('tests')}
          className={`px-6 py-3 font-semibold transition-colors relative ${
            activeTab === 'tests'
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            <span>Bài test</span>
          </div>
          {activeTab === 'tests' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 dark:bg-emerald-400" />
          )}
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner text="Đang tải..." />
      ) : (
        <>
          {activeTab === 'statistics' && (
            <StatisticsTab statistics={statistics} loading={loading} />
          )}
          {activeTab === 'users' && (
            <UsersTab 
              users={users} 
              userSearch={userSearch}
              onSearchChange={setUserSearch}
              loading={loading}
            />
          )}
          {activeTab === 'tests' && (
            <TestsTab tests={tests} loading={loading} />
          )}
        </>
      )}
    </AdminLayout>
  );
}
