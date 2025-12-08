/**
 * ExamPage Component
 * Main exam interface with questions, options, and review mode
 */

import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Check, X, Flag, AlertCircle } from 'lucide-react';
import { dataService } from '../services';
import { useExamStore } from '../store/useExamStore';
import { useAuthStore } from '../store/useAuthStore';
import type { ISectionWithParts, IQuestionWithOptions, IResult } from '../types';
import { ExamLayout } from '../layouts/ExamLayout';
import { HTMLRenderer } from '../components/HTMLRenderer';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { AudioPlayer } from '../components/AudioPlayer';

export const ExamPage: React.FC = () => {
  const { sectionAttemptId } = useParams<{ sectionAttemptId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { initExam, setAnswer, toggleMark, answers, mode } = useExamStore();

  const [section, setSection] = useState<ISectionWithParts | null>(null);
  const [result, setResult] = useState<IResult | null>(null);
  const [testAttemptId, setTestAttemptId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const hasFetchedRef = useRef(false);

  const examMode = searchParams.get('mode') as 'exam' | 'review' || 'exam';

  useEffect(() => {
    if (sectionAttemptId && user && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      loadSection();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionAttemptId, user]);

  const loadSection = async () => {
    setLoading(true);
    try {
      const currentSectionAttemptId = parseInt(sectionAttemptId!);
      
      // Step 1: Get section attempt detail (includes user answers if PAUSED/COMPLETED)
      const sectionAttempt = await dataService.getSectionAttempt(currentSectionAttemptId);
      const sectionId = sectionAttempt.section_id || (sectionAttempt as any).sectionId;
      
      if (!sectionId) {
        throw new Error('Section ID not found in section attempt');
      }
      
      // Step 2: Get section with questions
      const sectionData = await dataService.getSection(sectionId);
      
      // Step 3: Update status to IN_PROGRESS if NOT_STARTED or PAUSED
      const currentStatus = sectionAttempt.status;
      if (currentStatus === 'NOT_STARTED' || currentStatus === 'PAUSED') {
        await dataService.updateSectionAttempt(currentSectionAttemptId, 'IN_PROGRESS');
      }
      
      // Step 4: Load existing answers if any (for PAUSED/COMPLETED)
      const existingAnswers = (sectionAttempt as any).user_answers || [];
      
      const attemptId = sectionAttempt.test_attempt_id || (sectionAttempt as any).testAttemptId || 0;

      setSection(sectionData);
      setTestAttemptId(attemptId);

      // Initialize exam store
      const timeRemaining = (sectionAttempt as any).time_remaining || sectionData.time_limit * 60;
      initExam(currentSectionAttemptId, sectionData.id, examMode, timeRemaining);

      // Load existing answers if PAUSED or COMPLETED (review mode)
      if (existingAnswers.length > 0) {
        existingAnswers.forEach((ans: any) => {
          if (ans.selected_option_id) {
            setAnswer(ans.question_id, ans.selected_option_id);
          }
          if (ans.is_marked) {
            toggleMark(ans.question_id);
          }
        });
      }
      
      // If review mode, section attempt should have correct answers
      if (examMode === 'review' && sectionAttempt.status === 'COMPLETED') {
        // Answers already loaded with correct_answer from backend
        setResult(sectionAttempt as any); // Cast to IResult for review display
      }
    } catch (error) {
      console.error('Failed to load section:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (isPause: boolean = false) => {
    if (!sectionAttemptId || !section) return;

    try {
      const answerList = Array.from(answers.values()).map(answer => ({
        question_id: answer.questionId,
        selected_option_id: answer.selectedOptionId,
        is_marked: answer.isMarked
      }));

      const status = isPause ? 'PAUSED' : 'COMPLETED';
      const timeRemaining = useExamStore.getState().timeRemaining;
      
      const resultData = await dataService.submitSectionAttempt(
        parseInt(sectionAttemptId!),
        answerList,
        status,
        timeRemaining
      );
      
      setResult(resultData);
      
      // Navigate to test attempt detail page
      if (testAttemptId) {
        navigate(`/testAttempts/${testAttemptId}`);
      } else {
        navigate('/tests');
      }
    } catch (error) {
      console.error('Failed to submit exam:', error);
    }
  };

  const handleOptionSelect = (questionId: number, optionId: number) => {
    if (mode === 'exam') {
      setAnswer(questionId, optionId);
    }
  };

  const handleToggleMark = (questionId: number) => {
    if (mode === 'exam') {
      toggleMark(questionId);
    }
  };

  const isOptionSelected = (questionId: number, optionId: number): boolean => {
    return answers.get(questionId)?.selectedOptionId === optionId;
  };

  const isQuestionMarked = (questionId: number): boolean => {
    return answers.get(questionId)?.isMarked || false;
  };

  const getOptionStyle = (questionId: number, optionId: number, correctOptionId?: number): string => {
    if (mode === 'exam') {
      // Exam mode - just highlight selected
      return isOptionSelected(questionId, optionId)
        ? 'border-primary bg-primary/10'
        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500';
    }

    // Review mode - show correct/wrong
    const userSelected = isOptionSelected(questionId, optionId);
    const isCorrectOption = correctOptionId ? optionId === correctOptionId : false;
    
    if (userSelected && isCorrectOption) {
      return 'border-green-500 bg-green-50 dark:bg-green-900/20'; // User chọn đúng - màu xanh
    }
    if (userSelected && !isCorrectOption) {
      return 'border-red-500 bg-red-50 dark:bg-red-900/20'; // User chọn sai - màu đỏ
    }
    if (!userSelected && isCorrectOption) {
      return 'border-green-500 bg-green-50 dark:bg-green-900/20 ring-2 ring-green-300 dark:ring-green-700'; // Đáp án đúng - màu xanh với ring để dễ nhận biết
    }
    return 'border-gray-300 dark:border-gray-600';
  };

  const getQuestionResult = (questionId: number) => {
    if (!result) return null;
    const userAnswers = (result as any).user_answers || [];
    const userAnswer = userAnswers.find((a: any) => a.question_id === questionId);
    
    // Nếu không có userAnswer, vẫn cần trả về để có thể hiển thị đáp án đúng
    // Backend should always return user_answers for all questions even if not answered
    if (!userAnswer) {
      // Fallback: Tìm đáp án đúng từ question options
      return null;
    }
    
    const isCorrect = userAnswer.selected_option_id === userAnswer.option_correct_id;
    
    return {
      question_id: questionId,
      is_correct: isCorrect,
      selected_option_id: userAnswer.selected_option_id,
      correct_option_id: userAnswer.option_correct_id
    };
  };

  const renderQuestion = (question: IQuestionWithOptions, questionIndex: number) => {
    const questionResult = getQuestionResult(question.id);
    const hasAnswer = questionResult && questionResult.selected_option_id !== null;
    const isCorrect = questionResult?.is_correct || false;

    return (
      <div
        key={question.id}
        id={`question-${question.id}`}
        className="mb-10 scroll-mt-20"
      >
        {/* Question Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400">
                {t('exam.question')} {questionIndex + 1}
              </span>
              {mode === 'review' && hasAnswer && (
                <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${
                  isCorrect 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                }`}>
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
                </span>
              )}
            </div>
            
            {/* Audio Player for Listening Questions */}
            {question.audio_url && (
              <AudioPlayer audioUrl={question.audio_url} questionNumber={questionIndex + 1} />
            )}
            
            <HTMLRenderer
              content={question.content}
              className="text-[15px] leading-relaxed text-gray-900 dark:text-white mb-1"
            />
          </div>
          {mode === 'exam' && (
            <button
              onClick={() => handleToggleMark(question.id)}
              className={`p-2 rounded-lg transition-colors ${
                isQuestionMarked(question.id)
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
              alt={`Question ${questionIndex + 1}`}
              className="max-w-full h-auto rounded-xl border border-gray-200 dark:border-gray-700 shadow-md"
            />
          </div>
        )}

        {/* Options */}
        {(() => {
          // Calculate max option length to determine optimal grid layout
          const maxLength = Math.max(...question.options.map(opt => {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = opt.content;
            return tempDiv.textContent?.length || 0;
          }));
          
          // Determine grid columns: short options (≤15 chars) = 4 cols, medium (≤40 chars) = 2 cols, long = 1 col
          const gridCols = maxLength <= 15 ? 'sm:grid-cols-4' : maxLength <= 40 ? 'sm:grid-cols-2' : 'grid-cols-1';
          
          return (
            <div className={`grid ${gridCols} gap-3 mt-4`}>
              {question.options.map((option) => {
                // Lấy correctOptionId từ result, nếu không có thì tìm trong options
                let correctOptionId = questionResult?.correct_option_id;
                if (!correctOptionId && mode === 'review') {
                  // Fallback: tìm option có is_correct = true
                  const correctOption = question.options.find(opt => opt.is_correct);
                  correctOptionId = correctOption?.id;
                  
                  // Debug log
                  if (questionIndex === 0) {
                    console.log('[ExamPage] Question', question.id, 'options:', question.options.map(o => ({ id: o.id, is_correct: o.is_correct })));
                    console.log('[ExamPage] correctOption:', correctOption);
                    console.log('[ExamPage] questionResult:', questionResult);
                  }
                }
                
                const optionStyle = getOptionStyle(question.id, option.id, correctOptionId);
                const isSelected = isOptionSelected(question.id, option.id);
                const isCorrectAnswer = mode === 'review' && correctOptionId === option.id;
                const isWrongSelection = mode === 'review' && isSelected && correctOptionId !== option.id;

                return (
                  <button
                    key={option.id}
                    onClick={() => handleOptionSelect(question.id, option.id)}
                    disabled={mode === 'review'}
                    className={`w-full p-3 rounded-xl border-2 text-left transition-all ${optionStyle} ${
                      mode === 'review' ? 'cursor-default' : 'cursor-pointer hover:shadow-md'
                    } ${isSelected && mode === 'exam' ? 'ring-2 ring-primary-300 dark:ring-primary-700' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <span className={`w-7 h-7 flex items-center justify-center rounded-lg font-bold text-xs flex-shrink-0 ${
                          isSelected && mode === 'exam'
                            ? 'bg-primary-600 text-white'
                            : isCorrectAnswer
                            ? 'bg-green-600 text-white'
                            : isWrongSelection
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}>
                          {option.order_index}
                        </span>
                        <div className="flex-1">
                          <HTMLRenderer
                            content={option.content}
                            className="text-[15px] leading-relaxed text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>
                      {isCorrectAnswer && (
                        <Check className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                      )}
                      {isWrongSelection && (
                        <X className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                      )}
                    </div>
                  </button>
              );
            })}
            </div>
          );
        })()}

        {/* Explanation (Review Mode Only) */}
        {mode === 'review' && question.explanation && (
          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-1.5 text-sm">
                  {t('exam.explanation')}
                </h4>
                <HTMLRenderer
                  content={question.explanation}
                  className="text-[14px] leading-relaxed text-blue-800 dark:text-blue-200"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner text={t('common.loading')} />
      </div>
    );
  }

  if (!section) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">{t('exam.sectionNotFound')}</p>
      </div>
    );
  }

  // Count total questions
  const totalQuestions = section.parts.reduce((sum, part) => sum + part.questions.length, 0);
  const questionIds = section.parts.flatMap(part => part.questions.map(q => q.id));
  let questionIndex = 0;

  // Map user_answers to resultQuestions format for ExamLayout
  const resultQuestions = result ? ((result as any).user_answers || []).map((ans: any) => ({
    question_id: ans.question_id,
    is_correct: ans.selected_option_id === ans.option_correct_id,
    selected_option_id: ans.selected_option_id
  })) : undefined;

  const handlePause = async () => {
    // Submit with PAUSED status
    await handleSubmit(true);
  };

  return (
    <ExamLayout
      totalQuestions={totalQuestions}
      questionIds={questionIds}
      hasAudio={!!section.audio_url}
      audioUrl={section.audio_url}
      onSubmit={handleSubmit}
      onPause={handlePause}
      correctCount={result?.correct_count}
      resultQuestions={resultQuestions}
      testAttemptId={testAttemptId}
    >
      <div className="space-y-10 py-4">
        {section.parts.map((part) => (
          <div key={part.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
            {/* Part Title */}
            <div className="mb-6 pb-4 border-b-2 border-gray-200 dark:border-gray-700">
              <HTMLRenderer
                content={part.title}
                className="text-lg font-bold text-gray-900 dark:text-white leading-relaxed"
              />
            </div>

            {/* Passage (if exists) */}
            {part.passage && (
              <div className="mb-6 p-5 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 rounded-xl border-l-4 border-amber-400 dark:border-amber-600">
                {part.passage.title && (
                  <HTMLRenderer
                    content={part.passage.title}
                    className="text-base font-bold text-gray-900 dark:text-white mb-3"
                  />
                )}
                <HTMLRenderer
                  content={part.passage.content}
                  className="text-[15px] leading-[1.7] text-gray-800 dark:text-gray-200"
                />
                {part.passage.image_url && (
                  <img
                    src={part.passage.image_url}
                    alt={part.passage.title || 'Passage image'}
                    className="mt-4 w-full h-auto rounded-xl shadow-md"
                  />
                )}
              </div>
            )}

            {/* Questions */}
            <div>
              {part.questions.map((question) => {
                const rendered = renderQuestion(question, questionIndex);
                questionIndex++;
                return rendered;
              })}
            </div>
          </div>
        ))}
      </div>
    </ExamLayout>
  );
};
