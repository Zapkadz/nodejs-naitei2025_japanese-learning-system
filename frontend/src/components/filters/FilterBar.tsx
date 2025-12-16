import type { ReactNode } from 'react';

interface FilterBarProps {
  children: ReactNode;
  className?: string;
}

export function FilterBar({ children, className = '' }: FilterBarProps) {
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      {children}
    </div>
  );
}

interface FilterDividerProps {
  className?: string;
}

export function FilterDivider({ className = '' }: FilterDividerProps) {
  return (
    <div className={`hidden sm:block w-px h-8 bg-emerald-200 dark:bg-slate-700 ${className}`} />
  );
}
