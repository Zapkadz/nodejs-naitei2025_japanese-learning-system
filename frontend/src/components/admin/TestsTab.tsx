/**
 * Tests Tab Component
 * Displays tests for admin
 */

import type { ITest } from '../../types';

interface TestsTabProps {
  tests: ITest[];
  loading: boolean;
}

export function TestsTab({ tests, loading }: TestsTabProps) {
  if (loading) {
    return null; // Loading handled by parent
  }

  return (
    <div className="space-y-6">
      {/* Tests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tests.map((test) => (
          <div
            key={test.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <span
                className={`px-3 py-1 rounded-lg text-xs font-black text-white ${
                  test.level === 'N1'
                    ? 'bg-gradient-to-r from-red-500 to-rose-600'
                    : test.level === 'N2'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-600'
                    : test.level === 'N3'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600'
                    : test.level === 'N4'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600'
                    : 'bg-gradient-to-r from-green-400 to-teal-400'
                }`}
              >
                {test.level}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  test.is_active
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400'
                }`}
              >
                {test.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>

            <h3
              className="font-bold text-gray-900 dark:text-white mb-3 line-clamp-2"
              dangerouslySetInnerHTML={{ __html: test.title }}
            />

            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span>
                {test.year}.{String(test.month).padStart(2, '0')}
              </span>
              <span>ID: {test.id}</span>
            </div>
          </div>
        ))}
      </div>

      {tests.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          Không có bài test
        </div>
      )}
    </div>
  );
}
