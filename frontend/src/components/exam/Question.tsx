import { Flag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { IQuestionWithOptions } from '../../types';
import { HTMLRenderer } from '../HTMLRenderer';
import { AudioPlayer } from '../AudioPlayer';
import { QuestionHeader } from './QuestionHeader';
import { OptionButton } from './OptionButton';
import { QuestionExplanation } from './QuestionExplanation';

interface QuestionProps {
  question: IQuestionWithOptions;
  questionNumber: number;
  isReviewMode: boolean;
  selectedOptionId: number | null;
  isMarked: boolean;
  correctOptionId?: number;
  isCorrect?: boolean;
  onSelectOption: (optionId: number) => void;
  onToggleMark: () => void;
}

export function Question({
  question,
  questionNumber,
  isReviewMode,
  selectedOptionId,
  isMarked,
  correctOptionId,
  isCorrect,
  onSelectOption,
  onToggleMark,
}: QuestionProps) {
  const { t } = useTranslation();

  // Calculate grid columns based on option content length
  const maxLength = Math.max(...question.options.map(opt => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = opt.content;
    return tempDiv.textContent?.length || 0;
  }));
  
  const gridCols = maxLength <= 15 ? 'sm:grid-cols-4' : maxLength <= 40 ? 'sm:grid-cols-2' : 'grid-cols-1';

  return (
    <div id={`question-${question.id}`} className="mb-10 scroll-mt-20">
      {/* Question Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex-1">
          <QuestionHeader
            questionNumber={questionNumber}
            isCorrect={isCorrect}
            hasAnswer={selectedOptionId !== null}
            isReviewMode={isReviewMode}
          />
          
          {/* Audio Player for Listening Questions */}
          {question.audio_url && (
            <AudioPlayer audioUrl={question.audio_url} questionNumber={questionNumber} />
          )}
          
          <HTMLRenderer
            content={question.content}
            className="text-[15px] leading-relaxed text-gray-900 dark:text-white mb-1"
          />
        </div>
        
        {!isReviewMode && (
          <button
            onClick={onToggleMark}
            className={`p-2 rounded-lg transition-colors ${
              isMarked
                ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
                : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
            title={t('exam.markForReview')}
          >
            <Flag className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Question Image */}
      {question.image_url && (
        <div className="mb-4">
          <img
            src={question.image_url}
            alt={`Question ${questionNumber}`}
            className="max-w-full h-auto rounded-xl border border-gray-200 dark:border-gray-700 shadow-md"
          />
        </div>
      )}

      {/* Options */}
      <div className={`grid ${gridCols} gap-3 mt-4`}>
        {question.options.map((option) => {
          const isSelected = selectedOptionId === option.id;
          const isCorrectOption = isReviewMode && correctOptionId === option.id;
          const isWrongSelection = isReviewMode && isSelected && correctOptionId !== option.id;

          return (
            <OptionButton
              key={option.id}
              option={option}
              isSelected={isSelected}
              isCorrect={isCorrectOption}
              isWrong={isWrongSelection}
              isReviewMode={isReviewMode}
              onClick={() => onSelectOption(option.id)}
            />
          );
        })}
      </div>

      {/* Explanation (Review Mode Only) */}
      {isReviewMode && question.explanation && (
        <QuestionExplanation explanation={question.explanation} />
      )}
    </div>
  );
}
