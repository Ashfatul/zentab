'use client';

import React from 'react';
import { Sparkles, Search } from 'lucide-react';
import { DateGroup, FilterType, ViewMode, ZenItem } from '../lib/types';
import { DateSeparator } from './DateSeparator';
import { ItemCard } from './ItemCard';
import { ItemListRow } from './ItemListRow';

interface RightFeedProps {
  groups: DateGroup[];
  totalFilteredCount: number;
  viewMode: ViewMode;
  stickyNoteMode: boolean;
  activeFilter: FilterType;
  searchQuery: string;
  onClearSearch: () => void;
  onEdit: (item: ZenItem) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onToggleSubtask: (itemId: string, subtaskId: string) => void;
  onTogglePin: (id: string) => void;
}

export const RightFeed: React.FC<RightFeedProps> = ({
  groups,
  totalFilteredCount,
  viewMode,
  stickyNoteMode,
  activeFilter,
  searchQuery,
  onClearSearch,
  onEdit,
  onDelete,
  onToggleComplete,
  onToggleSubtask,
  onTogglePin,
}) => {
  if (totalFilteredCount === 0) {
    return (
      <main className="flex-1 h-full overflow-y-auto flex flex-col items-center justify-center p-8 select-none">
        <div className="max-w-md text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-center mx-auto text-emerald-500 shadow-xs">
            {searchQuery ? (
              <Search className="w-6 h-6 text-zinc-400" />
            ) : (
              <Sparkles className="w-6 h-6" />
            )}
          </div>

          <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
            {searchQuery
              ? `No results found for "${searchQuery}"`
              : activeFilter === 'completed'
              ? 'No completed tasks yet'
              : 'Your canvas is clear'}
          </h3>

          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            {searchQuery
              ? 'Try checking for typos or searching a different keyword or tag.'
              : 'Use the left capture area to jot down quick notes, checklists, or action items.'}
          </p>

          {searchQuery && (
            <button
              onClick={onClearSearch}
              className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium hover:underline cursor-pointer"
            >
              Clear search query
            </button>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 h-full overflow-y-auto px-5 py-4 space-y-6">
      {groups.map((group) => {
        const isPinnedGroup = group.dateKey === 'pinned';
        return (
          <section key={group.dateKey} className="w-full">
            {/* Full Width Date Separator */}
            <DateSeparator
              label={group.label}
              subLabel={group.subLabel}
              count={group.items.length}
              isPinned={isPinnedGroup}
            />

            {/* View Mode: Card Grid vs List Rows */}
            {viewMode === 'card' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pt-2">
                {group.items.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    stickyNoteMode={stickyNoteMode && viewMode === 'card'}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onToggleComplete={onToggleComplete}
                    onToggleSubtask={onToggleSubtask}
                    onTogglePin={onTogglePin}
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5 pt-2 max-w-6xl">
                {group.items.map((item) => (
                  <ItemListRow
                    key={item.id}
                    item={item}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onToggleComplete={onToggleComplete}
                    onTogglePin={onTogglePin}
                  />
                ))}
              </div>
            )}
          </section>
        );
      })}
    </main>
  );
};
