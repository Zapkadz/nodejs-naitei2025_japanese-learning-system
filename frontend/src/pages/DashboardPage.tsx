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
import { FilterBar, FilterPill, FilterSelect, FilterDivider } from '../components/filters';

export function DashboardPage() {
  const { t } = useTranslation();

  const [tests, setTests] = useState<ITest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState<JLPTLevel | 'ALL'>('ALL');
  const [selectedYear, setSelectedYear] = useState<number | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'ATTEMPTED' | 'NOT_ATTEMPTED'>('ALL');

  const levels: Array<JLPTLevel | 'ALL'> = ['ALL', 'N1', 'N2', 'N3', 'N4', 'N5'];
  const years = [2024, 2023, 2022, 2021, 2020];

  const levelLabel = (level: JLPTLevel | 'ALL') => 
    level === 'ALL' ? t('dashboard.allLevels', '🌟 All') : level;

  const statusOptions = [
    { value: 'ALL', label: t('dashboard.status.all', '📋 All Status') },
    { value: 'ATTEMPTED', label: t('dashboard.status.attempted', '✅ Attempted') },
    { value: 'NOT_ATTEMPTED', label: t('dashboard.status.notAttempted', '✨ Not Attempted') },
  ];

  const yearOptions = [
    { value: 'ALL', label: t('dashboard.allYears', '📅 All Years') },
    ...years.map(year => ({ 
      value: year, 
      label: t('dashboard.yearOption', '📅 {{year}}', { year }) 
    })),
  ];

  useEffect(() => {
    fetchTests();
  }, [selectedLevel, selectedYear, selectedStatus]);

  const fetchTests = async () => {
    setLoading(true);
    try {
      const filter = {
        level: selectedLevel !== 'ALL' ? selectedLevel : undefined,
        year: selectedYear !== 'ALL' ? selectedYear : undefined,
        skill: 'all' as const, // Only show full tests in Dashboard
      };
      let data = await dataService.getTests(filter);
      
      // Fetch all test attempts to check which tests have been attempted/completed
      try {
        const allAttempts = await dataService.getTestAttempts(1, 1000);
        const attemptedTestIds = new Set(allAttempts.map(attempt => attempt.test_id));
        const completedTestIds = new Set(
          allAttempts
            .filter(attempt => attempt.is_completed)
            .map(attempt => attempt.test_id)
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

      {/* Filter Bar - Clean & Reusable Components */}
      <FilterBar>
        {/* Level Pills */}
        <div className="flex items-center gap-2">
          {levels.map((level) => (
            <FilterPill
              key={level}
              label={levelLabel(level)}
              isActive={selectedLevel === level}
              onClick={() => setSelectedLevel(level)}
            />
          ))}
        </div>

        <FilterDivider />

        {/* Status Dropdown */}
        <FilterSelect
          value={selectedStatus}
          onChange={(val) => setSelectedStatus(val as 'ALL' | 'ATTEMPTED' | 'NOT_ATTEMPTED')}
          options={statusOptions}
        />

        {/* Year Dropdown */}
        <FilterSelect
          value={selectedYear}
          onChange={(val) => setSelectedYear(val as number | 'ALL')}
          options={yearOptions}
        />
      </FilterBar>

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
