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
} from 'lucide-react';
import {
  ItemType,
  Priority,
  StickyColor,
  Subtask,
  ZenItem,
} from '../lib/types';

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

  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleInputRef.current?.focus();
  }, [editingItem]);

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
      titleInputRef.current?.focus();
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
      <div className="p-4 pb-2 border-b border-zinc-200/70 dark:border-zinc-800/60">
        {editingItem ? (
          <div className="flex items-center justify-between bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 rounded-lg px-3 py-1.5 mb-2">
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Editing {editingItem.type === 'todo' ? 'Todo' : 'Note'}
            </span>
            <button
              onClick={onCancelEdit}
              className="text-amber-600 hover:text-amber-800 dark:text-amber-400 p-0.5 rounded"
              title="Cancel Edit"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : null}

        {/* Tab Switcher: [ Todo ] | [ Note ] */}
        <div className="flex rounded-lg bg-zinc-200/70 dark:bg-zinc-900 p-1">
          <button
            type="button"
            onClick={() => setType('todo')}
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
            onClick={() => setType('note')}
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
      </div>

      {/* Scrollable Form Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Title Input */}
        <div>
          <input
            ref={titleInputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={type === 'todo' ? 'What needs to be done?' : 'Note title or idea...'}
            className="w-full text-base font-semibold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 shadow-xs select-text"
          />
        </div>

        {/* Content / Notes Area */}
        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={type === 'todo' ? 3 : 6}
            placeholder={
              type === 'todo'
                ? 'Add context, links, or details...'
                : 'Write your thoughts, paste snippets, or outline ideas...'
            }
            className="w-full text-sm leading-relaxed bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 shadow-xs resize-y min-h-[75px] select-text font-sans"
          />
        </div>

        {/* Subtasks (Checklist) for Todos */}
        {type === 'todo' && (
          <div className="space-y-2 bg-white dark:bg-zinc-900/60 p-3 rounded-lg border border-zinc-200/80 dark:border-zinc-800">
            <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 flex items-center justify-between">
              <span>Checklist / Subtasks</span>
              {subtasks.length > 0 && (
                <span className="text-xs text-zinc-400 font-medium">
                  {subtasks.filter((s) => s.completed).length}/{subtasks.length} done
                </span>
              )}
            </label>

            {/* List of existing subtasks */}
            {subtasks.map((sub) => (
              <div
                key={sub.id}
                className="flex items-center gap-2 group/item text-sm py-1 px-1 rounded hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
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

            {/* Add Subtask Input */}
            <div className="flex items-center gap-1.5 pt-1">
              <input
                type="text"
                value={newSubtaskText}
                onChange={(e) => setNewSubtaskText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                placeholder="+ Add checklist step..."
                className="flex-1 text-sm bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 select-text"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>
        )}

        {/* Priority & Due Date (For Todos) */}
        {type === 'todo' && (
          <div className="grid grid-cols-2 gap-3">
            {/* Priority Selector */}
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                Priority
              </label>
              <select
                value={priority || ''}
                onChange={(e) =>
                  setPriority((e.target.value as Priority) || undefined)
                }
                className="w-full text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="">Normal</option>
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Due Date Quick Presets for Todo */}
        {type === 'todo' && !dueDate && (
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-zinc-400 text-xs font-medium">Presets:</span>
            <button
              type="button"
              onClick={() => setQuickDate(0)}
              className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 text-xs font-medium cursor-pointer"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setQuickDate(1)}
              className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 text-xs font-medium cursor-pointer"
            >
              Tomorrow
            </button>
            <button
              type="button"
              onClick={() => setQuickDate(7)}
              className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 text-xs font-medium cursor-pointer"
            >
              Next Week
            </button>
          </div>
        )}

        {/* Color Palette (Sticky Note Tint) */}
        <div>
          <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
            Card / Sticky Tone
          </label>
          <div className="flex items-center gap-2">
            {colorOptions.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => setColor(c.key)}
                className={`w-6 h-6 rounded-full border transition-transform cursor-pointer ${c.bg} ${
                  color === c.key ? 'ring-2 ring-emerald-500 scale-110' : 'hover:scale-105'
                }`}
                title={c.label}
              />
            ))}
          </div>
        </div>

        {/* Tags Section */}
        <div>
          <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
            Tags / Labels
          </label>
          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 text-xs font-medium bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-2 py-0.5 rounded-md"
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
              placeholder="Add tag (press Enter)..."
              className="flex-1 text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 select-text"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg text-xs font-semibold cursor-pointer"
            >
              Add
            </button>
          </div>
        </div>

        {/* Pin to Top Checkbox */}
        <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer pt-1">
          <input
            type="checkbox"
            checked={pinned}
            onChange={(e) => setPinned(e.target.checked)}
            className="rounded border-zinc-300 dark:border-zinc-700 text-rose-500 focus:ring-rose-500 cursor-pointer"
          />
          <Pin className={`w-4 h-4 ${pinned ? 'fill-rose-500 text-rose-500' : 'text-zinc-400'}`} />
          Pin this to top of feed
        </label>
      </div>

      {/* Action Footer */}
      <div className="p-4 border-t border-zinc-200/70 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-900/40 space-y-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={!title.trim() && !content.trim()}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white font-semibold text-sm shadow-xs transition-colors cursor-pointer"
          >
            {editingItem ? (
              <>Save Changes</>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Create {type === 'todo' ? 'Todo' : 'Note'}
              </>
            )}
            <span className="hidden sm:inline-block text-[10px] bg-emerald-700/60 px-1.5 py-0.5 rounded text-emerald-100 font-mono">
              Ctrl+↵
            </span>
          </button>

          {editingItem ? (
            <button
              type="button"
              onClick={onCancelEdit}
              className="py-2 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium transition-colors"
            >
              Cancel
            </button>
          ) : (
            <button
              type="button"
              onClick={resetForm}
              className="p-2 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Reset Form"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Shortcut hint */}
        <div className="flex items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-500 pt-0.5">
          <span>Ctrl + Enter to quick save</span>
          <span>Esc to cancel</span>
        </div>
      </div>
    </aside>
  );
};
