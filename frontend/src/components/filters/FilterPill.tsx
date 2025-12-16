import type { ReactNode } from 'react';

interface FilterPillProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  icon?: ReactNode;
}

export function FilterPill({ label, isActive, onClick, icon }: FilterPillProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
        isActive
          ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30 scale-105'
          : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border-2 border-gray-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
