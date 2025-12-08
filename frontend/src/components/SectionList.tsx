/**
 * Section List Component
 * Container for section cards
 */

import { SectionCard } from './SectionCard';

interface SectionListProps {
  sections: any[];
  onSectionClick: (section: any) => void;
  mode?: 'detail' | 'attempt';
  title?: string;
  showTitle?: boolean;
}

export function SectionList({ 
  sections, 
  onSectionClick, 
  mode = 'detail',
  title,
  showTitle = true 
}: SectionListProps) {
  const defaultTitle = mode === 'detail' 
    ? `Chọn phần thi để bắt đầu (${sections.length})`
    : `Các phần thi (${sections.length})`;

  return (
    <div>
      {showTitle && (
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          {title || defaultTitle}
        </h2>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((section, index) => (
          <SectionCard
            key={section.id}
            section={section}
            index={index}
            onClick={() => onSectionClick(section)}
            mode={mode}
          />
        ))}
      </div>
    </div>
  );
}
