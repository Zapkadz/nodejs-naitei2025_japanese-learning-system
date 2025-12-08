/**
 * Statistics Tab Component
 * Displays test statistics for admin
 */

import { TrendingUp } from 'lucide-react';

interface StatisticsTabProps {
  statistics: Array<{
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
  }>;
  loading: boolean;
}

export function StatisticsTab({ statistics, loading }: StatisticsTabProps) {
  if (loading) {
    return null; // Loading handled by parent
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {statistics.map((stat) => (
          <div
            key={stat.testId}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 pb-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-black text-white ${
                        stat.testLevel === 'N1'
                          ? 'bg-gradient-to-r from-red-500 to-rose-600'
                          : stat.testLevel === 'N2'
                          ? 'bg-gradient-to-r from-orange-500 to-amber-600'
                          : stat.testLevel === 'N3'
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-600'
                          : stat.testLevel === 'N4'
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600'
                          : 'bg-gradient-to-r from-green-400 to-teal-400'
                      }`}
                    >
                      {stat.testLevel}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      ID: {stat.testId}
                    </span>
                  </div>
                  <h3
                    className="font-bold text-gray-900 dark:text-white line-clamp-2"
                    dangerouslySetInnerHTML={{ __html: stat.testTitle }}
                  />
                </div>
                <TrendingUp className="w-6 h-6 text-emerald-500 flex-shrink-0 ml-3" />
              </div>

              {/* Stats Grid - Simplified */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4 text-center">
                  <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                    {stat.completedAttempts}
                  </div>
                  <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mt-2">
                    Hoàn thành
                  </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 text-center">
                  <div className="text-3xl font-black text-amber-600 dark:text-amber-400">
                    {stat.averageScore}
                  </div>
                  <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mt-2">
                    Điểm TB
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Attempts */}
            {stat.recentAttempts.length > 0 && (
              <div className="bg-gray-50 dark:bg-gray-900/50 p-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                  Lượt thi gần đây
                </h4>
                <div className="space-y-2">
                  {stat.recentAttempts.map((attempt) => (
                    <div
                      key={attempt.id}
                      className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                          {attempt.user.full_name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {attempt.user.full_name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(attempt.completed_at).toLocaleDateString('vi-VN')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {attempt.total_score}%
                        </span>
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold ${
                            attempt.is_passed
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                          }`}
                        >
                          {attempt.is_passed ? 'Đạt' : 'Chưa đạt'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {statistics.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          Không có dữ liệu thống kê
        </div>
      )}
    </div>
  );
}
