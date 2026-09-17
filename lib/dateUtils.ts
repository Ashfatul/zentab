import { ZenItem, DateGroup } from './types';

export function formatRelativeTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}

export function formatFullDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}

export function formatShortDate(isoOrDateStr: string): string {
  try {
    const date = new Date(isoOrDateStr.includes('T') ? isoOrDateStr : `${isoOrDateStr}T00:00:00`);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return isoOrDateStr;
  }
}

export function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

/**
 * Group items chronologically under full-width date separators
 */
export function groupItemsByDate(items: ZenItem[]): DateGroup[] {
  if (!items || items.length === 0) return [];

  // Sort items: pinned first, then by createdAt descending
  const sorted = [...items].sort((a, b) => {
    if (a.pinned !== b.pinned) {
      return a.pinned ? -1 : 1;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  const groupsMap = new Map<string, { label: string; subLabel: string; items: ZenItem[] }>();

  // If there are pinned items, let's keep them in a top "Pinned Focus" group, or group normally with badge
  const pinnedItems = sorted.filter((item) => item.pinned);
  const unpinnedItems = sorted.filter((item) => !item.pinned);

  if (pinnedItems.length > 0) {
    groupsMap.set('pinned', {
      label: 'Pinned Items',
      subLabel: 'Always at top',
      items: pinnedItems,
    });
  }

  for (const item of unpinnedItems) {
    const itemDate = new Date(item.createdAt);
    let key: string;
    let label: string;
    let subLabel: string;

    if (isSameDay(itemDate, now)) {
      key = 'today';
      label = 'Today';
      subLabel = now.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
    } else if (isSameDay(itemDate, yesterday)) {
      key = 'yesterday';
      label = 'Yesterday';
      subLabel = yesterday.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
    } else {
      const diffDays = Math.floor((now.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays < 7) {
        key = `day-${itemDate.getDay()}`;
        label = itemDate.toLocaleDateString(undefined, { weekday: 'long' });
        subLabel = itemDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      } else if (diffDays < 30) {
        key = `week-${Math.floor(diffDays / 7)}`;
        label = 'Earlier This Month';
        subLabel = itemDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      } else {
        key = `month-${itemDate.getFullYear()}-${itemDate.getMonth()}`;
        label = itemDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
        subLabel = '';
      }
    }

    if (!groupsMap.has(key)) {
      groupsMap.set(key, { label, subLabel, items: [] });
    }
    groupsMap.get(key)!.items.push(item);
  }

  const result: DateGroup[] = [];
  for (const [key, group] of groupsMap.entries()) {
    result.push({
      dateKey: key,
      label: group.label,
      subLabel: group.subLabel,
      items: group.items,
    });
  }

  return result;
}
