/**
 * Recent Attempts List Component
 * For sidebar display with compact cards
 */

import { Clock } from 'lucide-react';
import { RecentAttemptCard } from './RecentAttemptCard';
import type { ITestAttempt } from '../types';

interface RecentAttemptsListProps {
  attempts: ITestAttempt[];
}

export function RecentAttemptsList({ attempts }: RecentAttemptsListProps) {
  if (attempts.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Clock className="w-8 h-8 mx-auto mb-2 text-emerald-400 dark:text-emerald-500 opacity-50" />
          <p className="text-xs font-medium text-gray-600 dark:text-gray-400">No attempts yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {attempts.map((attempt) => (
        <RecentAttemptCard key={attempt.id} attempt={attempt} />
      ))}
    </div>
  );
}
