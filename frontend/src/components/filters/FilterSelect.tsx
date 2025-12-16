import type { ReactNode } from 'react';

interface SelectOption {
  value: string | number;
  label: string;
  icon?: ReactNode;
}

interface FilterSelectProps {
  value: string | number;
  onChange: (value: string | number) => void;
  options: SelectOption[];
  className?: string;
}

export function FilterSelect({ value, onChange, options, className = '' }: FilterSelectProps) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => {
          const val = e.target.value;
          // Try to parse as number if it's numeric
          const numVal = Number(val);
          onChange(isNaN(numVal) ? val : numVal);
        }}
        className={`px-4 py-2.5 pr-10 rounded-xl text-sm font-bold bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-2 border-emerald-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all cursor-pointer hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-md appearance-none ${className}`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-600 dark:text-emerald-400">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}
