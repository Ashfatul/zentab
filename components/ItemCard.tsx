'use client';

import React from 'react';
import {
  CheckCircle2,
  Circle,
  Pin,
  Pencil,
  Trash2,
  Calendar,
  CheckSquare,
  FileText,
  Tag,
} from 'lucide-react';
import { ZenItem } from '../lib/types';
import { formatRelativeTime } from '../lib/dateUtils';

interface ItemCardProps {
  item: ZenItem;
  stickyNoteMode: boolean;
  onEdit: (item: ZenItem) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onToggleSubtask: (itemId: string, subtaskId: string) => void;
  onTogglePin: (id: string) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  stickyNoteMode,
  onEdit,
  onDelete,
  onToggleComplete,
  onToggleSubtask,
  onTogglePin,
}) => {
  const isTodo = item.type === 'todo';
  const isCompleted = item.completed ?? false;
  const color = item.color || (isTodo ? 'blue' : 'yellow');

  // Subtle natural paper tilt for floating sticky note mode
  const tiltClasses = ['-rotate-1', 'rotate-1', '-rotate-[0.5deg]', 'rotate-[0.5deg]', 'rotate-0'];
  const charSum = item.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const tiltClass = tiltClasses[Math.abs(charSum) % tiltClasses.length];

  const stickyClass = stickyNoteMode
    ? `sticky-floating sticky-note-${color} border ${tiltClass}`
    : 'bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800/90 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-xs hover:shadow-sm transition-all duration-150';

  const completedSubtasks = item.subtasks?.filter((s) => s.completed).length || 0;
  const totalSubtasks = item.subtasks?.length || 0;
  const progressPercent = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  return (
    <div
      className={`group relative rounded-xl p-4 flex flex-col justify-between select-text ${stickyClass} ${
        isCompleted ? 'opacity-70' : ''
      }`}
    >
      {/* 45-degree Pinned Pushpin on Top-Left for Pinned items */}
      {item.pinned && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin(item.id);
          }}
          className="absolute -top-2.5 -left-2 z-10 p-0.5 text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 transition-transform hover:scale-115 cursor-pointer"
          title="Pinned to top (Click to unpin)"
        >
          <Pin className="w-5 h-5 fill-rose-500 text-rose-500 dark:fill-rose-400 dark:text-rose-400 -rotate-45 drop-shadow-md" />
        </button>
      )}

      {/* Centered Board Pin Tack for unpinned floating sticky notes */}
      {stickyNoteMode && !item.pinned && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin(item.id);
          }}
          className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-10 p-0.5 text-zinc-400/80 hover:text-rose-500 dark:text-zinc-500 hover:scale-115 transition-all cursor-pointer group/pin"
          title="Pin note to top"
        >
          <Pin className="w-4 h-4 fill-zinc-300 dark:fill-zinc-600 text-zinc-400 dark:text-zinc-500 group-hover/pin:fill-rose-500 group-hover/pin:text-rose-500 drop-shadow-xs transition-colors" />
        </button>
      )}

      {/* Card Header */}
      <div>
        {/* Top Type Label & Hover Actions Row */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase select-none ${
              stickyNoteMode
                ? 'bg-black/10 dark:bg-black/25 text-zinc-800 dark:text-zinc-200 border border-black/10 dark:border-white/10'
                : isTodo
                ? 'bg-emerald-100/90 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60'
                : 'bg-indigo-100/90 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60'
            }`}
          >
            {isTodo ? (
              <CheckSquare className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <FileText className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
            )}
            <span>{isTodo ? 'Todo' : 'Note'}</span>
          </span>

          {/* Hover Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <div className="opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto flex items-center gap-0.5 transition-opacity">
              <button
                onClick={() => onTogglePin(item.id)}
                className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                title={item.pinned ? 'Unpin' : 'Pin to top'}
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

        {/* Title and (for Todo) completion checkbox */}
        <div className="flex items-start gap-2 mb-2">
          {isTodo ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleComplete(item.id);
              }}
              className="mt-0.5 text-zinc-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors cursor-pointer flex-shrink-0"
              title={isCompleted ? 'Mark incomplete' : 'Mark complete'}
            >
              {isCompleted ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/10" />
              ) : (
                <Circle className="w-5 h-5" />
              )}
            </button>
          ) : (
            <FileText className="w-4 h-4 mt-1 text-zinc-400 flex-shrink-0" />
          )}

          <h3
            className={`font-semibold text-base leading-snug break-words flex-1 ${
              isCompleted
                ? 'line-through text-zinc-400 dark:text-zinc-500'
                : 'text-zinc-800 dark:text-zinc-100'
            }`}
          >
            {item.title || '(Untitled)'}
          </h3>
        </div>

        {/* Content Body */}
        {item.content && (
          <div className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-line break-words mb-3 max-h-48 overflow-y-auto pr-1 select-text">
            {item.content}
          </div>
        )}

        {/* Subtasks Section for Todos */}
        {isTodo && totalSubtasks > 0 && (
          <div className="mt-2 mb-3 bg-zinc-50/70 dark:bg-zinc-800/40 rounded-lg p-2.5 border border-zinc-200/50 dark:border-zinc-700/40">
            <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-2 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
                Tasks ({completedSubtasks}/{totalSubtasks})
              </span>
              <span>{Math.round(progressPercent)}%</span>
            </div>

            {/* Mini Progress Bar */}
            <div className="w-full h-1 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Checklist Items */}
            <div className="space-y-1.5">
              {item.subtasks?.map((sub) => (
                <label
                  key={sub.id}
                  className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300 cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100"
                >
                  <input
                    type="checkbox"
                    checked={sub.completed}
                    onChange={() => onToggleSubtask(item.id, sub.id)}
                    className="w-3.5 h-3.5 text-emerald-600 rounded border-zinc-300 dark:border-zinc-600 focus:ring-emerald-500"
                  />
                  <span className={sub.completed ? 'line-through text-zinc-400 dark:text-zinc-500' : ''}>
                    {sub.text}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Card Footer: Tags, Priority, Due Date & Timestamp */}
      <div className="pt-2.5 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between gap-2 text-xs flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Priority Pill */}
          {item.priority && (
            <span
              className={`px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider ${
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
            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-medium">
              <Calendar className="w-3 h-3 text-zinc-400" />
              {item.dueDate}
            </span>
          )}

          {/* Tag Badges */}
          {item.tags
            ?.filter((tag) => tag.toLowerCase() !== 'todo' && tag.toLowerCase() !== 'note')
            .map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 text-xs font-medium"
              >
                <Tag className="w-2.5 h-2.5 opacity-60" />
                {tag}
              </span>
            ))}
        </div>

        <span className="text-xs text-zinc-400 dark:text-zinc-500 ml-auto">
          {formatRelativeTime(item.createdAt)}
        </span>
      </div>
    </div>
  );
};
