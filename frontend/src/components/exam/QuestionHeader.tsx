import { Check, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '../ui/Badge';

interface QuestionHeaderProps {
  questionNumber: number;
  isCorrect?: boolean;
  hasAnswer?: boolean;
  isReviewMode?: boolean;
}

export function QuestionHeader({ 
  questionNumber, 
  isCorrect, 
  hasAnswer, 
  isReviewMode 
}: QuestionHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-3 mb-3">
      <Badge variant="primary" size="md">
        {t('exam.question')} {questionNumber}
      </Badge>
      
      {isReviewMode && hasAnswer && (
        <Badge 
          variant={isCorrect ? 'success' : 'danger'} 
          size="md"
          className="flex items-center gap-1.5"
        >
          {isCorrect ? (
            <>
              <Check className="w-3.5 h-3.5" />
              {t('exam.correct')}
            </>
          ) : (
            <>
              <X className="w-3.5 h-3.5" />
              {t('exam.incorrect')}
            </>
          )}
        </Badge>
      )}
    </div>
  );
}
