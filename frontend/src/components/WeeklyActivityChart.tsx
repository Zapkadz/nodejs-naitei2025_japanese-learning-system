/**
 * Weekly Activity Chart Component
 * Shows completed tests count for each day of current week
 */

import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { useEffect, useState } from 'react';
import { dataService } from '../services';
import type { IWeeklyActivity } from '../types';

export function WeeklyActivityChart() {
  const { t } = useTranslation();
  const [weeklyData, setWeeklyData] = useState<IWeeklyActivity[]>([]);
  const [loading, setLoading] = useState(true);

  // Get current day of week (0 = Sunday, 6 = Saturday)
  const today = new Date().getDay();

  useEffect(() => {
    const fetchWeeklyActivity = async () => {
      try {
        setLoading(true);
        const data = await dataService.getUserWeeklyActivity();
        setWeeklyData(data);
      } catch (error) {
        console.error('Failed to fetch weekly activity:', error);
        setWeeklyData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWeeklyActivity();
  }, []);

  // Map data with isToday flag
  const data = weeklyData.map((item, index) => ({
    ...item,
    isToday: index === today,
  }));

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-sm text-gray-500 dark:text-gray-400">{t('common.loading', 'Loading...')}</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-1.5">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">
          {t('dashboard.weeklyActivity')}
        </h3>
        <div className="text-[9px] text-gray-500 dark:text-gray-400 font-medium">
          {t('dashboard.last7Days')}
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 8, left: -15, bottom: 0 }}>
            <XAxis
              dataKey="day"
              tick={{ fill: 'currentColor', fontSize: 9 }}
              className="text-gray-600 dark:text-gray-400"
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: 'currentColor', fontSize: 9 }}
              className="text-gray-600 dark:text-gray-400"
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
              domain={[0, 'dataMax + 1']}
              ticks={[0, 1, 2, 3, 4, 5]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#064e3b',
                border: 'none',
                borderRadius: '8px',
                fontSize: '10px',
                padding: '6px 8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              }}
              labelStyle={{ color: '#d1fae5', fontWeight: 'bold' }}
              itemStyle={{ color: '#fff' }}
            />
            <Bar dataKey="completed" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.isToday ? '#167845ff' : '#6ee7b7'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center gap-2.5 text-[9px] text-gray-600 dark:text-gray-400 mt-1">
        <span className="inline-flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded bg-emerald-700 dark:bg-emerald-600"></span>
          {t('dashboard.today')}
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded bg-emerald-300"></span>
          {t('dashboard.otherDays')}
        </span>
      </div>
    </div>
  );
}
