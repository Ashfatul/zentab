'use client';

import React, { useEffect, useRef } from 'react';
import {
  Trash2,
  X,
  CheckSquare,
  FileText,
  Calendar,
  Tag,
  AlertCircle,
} from 'lucide-react';
import { ZenItem } from '../lib/types';
import { formatShortDate } from '../lib/dateUtils';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  item?: ZenItem | null;
  isClearAll?: boolean;
  title?: string;
  description?: string;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  item,
  isClearAll = false,
  title,
  description,
}) => {
  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  // Autofocus the Cancel button for safety when opened
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        cancelBtnRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isTodo = item?.type === 'todo';
  const modalTitle =
    title ||
    (isClearAll
      ? 'Clear All Data & Reset'
      : isTodo
      ? 'Delete Task?'
      : 'Delete Note?');

  const modalDescription =
    description ||
    (isClearAll
      ? 'Are you sure you want to delete all notes and tasks? This will permanently erase your local board data.'
      : `Are you sure you want to delete this ${
          isTodo ? 'task' : 'note'
        }? You can undo this action right after.`);

  const completedSubtasks =
    item?.subtasks?.filter((s) => s.completed).length || 0;
  const totalSubtasks = item?.subtasks?.length || 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      <div
        className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150 select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 pb-3 flex items-start justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400 flex-shrink-0 shadow-2xs">
              {isClearAll ? (
                <AlertCircle className="w-5 h-5" />
              ) : (
                <Trash2 className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2
                id="delete-modal-title"
                className="text-base font-semibold text-zinc-900 dark:text-zinc-100"
              >
                {modalTitle}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                {isClearAll ? 'Permanent reset' : 'Confirm deletion'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Cancel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-4">
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
            {modalDescription}
          </p>

          {/* Item Preview Box (when deleting a specific item) */}
          {item && (
            <div className="rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-800/40 p-3.5 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300">
                  {isTodo ? (
                    <>
                      <CheckSquare className="w-3 h-3 text-emerald-500" />
                      Task
                    </>
                  ) : (
                    <>
                      <FileText className="w-3 h-3 text-indigo-500" />
                      Zen Note
                    </>
                  )}
                </span>

                {item.priority && (
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
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

                {item.dueDate && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                    <Calendar className="w-3 h-3 text-zinc-400" />
                    {formatShortDate(item.dueDate)}
                  </span>
                )}
              </div>

              <div className="font-medium text-sm text-zinc-900 dark:text-zinc-100 line-clamp-2">
                {item.title || '(Untitled)'}
              </div>

              {item.content && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 whitespace-pre-line">
                  {item.content}
                </p>
              )}

              {/* Subtasks summary */}
              {isTodo && totalSubtasks > 0 && (
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 pt-0.5">
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                    {completedSubtasks}/{totalSubtasks}
                  </span>{' '}
                  subtasks completed
                </div>
              )}

              {/* Tags */}
              {item.tags && item.tags.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-zinc-200/60 dark:bg-zinc-700/60 text-[10px] font-medium text-zinc-600 dark:text-zinc-300"
                    >
                      <Tag className="w-2.5 h-2.5 opacity-60" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Warning note for Clear All */}
          {isClearAll && (
            <div className="rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/70 dark:bg-rose-950/30 p-3 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
              <span>
                Tip: You can download a backup copy using <strong>Export JSON</strong> or{' '}
                <strong>Export Markdown</strong> before resetting.
              </span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 pt-3 bg-zinc-50/60 dark:bg-zinc-950/40 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-end gap-2.5">
          <button
            ref={cancelBtnRef}
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer shadow-2xs"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-xs focus:ring-2 focus:ring-rose-500 focus:ring-offset-1 dark:focus:ring-offset-zinc-900"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>
              {isClearAll
                ? 'Clear Everything'
                : isTodo
                ? 'Delete Task'
                : 'Delete Note'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
