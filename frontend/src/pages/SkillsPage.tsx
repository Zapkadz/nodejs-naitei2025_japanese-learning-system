/**
 * Skills Practice Page
 * Shows 4 skill tags: Goi, Bunpou, Dokkai, Choukai
 * Click on a skill to navigate to skill-specific tests
 */

import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Book, FileText, BookOpen, Headphones } from 'lucide-react';
import { Card } from '../components/ui';
import type { SkillType } from '../types';

interface SkillCardProps {
  skill: Exclude<SkillType, 'all'>;
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  onClick: () => void;
}

function SkillCard({ skill, title, description, icon, gradient, onClick }: SkillCardProps) {
  return (
    <Card 
      className={`cursor-pointer group hover:scale-105 transition-all duration-300 hover:shadow-2xl ${gradient}`}
      onClick={onClick}
    >
      <Card.Header className="space-y-2">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
          <p className="text-white/80 text-sm">{description}</p>
        </div>
      </Card.Header>
      <Card.Footer>
        <div className="text-right">
          <span className="inline-flex items-center px-3 py-1 rounded-lg bg-white/20 text-white text-sm font-medium group-hover:bg-white/30 transition-colors">
            {skill.toUpperCase()}
          </span>
        </div>
      </Card.Footer>
    </Card>
  );
}

export function SkillsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const skills: Array<{
    skill: Exclude<SkillType, 'all'>;
    title: string;
    description: string;
    icon: React.ReactNode;
    gradient: string;
  }> = [
    {
      skill: 'goi',
      title: t('skills.goi.title', '語彙'),
      description: t('skills.goi.description', 'Luyện tập từ vựng tiếng Nhật'),
      icon: <Book className="w-6 h-6 text-white" />,
      gradient: 'bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700',
    },
    {
      skill: 'bunpou',
      title: t('skills.bunpou.title', '文法'),
      description: t('skills.bunpou.description', 'Luyện tập ngữ pháp tiếng Nhật'),
      icon: <FileText className="w-6 h-6 text-white" />,
      gradient: 'bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700',
    },
    {
      skill: 'dokkai',
      title: t('skills.dokkai.title', '読解'),
      description: t('skills.dokkai.description', 'Luyện tập đọc hiểu tiếng Nhật'),
      icon: <BookOpen className="w-6 h-6 text-white" />,
      gradient: 'bg-gradient-to-br from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700',
    },
    {
      skill: 'choukai',
      title: t('skills.choukai.title', '聴解'),
      description: t('skills.choukai.description', 'Luyện tập nghe hiểu tiếng Nhật'),
      icon: <Headphones className="w-6 h-6 text-white" />,
      gradient: 'bg-gradient-to-br from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700',
    },
  ];

  const handleSkillClick = (skill: Exclude<SkillType, 'all'>) => {
    navigate(`/skills/${skill}`);
  };

  return (
    <div className="min-h-full flex flex-col space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 dark:from-slate-800 dark:to-slate-900 py-6 px-6 rounded-3xl shadow-2xl shadow-emerald-500/20">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-black text-white mb-2 drop-shadow-lg">
            {t('skills.title', '🎯 Luyện kỹ năng')}
          </h1>
          <p className="text-white/90 text-sm font-medium">
            {t('skills.subtitle', 'Chọn kỹ năng bạn muốn luyện tập')}
          </p>
        </div>
      </div>

      {/* Skills Grid */}
      <div className="flex-1 py-2 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {skills.map((skill) => (
              <SkillCard
                key={skill.skill}
                skill={skill.skill}
                title={skill.title}
                description={skill.description}
                icon={skill.icon}
                gradient={skill.gradient}
                onClick={() => handleSkillClick(skill.skill)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
