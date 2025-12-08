/**
 * Dashboard Page - Shows all available tests with filters
 * Same as TestsPage functionality
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';
import { dataService } from '../services';
import type { ITest, JLPTLevel } from '../types';
import { TestCardList } from '../components/TestCardList';

export function DashboardPage() {
  const { t } = useTranslation();

  const [tests, setTests] = useState<ITest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState<JLPTLevel | 'ALL'>('ALL');
  const [selectedYear, setSelectedYear] = useState<number | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'ATTEMPTED' | 'NOT_ATTEMPTED'>('ALL');

  const levels: Array<JLPTLevel | 'ALL'> = ['ALL', 'N1', 'N2', 'N3', 'N4', 'N5'];
  const years = [2024, 2023, 2022, 2021, 2020];

  useEffect(() => {
    fetchTests();
  }, [selectedLevel, selectedYear, selectedStatus]);

  const fetchTests = async () => {
    setLoading(true);
    try {
      const filter = {
        level: selectedLevel !== 'ALL' ? selectedLevel : undefined,
        year: selectedYear !== 'ALL' ? selectedYear : undefined,
      };
      let data = await dataService.getTests(filter);
      
      // Fetch all test attempts to check which tests have been attempted/completed
      try {
        const allAttempts = await dataService.getTestAttempts();
        const attemptedTestIds = new Set(allAttempts.map(attempt => attempt.testId || (attempt as any).test_id));
        const completedTestIds = new Set(
          allAttempts
            .filter(attempt => attempt.is_completed)
            .map(attempt => attempt.testId || (attempt as any).test_id)
        );
        
        // Store original values from backend for comparison
        const originalIsAttempted = new Map(data.map(test => [test.id, test.is_attempted]));
        
        // Update is_attempted and is_completed based on actual test attempts
        data = data.map(test => ({
          ...test,
          is_attempted: attemptedTestIds.has(test.id),
          is_completed: completedTestIds.has(test.id)
        }));
        
        console.log('[DashboardPage] Tests with updated status:', data.map(t => ({ 
          id: t.id, 
          title: t.title, 
          backend_is_attempted: originalIsAttempted.get(t.id),
          calculated_is_attempted: attemptedTestIds.has(t.id),
          calculated_is_completed: completedTestIds.has(t.id)
        })));
      } catch (attemptError) {
        console.error('Failed to fetch test attempts for status check:', attemptError);
      }
      
      // Filter by status
      if (selectedStatus === 'ATTEMPTED') {
        data = data.filter(test => test.is_attempted);
      } else if (selectedStatus === 'NOT_ATTEMPTED') {
        data = data.filter(test => !test.is_attempted);
      }
      
      setTests(data);
    } catch (error) {
      console.error('Failed to fetch tests:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header - Modern & Clean */}
      <div className="relative">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400 mb-2">
              {t('dashboard.title', 'Practice Tests')}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              {t('dashboard.subtitle', 'Choose a test to start practicing')}
            </p>
          </div>
          {!loading && tests.length > 0 && (
            <div className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 px-4 py-3 rounded-full border border-emerald-200 dark:border-emerald-800">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                {t('dashboard.availablePlural', '{{count}} tests available', { count: tests.length })}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Filter Bar - Sleek & Compact */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Level Pills */}
        <div className="flex items-center gap-2">
          {levels.map((level) => (
            <button
              key={level}
              onClick={() => setSelectedLevel(level)}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                selectedLevel === level
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30 scale-105'
                  : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border-2 border-gray-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700'
              }`}
            >
              {level === 'ALL' ? t('dashboard.allLevels', '🌟 All') : level}
            </button>
          ))}
        </div>

        <div className="hidden sm:block w-px h-8 bg-emerald-200 dark:bg-slate-700" />

        {/* Status Dropdown */}
        <div className="relative">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as 'ALL' | 'ATTEMPTED' | 'NOT_ATTEMPTED')}
            className="px-4 py-2.5 pr-10 rounded-xl text-sm font-bold bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-2 border-emerald-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all cursor-pointer hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-md appearance-none [&>option]:bg-white [&>option]:dark:bg-slate-800 [&>option]:text-gray-900 [&>option]:dark:text-white [&>option]:py-3 [&>option]:px-4 [&>option]:font-medium [&>option]:rounded-lg [&>option:checked]:bg-emerald-100 [&>option:checked]:dark:bg-emerald-900/30 [&>option:checked]:text-emerald-700 [&>option:checked]:dark:text-emerald-300"
          >
            <option value="ALL">{t('dashboard.status.all', '📋 All Status')}</option>
            <option value="ATTEMPTED">{t('dashboard.status.attempted', '✅ Attempted')}</option>
            <option value="NOT_ATTEMPTED">{t('dashboard.status.notAttempted', '✨ Not Attempted')}</option>
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-600 dark:text-emerald-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Year Dropdown */}
        <div className="relative">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value === 'ALL' ? 'ALL' : parseInt(e.target.value))}
            className="px-4 py-2.5 pr-10 rounded-xl text-sm font-bold bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-2 border-emerald-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all cursor-pointer hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-md appearance-none [&>option]:bg-white [&>option]:dark:bg-slate-800 [&>option]:text-gray-900 [&>option]:dark:text-white [&>option]:py-3 [&>option]:px-4 [&>option]:font-medium [&>option]:rounded-lg [&>option:checked]:bg-emerald-100 [&>option:checked]:dark:bg-emerald-900/30 [&>option:checked]:text-emerald-700 [&>option:checked]:dark:text-emerald-300"
          >
            <option value="ALL">{t('dashboard.allYears', '📅 All Years')}</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {t('dashboard.yearOption', '📅 {{year}}', { year })}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-600 dark:text-emerald-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Test Grid */}
      <TestCardList 
        tests={tests}
        loading={loading}
        emptyMessage={t('tests.noTests', 'No tests found')}
        emptyDescription={t('dashboard.emptyDescription', 'Try adjusting your filters')}
      />
    </div>
  );
}
