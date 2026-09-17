'use client';

import React from 'react';
import { Calendar, Pin } from 'lucide-react';

interface DateSeparatorProps {
  label: string;
  subLabel?: string;
  count: number;
  isPinned?: boolean;
}

export const DateSeparator: React.FC<DateSeparatorProps> = ({
  label,
  subLabel,
  count,
  isPinned = false,
}) => {
  return (
    <div className="w-full flex items-center gap-3 my-4 select-none">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/80 px-2.5 py-1 rounded-md border border-zinc-200/70 dark:border-zinc-700/60 shadow-xs flex-shrink-0">
        {isPinned ? (
          <Pin className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
        ) : (
          <Calendar className="w-3.5 h-3.5 text-emerald-500" />
        )}
        <span className={isPinned ? 'text-rose-600 dark:text-rose-400' : ''}>{label}</span>
        {subLabel && (
          <span className="text-xs font-normal lowercase tracking-normal text-zinc-400 dark:text-zinc-500">
            • {subLabel}
          </span>
        )}
      </div>

      <div className="h-[1px] flex-1 bg-gradient-to-r from-zinc-200 dark:from-zinc-800 to-transparent" />

      <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500 px-2 py-0.5 rounded-full bg-zinc-100/60 dark:bg-zinc-800/40 border border-zinc-200/40 dark:border-zinc-700/40 flex-shrink-0">
        {count} {count === 1 ? 'item' : 'items'}
      </span>
    </div>
  );
};
