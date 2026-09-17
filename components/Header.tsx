'use client';

import React, { useState, useEffect } from 'react';
import {
  LayoutGrid,
  List,
  Search,
  Settings,
  StickyNote,
  HelpCircle,
  X,
  Clock,
} from 'lucide-react';
import { FilterType, ViewMode } from '../lib/types';

interface HeaderProps {
  viewMode: ViewMode;
  onToggleViewMode: (mode: ViewMode) => void;
  stickyNoteMode: boolean;
  onToggleStickyNote: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  counts: {
    all: number;
    todos: number;
    notes: number;
    completed: number;
  };
  showClock: boolean;
  onOpenSettings: () => void;
  onOpenShortcuts: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  viewMode,
  onToggleViewMode,
  stickyNoteMode,
  onToggleStickyNote,
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  counts,
  showClock,
  onOpenSettings,
  onOpenShortcuts,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString(undefined, {
          hour: '2-digit',
          minute: '2-digit',
        })
      );
      setDateStr(
        now.toLocaleDateString(undefined, {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-14 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 flex items-center justify-between gap-3 sm:gap-4 select-none z-20 flex-shrink-0">
      {/* Left: ZenTab Branding & Perfectly Aligned Time & Date */}
      <div className="flex items-center gap-3 sm:gap-3.5 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500/50 animate-pulse" />
          <span className="font-bold text-base tracking-tight text-zinc-900 dark:text-zinc-50">
            Zen<span className="text-emerald-600 dark:text-emerald-400">Tab</span>
          </span>
        </div>

        {showClock && (
          <div className="hidden sm:flex items-center gap-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 bg-zinc-100/80 dark:bg-zinc-900 px-2.5 py-1 rounded-full border border-zinc-200/80 dark:border-zinc-800 shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span className="font-semibold text-zinc-800 dark:text-zinc-200 tabular-nums">
              {timeStr}
            </span>
            <span className="text-zinc-300 dark:text-zinc-600 select-none">•</span>
            <span className="font-medium text-zinc-600 dark:text-zinc-400">
              {dateStr}
            </span>
          </div>
        )}
      </div>

      {/* Middle: Live Search Bar & Filter Tabs */}
      <div className="flex items-center gap-2.5 sm:gap-3 flex-1 max-w-xl">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
          <input
            id="zentab-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search notes & tasks... (press /)"
            className="w-full text-sm bg-zinc-100 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 rounded-lg pl-9 pr-8 py-1.5 text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white dark:focus:bg-zinc-900 transition-all select-text"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="hidden lg:flex items-center bg-zinc-100 dark:bg-zinc-900 rounded-lg p-0.5 border border-zinc-200/60 dark:border-zinc-800">
          {(['all', 'todos', 'notes', 'completed'] as FilterType[]).map((filter) => {
            const count = counts[filter];
            const isActive = activeFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => onFilterChange(filter)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold capitalize transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
                }`}
              >
                <span>{filter}</span>
                <span
                  className={`text-xs px-1.5 py-0.2 rounded-full font-medium ${
                    isActive
                      ? 'bg-zinc-100 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200'
                      : 'bg-zinc-200/70 dark:bg-zinc-800 text-zinc-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: View Toggle, Sticky Toggle & Settings */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {/* Sticky Note Quick Toggle */}
        <button
          onClick={() => {
            if (viewMode === 'list') {
              onToggleViewMode('card');
              if (!stickyNoteMode) onToggleStickyNote();
            } else {
              onToggleStickyNote();
            }
          }}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
            stickyNoteMode && viewMode === 'card'
              ? 'bg-amber-100/90 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 shadow-xs'
              : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'
          }`}
          title={
            viewMode === 'list'
              ? 'Switch to Grid View with Sticky Notes'
              : stickyNoteMode
              ? 'Sticky Note Mode: Active'
              : 'Enable Sticky Note Mode (Grid View)'
          }
        >
          <StickyNote className="w-4 h-4" />
          <span className="hidden sm:inline">Sticky Notes</span>
        </button>

        {/* View Mode Toggle: List vs Card */}
        <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 rounded-lg p-0.5 border border-zinc-200/60 dark:border-zinc-800">
          <button
            onClick={() => onToggleViewMode('card')}
            className={`p-1.5 rounded-md transition-all cursor-pointer ${
              viewMode === 'card'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
            }`}
            title="Card View (Grid)"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => onToggleViewMode('list')}
            className={`p-1.5 rounded-md transition-all cursor-pointer ${
              viewMode === 'list'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
            }`}
            title="List View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>

        {/* Shortcuts Help Modal */}
        <button
          onClick={onOpenShortcuts}
          className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          title="Keyboard Shortcuts (?)"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Settings Modal Button */}
        <button
          onClick={onOpenSettings}
          className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          title="ZenTab Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
