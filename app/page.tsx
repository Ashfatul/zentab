'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from '../components/Header';
import { LeftPanel } from '../components/LeftPanel';
import { RightFeed } from '../components/RightFeed';
import { SettingsModal } from '../components/SettingsModal';
import { KeyboardShortcutsModal } from '../components/KeyboardShortcutsModal';
import { Toast } from '../components/Toast';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import {
  FilterType,
  ZenItem,
  ZenSettings,
} from '../lib/types';
import {
  loadItems,
  saveItems,
  loadSettings,
  saveSettings,
  defaultSettings,
  clearAll as clearAllStorage,
} from '../lib/storage';
import { groupItemsByDate } from '../lib/dateUtils';

export default function ZenTabPage() {
  const [items, setItems] = useState<ZenItem[]>([]);
  const [settings, setSettings] = useState<ZenSettings>(defaultSettings);
  const [editingItem, setEditingItem] = useState<ZenItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [lastDeletedItem, setLastDeletedItem] = useState<ZenItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<ZenItem | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. Initial Data Loading from Storage (chrome.storage or localStorage)
  const refreshItems = useCallback(async () => {
    const loadedItems = await loadItems();
    setItems(loadedItems);
  }, []);

  useEffect(() => {
    let mounted = true;
    async function init() {
      try {
        const [savedItems, savedSettings] = await Promise.all([
          loadItems(),
          loadSettings(),
        ]);
        if (mounted) {
          setItems(savedItems);
          setSettings(savedSettings);
        }
      } catch (err) {
        console.error('Failed to initialize ZenTab data:', err);
      } finally {
        if (mounted) {
          setIsLoaded(true);
        }
      }
    }
    init();
    return () => {
      mounted = false;
    };
  }, []);

  // 2. Theme synchronization
  useEffect(() => {
    const root = document.documentElement;
    const applyTheme = (isDark: boolean) => {
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    if (settings.theme === 'dark') {
      applyTheme(true);
    } else if (settings.theme === 'light') {
      applyTheme(false);
    } else {
      // System mode
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      applyTheme(mq.matches);
      const listener = (e: MediaQueryListEvent) => applyTheme(e.matches);
      mq.addEventListener('change', listener);
      return () => mq.removeEventListener('change', listener);
    }
  }, [settings.theme]);

  // 3. Global Keyboard Shortcuts: '/' for search, '?' for shortcuts, 'Escape' to close
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      if (!isInput) {
        if (e.key === '/') {
          e.preventDefault();
          const searchInput = document.getElementById('zentab-search-input');
          searchInput?.focus();
        } else if (e.key === '?') {
          e.preventDefault();
          setIsShortcutsOpen((prev) => !prev);
        }
      }

      if (e.key === 'Escape') {
        if (itemToDelete) {
          setItemToDelete(null);
          return;
        }
        if (isSettingsOpen) setIsSettingsOpen(false);
        if (isShortcutsOpen) setIsShortcutsOpen(false);
        if (editingItem) setEditingItem(null);
        if (searchQuery) setSearchQuery('');
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [itemToDelete, isSettingsOpen, isShortcutsOpen, editingItem, searchQuery]);

  // 4. Save updates to storage
  const updateItems = useCallback(
    (newItems: ZenItem[]) => {
      setItems(newItems);
      saveItems(newItems);
    },
    []
  );

  const updateSettings = useCallback(
    (newSettings: ZenSettings) => {
      setSettings(newSettings);
      saveSettings(newSettings);
    },
    []
  );

  // 5. Item Actions: Save (Create or Edit)
  const handleSaveItem = useCallback(
    (itemData: Partial<ZenItem>, isNew: boolean) => {
      const now = new Date().toISOString();
      const itemType = itemData.type || (editingItem ? editingItem.type : 'todo');
      const existingTags =
        itemData.tags !== undefined ? itemData.tags : editingItem ? editingItem.tags : [];
      // Always ensure the item has a label 'note' or 'todo' based on its type
      const otherTags = existingTags.filter(
        (t) => t.toLowerCase() !== 'todo' && t.toLowerCase() !== 'note'
      );
      const finalTags = [itemType, ...otherTags];

      if (isNew) {
        const newItem: ZenItem = {
          id: 'zen-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
          type: itemType,
          title: itemData.title || 'Untitled',
          content: itemData.content || '',
          subtasks: itemData.subtasks || [],
          completed: false,
          completedAt: null,
          priority: itemData.priority,
          tags: finalTags,
          pinned: itemData.pinned || false,
          color: itemData.color || 'yellow',
          createdAt: now,
          updatedAt: now,
          dueDate: itemData.dueDate || null,
        };
        const updated = [newItem, ...items];
        updateItems(updated);
      } else if (editingItem) {
        const updated = items.map((it) => {
          if (it.id === editingItem.id) {
            return {
              ...it,
              ...itemData,
              type: itemType,
              tags: finalTags,
              updatedAt: now,
            };
          }
          return it;
        });
        updateItems(updated);
        setEditingItem(null);
      }
    },
    [items, editingItem, updateItems]
  );

  // Toggle complete for a todo item
  const handleToggleComplete = useCallback(
    (id: string) => {
      const now = new Date().toISOString();
      const updated = items.map((it) => {
        if (it.id === id) {
          const nextCompleted = !it.completed;
          return {
            ...it,
            completed: nextCompleted,
            completedAt: nextCompleted ? now : null,
            updatedAt: now,
          };
        }
        return it;
      });
      updateItems(updated);
    },
    [items, updateItems]
  );

  // Toggle subtask within a todo
  const handleToggleSubtask = useCallback(
    (itemId: string, subtaskId: string) => {
      const updated = items.map((it) => {
        if (it.id === itemId && it.subtasks) {
          const nextSubtasks = it.subtasks.map((s) =>
            s.id === subtaskId ? { ...s, completed: !s.completed } : s
          );
          return {
            ...it,
            subtasks: nextSubtasks,
            updatedAt: new Date().toISOString(),
          };
        }
        return it;
      });
      updateItems(updated);
    },
    [items, updateItems]
  );

  // Toggle pin
  const handleTogglePin = useCallback(
    (id: string) => {
      const updated = items.map((it) =>
        it.id === id ? { ...it, pinned: !it.pinned, updatedAt: new Date().toISOString() } : it
      );
      updateItems(updated);
    },
    [items, updateItems]
  );

  // Delete item with Undo capability (opens custom confirmation modal)
  const handleDeleteItem = useCallback(
    (id: string) => {
      const toDelete = items.find((it) => it.id === id);
      if (toDelete) {
        setItemToDelete(toDelete);
      }
    },
    [items]
  );

  // Confirmed delete execution
  const handleConfirmDelete = useCallback(() => {
    if (!itemToDelete) return;
    const toDelete = itemToDelete;
    const updated = items.filter((it) => it.id !== toDelete.id);
    updateItems(updated);
    if (editingItem?.id === toDelete.id) {
      setEditingItem(null);
    }

    setLastDeletedItem(toDelete);
    setToastMessage(`"${toDelete.title}" deleted`);
    setItemToDelete(null);
  }, [itemToDelete, items, editingItem, updateItems]);

  // Undo delete
  const handleUndoDelete = useCallback(() => {
    if (lastDeletedItem) {
      updateItems([lastDeletedItem, ...items]);
      setLastDeletedItem(null);
      setToastMessage(null);
    }
  }, [lastDeletedItem, items, updateItems]);

  // Clear all data
  const handleClearAll = useCallback(async () => {
    await clearAllStorage();
    setItems([]);
    setEditingItem(null);
    setIsSettingsOpen(false);
  }, []);

  // Filter and Search
  const filteredItems = useMemo(() => {
    let result = items;

    // Filter by type or completion
    if (activeFilter === 'todos') {
      result = result.filter((it) => it.type === 'todo');
    } else if (activeFilter === 'notes') {
      result = result.filter((it) => it.type === 'note');
    } else if (activeFilter === 'completed') {
      result = result.filter((it) => it.completed === true);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (it) =>
          it.type.toLowerCase().includes(q) ||
          it.title.toLowerCase().includes(q) ||
          it.content.toLowerCase().includes(q) ||
          it.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    return result;
  }, [items, activeFilter, searchQuery]);

  // Group filtered items by date
  const dateGroups = useMemo(() => {
    return groupItemsByDate(filteredItems);
  }, [filteredItems]);

  // Counts for filter pills
  const counts = useMemo(() => {
    return {
      all: items.length,
      todos: items.filter((i) => i.type === 'todo').length,
      notes: items.filter((i) => i.type === 'note').length,
      completed: items.filter((i) => i.completed).length,
    };
  }, [items]);

  if (!isLoaded) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-400">
        <div className="w-4 h-4 rounded-full bg-emerald-500 animate-ping" />
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-zinc-50/50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans">
      {/* Top Header */}
      <Header
        viewMode={settings.viewMode}
        onToggleViewMode={(mode) => updateSettings({ ...settings, viewMode: mode })}
        stickyNoteMode={settings.stickyNoteMode}
        onToggleStickyNote={() =>
          updateSettings({ ...settings, stickyNoteMode: !settings.stickyNoteMode })
        }
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        counts={counts}
        showClock={settings.showClock}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
      />

      {/* Main Single Page Area (Strictly No Full Page Scroll) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Area: 33% Input and Edit Workspace */}
        <LeftPanel
          key={editingItem ? editingItem.id : 'create'}
          editingItem={editingItem}
          defaultType={settings.defaultType}
          onSaveItem={handleSaveItem}
          onCancelEdit={() => setEditingItem(null)}
          onDeleteItem={handleDeleteItem}
        />

        {/* Right Area: Rest (~67%) Feed with Date Separators & Dual Views */}
        <RightFeed
          groups={dateGroups}
          totalFilteredCount={filteredItems.length}
          viewMode={settings.viewMode}
          stickyNoteMode={settings.stickyNoteMode}
          activeFilter={activeFilter}
          searchQuery={searchQuery}
          onClearSearch={() => setSearchQuery('')}
          onEdit={(item) => setEditingItem(item)}
          onDelete={handleDeleteItem}
          onToggleComplete={handleToggleComplete}
          onToggleSubtask={handleToggleSubtask}
          onTogglePin={handleTogglePin}
        />
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={updateSettings}
        onClearAll={handleClearAll}
        onReloadItems={refreshItems}
      />

      {/* Keyboard Shortcuts Cheat Sheet */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* Custom Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={itemToDelete !== null}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleConfirmDelete}
        item={itemToDelete}
      />

      {/* Toast Notification (Undo on Delete) */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          onUndo={lastDeletedItem ? handleUndoDelete : undefined}
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
}
