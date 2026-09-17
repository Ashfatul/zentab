'use client';

import React, { useRef, useState } from 'react';
import {
  X,
  StickyNote,
  Moon,
  Sun,
  Laptop,
  LayoutGrid,
  List,
  Download,
  Upload,
  Trash2,
  FileText,
  Clock,
} from 'lucide-react';
import { ThemeMode, ViewMode, ZenSettings } from '../lib/types';
import { exportBackup, exportMarkdown, importBackup } from '../lib/storage';
import { DeleteConfirmModal } from './DeleteConfirmModal';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ZenSettings;
  onUpdateSettings: (newSettings: ZenSettings) => void;
  onClearAll: () => void;
  onReloadItems: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onClearAll,
  onReloadItems,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);

  if (!isOpen) return null;

  const handleToggleSticky = () => {
    onUpdateSettings({
      ...settings,
      stickyNoteMode: !settings.stickyNoteMode,
    });
  };

  const handleThemeChange = (theme: ThemeMode) => {
    onUpdateSettings({ ...settings, theme });
  };

  const handleViewModeChange = (viewMode: ViewMode) => {
    onUpdateSettings({ ...settings, viewMode });
  };

  const handleToggleClock = () => {
    onUpdateSettings({
      ...settings,
      showClock: !settings.showClock,
    });
  };

  const handleExportJson = async () => {
    const jsonStr = await exportBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zentab-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportMd = async () => {
    const mdStr = await exportMarkdown();
    const blob = new Blob([mdStr], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zentab-export-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target?.result as string;
      if (text) {
        const success = await importBackup(text);
        if (success) {
          alert('Backup imported successfully!');
          onReloadItems();
        } else {
          alert('Failed to import backup. Please check file format.');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              ZenTab Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-6 text-sm">
          {/* Setting 1: Sticky Note Mode */}
          <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/70 dark:border-zinc-700/50">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 font-medium text-zinc-900 dark:text-zinc-100">
                <StickyNote className="w-4 h-4 text-amber-500" />
                <span>Sticky Note Mode</span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Transform feed cards into colorful sticky notes with soft pastel tints. (Default: False)
              </p>
            </div>
            <button
              type="button"
              onClick={handleToggleSticky}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer flex-shrink-0 ${
                settings.stickyNoteMode ? 'bg-emerald-600' : 'bg-zinc-300 dark:bg-zinc-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.stickyNoteMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Setting 2: Theme Selection */}
          <div>
            <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">
              Color Theme
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: 'system', label: 'System', icon: Laptop },
                { key: 'light', label: 'Light', icon: Sun },
                { key: 'dark', label: 'Dark', icon: Moon },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleThemeChange(key as ThemeMode)}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                    settings.theme === key
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 shadow-xs'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Setting 3: Default View Mode */}
          <div>
            <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">
              Default View Layout
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleViewModeChange('card')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                  settings.viewMode === 'card'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                    : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span>Card Grid</span>
              </button>
              <button
                type="button"
                onClick={() => handleViewModeChange('list')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                  settings.viewMode === 'list'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                    : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                }`}
              >
                <List className="w-4 h-4" />
                <span>List Rows</span>
              </button>
            </div>
          </div>

          {/* Setting 4: Clock Toggle */}
          <div className="flex items-center justify-between gap-4 py-2 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2 text-xs font-medium text-zinc-700 dark:text-zinc-300">
              <Clock className="w-4 h-4 text-zinc-400" />
              <span>Show Live Clock in Header</span>
            </div>
            <input
              type="checkbox"
              checked={settings.showClock}
              onChange={handleToggleClock}
              className="rounded border-zinc-300 dark:border-zinc-700 text-emerald-600 focus:ring-emerald-500"
            />
          </div>

          {/* Backup & Export Section */}
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Backup & Portability (Memory)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleExportJson}
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 font-medium transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-emerald-500" />
                Export JSON
              </button>
              <button
                type="button"
                onClick={handleExportMd}
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 font-medium transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-indigo-500" />
                Export Markdown
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 font-medium transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-blue-500" />
                Import Backup JSON
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="hidden"
              />
            </div>
          </div>

          {/* Danger Zone: Clear Data */}
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setIsConfirmClearOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-medium transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear All Data & Reset
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-3 bg-zinc-50 dark:bg-zinc-950/60 border-t border-zinc-200/80 dark:border-zinc-800/80 text-center text-[11px] text-zinc-400">
          ZenTab v1.0 • Modern New Tab for Chrome & Firefox
        </div>
      </div>

      {/* Delete Confirmation Modal for Clear All */}
      <DeleteConfirmModal
        isOpen={isConfirmClearOpen}
        onClose={() => setIsConfirmClearOpen(false)}
        onConfirm={() => {
          onClearAll();
          setIsConfirmClearOpen(false);
        }}
        isClearAll={true}
      />
    </div>
  );
};
