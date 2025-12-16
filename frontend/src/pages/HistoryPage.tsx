import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Award,
  Calendar,
} from 'lucide-react';
import { dataService } from '../services';
import { useAuthStore } from '../store/useAuthStore';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { TestAttemptsList } from '../components/TestAttemptsList';
import type { ITestAttempt } from '../types';

export function HistoryPage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [testAttempts, setTestAttempts] = useState<ITestAttempt[]>([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [heatmapDays, setHeatmapDays] = useState<{ date: string; count: number }[]>([]);

  useEffect(() => {
    if (user) {
      loadHistory();
    }
  }, [user]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await dataService.getTestAttempts(user!.id);
      setTestAttempts(data);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadHeatmap = async () => {
      try {
        // TODO: Implement getUserActivityHeatmap in IDataService
        // const days = await dataService.getUserActivityHeatmap(selectedYear);
        // setHeatmapDays(Array.isArray(days) ? days : []);
        setHeatmapDays([]);
      } catch (err) {
        console.error('Failed to load activity heatmap:', err);
        setHeatmapDays([]);
      }
    };
    loadHeatmap();
  }, [selectedYear]);

  // Calculate statistics
  const completedTests = testAttempts.filter(t => t.is_completed).length;
  const incompleteTests = testAttempts.filter(t => !t.is_completed).length;
  const avgScore = testAttempts.length > 0
    ? testAttempts.filter(t => t.total_score !== null).reduce((sum, t) => sum + (t.total_score || 0), 0) / testAttempts.filter(t => t.total_score !== null).length
    : 0;
  const highestScore = testAttempts.length > 0
    ? Math.max(...testAttempts.map(t => t.total_score || 0))
    : 0;

  // Generate activity heatmap data (full year - 53 weeks)
  const generateActivityData = () => {
    const year = selectedYear;
    const startDate = new Date(year, 0, 1);
    const startDay = startDate.getDay();
    const adjustedStart = new Date(startDate);
    adjustedStart.setDate(adjustedStart.getDate() - startDay);

    const activityMap = new Map<string, number>();
    heatmapDays.forEach(d => activityMap.set(d.date, d.count));

    const data: { date: string; count: number; day: number; week: number }[] = [];
    for (let week = 0; week < 53; week++) {
      for (let day = 0; day < 7; day++) {
        const currentDate = new Date(adjustedStart);
        currentDate.setDate(adjustedStart.getDate() + (week * 7) + day);
        const dateStr = currentDate.toISOString().split('T')[0];
        data.push({
          date: dateStr,
          count: activityMap.get(dateStr) || 0,
          day,
          week,
        });
      }
    }
    return data;
  };

  const activityData = generateActivityData();

  // Get available years - show last 5 years
  const currentYear = new Date().getFullYear();
  const availableYears = Array.from(
    { length: 5 }, 
    (_, i) => currentYear - i
  );

  const getActivityColor = (count: number) => {
    if (count === 0) return 'bg-gray-100 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700';
    if (count === 1) return 'bg-emerald-200 dark:bg-emerald-500/60 border border-emerald-300 dark:border-emerald-400';
    if (count === 2) return 'bg-emerald-400 dark:bg-emerald-500/80 border border-emerald-500 dark:border-emerald-300';
    if (count === 3) return 'bg-emerald-500 dark:bg-emerald-400/90 border border-emerald-600 dark:border-emerald-200';
    return 'bg-emerald-600 dark:bg-emerald-300 border border-emerald-700 dark:border-emerald-100';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner text={t('common.loading')} />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400 mb-2">
          {t('history.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 font-medium">
          {t('history.subtitle')}
        </p>
      </div>

      {/* Section 1: Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border-2 border-emerald-200 dark:border-slate-800 shadow-md hover:shadow-2xl hover:border-emerald-500 hover:-translate-y-1 transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-600 dark:bg-emerald-500/30 flex items-center justify-center shadow-md">
              <CheckCircle className="w-5 h-5 text-white dark:text-emerald-300" />
            </div>
            <div className="text-2xl font-black text-gray-900 dark:text-white">
              {completedTests}
            </div>
          </div>
          <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
            {t('history.completedTests')}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border-2 border-orange-200 dark:border-slate-800 shadow-md hover:shadow-2xl hover:border-orange-500 hover:-translate-y-1 transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-orange-600 dark:bg-amber-500/30 flex items-center justify-center shadow-md">
              <Clock className="w-5 h-5 text-white dark:text-amber-300" />
            </div>
            <div className="text-2xl font-black text-gray-900 dark:text-white">
              {incompleteTests}
            </div>
          </div>
          <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
            {t('history.incompleteTests')}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border-2 border-blue-200 dark:border-slate-800 shadow-md hover:shadow-2xl hover:border-blue-500 hover:-translate-y-1 transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 dark:bg-sky-500/30 flex items-center justify-center shadow-md">
              <TrendingUp className="w-5 h-5 text-white dark:text-sky-300" />
            </div>
            <div className="text-2xl font-black text-gray-900 dark:text-white">
              {avgScore.toFixed(0)}%
            </div>
          </div>
          <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
            {t('history.avgScore')}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border-2 border-purple-200 dark:border-slate-800 shadow-md hover:shadow-2xl hover:border-purple-500 hover:-translate-y-1 transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-600 dark:bg-violet-500/30 flex items-center justify-center shadow-md">
              <Award className="w-5 h-5 text-white dark:text-violet-300" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {highestScore}%
            </div>
          </div>
          <div className="text-sm font-medium text-slate-600 dark:text-slate-300">
            {t('history.highScore')}
          </div>
        </div>
      </div>

      {/* Section 2: Activity Heatmap */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6 border-2 border-emerald-100 dark:border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {t('history.activityHeatmap')}
            </h2>
          </div>
          
          {/* Year Selector */}
          <div className="flex gap-2">
            {availableYears.map(year => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`px-3 py-2 rounded-xl text-sm font-bold transition-all ${
                  selectedYear === year
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg scale-105'
                    : 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border-2 border-emerald-200 dark:border-slate-700'
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            {/* Month labels */}
            <div className="flex gap-[3px] mb-2 ml-8">
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, i) => (
                <div key={month} className="text-xs text-gray-500 dark:text-gray-300" style={{ width: `${(53 / 12) * 11}px` }}>
                  {i % 2 === 0 ? month : ''}
                </div>
              ))}
            </div>
            
            {/* Heatmap grid */}
            <div className="flex gap-[3px]">
              {/* Day labels */}
              <div className="flex flex-col gap-[3px] mr-2">
                <div className="h-[11px]" />
                <div className="h-[11px] text-xs text-gray-500 dark:text-gray-300">Mon</div>
                <div className="h-[11px]" />
                <div className="h-[11px] text-xs text-gray-500 dark:text-gray-300">Wed</div>
                <div className="h-[11px]" />
                <div className="h-[11px] text-xs text-gray-500 dark:text-gray-300">Fri</div>
                <div className="h-[11px]" />
              </div>
              
              {/* Week columns */}
              {Array.from({ length: 53 }).map((_, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-[3px]">
                  {Array.from({ length: 7 }).map((_, dayIndex) => {
                    const dataIndex = weekIndex * 7 + dayIndex;
                    const data = activityData[dataIndex];
                    const date = new Date(data?.date || '');
                    const isCurrentYear = date.getFullYear() === selectedYear;
                    
                    return (
                      <div
                        key={dayIndex}
                        className={`w-[11px] h-[11px] rounded-sm ${
                          isCurrentYear ? getActivityColor(data?.count || 0) : 'bg-emerald-50/50 dark:bg-slate-800/50'
                        } transition-all hover:ring-2 hover:ring-emerald-400 dark:hover:ring-emerald-500 cursor-pointer`}
                        title={`${data?.date || ''}: ${data?.count || 0} tests`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
            
            {/* Legend */}
            <div className="flex items-center gap-2 mt-4 text-xs text-gray-600 dark:text-gray-300 font-medium">
              <span>{t('history.legend')}</span>
              <div className="flex gap-1">
                <div className="w-[11px] h-[11px] rounded-sm bg-gray-100 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700" />
                <div className="w-[11px] h-[11px] rounded-sm bg-emerald-200 dark:bg-emerald-500/60 border border-emerald-300 dark:border-emerald-400" />
                <div className="w-[11px] h-[11px] rounded-sm bg-emerald-400 dark:bg-emerald-500/80 border border-emerald-500 dark:border-emerald-300" />
                <div className="w-[11px] h-[11px] rounded-sm bg-emerald-500 dark:bg-emerald-400/90 border border-emerald-600 dark:border-emerald-200" />
                <div className="w-[11px] h-[11px] rounded-sm bg-emerald-600 dark:bg-emerald-300 border border-emerald-700 dark:border-emerald-100" />
              </div>
              <span>{t('history.legendMore')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Test Attempts List */}
      <TestAttemptsList 
        attempts={testAttempts}
        showTitle={true}
      />
    </div>
  );
}
