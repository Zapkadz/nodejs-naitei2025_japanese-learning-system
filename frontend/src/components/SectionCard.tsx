/**
 * Section Card Component
 * Compact and elegant card for section display
 */

import { useTranslation } from 'react-i18next';
import { Book, Headphones, FileText, Clock, CheckCircle, PlayCircle, PenTool, Languages, BookOpen } from 'lucide-react';
import { HTMLRenderer } from './HTMLRenderer';

interface SectionCardProps {
  section: {
    id: number;
    name: string;
    time_limit?: number;
    question_count?: number;
    status?: string;
    score?: number | null;
    correct_count?: number;
    time_remaining?: number | null;
  };
  index: number;
  onClick: () => void;
  mode?: 'detail' | 'attempt'; // detail = TestDetailPage, attempt = TestAttemptDetailPage
}

export function SectionCard({ section, index, onClick, mode = 'detail' }: SectionCardProps) {
  const { t } = useTranslation();
  const getSectionIcon = (sectionName: string | undefined, index: number) => {
    if (!sectionName) {
      return <FileText className="w-5 h-5" />;
    }
    if (sectionName.includes('聴解') || sectionName.includes('Listening')) {
      return <Headphones className="w-5 h-5" />;
    }
    if (sectionName.includes('語彙') || sectionName.includes('Vocabulary')) {
      return <Languages className="w-5 h-5" />;
    }
    if (sectionName.includes('文法') || sectionName.includes('Grammar')) {
      return <BookOpen className="w-5 h-5" />;
    }
    if (sectionName.includes('読解') || sectionName.includes('Reading')) {
      return <Book className="w-5 h-5" />;
    }
    if (sectionName.includes('言語知識') || sectionName.includes('Language')) {
      return <PenTool className="w-5 h-5" />;
    }
    
    const icons = [
      <Book className="w-5 h-5" />,
      <PenTool className="w-5 h-5" />,
      <FileText className="w-5 h-5" />,
    ];
    return icons[index % icons.length];
  };

  const getSectionGradient = (index: number) => {
    const gradients = [
      'from-emerald-500 to-teal-500',
      'from-teal-500 to-cyan-500',
      'from-cyan-500 to-emerald-500',
    ];
    return gradients[index % gradients.length];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'IN_PROGRESS':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'PAUSED':
        return <Clock className="w-4 h-4 text-amber-500" />;
      default:
        return <PlayCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
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
        return `✓ ${t('tests.status.completed')}`;
      case 'IN_PROGRESS':
        return `⏱ ${t('tests.inProgress')}`;
      case 'PAUSED':
        return `⏸ ${t('tests.status.paused')}`;
      default:
        return `○ ${t('tests.status.notStarted')}`;
    }
  };

  const formatTimeRemaining = (seconds: number | null) => {
    if (seconds === null || seconds === 0) return null;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getCTAText = () => {
    if (mode === 'detail') return t('tests.cta.start');
    if (section.status === 'COMPLETED') return t('tests.cta.review');
    if (section.status === 'NOT_STARTED') return t('tests.cta.start');
    return t('tests.cta.continue');
  };

  return (
    <div
      onClick={onClick}
      className="group relative bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-gray-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500 shadow-md hover:shadow-xl hover:shadow-emerald-500/15 dark:hover:shadow-emerald-500/25 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer"
    >
      {/* Top gradient bar */}
      <div className={`h-1 bg-gradient-to-r ${getSectionGradient(index)}`} />

      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 via-teal-500/0 to-cyan-500/0 group-hover:from-emerald-500/6 group-hover:via-teal-500/6 group-hover:to-cyan-500/6 transition-all duration-300"></div>

      {/* Shine effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/8 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      </div>

      <div className="p-4 relative">
        {/* Header: Icon + Title */}
        <div className="flex items-start gap-3 mb-3">
          <div className={`flex-none w-11 h-11 rounded-lg bg-gradient-to-br ${getSectionGradient(index)} flex items-center justify-center text-white shadow-md group-hover:shadow-lg group-hover:scale-105 group-hover:rotate-2 transition-all duration-300`}>
            {getSectionIcon(section.name, index)}
          </div>
          <div className="flex-1 min-w-0">
            <HTMLRenderer
              content={section.name}
              className="font-bold text-gray-900 dark:text-white text-sm line-clamp-2 leading-tight mb-1.5 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors"
            />
            {mode === 'attempt' && section.status && (
              <div className="flex items-center gap-1.5">
                {getStatusIcon(section.status)}
                <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400">
                  {getStatusText(section.status).replace(/[✓⏱⏸○]\s/, '')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Stats - compact and elegant */}
        <div className="bg-gray-50/80 dark:bg-slate-800/50 rounded-lg p-2.5 mb-3 space-y-1.5 border border-gray-100 dark:border-slate-700/50">
          {mode === 'attempt' && section.status === 'COMPLETED' ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-gray-600 dark:text-gray-400">{t('tests.score')}</span>
                <span className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400">
                  {section.score}%
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-gray-600 dark:text-gray-400 font-medium">{t('tests.correct')}</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {section.correct_count}/{section.question_count}
                </span>
              </div>
            </>
          ) : (
            <>
              {section.question_count !== undefined && (
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">{t('tests.questions')}</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {section.question_count}
                  </span>
                </div>
              )}
              {section.time_limit !== undefined && (
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">
                    {mode === 'attempt' && section.status !== 'NOT_STARTED' && section.time_remaining !== null && section.time_remaining !== undefined && section.time_remaining > 0
                      ? `⏱ ${t('tests.timeRemaining')}`
                      : `⏱ ${t('tests.time')}`}
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {mode === 'attempt' && section.status !== 'NOT_STARTED' && section.time_remaining !== null && section.time_remaining !== undefined && section.time_remaining > 0
                      ? formatTimeRemaining(section.time_remaining)
                      : `${section.time_limit}p`}
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {/* CTA Footer - clean and prominent */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-slate-700">
          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-500 dark:group-hover:text-emerald-300 transition-colors uppercase tracking-wide">
            {getCTAText()}
          </span>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
            <span className="text-white font-bold text-sm group-hover:translate-x-0.5 transition-transform">
              →
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
