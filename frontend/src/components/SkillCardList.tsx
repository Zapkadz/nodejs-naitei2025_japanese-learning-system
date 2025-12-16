import { SkillCard } from './SkillCard';
import { Sparkles } from 'lucide-react';
import type { ITest } from '../types';

interface SkillCardListProps {
  tests: ITest[];
  loading?: boolean;
  emptyMessage?: string;
  emptyDescription?: string;
}

export function SkillCardList({ 
  tests, 
  loading = false, 
  emptyMessage = 'Không có bài tập nào',
  emptyDescription = 'Thử thay đổi bộ lọc để xem các bài tập khác'
}: SkillCardListProps) {
  const safeTests = Array.isArray(tests) ? tests : [];
  
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Đang tải...
          </p>
        </div>
      </div>
    );
  }

  if (safeTests.length === 0) {
    return (
      <div className="text-center py-20 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl border-2 border-dashed border-emerald-300 dark:border-emerald-700">
        <Sparkles className="w-16 h-16 mx-auto mb-4 text-emerald-400 dark:text-emerald-600" />
        <p className="text-lg font-bold text-gray-600 dark:text-gray-400">
          {emptyMessage}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
          {emptyDescription}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-5">
      {safeTests.map((test) => (
        <SkillCard key={test.id} test={test} />
      ))}
    </div>
  );
}
