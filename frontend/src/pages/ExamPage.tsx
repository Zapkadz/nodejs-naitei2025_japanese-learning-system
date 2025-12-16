/**
 * ExamPage Component
 * Main exam interface with questions, options, and review mode
 */

import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { dataService } from '../services';
import { useExamStore } from '../store/useExamStore';
import { useAuthStore } from '../store/useAuthStore';
import type { ISectionWithParts, IResult } from '../types';
import { ExamLayout } from '../layouts/ExamLayout';
import { HTMLRenderer } from '../components/HTMLRenderer';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Question } from '../components/exam/Question';
import { PassageCard } from '../components/exam/PassageCard';
import { Card, CardHeader } from '../components/ui/Card';

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

  const getQuestionResult = (questionId: number) => {
    if (!result) return null;
    const userAnswers = (result as any).user_answers || [];
    const userAnswer = userAnswers.find((a: any) => a.question_id === questionId);
    
    if (!userAnswer) return null;
    
    return {
      question_id: questionId,
      is_correct: userAnswer.selected_option_id === userAnswer.option_correct_id,
      selected_option_id: userAnswer.selected_option_id,
      correct_option_id: userAnswer.option_correct_id
    };
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
          <Card key={part.id} padding="lg">
            {/* Part Title */}
            <CardHeader>
              <HTMLRenderer
                content={part.title}
                className="text-lg font-bold text-gray-900 dark:text-white leading-relaxed"
              />
            </CardHeader>

            {/* Passage (if exists) */}
            {part.passage && (
              <PassageCard
                title={part.passage.title || undefined}
                content={part.passage.content}
                imageUrl={part.passage.image_url || undefined}
              />
            )}

            {/* Questions */}
            <div>
              {part.questions.map((question) => {
                const questionResult = getQuestionResult(question.id);
                const currentQuestionIndex = questionIndex;
                questionIndex++;
                
                return (
                  <Question
                    key={question.id}
                    question={question}
                    questionNumber={currentQuestionIndex + 1}
                    isReviewMode={mode === 'review'}
                    selectedOptionId={answers.get(question.id)?.selectedOptionId || null}
                    isMarked={answers.get(question.id)?.isMarked || false}
                    correctOptionId={questionResult?.correct_option_id}
                    isCorrect={questionResult?.is_correct}
                    onSelectOption={(optionId) => handleOptionSelect(question.id, optionId)}
                    onToggleMark={() => handleToggleMark(question.id)}
                  />
                );
              })}
            </div>
          </Card>
        ))}
      </div>
    </ExamLayout>
  );
};
