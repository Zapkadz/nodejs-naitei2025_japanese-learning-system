/**
 * Recent Attempts Component
 * Shows user's recent test attempts
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { dataService } from '../services';
import { useAuthStore } from '../store/useAuthStore';
import { RecentAttemptsList } from './RecentAttemptsList';
import type { ITestAttempt } from '../types';

export function RecentAttempts() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [attempts, setAttempts] = useState<ITestAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttempts = async () => {
      if (!user) return;

      try {
        const data = await dataService.getTestAttempts(user!.id);
        // Filter only practice test attempts (skill='all'), not skill practice
        // TODO: Backend needs to return 'skill' field in test attempts
        // For now, show all attempts
        
        // Sort by started_at descending and take latest 5
        const sortedData = data.sort((a, b) => 
          new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
        );
        setAttempts(sortedData.slice(0, 3));
      } catch (error) {
        console.error('Error fetching attempts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttempts();
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t('dashboard.recentAttempts')}
        </h3>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 h-16 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">
          {t('dashboard.recentAttempts')}
        </h3>
        {attempts.length > 0 && (
          <button
            onClick={() => navigate('/history')}
            className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
          >
            {t('common.viewAll')} →
          </button>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <RecentAttemptsList attempts={attempts.slice(0, 5)} />
      </div>
    </div>
  );
}
