import { Check, X } from 'lucide-react';
import { HTMLRenderer } from '../HTMLRenderer';

interface OptionButtonProps {
  option: {
    id: number;
    content: string;
    order_index: number;
  };
  isSelected: boolean;
  isCorrect?: boolean;
  isWrong?: boolean;
  isReviewMode: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export function OptionButton({ 
  option, 
  isSelected, 
  isCorrect, 
  isWrong, 
  isReviewMode, 
  onClick,
  disabled = false 
}: OptionButtonProps) {
  const getOptionStyle = () => {
    if (isReviewMode) {
      if (isSelected && isCorrect) {
        return 'border-green-500 bg-green-50 dark:bg-green-900/20';
      }
      if (isSelected && isWrong) {
        return 'border-red-500 bg-red-50 dark:bg-red-900/20';
      }
      if (!isSelected && isCorrect) {
        return 'border-green-500 bg-green-50 dark:bg-green-900/20 ring-2 ring-green-300 dark:ring-green-700';
      }
    } else if (isSelected) {
      return 'border-primary bg-primary/10 ring-2 ring-primary-300 dark:ring-primary-700';
    }
    
    return 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500';
  };

  const getLabelStyle = () => {
    if (isSelected && !isReviewMode) {
      return 'bg-primary-600 text-white';
    }
    if (isCorrect) {
      return 'bg-green-600 text-white';
    }
    if (isWrong) {
      return 'bg-red-600 text-white';
    }
    return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || isReviewMode}
      className={`w-full p-3 rounded-xl border-2 text-left transition-all ${getOptionStyle()} ${
        isReviewMode ? 'cursor-default' : 'cursor-pointer hover:shadow-md'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <span className={`w-7 h-7 flex items-center justify-center rounded-lg font-bold text-xs flex-shrink-0 ${getLabelStyle()}`}>
            {option.order_index}
          </span>
          <div className="flex-1">
            <HTMLRenderer
              content={option.content}
              className="text-[15px] leading-relaxed text-gray-900 dark:text-white"
            />
          </div>
        </div>
        {isCorrect && <Check className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />}
        {isWrong && <X className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />}
      </div>
    </button>
  );
}
