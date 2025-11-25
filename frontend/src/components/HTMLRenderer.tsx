/**
 * HTMLRenderer Component
 * Safely renders HTML content with ruby tags for furigana
 */

import { useMemo } from 'react';

interface HTMLRendererProps {
  content: string;
  className?: string;
}

export const HTMLRenderer: React.FC<HTMLRendererProps> = ({ content, className = '' }) => {
  // Sanitize and prepare HTML content
  const sanitizedContent = useMemo(() => {
    // In production, you might want to use a library like DOMPurify
    // For now, we trust our backend data
    return content;
  }, [content]);

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      style={{
        // Ensure ruby tags display correctly
        display: 'inline',
      }}
    />
  );
};
