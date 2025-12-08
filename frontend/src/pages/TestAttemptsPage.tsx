/**
 * Test Attempts Page
 * Shows all attempts for a specific test
 */

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { PlayCircle, Calendar, TrendingUp, Award } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { dataService } from '../services';
import type { ITestAttempt, ITestDetail } from '../types';
import { HTMLRenderer } from '../components/HTMLRenderer';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { TestAttemptsList } from '../components/TestAttemptsList';
import { useAuthStore } from '../store/useAuthStore';

export function TestAttemptsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const { t } = useTranslation();

  const [test, setTest] = useState<ITestDetail | null>(null);
  const [attempts, setAttempts] = useState<ITestAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);
  const prevIdRef = useRef<string | undefined>();

  useEffect(() => {
    // Reset hasFetchedRef khi id thay đổi
    if (prevIdRef.current !== id) {
      hasFetchedRef.current = false;
      prevIdRef.current = id;
    }

    if (id && user && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user, location.key]);

  const fetchData = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    try {
      const testId = parseInt(id!);
      
      console.log('[TestAttemptsPage] Fetching test detail:', testId);
      const testData = await dataService.getTestDetail(testId);
      console.log('[TestAttemptsPage] Test data:', testData);
      console.log('[TestAttemptsPage] Has sections?', testData?.sections, 'Length:', testData?.sections?.length);
      setTest(testData);

      console.log('[TestAttemptsPage] Fetching test attempts for user:', user.id, 'test:', testId);
      try {
        const testAttempts = await dataService.getTestAttempts(user.id, testId);
        console.log('[TestAttemptsPage] Test attempts:', testAttempts);
        // Sort by most recent first (backend returns oldest first)
        const sortedAttempts = [...testAttempts].sort((a, b) => 
          new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
        );
        setAttempts(sortedAttempts);
      } catch (attemptErr) {
        // No test attempts found is OK - user hasn't started yet
        console.log('[TestAttemptsPage] No test attempts found (user has not started this test yet)');
        setAttempts([]);
      }
    } catch (err) {
      console.error('[TestAttemptsPage] Failed to fetch:', err);
      setError(t('tests.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  const handleStartNew = () => {
    // Navigate to test detail (sections page) to choose section
    navigate(`/tests/${id}/sections`);
  };

  const handleSectionClick = async (sectionId: number) => {
    try {
      if (!user) return;
      
      // Get the latest test attempt for this test
      const testAttempts = await dataService.getTestAttempts(user.id, parseInt(id!));
      // Sort by most recent first
      const sortedAttempts = [...testAttempts].sort((a, b) => 
        new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
      );
      
      if (sortedAttempts.length === 0) {
        // No attempts yet, redirect to test detail page to create new
        navigate(`/tests/${id}/sections`);
        return;
      }
      
      // Use the most recent attempt
      const latestAttempt = sortedAttempts[0];
      
      // Find section attempt for this section
      const sectionAttempts = latestAttempt.section_attempts || [];
      const sectionAttempt = sectionAttempts.find(sa => 
        (sa.section_id || (sa as any).sectionId) === sectionId
      );
      
      if (!sectionAttempt) {
        console.error('[TestAttemptsPage] Section attempt not found for section:', sectionId);
        return;
      }
      
      // Navigate based on section status
      if (sectionAttempt.status === 'COMPLETED') {
        navigate(`/sectionAttempts/${sectionAttempt.id}?mode=review`);
      } else {
        navigate(`/sectionAttempts/${sectionAttempt.id}?mode=exam`);
      }
    } catch (error) {
      console.error('[TestAttemptsPage] Failed to start section:', error);
    }
  };

  const getBestScore = () => {
    const completedAttempts = attempts.filter(a => a.is_completed && a.total_score !== null);
    if (completedAttempts.length === 0) return null;
    return Math.max(...completedAttempts.map(a => a.total_score!));
  };

  const getAverageScore = () => {
    const completedAttempts = attempts.filter(a => a.is_completed && a.total_score !== null);
    if (completedAttempts.length === 0) return null;
    const sum = completedAttempts.reduce((acc, a) => acc + a.total_score!, 0);
    return Math.round(sum / completedAttempts.length);
  };

  if (loading) {
    return <LoadingSpinner text={t('common.loading')} />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          {t('common.back')}
        </button>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">{t('common.error')}</p>
      </div>
    );
  }

  const bestScore = getBestScore();
  const avgScore = getAverageScore();
  const completedCount = attempts.filter(a => a.is_completed).length;

  return (
    <div className={attempts.length === 0 ? 'h-full flex items-center justify-center' : 'space-y-6'}>
      {/* Only show header and stats if there are attempts */}
      {attempts.length > 0 && (
        <>
          {/* Test Header */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl p-6 border-2 border-emerald-100 dark:border-emerald-800">
            <HTMLRenderer
              content={test.title}
              className="text-2xl font-bold text-gray-900 dark:text-white mb-3"
            />
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>
                  {test.year}.{String(test.month).padStart(2, '0')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{t('tests.level')}</span>
                <span className="px-2.5 py-1 bg-primary-600 text-white rounded-full text-xs font-bold">
                  {test.level}
                </span>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border-2 border-emerald-100 dark:border-slate-700 hover:shadow-lg hover:-translate-y-1 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{t('tests.totalAttempts')}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{completedCount}</p>
                </div>
              </div>
            </div>

            {bestScore !== null && (
              <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border-2 border-emerald-100 dark:border-slate-700 hover:shadow-lg hover:-translate-y-1 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('tests.bestScore')}</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{bestScore}%</p>
                  </div>
                </div>
              </div>
            )}

            {avgScore !== null && (
              <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border-2 border-emerald-100 dark:border-slate-700 hover:shadow-lg hover:-translate-y-1 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('tests.averageScore')}</p>
                    <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">{avgScore}%</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {t('tests.attemptHistory', { count: attempts.length })}
            </h2>
            <button
              onClick={handleStartNew}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              + {t('tests.startNew')}
            </button>
          </div>
        </>
      )}

      {/* Attempts List */}
      {attempts.length === 0 ? (
        <div className="w-full max-w-2xl px-4">
          {/* Compact Clean Card */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-gray-200 dark:border-slate-800 overflow-hidden">
            {/* Compact Header */}
            <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 px-6 py-4 text-center">
              <HTMLRenderer
                content={test!.title}
                className="text-base font-bold text-white mb-1.5"
              />
              <div className="flex items-center justify-center gap-2 text-sm">
                <span className="px-2 py-0.5 bg-white/20 backdrop-blur-sm text-white rounded text-xs font-semibold">
                  {test.level}
                </span>
                <span className="text-white/70">•</span>
                <span className="text-white/90 font-medium">
                  {test.year}.{String(test.month).padStart(2, '0')}
                </span>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-5">
              {/* Compact Stats Row */}
              <div className="grid grid-cols-2 gap-2.5 mb-4">
                <div className="text-center p-2.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200/50 dark:border-emerald-800/50">
                  <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                    {test?.sections?.length || 0}
                  </div>
                  <div className="text-[10px] font-medium text-emerald-700 dark:text-emerald-300">
                    {t('tests.sections')}
                  </div>
                </div>
                <div className="text-center p-2.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200/50 dark:border-indigo-800/50">
                  <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                    {test?.sections?.reduce((sum, s) => sum + (s.time_limit || 0), 0) || 0}
                  </div>
                  <div className="text-[10px] font-medium text-indigo-700 dark:text-indigo-300">
                    {t('tests.minutes')}
                  </div>
                </div>
              </div>

              {/* Compact Sections List - Single Column with max height */}
              <div className="mb-4 max-h-[35vh] overflow-hidden">
                <div className="space-y-1.5 pr-1">
                  {(test?.sections || []).slice(0, 6).map((section, index) => (
                    <button
                      key={section.id}
                      onClick={() => handleSectionClick(section.id)}
                      className="w-full flex items-center gap-2 p-2 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all cursor-pointer"
                    >
                      <div className="w-6 h-6 rounded bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-white">
                          {index + 1}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <HTMLRenderer
                          content={section.name}
                          className="text-xs font-semibold text-gray-900 dark:text-white truncate leading-tight"
                        />
                        <div className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                          {section.time_limit || 0} min
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Start Button */}
              <div className="text-center">
                <button
                  onClick={handleStartNew}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-lg text-sm font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all"
                >
                  <PlayCircle className="w-4 h-4" />
                  {t('tests.startTest')}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <TestAttemptsList 
          attempts={attempts}
          title={t('tests.attemptHistory', { count: attempts.length })}
          showTitle={false}
        />
      )}
    </div>
  );
}
