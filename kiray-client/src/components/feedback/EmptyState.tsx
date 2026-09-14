import React from 'react';
import { FolderSearch } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50/50',
        className,
      )}
    >
      <div className="w-12 h-12 rounded-2xl bg-orange-100/70 text-orange-600 flex items-center justify-center mb-4">
        {icon || <FolderSearch className="w-6 h-6" />}
      </div>
      <h3 className="text-base font-bold text-slate-900 font-display">{title}</h3>
      {description && (
        <p className="text-xs sm:text-sm text-stone-500 max-w-sm mt-1 mb-6 leading-relaxed">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
};
