/**
 * Skill Card Component
 * Card for displaying skill practice tests (without date/year)
 */

import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle, ArrowRight, Zap } from 'lucide-react';
import { HTMLRenderer } from './HTMLRenderer';
import type { ITest, JLPTLevel } from '../types';

interface SkillCardProps {
  test: ITest;
}

export function SkillCard({ test }: SkillCardProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isAttempted = test.is_attempted || false;
  const isCompleted = test.is_completed || false;

  const handleClick = () => {
    navigate(`/skills/${test.id}/sections`);
  };

  const getLevelBadge = (level: JLPTLevel) => {
    const badges = {
        N1: 'bg-gradient-to-r from-red-500 to-rose-600 shadow-lg shadow-red-500/30',
        N2: 'bg-gradient-to-r from-orange-500 to-amber-600 shadow-lg shadow-orange-500/30',
        N3: 'bg-gradient-to-r from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/30',
        N4: 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30',
        N5: 'bg-gradient-to-r from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30',
    };
    return badges[level];
  };

  return (
    <div
      onClick={handleClick}
      className="group relative bg-white dark:bg-slate-800/80 backdrop-blur-sm rounded-lg shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-teal-200 dark:border-teal-700 cursor-pointer hover:-translate-y-2 hover:border-teal-400 dark:hover:border-teal-500"
    >
      {/* Gradient Top Border with Skill indicator */}
      <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
      
      {/* Decorative glow on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-emerald-500 to-teal-500 opacity-20 blur-2xl" />
      </div>

      <div className="relative p-4">
        {/* Compact Header */}
        <div className="flex items-start gap-2 mb-3">
          {/* Skill Practice Icon */}
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
            <Zap className="w-4 h-4 text-white" />
          </div>

          {/* Level Badge */}
          <span className={`px-2.5 py-1 rounded-lg text-xs font-black text-white ${getLevelBadge(test.level)} shadow-md group-hover:scale-110 transition-transform flex-shrink-0`}>
            {test.level}
          </span>
          
          <div className="flex-1 min-w-0">
            <HTMLRenderer
              content={test.title}
              className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2 leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors"
            />
          </div>

          {/* Completed Badge */}
          {isAttempted && (
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <CheckCircle className="w-3.5 h-3.5 text-white" />
            </div>
          )}
        </div>

        {/* Status Only (No Date) */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1 px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 rounded text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
            <Zap className="w-3 h-3" />
            {t('skills.practice', 'Luyện kỹ năng')}
          </div>

          {isCompleted ? (
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded">
              {t('tests.status.completed', '✓ Hoàn thành')}
            </span>
          ) : isAttempted ? (
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded">
              {t('tests.status.inProgress', '⏱ Đang luyện')}
            </span>
          ) : (
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-1 rounded animate-pulse">
              {t('tests.status.new', '✨ Mới')}
            </span>
          )}
        </div>

        {/* CTA - Prominent with skill theme */}
        <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-lg text-xs font-bold shadow-lg shadow-emerald-500/30 group-hover:shadow-xl group-hover:shadow-emerald-500/40 transition-all">
          <span>
            {isCompleted ? t('tests.cta.review', 'Xem lại') : isAttempted ? t('tests.cta.continue', 'Tiếp tục') : t('tests.cta.start', 'Bắt đầu')}
          </span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
