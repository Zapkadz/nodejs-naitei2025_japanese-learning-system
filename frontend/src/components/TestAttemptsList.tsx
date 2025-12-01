import { useTranslation } from 'react-i18next';
import { TestAttemptCard } from './TestAttemptCard';
import type { ITestAttempt } from '../types';

interface TestAttemptsListProps {
  attempts: ITestAttempt[];
  title?: string;
  showTitle?: boolean;
  maxItems?: number;
}

export function TestAttemptsList({ 
  attempts, 
  title,
  showTitle = true,
  maxItems
}: TestAttemptsListProps) {
  const { t } = useTranslation();
  const displayTitle = title || t('history.title');
  const displayAttempts = maxItems ? attempts.slice(0, maxItems) : attempts;

  if (attempts.length === 0) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-emerald-50/30 dark:from-slate-900 dark:to-emerald-900/10 rounded-3xl shadow-xl p-16 text-center border-2 border-dashed border-emerald-300 dark:border-emerald-800">
        <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">{t('history.noAttempts')}</p>
      </div>
    );
  }

  return (
    <div>
      {showTitle && (
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-8 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full"></div>
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300">
            {displayTitle} <span className="text-emerald-600 dark:text-emerald-400">({attempts.length})</span>
          </h2>
        </div>
      )}
      
      <div className="space-y-4">
        {displayAttempts.map((attempt) => (
          <TestAttemptCard key={attempt.id} attempt={attempt} />
        ))}
      </div>
    </div>
  );
}
