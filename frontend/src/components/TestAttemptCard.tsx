import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Clock, Calendar, CircleCheckBig } from 'lucide-react';
import type { ITestAttempt } from '../types';

interface TestAttemptCardProps {
  attempt: ITestAttempt;
}

export function TestAttemptCard({ attempt }: TestAttemptCardProps) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const completedSections = attempt.sections?.filter(s => s.status === 'COMPLETED').length || 0;
  const totalSections = attempt.sections?.length || 0;

  return (
    <div
      onClick={() => navigate(`/testAttempts/${attempt.id}`)}
      className="group relative bg-gradient-to-br from-white to-gray-50/50 dark:from-slate-900 dark:to-slate-800/50 rounded-xl p-5 border border-gray-200/80 dark:border-slate-700/80 hover:border-emerald-400 dark:hover:border-emerald-500 shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 dark:hover:shadow-emerald-500/20 hover:-translate-y-1 transition-all duration-200 cursor-pointer overflow-hidden"
    >
      {/* Hover glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-400/0 to-teal-500/0 group-hover:from-emerald-500/8 group-hover:via-emerald-400/8 group-hover:to-teal-500/8 transition-all duration-200 rounded-xl"></div>
      
      <div className="flex items-start gap-4 relative">
        {/* Icon */}
        {attempt.is_completed ? (
          <div className="flex-none w-11 h-11 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all">
            <CircleCheckBig className="w-5 h-5 text-white" />
          </div>
        ) : (
          <div className="flex-none w-11 h-11 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all">
            <Clock className="w-5 h-5 text-white" />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-2">
            <span 
              className="font-bold text-gray-900 dark:text-white line-clamp-1"
              dangerouslySetInnerHTML={{ __html: attempt.test_title }}
            />
            <span className={`flex-none px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide ${
              attempt.is_completed
                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-300/50 dark:border-emerald-700/50'
                : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-300/50 dark:border-amber-700/50'
            }`}>
              {attempt.is_completed ? `✓ ${t('tests.completed')}` : `⏱ ${t('tests.inProgress')}`}
            </span>
          </div>

          {/* Date info */}
          <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400 mb-2">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                {new Date(attempt.started_at).toLocaleDateString(i18n.language, { day: '2-digit', month: '2-digit', year: 'numeric' })} • {new Date(attempt.started_at).toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            {attempt.is_completed && attempt.completed_at && (
              <>
                <span className="text-gray-400 dark:text-gray-600">→</span>
                <span>
                  {new Date(attempt.completed_at).toLocaleDateString(i18n.language, { day: '2-digit', month: '2-digit', year: 'numeric' })} • {new Date(attempt.completed_at).toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' })}
                </span>
              </>
            )}
          </div>

          {/* Progress */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-100 dark:bg-slate-800 text-[11px] font-semibold text-gray-700 dark:text-gray-300">
            <span className="text-emerald-600 dark:text-emerald-400">{completedSections}</span>
            <span className="text-gray-400 dark:text-gray-600">/</span>
            <span>{totalSections}</span>
            <span className="text-gray-500 dark:text-gray-500">{t('tests.sections')}</span>
          </div>
        </div>

        {/* Score */}
        {attempt.is_completed && attempt.total_score !== null && (
          <div className="flex-none text-right">
            <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400 leading-none mb-1">
              {attempt.total_score}%
            </div>
            <div className="text-[9px] text-gray-500 dark:text-gray-500 font-bold uppercase tracking-wider">
              {t('tests.avgScore')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
