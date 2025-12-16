import type { ReactNode } from 'react';
import { AlertCircle, CheckCircle, XCircle, Info } from 'lucide-react';

export interface AlertProps {
  variant?: 'success' | 'error' | 'warning' | 'info';
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
}

export function Alert({ variant = 'info', children, className = '', icon }: AlertProps) {
  const variants = {
    success: {
      container: 'bg-green-50 dark:bg-green-900/20 border-green-500 dark:border-green-600 text-green-700 dark:text-green-300',
      icon: <CheckCircle className="w-5 h-5" />,
    },
    error: {
      container: 'bg-red-50 dark:bg-red-900/20 border-red-500 dark:border-red-600 text-red-700 dark:text-red-300',
      icon: <XCircle className="w-5 h-5" />,
    },
    warning: {
      container: 'bg-orange-50 dark:bg-orange-900/20 border-orange-500 dark:border-orange-600 text-orange-700 dark:text-orange-300',
      icon: <AlertCircle className="w-5 h-5" />,
    },
    info: {
      container: 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-600 text-blue-700 dark:text-blue-300',
      icon: <Info className="w-5 h-5" />,
    },
  };

  const variantStyles = variants[variant];
  const displayIcon = icon !== undefined ? icon : variantStyles.icon;

  return (
    <div 
      className={`p-4 border-2 rounded-lg flex items-center gap-3 ${variantStyles.container} ${className}`}
      role="alert"
    >
      {displayIcon && <div className="flex-shrink-0">{displayIcon}</div>}
      <div className="flex-1 text-sm font-medium">{children}</div>
    </div>
  );
}
