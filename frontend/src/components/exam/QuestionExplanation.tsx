import { AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { HTMLRenderer } from '../HTMLRenderer';

interface QuestionExplanationProps {
  explanation: string;
}

export function QuestionExplanation({ explanation }: QuestionExplanationProps) {
  const { t } = useTranslation();

  return (
    <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
      <div className="flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-1.5 text-sm">
            {t('exam.explanation')}
          </h4>
          <HTMLRenderer
            content={explanation}
            className="text-[14px] leading-relaxed text-blue-800 dark:text-blue-200"
          />
        </div>
      </div>
    </div>
  );
}
