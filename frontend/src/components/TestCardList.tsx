import { TestCard } from './TestCard';
import { Sparkles } from 'lucide-react';
import type { ITest } from '../types';

interface TestCardListProps {
  tests: ITest[];
  loading: boolean;
  emptyMessage?: string;
  emptyDescription?: string;
}

export function TestCardList({ 
  tests, 
  loading, 
  emptyMessage = 'テストが見つかりません',
  emptyDescription = 'フィルターを調整してみてください'
}: TestCardListProps) {
  const safeTests = Array.isArray(tests) ? tests : [];
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            読み込み中...
          </p>
        </div>
      </div>
    );
  }

  if (safeTests.length === 0) {
    return (
      <div className="text-center py-20 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700">
        <Sparkles className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
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
        <TestCard key={test.id} test={test} />
      ))}
    </div>
  );
}
