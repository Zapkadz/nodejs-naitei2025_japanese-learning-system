/**
 * Skill Test Detail Page
 * Shows sections for a skill test
 * Allows direct section start (no need to start full test)
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, PlayCircle } from 'lucide-react';
import { dataService } from '../services';
import type { ITestDetail, ISectionWithParts, SkillType } from '../types';
import { HTMLRenderer } from '../components/HTMLRenderer';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Card } from '../components/ui';
import { Book, FileText, BookOpen, Headphones } from 'lucide-react';

const SKILL_INFO: Record<Exclude<SkillType, 'all'>, { 
  title: string; 
  icon: React.ReactNode; 
  gradient: string;
}> = {
  goi: {
    title: '語彙 Từ vựng',
    icon: <Book className="w-6 h-6 text-white" />,
    gradient: 'from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700',
  },
  bunpou: {
    title: '文法 Ngữ pháp',
    icon: <FileText className="w-6 h-6 text-white" />,
    gradient: 'from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700',
  },
  dokkai: {
    title: '読解 Đọc hiểu',
    icon: <BookOpen className="w-6 h-6 text-white" />,
    gradient: 'from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700',
  },
  choukai: {
    title: '聴解 Nghe hiểu',
    icon: <Headphones className="w-6 h-6 text-white" />,
    gradient: 'from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700',
  },
};

export function SkillTestDetailPage() {
  const { skill, testId } = useParams<{ skill: string; testId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [test, setTest] = useState<ITestDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const skillInfo = skill ? SKILL_INFO[skill as Exclude<SkillType, 'all'>] : null;

  useEffect(() => {
    if (!skill || !testId || !['goi', 'bunpou', 'dokkai', 'choukai'].includes(skill)) {
      navigate('/skills');
      return;
    }
    fetchTestDetail();
  }, [skill, testId]);

  const fetchTestDetail = async () => {
    if (!testId) return;

    setLoading(true);
    try {
      const data = await dataService.getTestDetail(parseInt(testId));
      setTest(data);
    } catch (error) {
      console.error('Failed to fetch test detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSectionStart = async (section: ISectionWithParts) => {
    try {
      console.log('[SkillTestDetailPage] Starting section directly:', section.id);
      
      // For skill practice, we create a test attempt but go directly to the section
      const testAttempt = await dataService.startTestAttempt(parseInt(testId!));
      console.log('[SkillTestDetailPage] Created test attempt:', testAttempt);
      
      // Find the section attempt
      const sectionAttempts = testAttempt.section_attempts || [];
      const sectionAttempt = sectionAttempts.find(sa => 
        (sa.section_id || (sa as any).sectionId) === section.id
      );
      
      if (!sectionAttempt) {
        console.error('[SkillTestDetailPage] Section attempt not found!');
        throw new Error('Section attempt not found in test attempt');
      }
      
      console.log('[SkillTestDetailPage] Found section attempt:', sectionAttempt);
      
      // Navigate directly to exam page for this section
      navigate(`/sectionAttempts/${sectionAttempt.id}?mode=exam`);
    } catch (error) {
      console.error('[SkillTestDetailPage] Failed to start section:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner text={t('common.loading')} />;
  }

  if (!test || !skillInfo) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">{t('tests.noTests')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col">
      {/* Header Section */}
      <div className={`bg-gradient-to-r ${skillInfo.gradient} py-12 px-4 sm:px-6 lg:px-8`}>
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate(`/skills/${skill}`)}
            className="flex items-center space-x-2 text-white/90 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{t('common.back', 'Quay lại')}</span>
          </button>
          
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm">
              {skillInfo.icon}
            </div>
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <span className="inline-flex items-center px-3 py-1 rounded-lg bg-white/20 text-white text-sm font-medium">
                  {test.level}
                </span>
                <span className="text-white/80 text-sm">
                  {test.year}/{test.month}
                </span>
              </div>
              <h1 className="text-4xl font-bold text-white">
                <HTMLRenderer content={test.title} />
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 bg-gray-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Info Banner */}
          <div className="mb-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 text-2xl">💡</div>
              <div>
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-2">
                  {t('skills.directStart.title', 'Luyện từng phần riêng lẻ')}
                </h3>
                <p className="text-blue-700 dark:text-blue-400 text-sm">
                  {t('skills.directStart.description', 'Bạn có thể bắt đầu làm bất kỳ phần nào mà không cần hoàn thành toàn bộ đề thi. Chọn phần bạn muốn luyện tập và bắt đầu ngay!')}
                </p>
              </div>
            </div>
          </div>

          {/* Sections List */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {t('skills.sections', 'Các phần thi')} ({test.sections?.length || 0})
            </h2>

            {test.sections && test.sections.length > 0 ? (
              <div className="grid gap-4">
                {test.sections.map((section, index) => (
                  <Card key={section.id} className="hover:shadow-xl transition-shadow">
                    <Card.Body>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold">
                              {index + 1}
                            </span>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {section.name}
                            </h3>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 ml-11">
                            <span>⏱️ {section.time_limit} {t('common.minutes', 'phút')}</span>
                            <span>📝 {section.parts?.reduce((acc, part) => acc + (part.questions?.length || 0), 0) || 0} {t('common.questions', 'câu hỏi')}</span>
                            {section.audio_url && <span>🔊 {t('common.hasAudio', 'Có audio')}</span>}
                          </div>
                        </div>

                        <button
                          onClick={() => handleSectionStart(section)}
                          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium rounded-xl transition-all hover:scale-105 shadow-lg hover:shadow-xl"
                        >
                          <PlayCircle className="w-5 h-5" />
                          <span>{t('skills.startSection', 'Bắt đầu')}</span>
                        </button>
                      </div>
                    </Card.Body>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  {t('tests.noSections', 'Không có phần thi nào')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
