/**
 * Skill Tests Page
 * Shows tests filtered by specific skill (e.g., goi N1, N2, N3...)
 * Similar to DashboardPage but filtered by skill
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Book, FileText, BookOpen, Headphones } from 'lucide-react';
import { dataService } from '../services';
import type { ITest, JLPTLevel, SkillType } from '../types';
import { SkillCardList } from '../components/SkillCardList';
import { FilterBar, FilterPill } from '../components/filters';

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

export function SkillTestsPage() {
  const { skill } = useParams<{ skill: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [tests, setTests] = useState<ITest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState<JLPTLevel | 'ALL'>('ALL');

  const levels: Array<JLPTLevel | 'ALL'> = ['ALL', 'N1', 'N2', 'N3', 'N4', 'N5'];

  const skillInfo = skill ? SKILL_INFO[skill as Exclude<SkillType, 'all'>] : null;

  useEffect(() => {
    if (!skill || !['goi', 'bunpou', 'dokkai', 'choukai'].includes(skill)) {
      navigate('/skills');
      return;
    }
    fetchTests();
  }, [skill, selectedLevel]);

  const fetchTests = async () => {
    if (!skill) return;

    setLoading(true);
    try {
      const filter = {
        level: selectedLevel !== 'ALL' ? selectedLevel : undefined,
        skill: skill as SkillType,
      };
      const data = await dataService.getTests(filter);
      setTests(data);
    } catch (error) {
      console.error('Failed to fetch tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const levelLabel = (level: JLPTLevel | 'ALL') => 
    level === 'ALL' ? t('dashboard.allLevels', '🌟 All') : level;

  if (!skillInfo) return null;

  return (
    <div className="min-h-full flex flex-col space-y-6">
      {/* Header Section */}
      <div className={`bg-gradient-to-r ${skillInfo.gradient} py-6 px-6 rounded-3xl shadow-2xl shadow-${skillInfo.gradient.split('-')[1]}-500/20`}>
        <div className="max-w-7xl mx-auto">          
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm shadow-lg">
              {skillInfo.icon}
            </div>
            <div>
              <h1 className="text-3xl font-black text-white drop-shadow-lg">
                {skillInfo.title}
              </h1>
              <p className="text-white/90 text-sm mt-1.5 font-medium">
                {t('skills.selectLevel', 'Chọn mức độ để bắt đầu luyện tập')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 py-2 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Level Filter */}
          <FilterBar className="mb-8">
            {levels.map((level) => (
              <FilterPill
                key={level}
                label={levelLabel(level)}
                isActive={selectedLevel === level}
                onClick={() => setSelectedLevel(level)}
              />
            ))}
          </FilterBar>

          {/* Tests List */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 dark:border-emerald-400"></div>
            </div>
          ) : tests.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">
                {t('dashboard.noTests', 'Không có đề thi nào')}
              </p>
              <p className="text-gray-500 dark:text-gray-500">
                {t('dashboard.noTestsHint', 'Thử thay đổi bộ lọc để xem các đề thi khác')}
              </p>
            </div>
          ) : (
              <SkillCardList tests={tests} loading={loading} />
          )}
        </div>
      </div>
    </div>
  );
}
