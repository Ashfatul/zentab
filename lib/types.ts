export type ItemType = 'todo' | 'note';
export type Priority = 'low' | 'medium' | 'high';
export type ViewMode = 'card' | 'list';
export type FilterType = 'all' | 'todos' | 'notes' | 'completed';
export type ThemeMode = 'dark' | 'light' | 'system';
export type StickyColor = 'yellow' | 'green' | 'blue' | 'purple' | 'rose' | 'amber' | 'slate';

export interface Subtask {
  id: string;
  text: string;
  completed: boolean;
}

export interface ZenItem {
  id: string;
  type: ItemType;
  title: string;
  content: string;
  subtasks?: Subtask[];
  completed?: boolean;
  completedAt?: string | null;
  priority?: Priority;
  tags: string[];
  pinned: boolean;
  color?: StickyColor;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  dueDate?: string | null;
}

export interface ZenSettings {
  viewMode: ViewMode;
  stickyNoteMode: boolean; // default: false
  theme: ThemeMode;
  showClock: boolean;
  soundEffects: boolean;
  defaultType: ItemType;
}

export interface DateGroup {
  label: string;
  subLabel?: string;
  dateKey: string;
  items: ZenItem[];
}
