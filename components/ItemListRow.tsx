'use client';

import React from 'react';
import {
  CheckCircle2,
  Circle,
  Pin,
  Pencil,
  Trash2,
  Calendar,
  FileText,
  Tag,
  CheckSquare,
} from 'lucide-react';
import { ZenItem } from '../lib/types';
import { formatRelativeTime, formatShortDate } from '../lib/dateUtils';

interface ItemListRowProps {
  item: ZenItem;
  onEdit: (item: ZenItem) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onTogglePin: (id: string) => void;
}

const colorBorderMap: Record<string, string> = {
  yellow: 'border-l-amber-400 dark:border-l-amber-500',
  green: 'border-l-emerald-400 dark:border-l-emerald-500',
  blue: 'border-l-sky-400 dark:border-l-sky-500',
  purple: 'border-l-purple-400 dark:border-l-purple-500',
  rose: 'border-l-rose-400 dark:border-l-rose-500',
  slate: 'border-l-zinc-300 dark:border-l-zinc-600',
  amber: 'border-l-amber-500 dark:border-l-amber-600',
};

export const ItemListRow: React.FC<ItemListRowProps> = ({
  item,
  onEdit,
  onDelete,
  onToggleComplete,
  onTogglePin,
}) => {
  const isTodo = item.type === 'todo';
  const isCompleted = item.completed ?? false;
  const completedSubtasks = item.subtasks?.filter((s) => s.completed).length || 0;
  const totalSubtasks = item.subtasks?.length || 0;
  const colorBorder = item.color ? colorBorderMap[item.color] || 'border-l-transparent' : 'border-l-transparent';

  return (
    <div
      className={`group relative flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border border-zinc-200/70 dark:border-zinc-800/80 border-l-[3.5px] ${colorBorder} bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-xs transition-all duration-150 select-text ${
        isCompleted ? 'opacity-60 bg-zinc-50/50 dark:bg-zinc-900/40' : ''
      }`}
    >
      {/* 45-degree Pinned Pushpin on Top-Left */}
      {item.pinned && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin(item.id);
          }}
          className="absolute -top-1.5 -left-1.5 z-10 text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 transition-transform hover:scale-110 cursor-pointer"
          title="Pinned to top (Click to unpin)"
        >
          <Pin className="w-4 h-4 fill-rose-500 text-rose-500 dark:fill-rose-400 dark:text-rose-400 -rotate-45 drop-shadow-xs" />
        </button>
      )}

      {/* Left Area: Icon / Checkbox + Title + Snippet */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Checkbox or Note Icon */}
        {isTodo ? (
          <button
            onClick={() => onToggleComplete(item.id)}
            className="text-zinc-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors cursor-pointer flex-shrink-0"
            title={isCompleted ? 'Mark incomplete' : 'Mark complete'}
          >
            {isCompleted ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-500/10" />
            ) : (
              <Circle className="w-4 h-4" />
            )}
          </button>
        ) : (
          <FileText className="w-4 h-4 text-zinc-400 flex-shrink-0" />
        )}

        {/* Title and Snippet */}
        <div className="flex items-baseline gap-2 flex-1 min-w-0">
          <span
            className={`text-sm font-semibold truncate ${
              isCompleted
                ? 'line-through text-zinc-400 dark:text-zinc-500'
                : 'text-zinc-800 dark:text-zinc-100'
            }`}
          >
            {item.title || '(Untitled)'}
          </span>

          {item.content && (
            <span className="text-xs text-zinc-400 dark:text-zinc-500 truncate hidden 2xl:inline max-w-[160px]">
              — {item.content.replace(/\n/g, ' ')}
            </span>
          )}
        </div>
      </div>

      {/* Right Area: Badges, Subtask counter, Tags, Actions & Timestamp */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Subtask count */}
        {isTodo && totalSubtasks > 0 && (
          <span className="flex items-center gap-1 text-xs font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded flex-shrink-0">
            <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
            {completedSubtasks}/{totalSubtasks}
          </span>
        )}

        {/* Priority Badge */}
        {item.priority && (
          <span
            className={`px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider flex-shrink-0 ${
              item.priority === 'high'
                ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                : item.priority === 'medium'
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
            }`}
          >
            {item.priority}
          </span>
        )}

        {/* Due Date */}
        {item.dueDate && (
          <span className="items-center gap-1 text-xs font-medium text-zinc-600 dark:text-zinc-400 hidden xl:flex flex-shrink-0">
            <Calendar className="w-3 h-3 text-zinc-400" />
            {formatShortDate(item.dueDate)}
          </span>
        )}

        {/* First Tag */}
        {item.tags && item.tags.length > 0 && (
          <span className="items-center gap-1 px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-medium hidden 2xl:flex flex-shrink-0">
            <Tag className="w-2.5 h-2.5 opacity-50" />
            {item.tags[0]}
          </span>
        )}

        {/* Timestamp & Hover Action Swapper */}
        <div className="relative flex items-center justify-end min-w-[65px] h-6 flex-shrink-0">
          <span className="text-xs text-zinc-400 dark:text-zinc-500 group-hover:opacity-0 transition-opacity text-right whitespace-nowrap">
            {formatRelativeTime(item.createdAt)}
          </span>

          <div className="absolute right-0 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto flex items-center gap-0.5 transition-opacity bg-white dark:bg-zinc-900 pl-1.5">
            <button
              onClick={() => onTogglePin(item.id)}
              className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title={item.pinned ? 'Unpin' : 'Pin'}
            >
              <Pin
                className={`w-3.5 h-3.5 ${
                  item.pinned ? 'fill-rose-500 text-rose-500' : ''
                }`}
              />
            </button>
            <button
              onClick={() => onEdit(item)}
              className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Edit"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(item.id)}
              className="p-1 rounded text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
