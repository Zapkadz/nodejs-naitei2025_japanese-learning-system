/**
 * ExamLayout Component
 * Special layout for exam/review with timer and question palette
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Clock, CheckCircle, X, Play } from 'lucide-react';
import { useExamStore } from '../store/useExamStore';
import { ConfirmModal } from '../components/ConfirmModal';

interface ExamLayoutProps {
  children: React.ReactNode;
  totalQuestions: number;
  questionIds: number[];
  hasAudio?: boolean;
  audioUrl?: string | null;
  onSubmit: () => void;
  onPause?: () => void;
  correctCount?: number;
  resultQuestions?: Array<{
    question_id: number;
    is_correct: boolean;
    selected_option_id: number | null;
  }>;
  testAttemptId?: number | null;
}

export const ExamLayout: React.FC<ExamLayoutProps> = ({
  children,
  totalQuestions,
  questionIds,
  hasAudio = false,
  audioUrl = null,
  onSubmit,
  onPause,
  correctCount,
  resultQuestions = [],
  testAttemptId,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    mode,
    timeRemaining,
    isTimerRunning,
    answers,
    setTimeRemaining,
    pauseTimer,
    startTimer: _startTimer,
  } = useExamStore();

  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  // Timer countdown
  useEffect(() => {
    if (mode === 'exam' && isTimerRunning && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);

      return () => clearInterval(timer);
    }

    // Auto-submit when timer reaches 0
    if (mode === 'exam' && timeRemaining === 0) {
      onSubmit();
    }
  }, [mode, isTimerRunning, timeRemaining]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getQuestionStatus = (questionIndex: number): string => {
    const questionId = questionIds[questionIndex];
    if (mode === 'review' && resultQuestions) {
      const result = resultQuestions.find(q => q.question_id === questionId);
      if (!result) return 'unanswered';
      if (result.selected_option_id === null) return 'skipped';
      return result.is_correct ? 'correct' : 'wrong';
    }

    const answer = answers.get(questionId);
    if (!answer) return 'unanswered';
    if (answer.isMarked) return 'marked';
    if (answer.selectedOptionId !== null) return 'answered';
    return 'unanswered';
  };

  const getPaletteColor = (status: string): string => {
    const colors: Record<string, string> = {
      answered: 'bg-yellow-400 hover:bg-yellow-500',
      marked: 'bg-orange-400 hover:bg-orange-500',
      correct: 'bg-green-500 hover:bg-green-600',
      wrong: 'bg-red-500 hover:bg-red-600',
      skipped: 'bg-gray-400 hover:bg-gray-500',
      unanswered: 'bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border-2 border-gray-300 dark:border-gray-600',
    };
    return colors[status] || colors.unanswered;
  };

  const handleQuestionClick = (index: number) => {
    const questionId = questionIds[index];
    // Scroll to question
    const element = document.getElementById(`question-${questionId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleExit = async () => {
    setShowExitModal(false);
    if (mode === 'review') {
      // Review mode - thoát trực tiếp
      if (testAttemptId) {
        navigate(`/testAttempts/${testAttemptId}`);
      } else {
        navigate('/tests');
      }
    } else {
      // Exam mode - tạm dừng
      pauseTimer();
      
      // Call onPause to submit with PAUSED status
      if (onPause) {
        await onPause();
      }
      
      if (testAttemptId) {
        navigate(`/testAttempts/${testAttemptId}`);
      } else {
        navigate('/tests');
      }
    }
  };

  const handleSubmitClick = () => {
    // If there's still time, ask if user wants to pause or submit
    if (mode === 'exam' && timeRemaining > 0) {
      setShowPauseModal(true);
    } else {
      onSubmit();
    }
  };

  const handlePauseModalClose = async () => {
    // Cancel button = Pause and exit
    pauseTimer();
    setShowPauseModal(false);
    
    // Call onPause to submit with PAUSED status
    if (onPause) {
      await onPause();
    }
    
    if (testAttemptId) {
      navigate(`/testAttempts/${testAttemptId}`);
    } else {
      navigate('/tests');
    }
  };

  const handleSubmitNow = () => {
    setShowPauseModal(false);
    onSubmit();
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-emerald-500 to-teal-600 dark:from-slate-900 dark:to-slate-900 dark:bg-slate-900 backdrop-blur-xl border-b border-emerald-600 dark:border-slate-700/50 shadow-lg shadow-emerald-500/30 dark:shadow-slate-900/50 z-40 flex-shrink-0">
        <div className="px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => mode === 'review' ? handleExit() : setShowExitModal(true)}
              className="text-white dark:text-emerald-400 hover:bg-white/20 dark:hover:bg-emerald-900/20 rounded-xl transition-all p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <h1 className="text-base font-bold text-white dark:text-white">
              {mode === 'exam' ? t('exam.title') : t('exam.reviewTitle')}
            </h1>
          </div>

          {/* Timer (Exam Mode Only) */}
          {mode === 'exam' && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/20 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg border border-white/30 dark:border-slate-700">
              <Clock className="w-4 h-4 text-white dark:text-emerald-400" />
              <span className={`font-mono text-base font-semibold ${timeRemaining < 300 ? 'text-red-200 dark:text-red-400' : 'text-white dark:text-white'}`}>
                {formatTime(timeRemaining)}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Question Area - with right padding to avoid sidebar overlap */}
        <main className="flex-1 w-3/4 p-6 pb-24 overflow-y-auto">
          {children}
        </main>

        {/* Right Sidebar - Fixed */}
        <aside className="w-1/4 border-l-2 border-emerald-200 dark:border-slate-700 bg-gradient-to-b from-emerald-50/50 to-teal-50/30 dark:from-slate-900 dark:to-slate-800 relative shadow-xl p-4 overflow-y-auto">
          {/* Decorative accents */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/10 to-transparent dark:from-emerald-500/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-teal-400/10 to-transparent dark:from-teal-500/10 rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            {/* Audio Player (Listening Section) */}
            {hasAudio && audioUrl && (
              <div className="mb-4 p-3 bg-white dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-blue-200 dark:border-blue-700 hover:shadow-2xl hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-300">
                <h3 className="text-xs font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <Play className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  音声
                </h3>
                <audio controls className="w-full">
                  <source src={audioUrl} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}

            {/* Review Stats */}
            {mode === 'review' && correctCount !== undefined && (
              <div className="mb-4 p-4 bg-white dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-emerald-200 dark:border-slate-700 hover:shadow-2xl hover:border-emerald-400 dark:hover:border-emerald-600 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent dark:from-emerald-900/10 rounded-xl pointer-events-none"></div>
                <div className="relative">
                  <h3 className="text-sm font-black text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <div className="w-1 h-4 bg-gradient-to-b from-green-600 to-emerald-600 rounded-full"></div>
                    結果
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600 dark:text-gray-400 font-semibold">正解数</span>
                      <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br from-green-600 to-emerald-600">
                        {correctCount}<span className="text-lg text-gray-400 dark:text-gray-500">/{totalQuestions}</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600 dark:text-gray-400 font-semibold">正答率</span>
                      <span className="text-xl font-black text-green-600 dark:text-green-400">
                        {Math.round((correctCount / totalQuestions) * 100)}%
                      </span>
                    </div>
                    {(() => {
                      const markedCount = questionIds.filter(qId => {
                        const answer = answers.get(qId);
                        return answer?.isMarked;
                      }).length;
                      if (markedCount > 0) {
                        return (
                          <div className="flex items-center justify-between pt-2 border-t border-emerald-200 dark:border-emerald-800">
                            <span className="text-xs text-orange-600 dark:text-orange-400 font-semibold">マーク付き</span>
                            <span className="text-base font-bold text-orange-600 dark:text-orange-400">
                              {markedCount}
                            </span>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </div>
              </div>
            )}

            {/* Question Palette */}
            <div className="mb-4 bg-white dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-emerald-200 dark:border-slate-700 p-4 hover:shadow-2xl hover:border-emerald-400 dark:hover:border-emerald-600 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-50/50 to-transparent dark:from-teal-900/10 rounded-xl pointer-events-none"></div>
              <div className="relative">
                <h3 className="text-xs font-bold text-gray-900 dark:text-white mb-2">
                  問題番号
                </h3>
                <div className="grid grid-cols-7 gap-1.5">
                  {Array.from({ length: totalQuestions }, (_, i) => {
                    const status = getQuestionStatus(i);
                    return (
                      <button
                        key={i}
                        onClick={() => handleQuestionClick(i)}
                        className={`w-full aspect-square rounded-md font-semibold text-[10px] transition-all ${getPaletteColor(status)} ${
                          status === 'unanswered' ? 'text-gray-700 dark:text-gray-300' : 'text-white'
                        } hover:scale-105`}
                        title={status}
                      >
                        {i + 1}
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="mt-3 space-y-1 text-[10px]">
                  {mode === 'exam' ? (
                    <>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-400">未回答</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-400 rounded flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-400">回答済み</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-orange-400 rounded flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-400">要確認</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-400">正解</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-400">不正解</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-gray-400 rounded flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-400">未回答</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button (Exam Mode Only) */}
            {mode === 'exam' && (
              <button
                onClick={handleSubmitClick}
                className="w-full py-3 px-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-2xl hover:-translate-y-1 duration-300"
              >
                <CheckCircle className="w-5 h-5" />
                提出
              </button>
            )}

            {/* Exit Button (Review Mode) */}
            {mode === 'review' && (
              <button
                onClick={handleExit}
                className="w-full py-2.5 px-3 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-bold hover:bg-gray-300 dark:hover:bg-slate-600 transition-all hover:shadow-lg hover:-translate-y-1 duration-300"
              >
                終了
              </button>
            )}
          </div>
        </aside>
      </div>

      {/* Modals */}
      {/* Pause Modal - Shows when submitting with time remaining */}
      <ConfirmModal
        isOpen={showPauseModal}
        onClose={handlePauseModalClose}
        onConfirm={handleSubmitNow}
        title="Bạn còn thời gian"
        message={`Bạn còn ${formatTime(timeRemaining)} để hoàn thành bài thi. Bạn muốn tạm dừng để làm tiếp sau hay nộp bài ngay?`}
        confirmText="Nộp bài ngay"
        cancelText="Tạm dừng"
        variant="warning"
      />

      <ConfirmModal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        onConfirm={onSubmit}
        title={t('exam.submitConfirmTitle')}
        message={t('exam.submitConfirmMessage')}
        confirmText={t('exam.submit')}
        variant="warning"
      />

      {/* Exit Modal - Chỉ hiển thị ở exam mode */}
      {mode === 'exam' && (
        <ConfirmModal
          isOpen={showExitModal}
          onClose={() => setShowExitModal(false)}
          onConfirm={handleExit}
          title="Thoát bài thi"
          message="Bài thi sẽ được tạm dừng và bạn có thể tiếp tục làm vào lần sau. Bạn có chắc muốn thoát?"
          confirmText="Thoát và tạm dừng"
          variant="warning"
        />
      )}
    </div>
  );
};
