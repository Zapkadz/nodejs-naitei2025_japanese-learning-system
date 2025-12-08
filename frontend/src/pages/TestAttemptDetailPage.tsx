/**
 * Test Attempt Detail Page
 * Shows 3 section attempts for a specific test attempt
 */

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { dataService } from '../services';
import type { ITestAttempt, ITestDetail } from '../types';
import { HTMLRenderer } from '../components/HTMLRenderer';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useAuthStore } from '../store/useAuthStore';
import { SectionList } from '../components/SectionList';

export function TestAttemptDetailPage() {
  const { testAttemptId } = useParams<{ testAttemptId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  const [testAttempt, setTestAttempt] = useState<ITestAttempt | null>(null);
  const [testDetail, setTestDetail] = useState<ITestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const hasFetchedRef = useRef(false);
  const prevTestAttemptIdRef = useRef<string | undefined>();

  useEffect(() => {
    // Reset hasFetchedRef khi testAttemptId thay đổi
    if (prevTestAttemptIdRef.current !== testAttemptId) {
      hasFetchedRef.current = false;
      prevTestAttemptIdRef.current = testAttemptId;
    }

    if (testAttemptId && user && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchTestAttempt();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testAttemptId, user, location.key]);

  const fetchTestAttempt = async () => {
    setLoading(true);
    try {
      const attempt = await dataService.getTestAttempt(parseInt(testAttemptId!));
      setTestAttempt(attempt);
      
      // Fetch test detail to get section names
      const testId = (attempt as any).testId || (attempt as any).test_id;
      if (testId) {
        const detail = await dataService.getTestDetail(testId);
        setTestDetail(detail);
      }
    } catch (error) {
      console.error('Failed to fetch test attempt:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-300/50 dark:border-emerald-700/50';
      case 'IN_PROGRESS':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-300/50 dark:border-blue-700/50';
      case 'PAUSED':
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-300/50 dark:border-amber-700/50';
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400 border-gray-300/50 dark:border-gray-700/50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return '✓ Hoàn thành';
      case 'IN_PROGRESS':
        return '⏱ Đang làm';
      case 'PAUSED':
        return '⏸ Tạm dừng';
      default:
        return '○ Chưa làm';
    }
  };

  const handleSectionClick = (section: any) => {
    if (section.status === 'COMPLETED') {
      // Navigate to review mode
      navigate(`/sectionAttempts/${section.id}?mode=review`);
    } else {
      // Resume or continue
      navigate(`/sectionAttempts/${section.id}`);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (loading) {
    return <LoadingSpinner text="Đang tải..." />;
  }

  if (!testAttempt) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Không tìm thấy test attempt</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(`/tests/${testAttempt.test_id || testAttempt.testId}`)}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="font-semibold">Quay lại danh sách</span>
      </button>

      {/* Test Attempt Header */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-5 border border-emerald-200/80 dark:border-emerald-800/80">
        <HTMLRenderer
          content={testAttempt.test_title}
          className="text-2xl font-bold text-gray-900 dark:text-white mb-3"
        />
        <div className="flex flex-wrap items-center gap-3">
          <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border ${getStatusColor(testAttempt.is_completed ? 'COMPLETED' : 'IN_PROGRESS')}`}>
            {getStatusText(testAttempt.is_completed ? 'COMPLETED' : 'IN_PROGRESS')}
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {formatDate(testAttempt.started_at)}
          </span>
          {testAttempt.is_completed && testAttempt.total_score !== null && (
            <div className="ml-auto">
              <div className="text-right">
                <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400 leading-none mb-1">
                  {testAttempt.total_score}%
                </div>
                <div className="text-[9px] text-gray-500 dark:text-gray-500 font-bold uppercase tracking-wider">
                  Avg Score
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Section Attempts */}
      <SectionList
        sections={(testAttempt.section_attempts || testAttempt.sections || []).map(section => {
          // Find section name from test detail
          const sectionId = (section as any).sectionId || (section as any).section_id;
          const sectionDetail = testDetail?.sections?.find(s => s.id === sectionId);
          
          return {
            id: section.id,
            name: sectionDetail?.name || `Section ${section.id}`,
            time_limit: section.time_limit || sectionDetail?.time_limit,
            question_count: section.question_count,
            status: section.status,
            score: section.score,
            correct_count: section.correct_count,
            time_remaining: section.time_remaining
          };
        })}
        onSectionClick={handleSectionClick}
        mode="attempt"
      />
    </div>
  );
}
