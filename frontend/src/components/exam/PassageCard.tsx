import { HTMLRenderer } from '../HTMLRenderer';

interface PassageCardProps {
  title?: string;
  content: string;
  imageUrl?: string;
}

export function PassageCard({ title, content, imageUrl }: PassageCardProps) {
  return (
    <div className="mb-6 p-5 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 rounded-xl border-l-4 border-amber-400 dark:border-amber-600">
      {title && (
        <HTMLRenderer
          content={title}
          className="text-base font-bold text-gray-900 dark:text-white mb-3"
        />
      )}
      <HTMLRenderer
        content={content}
        className="text-[15px] leading-[1.7] text-gray-800 dark:text-gray-200"
      />
      {imageUrl && (
        <img
          src={imageUrl}
          alt={title || 'Passage image'}
          className="mt-4 w-full h-auto rounded-xl shadow-md"
        />
      )}
    </div>
  );
}
