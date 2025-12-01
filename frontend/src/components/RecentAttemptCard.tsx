/**
 * Recent Attempt Card Component
 * Compact card for sidebar display
 */

import { useNavigate } from 'react-router-dom';
import { CircleCheckBig, Clock, Calendar } from 'lucide-react';
import type { ITestAttempt } from '../types';

interface RecentAttemptCardProps {
  attempt: ITestAttempt;
}

export function RecentAttemptCard({ attempt }: RecentAttemptCardProps) {
  const navigate = useNavigate();
  const completedSections = attempt.sections?.filter(s => s.status === 'COMPLETED').length || 0;
  const totalSections = attempt.sections?.length || 0;

  return (
    <div
      onClick={() => navigate(`/testAttempts/${attempt.id}`)}
      className="group relative bg-white dark:bg-slate-800 rounded-lg p-3 border border-gray-200 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-600 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
    >
      <div className="flex items-center gap-2 mb-2">
        {attempt.is_completed ? (
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
            <CircleCheckBig className="w-3.5 h-3.5 text-white" />
          </div>
        ) : (
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0">
            <Clock className="w-3.5 h-3.5 text-white" />
          </div>
        )}
        <span 
          className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1 flex-1"
          dangerouslySetInnerHTML={{ __html: attempt.test_title }}
        />
      </div>

      <div className="flex items-center justify-between text-[10px] text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <span>{new Date(attempt.started_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}</span>
        </div>
        <span className={`px-2 py-0.5 rounded font-semibold ${
          attempt.is_completed
            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
        }`}>
          {completedSections}/{totalSections}
        </span>
      </div>
    </div>
  );
}
