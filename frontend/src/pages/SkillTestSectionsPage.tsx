/**
 * Skill Test Sections Page
 * Shows sections for skill practice
 * Route: /skills/:testId/sections
 */

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Target, Zap, BookOpen, TrendingUp, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { dataService } from '../services';
import type { ITestDetail, ISectionWithParts } from '../types';
import { HTMLRenderer } from '../components/HTMLRenderer';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { SkillSectionCard } from '../components/SkillSectionCard';
import { useAuthStore } from '../store/useAuthStore';

export function SkillTestSectionsPage() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [test, setTest] = useState<ITestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (testId && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchTestDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testId]);

  const fetchTestDetail = async () => {
    setLoading(true);
    try {
      const testData = await dataService.getTestDetail(parseInt(testId!));
      setTest(testData);
    } catch (error) {
      console.error('Failed to fetch test detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSectionClick = async (section: ISectionWithParts) => {
    try {
      const { user } = useAuthStore.getState();
      if (!user) return;

      // Check if user has existing test attempts for this test
      const existingTestAttempts = await dataService.getUserTestAttempts(test!.id);
      
      if (existingTestAttempts.length > 0) {
        // Find the most recent test attempt
        const latestTestAttempt = existingTestAttempts[existingTestAttempts.length - 1];
        const sectionAttempts = latestTestAttempt.section_attempts || [];
        
        // Find section attempt for this specific section
        const sectionAttempt = sectionAttempts.find(sa => 
          (sa.section_id || (sa as any).sectionId) === section.id
        );
        
        if (sectionAttempt) {
          // If section attempt exists and is not completed, resume it
          if (sectionAttempt.status !== 'COMPLETED') {
            navigate(`/sectionAttempts/${sectionAttempt.id}?mode=exam`);
            return;
          }
        }
      }
      
      // If no existing test attempt or section is completed, start new attempt
      console.log('[SkillTestSectionsPage] Starting new test attempt...');
      const testAttempt = await dataService.startTestAttempt(test!.id);
      
      // Find the section attempt from the created test attempt
      const sectionAttempts = testAttempt.section_attempts || [];
      const sectionAttempt = sectionAttempts.find(sa => 
        (sa.section_id || (sa as any).sectionId) === section.id
      );
      
      if (!sectionAttempt) {
        throw new Error('Section attempt not found in test attempt');
      }
      
      // Navigate to exam page with the new section attempt ID
      navigate(`/sectionAttempts/${sectionAttempt.id}?mode=exam`);
    } catch (error) {
      console.error('Failed to start section:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner text={t('common.loading')} />;
  }

  if (!test) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">{t('tests.noTests')}</p>
      </div>
    );
  }

  const totalQuestions = test.sections?.reduce((sum, section) => {
    const sectionQuestions = section.parts?.reduce((partSum, part) => {
      return partSum + (part.questions?.length || 0);
    }, 0) || 0;
    return sum + sectionQuestions;
  }, 0) || 0;

  const totalTime = test.sections?.reduce((sum, section) => {
    return sum + (section.time_limit || 0);
  }, 0) || 0;

  return (
    <div className="min-h-screen pb-12">
      {/* Background decorative elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute top-60 -left-40 w-96 h-96 bg-teal-500/5 dark:bg-teal-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative space-y-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(test?.skill ? `/skills/${test.skill}` : '/skills')}
          className="group flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all"
        >
          <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 group-hover:border-emerald-400 dark:group-hover:border-emerald-500 group-hover:shadow-lg group-hover:shadow-emerald-500/10 transition-all group-hover:-translate-x-1">
            <ArrowLeft className="w-5 h-5" />
          </div>
          <span className="font-semibold">Quay lại</span>
        </button>

        {/* Hero Section - Skill Practice Theme */}
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl p-8 shadow-2xl shadow-emerald-500/20">
          {/* Decorative patterns */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-32 translate-x-32" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-24 -translate-x-24" />
          </div>
          
          {/* Floating particles animation */}
          <div className="absolute inset-0 overflow-hidden">
            <Sparkles className="absolute top-10 left-20 w-6 h-6 text-white/30 animate-pulse" />
            <Sparkles className="absolute top-32 right-32 w-4 h-4 text-white/20 animate-pulse delay-75" />
            <Sparkles className="absolute bottom-20 left-1/2 w-5 h-5 text-white/25 animate-pulse delay-150" />
          </div>
          
          <div className="relative">
            {/* Skill Practice Badge */}
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-white" />
                  <span className="text-sm font-black text-white uppercase tracking-wider">
                    Luyện kỹ năng
                  </span>
                </div>
              </div>
              <div className="px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
                <span className="text-sm font-black text-white uppercase tracking-wider">
                  {test.level}
                </span>
              </div>
              <div className="px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20">
                <span className="text-xs font-bold text-white/90">
                  {test.year}/{test.month}
                </span>
              </div>
            </div>

            {/* Test Title */}
            <HTMLRenderer
              content={test.title}
              className="text-3xl md:text-4xl font-black text-white mb-6 leading-tight drop-shadow-lg"
            />

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 border border-white/20 hover:bg-white/20 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-white/20">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-bold text-white/80 uppercase tracking-wide">Phần thi</span>
                </div>
                <p className="text-2xl font-black text-white">{test.sections?.length || 0}</p>
              </div>

              <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 border border-white/20 hover:bg-white/20 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-white/20">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-bold text-white/80 uppercase tracking-wide">Câu hỏi</span>
                </div>
                <p className="text-2xl font-black text-white">{totalQuestions}</p>
              </div>

              <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 border border-white/20 hover:bg-white/20 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-white/20">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-bold text-white/80 uppercase tracking-wide">Thời gian</span>
                </div>
                <p className="text-2xl font-black text-white">{totalTime} phút</p>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions Card */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-2xl p-6 border border-blue-200 dark:border-blue-800/50">
          <div className="flex items-start gap-4">
            <div className="flex-none p-3 rounded-xl bg-blue-500 text-white">
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Hướng dẫn luyện tập</h3>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="flex-none w-5 h-5 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center mt-0.5">1</span>
                  <span>Chọn phần thi bạn muốn luyện tập từ danh sách bên dưới</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-none w-5 h-5 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center mt-0.5">2</span>
                  <span>Hoàn thành tất cả câu hỏi trong thời gian quy định</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-none w-5 h-5 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center mt-0.5">3</span>
                  <span>Xem kết quả và đáp án chi tiết sau khi hoàn thành</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section Cards */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
                <Zap className="w-6 h-6" />
              </div>
              Chọn phần thi để bắt đầu
            </h2>
            <div className="px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
              <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                {test.sections?.length || 0} phần
              </span>
            </div>
          </div>
          
          {test.sections && test.sections.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {test.sections.map((section, index) => (
                <SkillSectionCard
                  key={section.id}
                  section={section}
                  index={index}
                  onClick={() => handleSectionClick(section)}
                  mode="detail"
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900/50 dark:to-slate-800/50 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700">
              <Sparkles className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
              <p className="text-lg font-bold text-gray-600 dark:text-gray-400">
                Không có phần thi nào
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
