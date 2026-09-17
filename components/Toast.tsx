'use client';

import React from 'react';
import { Undo2, X } from 'lucide-react';

interface ToastProps {
  message: string;
  onUndo?: () => void;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, onUndo, onClose }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 px-4 py-2.5 rounded-xl shadow-lg border border-zinc-800 dark:border-zinc-200 text-xs font-medium animate-in fade-in slide-in-from-bottom-3 duration-200">
      <span>{message}</span>

      {onUndo && (
        <button
          onClick={onUndo}
          className="flex items-center gap-1 text-emerald-400 dark:text-emerald-600 hover:underline font-semibold cursor-pointer ml-1"
        >
          <Undo2 className="w-3.5 h-3.5" />
          Undo
        </button>
      )}

      <button
        onClick={onClose}
        className="text-zinc-400 hover:text-zinc-200 dark:hover:text-zinc-700 p-0.5"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
