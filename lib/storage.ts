import { ZenItem, ZenSettings } from './types';
import { initialSampleItems } from './sampleData';

const ITEMS_STORAGE_KEY = 'zentab_items_v1';
const SETTINGS_STORAGE_KEY = 'zentab_settings_v1';

export const defaultSettings: ZenSettings = {
  viewMode: 'card',
  stickyNoteMode: false,
  theme: 'system',
  showClock: true,
  soundEffects: false,
  defaultType: 'todo',
};

// Check if browser extension storage is available
function isExtensionStorageAvailable(): boolean {
  return typeof chrome !== 'undefined' && Boolean(chrome.storage?.local);
}

// Get from extension storage
function getExtStorage<T>(key: string): Promise<T | null> {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      console.warn(`Extension storage read timed out for key "${key}"`);
      resolve(null);
    }, 1000);

    try {
      if (typeof chrome !== 'undefined' && chrome.storage?.local) {
        chrome.storage.local.get([key], (result: { [k: string]: unknown }) => {
          clearTimeout(timeout);
          if (chrome.runtime?.lastError) {
            console.warn('Chrome storage get error:', chrome.runtime.lastError);
            resolve(null);
          } else {
            resolve(result ? (result[key] as T) : null);
          }
        });
      } else {
        clearTimeout(timeout);
        resolve(null);
      }
    } catch (e) {
      clearTimeout(timeout);
      console.warn('Extension storage read failed:', e);
      resolve(null);
    }
  });
}

// Set to extension storage
function setExtStorage<T>(key: string, value: T): Promise<void> {
  return new Promise((resolve) => {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage?.local) {
        chrome.storage.local.set({ [key]: value }, () => {
          resolve();
        });
      } else {
        resolve();
      }
    } catch (e) {
      console.warn('Extension storage write failed:', e);
      resolve();
    }
  });
}

/**
 * Load items from storage (chrome.storage or localStorage)
 */
export async function loadItems(): Promise<ZenItem[]> {
  try {
    if (isExtensionStorageAvailable()) {
      const items = await getExtStorage<ZenItem[]>(ITEMS_STORAGE_KEY);
      if (items && Array.isArray(items)) {
        return items;
      }
    } else if (typeof window !== 'undefined' && window.localStorage) {
      const raw = localStorage.getItem(ITEMS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    }
  } catch (err) {
    console.error('Failed to load items from storage:', err);
  }

  // Return initial sample items on first run
  return initialSampleItems;
}

/**
 * Save items to storage
 */
export async function saveItems(items: ZenItem[]): Promise<void> {
  try {
    if (isExtensionStorageAvailable()) {
      await setExtStorage(ITEMS_STORAGE_KEY, items);
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(items));
    }
  } catch (err) {
    console.error('Failed to save items to storage:', err);
  }
}

/**
 * Load settings
 */
export async function loadSettings(): Promise<ZenSettings> {
  try {
    if (isExtensionStorageAvailable()) {
      const settings = await getExtStorage<ZenSettings>(SETTINGS_STORAGE_KEY);
      if (settings) {
        return { ...defaultSettings, ...settings };
      }
    } else if (typeof window !== 'undefined' && window.localStorage) {
      const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return { ...defaultSettings, ...parsed };
      }
    }
  } catch (err) {
    console.error('Failed to load settings:', err);
  }
  return defaultSettings;
}

/**
 * Save settings
 */
export async function saveSettings(settings: ZenSettings): Promise<void> {
  try {
    if (isExtensionStorageAvailable()) {
      await setExtStorage(SETTINGS_STORAGE_KEY, settings);
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    }
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
}

/**
 * Export backup as JSON
 */
export async function exportBackup(): Promise<string> {
  const items = await loadItems();
  const settings = await loadSettings();
  const exportPayload = {
    version: '1.0',
    app: 'zentab',
    exportedAt: new Date().toISOString(),
    settings,
    items,
  };
  return JSON.stringify(exportPayload, null, 2);
}

/**
 * Export backup as Markdown
 */
export async function exportMarkdown(): Promise<string> {
  const items = await loadItems();
  let md = `# ZenTab Export — ${new Date().toLocaleDateString()}\n\n`;

  const todos = items.filter((i) => i.type === 'todo');
  const notes = items.filter((i) => i.type === 'note');

  if (todos.length > 0) {
    md += `## Todos\n\n`;
    for (const todo of todos) {
      const mark = todo.completed ? '[x]' : '[ ]';
      const priority = todo.priority ? ` [Priority: ${todo.priority}]` : '';
      const tags = todo.tags.length ? ` (${todo.tags.map((t) => '#' + t).join(' ')})` : '';
      md += `- ${mark} **${todo.title}**${priority}${tags}\n`;
      if (todo.content) {
        md += `  ${todo.content.replace(/\n/g, '\n  ')}\n`;
      }
      if (todo.subtasks && todo.subtasks.length > 0) {
        for (const sub of todo.subtasks) {
          const subMark = sub.completed ? '[x]' : '[ ]';
          md += `    - ${subMark} ${sub.text}\n`;
        }
      }
      md += `\n`;
    }
  }

  if (notes.length > 0) {
    md += `## Notes\n\n`;
    for (const note of notes) {
      const tags = note.tags.length ? ` (${note.tags.map((t) => '#' + t).join(' ')})` : '';
      md += `### ${note.title}${tags}\n\n`;
      md += `${note.content}\n\n---\n\n`;
    }
  }

  return md;
}

/**
 * Import backup
 */
export async function importBackup(jsonString: string): Promise<boolean> {
  try {
    const data = JSON.parse(jsonString);
    if (!data || !Array.isArray(data.items)) {
      throw new Error('Invalid ZenTab backup format');
    }
    await saveItems(data.items);
    if (data.settings) {
      await saveSettings({ ...defaultSettings, ...data.settings });
    }
    return true;
  } catch (err) {
    console.error('Import failed:', err);
    return false;
  }
}

/**
 * Clear all data
 */
export async function clearAll(): Promise<void> {
  try {
    if (isExtensionStorageAvailable()) {
      await setExtStorage(ITEMS_STORAGE_KEY, []);
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify([]));
    }
  } catch (err) {
    console.error('Failed to clear data:', err);
  }
}
