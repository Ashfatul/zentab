'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  CheckSquare,
  FileText,
  Pin,
  Plus,
  X,
  Sparkles,
  RotateCcw,
  Trash2,
  Calendar,
  Zap,
  AlignLeft,
  Tag,
  Check,
} from 'lucide-react';
import {
  ItemType,
  Priority,
  StickyColor,
  Subtask,
  ZenItem,
} from '../lib/types';
import { formatShortDate } from '../lib/dateUtils';

interface LeftPanelProps {
  editingItem: ZenItem | null;
  defaultType: ItemType;
  onSaveItem: (itemData: Partial<ZenItem>, isNew: boolean) => void;
  onCancelEdit: () => void;
}

export const LeftPanel: React.FC<LeftPanelProps> = ({
  editingItem,
  defaultType,
  onSaveItem,
  onCancelEdit,
}) => {
  const [type, setType] = useState<ItemType>(editingItem ? editingItem.type : defaultType);
  const [title, setTitle] = useState(editingItem ? editingItem.title : '');
  const [content, setContent] = useState(editingItem?.content || '');
  const [priority, setPriority] = useState<Priority | undefined>(editingItem?.priority);
  const [pinned, setPinned] = useState(editingItem?.pinned || false);
  const [dueDate, setDueDate] = useState<string>(editingItem?.dueDate || '');
  const [color, setColor] = useState<StickyColor>(
    editingItem?.color || (defaultType === 'todo' ? 'blue' : 'yellow')
  );
  const [subtasks, setSubtasks] = useState<Subtask[]>(editingItem?.subtasks || []);
  const [newSubtaskText, setNewSubtaskText] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(editingItem?.tags || []);

  // Progressive disclosure drawer states
  const [showDetails, setShowDetails] = useState(
    Boolean(editingItem?.content) || (editingItem ? editingItem.type === 'note' : defaultType === 'note')
  );
  const [showDueDate, setShowDueDate] = useState(Boolean(editingItem?.dueDate));
  const [showPriority, setShowPriority] = useState(Boolean(editingItem?.priority));
  const [showSubtasks, setShowSubtasks] = useState(
    Boolean(editingItem?.subtasks && editingItem.subtasks.length > 0)
  );
  const [showTags, setShowTags] = useState(
    Boolean(editingItem?.tags && editingItem.tags.length > 0)
  );
  const [showColor, setShowColor] = useState(
    Boolean(editingItem && editingItem.color && editingItem.color !== (editingItem.type === 'todo' ? 'blue' : 'yellow'))
  );

  const titleInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const subtaskInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleInputRef.current?.focus();
  }, [editingItem]);

  // When switching type to note, auto-reveal description
  const handleTypeChange = (newType: ItemType) => {
    setType(newType);
    if (newType === 'note') {
      setShowDetails(true);
    }
  };

  const resetForm = () => {
    setType(defaultType);
    setTitle('');
    setContent('');
    setPriority(undefined);
    setPinned(false);
    setDueDate('');
    setColor(defaultType === 'todo' ? 'blue' : 'yellow');
    setSubtasks([]);
    setNewSubtaskText('');
    setTagInput('');
    setTags([]);

    // Collapse drawers back to clean quick state
    setShowDetails(defaultType === 'note');
    setShowDueDate(false);
    setShowPriority(false);
    setShowSubtasks(false);
    setShowTags(false);
    setShowColor(false);
  };

  const handleSave = () => {
    if (!title.trim() && !content.trim()) return;

    const payload: Partial<ZenItem> = {
      type,
      title: title.trim() || 'Untitled',
      content: content.trim(),
      priority,
      pinned,
      dueDate: dueDate || null,
      color,
      subtasks: type === 'todo' ? subtasks : [],
      tags,
    };

    onSaveItem(payload, !editingItem);
    if (!editingItem) {
      resetForm();
      setTimeout(() => titleInputRef.current?.focus(), 50);
    }
  };

  // Keyboard shortcut Ctrl+Enter to save, Esc to cancel
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      if (editingItem) {
        onCancelEdit();
      } else {
        resetForm();
      }
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        // Shift+Enter expands and jumps into notes textarea
        e.preventDefault();
        setShowDetails(true);
        setTimeout(() => textareaRef.current?.focus(), 50);
      } else {
        // Enter alone: Instant save!
        e.preventDefault();
        handleSave();
      }
    }
  };

  const handleAddSubtask = () => {
    if (!newSubtaskText.trim()) return;
    setSubtasks([
      ...subtasks,
      {
        id: 'sub-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
        text: newSubtaskText.trim(),
        completed: false,
      },
    ]);
    setNewSubtaskText('');
    subtaskInputRef.current?.focus();
  };

  const handleToggleSubtask = (id: string) => {
    setSubtasks(
      subtasks.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s))
    );
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter((s) => s.id !== id));
  };

  const handleAddTag = () => {
    const clean = tagInput.trim().replace(/^#/, '');
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const setQuickDate = (daysFromNow: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    setDueDate(d.toISOString().split('T')[0]);
  };

  const getDueDateLabel = (dateStr: string) => {
    if (!dateStr) return 'Due Date';
    const today = new Date();
    const target = new Date(`${dateStr}T00:00:00`);
    const diffDays = Math.round(
      (target.getTime() - new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    return formatShortDate(dateStr);
  };

  const colorOptions: { key: StickyColor; label: string; bg: string }[] = [
    { key: 'yellow', label: 'Yellow', bg: 'bg-amber-200 border-amber-300' },
    { key: 'green', label: 'Mint', bg: 'bg-emerald-200 border-emerald-300' },
    { key: 'blue', label: 'Sky', bg: 'bg-sky-200 border-sky-300' },
    { key: 'purple', label: 'Lavender', bg: 'bg-purple-200 border-purple-300' },
    { key: 'rose', label: 'Rose', bg: 'bg-rose-200 border-rose-300' },
    { key: 'slate', label: 'Neutral', bg: 'bg-zinc-200 border-zinc-300' },
  ];

  return (
    <aside
      onKeyDown={handleKeyDown}
      className="w-full md:w-[33%] min-w-[310px] max-w-[420px] h-full flex flex-col border-r border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/40 dark:bg-zinc-950/50 select-none z-10 flex-shrink-0"
    >
      {/* Top Banner / Mode Header */}
      <div className="p-4 pb-3 border-b border-zinc-200/70 dark:border-zinc-800/60">
        {editingItem ? (
          <div className="flex items-center justify-between bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 rounded-lg px-3 py-1.5 mb-2">
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Editing {editingItem.type === 'todo' ? 'Todo' : 'Note'}
            </span>
            <button
              onClick={onCancelEdit}
              className="text-amber-600 hover:text-amber-800 dark:text-amber-400 p-0.5 rounded cursor-pointer"
              title="Cancel Edit"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : null}

        {/* Tab Switcher: [ Todo Task ] | [ Zen Note ] */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 flex rounded-lg bg-zinc-200/70 dark:bg-zinc-900 p-1">
            <button
              type="button"
              onClick={() => handleTypeChange('todo')}
              className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-md text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                type === 'todo'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
              }`}
            >
              <CheckSquare className="w-4 h-4 text-emerald-500" />
              Todo Task
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('note')}
              className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-md text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                type === 'note'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
              }`}
            >
              <FileText className="w-4 h-4 text-indigo-500" />
              Zen Note
            </button>
          </div>

          {!editingItem && (
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 px-2 py-1 rounded-full hidden sm:inline-block">
              Quick Capture
            </span>
          )}
        </div>
      </div>

      {/* Scrollable Form Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {/* Primary Title Input (Fast Instant Submit) */}
        <div>
          <input
            ref={titleInputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleTitleKeyDown}
            placeholder={
              type === 'todo'
                ? 'What needs to be done? (Press ↵)'
                : 'Note title or idea... (Press ↵)'
            }
            className="w-full text-base font-semibold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-2xs select-text"
          />
        </div>

        {/* Quick Action Toolbar Chips (Progressive Disclosure) */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Notes / Description Chip */}
          <button
            type="button"
            onClick={() => {
              setShowDetails(!showDetails);
              if (!showDetails) setTimeout(() => textareaRef.current?.focus(), 50);
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
              showDetails || content.trim()
                ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                : 'bg-zinc-100 dark:bg-zinc-800/80 border-zinc-200/80 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/70 dark:hover:bg-zinc-700'
            }`}
            title={showDetails ? 'Hide Notes' : 'Add Notes / Details'}
          >
            <AlignLeft className="w-3.5 h-3.5" />
            <span>{content.trim() ? 'Notes Added' : 'Notes'}</span>
          </button>

          {/* Due Date Chip (For Todos) */}
          {type === 'todo' && (
            <button
              type="button"
              onClick={() => setShowDueDate(!showDueDate)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                showDueDate || dueDate
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                  : 'bg-zinc-100 dark:bg-zinc-800/80 border-zinc-200/80 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/70 dark:hover:bg-zinc-700'
              }`}
              title="Set Due Date"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{getDueDateLabel(dueDate)}</span>
            </button>
          )}

          {/* Priority Chip (For Todos) */}
          {type === 'todo' && (
            <button
              type="button"
              onClick={() => setShowPriority(!showPriority)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                priority
                  ? priority === 'high'
                    ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                    : priority === 'medium'
                    ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300'
                    : 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
                  : showPriority
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                  : 'bg-zinc-100 dark:bg-zinc-800/80 border-zinc-200/80 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/70 dark:hover:bg-zinc-700'
              }`}
              title="Set Priority"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{priority ? priority.charAt(0).toUpperCase() + priority.slice(1) : 'Priority'}</span>
            </button>
          )}

          {/* Checklist Steps Chip (For Todos) */}
          {type === 'todo' && (
            <button
              type="button"
              onClick={() => {
                setShowSubtasks(!showSubtasks);
                if (!showSubtasks) setTimeout(() => subtaskInputRef.current?.focus(), 50);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                showSubtasks || subtasks.length > 0
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                  : 'bg-zinc-100 dark:bg-zinc-800/80 border-zinc-200/80 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/70 dark:hover:bg-zinc-700'
              }`}
              title="Add Checklist / Subtasks"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>{subtasks.length > 0 ? `${subtasks.length} Steps` : 'Checklist'}</span>
            </button>
          )}

          {/* Tags Chip */}
          <button
            type="button"
            onClick={() => setShowTags(!showTags)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
              showTags || tags.length > 0
                ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                : 'bg-zinc-100 dark:bg-zinc-800/80 border-zinc-200/80 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/70 dark:hover:bg-zinc-700'
            }`}
            title="Add Tags"
          >
            <Tag className="w-3.5 h-3.5" />
            <span>{tags.length > 0 ? `${tags.length} Tags` : 'Tags'}</span>
          </button>

          {/* Color Chip */}
          <button
            type="button"
            onClick={() => setShowColor(!showColor)}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
              showColor
                ? 'bg-zinc-200 dark:bg-zinc-700 border-zinc-300 dark:border-zinc-600'
                : 'bg-zinc-100 dark:bg-zinc-800/80 border-zinc-200/80 dark:border-zinc-700 text-zinc-600 hover:bg-zinc-200/70'
            }`}
            title="Card Tone / Color"
          >
            <div
              className={`w-3.5 h-3.5 rounded-full border ${
                colorOptions.find((c) => c.key === color)?.bg || 'bg-amber-200 border-amber-300'
              }`}
            />
          </button>

          {/* Pin Toggle Chip */}
          <button
            type="button"
            onClick={() => setPinned(!pinned)}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
              pinned
                ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800 text-rose-500 shadow-2xs'
                : 'bg-zinc-100 dark:bg-zinc-800/80 border-zinc-200/80 dark:border-zinc-700 text-zinc-400 hover:text-rose-500'
            }`}
            title={pinned ? 'Pinned to top (Click to unpin)' : 'Pin this item to top of feed'}
          >
            <Pin className={`w-3.5 h-3.5 ${pinned ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>
        </div>

        {/* --- PROGRESSIVE DISCLOSURE DRAWERS --- */}

        {/* Drawer 1: Notes / Details Textarea */}
        {showDetails && (
          <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-400">
              <span>{type === 'todo' ? 'Details & Context' : 'Note Content'}</span>
              <button
                type="button"
                onClick={() => setShowDetails(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xs font-normal cursor-pointer"
              >
                Hide
              </button>
            </div>
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={type === 'todo' ? 3 : 6}
              placeholder={
                type === 'todo'
                  ? 'Add context, links, or details... (Ctrl+Enter to save)'
                  : 'Write your thoughts, paste snippets, or outline ideas...'
              }
              className="w-full text-sm leading-relaxed bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-2xs resize-y min-h-[75px] select-text font-sans"
            />
          </div>
        )}

        {/* Drawer 2: Due Date Drawer (For Todos) */}
        {type === 'todo' && showDueDate && (
          <div className="p-3 bg-zinc-100/70 dark:bg-zinc-900/70 rounded-xl border border-zinc-200/80 dark:border-zinc-800 space-y-2.5 animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                Due Date
              </span>
              {dueDate && (
                <button
                  type="button"
                  onClick={() => setDueDate('')}
                  className="text-rose-500 hover:text-rose-600 text-xs font-medium cursor-pointer"
                >
                  Clear Date
                </button>
              )}
            </div>

            {/* Quick Presets */}
            <div className="grid grid-cols-4 gap-1.5">
              <button
                type="button"
                onClick={() => setQuickDate(0)}
                className="py-1 px-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-zinc-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-zinc-700 dark:text-zinc-200 border border-zinc-200/70 dark:border-zinc-700/60 shadow-2xs transition-colors cursor-pointer text-center"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setQuickDate(1)}
                className="py-1 px-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-zinc-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-zinc-700 dark:text-zinc-200 border border-zinc-200/70 dark:border-zinc-700/60 shadow-2xs transition-colors cursor-pointer text-center"
              >
                Tomorrow
              </button>
              <button
                type="button"
                onClick={() => setQuickDate(3)}
                className="py-1 px-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-zinc-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-zinc-700 dark:text-zinc-200 border border-zinc-200/70 dark:border-zinc-700/60 shadow-2xs transition-colors cursor-pointer text-center"
              >
                +3 Days
              </button>
              <button
                type="button"
                onClick={() => setQuickDate(7)}
                className="py-1 px-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-zinc-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-zinc-700 dark:text-zinc-200 border border-zinc-200/70 dark:border-zinc-700/60 shadow-2xs transition-colors cursor-pointer text-center"
              >
                Next Wk
              </button>
            </div>

            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            />
          </div>
        )}

        {/* Drawer 3: Priority Segmented Drawer (For Todos) */}
        {type === 'todo' && showPriority && (
          <div className="p-3 bg-zinc-100/70 dark:bg-zinc-900/70 rounded-xl border border-zinc-200/80 dark:border-zinc-800 space-y-2 animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Priority Level
              </span>
              {priority && (
                <button
                  type="button"
                  onClick={() => setPriority(undefined)}
                  className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xs font-normal cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {[
                { val: undefined, label: 'Normal' },
                { val: 'low' as Priority, label: 'Low' },
                { val: 'medium' as Priority, label: 'Medium' },
                { val: 'high' as Priority, label: 'High' },
              ].map((p) => {
                const isSelected = priority === p.val;
                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setPriority(p.val)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      isSelected
                        ? p.val === 'high'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                          : p.val === 'medium'
                          ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
                          : p.val === 'low'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                          : 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                        : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200/80 dark:border-zinc-700 hover:bg-zinc-50'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Drawer 4: Checklist Steps Drawer (For Todos) */}
        {type === 'todo' && showSubtasks && (
          <div className="space-y-2 bg-zinc-100/70 dark:bg-zinc-900/70 p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800 animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-400">
              <span className="flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
                Checklist Steps
              </span>
              {subtasks.length > 0 && (
                <span className="text-xs text-zinc-400 font-medium">
                  {subtasks.filter((s) => s.completed).length}/{subtasks.length} done
                </span>
              )}
            </div>

            {/* List of existing subtasks */}
            {subtasks.length > 0 && (
              <div className="space-y-1">
                {subtasks.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center gap-2 group/item text-sm py-1 px-1.5 rounded-lg bg-white dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60"
                  >
                    <input
                      type="checkbox"
                      checked={sub.completed}
                      onChange={() => handleToggleSubtask(sub.id)}
                      className="rounded border-zinc-300 dark:border-zinc-600 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span
                      className={`flex-1 truncate ${
                        sub.completed
                          ? 'line-through text-zinc-400 dark:text-zinc-500'
                          : 'text-zinc-700 dark:text-zinc-200 font-medium'
                      }`}
                    >
                      {sub.text}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(sub.id)}
                      className="opacity-0 group-hover/item:opacity-100 text-zinc-400 hover:text-rose-500 transition-opacity cursor-pointer p-0.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Subtask Input */}
            <div className="flex items-center gap-1.5 pt-1">
              <input
                ref={subtaskInputRef}
                type="text"
                value={newSubtaskText}
                onChange={(e) => setNewSubtaskText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                placeholder="+ Add checklist step (press Enter)..."
                className="flex-1 text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 select-text"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-1.5 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
              >
                Add
              </button>
            </div>
          </div>
        )}

        {/* Drawer 5: Tags Drawer */}
        {showTags && (
          <div className="p-3 bg-zinc-100/70 dark:bg-zinc-900/70 rounded-xl border border-zinc-200/80 dark:border-zinc-800 space-y-2 animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-indigo-500" />
                Tags & Labels
              </span>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 text-xs font-medium bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 px-2 py-0.5 rounded-md shadow-2xs"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-rose-500 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Type tag and press Enter..."
                className="flex-1 text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 select-text"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-1.5 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-semibold cursor-pointer shadow-2xs"
              >
                Add
              </button>
            </div>
          </div>
        )}

        {/* Drawer 6: Color Tone Palette */}
        {showColor && (
          <div className="p-3 bg-zinc-100/70 dark:bg-zinc-900/70 rounded-xl border border-zinc-200/80 dark:border-zinc-800 space-y-2 animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
              Card / Sticky Tone
            </div>
            <div className="flex items-center gap-2.5">
              {colorOptions.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setColor(c.key)}
                  className={`w-7 h-7 rounded-full border transition-transform cursor-pointer flex items-center justify-center ${c.bg} ${
                    color === c.key ? 'ring-2 ring-emerald-500 scale-110 shadow-xs' : 'hover:scale-105'
                  }`}
                  title={c.label}
                >
                  {color === c.key && <Check className="w-3 h-3 text-zinc-800" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="p-4 border-t border-zinc-200/70 dark:border-zinc-800/60 bg-white/60 dark:bg-zinc-900/50 space-y-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={!title.trim() && !content.trim()}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white font-semibold text-sm shadow-xs transition-colors cursor-pointer"
          >
            {editingItem ? (
              <>Save Changes</>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Create {type === 'todo' ? 'Todo' : 'Note'}
              </>
            )}
            <span className="hidden sm:inline-block text-[10px] bg-emerald-700/70 px-1.5 py-0.5 rounded text-emerald-100 font-mono">
              ↵
            </span>
          </button>

          {editingItem ? (
            <button
              type="button"
              onClick={onCancelEdit}
              className="py-2.5 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
          ) : (
            (title || content || subtasks.length > 0 || dueDate || tags.length > 0) && (
              <button
                type="button"
                onClick={resetForm}
                className="p-2.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Clear input"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )
          )}
        </div>

        {/* Shortcut Hint */}
        <div className="flex items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-500 pt-0.5">
          <span>Press <kbd className="px-1 py-0.2 rounded bg-zinc-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono">↵ Enter</kbd> to add</span>
          <span><kbd className="px-1 py-0.2 rounded bg-zinc-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono">Shift+↵</kbd> for notes</span>
        </div>
      </div>
    </aside>
  );
};
