/**
 * Exam Store
 * Manages exam state: answers, marked questions, timer
 */

import { create } from 'zustand';

interface UserAnswer {
  questionId: number;
  selectedOptionId: number | null;
  isMarked: boolean;
}

interface ExamState {
  // Exam data
  attemptId: number | null;
  sectionId: number | null;
  mode: 'exam' | 'review';
  
  // User answers
  answers: Map<number, UserAnswer>;
  
  // Timer
  timeRemaining: number; // in seconds
  isTimerRunning: boolean;
  
  // Actions
  initExam: (attemptId: number, sectionId: number, mode: 'exam' | 'review', initialTime: number) => void;
  setAnswer: (questionId: number, optionId: number | null) => void;
  toggleMark: (questionId: number) => void;
  setTimeRemaining: (seconds: number) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resetExam: () => void;
}

export const useExamStore = create<ExamState>((set) => ({
  attemptId: null,
  sectionId: null,
  mode: 'exam',
  answers: new Map(),
  timeRemaining: 0,
  isTimerRunning: false,

  initExam: (attemptId, sectionId, mode, initialTime) => {
    set({
      attemptId,
      sectionId,
      mode,
      timeRemaining: initialTime,
      answers: new Map(),
      isTimerRunning: mode === 'exam',
    });
  },

  setAnswer: (questionId, optionId) => {
    set((state) => {
      const newAnswers = new Map(state.answers);
      const existing = newAnswers.get(questionId);
      newAnswers.set(questionId, {
        questionId,
        selectedOptionId: optionId,
        isMarked: existing?.isMarked || false,
      });
      return { answers: newAnswers };
    });
  },

  toggleMark: (questionId) => {
    set((state) => {
      const newAnswers = new Map(state.answers);
      const existing = newAnswers.get(questionId);
      newAnswers.set(questionId, {
        questionId,
        selectedOptionId: existing?.selectedOptionId || null,
        isMarked: !existing?.isMarked,
      });
      return { answers: newAnswers };
    });
  },

  setTimeRemaining: (seconds) => {
    set({ timeRemaining: seconds });
  },

  startTimer: () => {
    set({ isTimerRunning: true });
  },

  pauseTimer: () => {
    set({ isTimerRunning: false });
  },

  resetExam: () => {
    set({
      attemptId: null,
      sectionId: null,
      mode: 'exam',
      answers: new Map(),
      timeRemaining: 0,
      isTimerRunning: false,
    });
  },
}));
