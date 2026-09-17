import { ZenItem } from './types';

const now = new Date();
const todayISO = now.toISOString();

const yesterday = new Date(now);
yesterday.setDate(yesterday.getDate() - 1);
const yesterdayISO = yesterday.toISOString();

const twoDaysAgo = new Date(now);
twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
const twoDaysAgoISO = twoDaysAgo.toISOString();

export const initialSampleItems: ZenItem[] = [
  {
    id: 'sample-todo-1',
    type: 'todo',
    title: 'Explore ZenTab features & shortcuts',
    content: 'Get familiar with the single-page flow. Use the left panel to jot notes or manage tasks.',
    subtasks: [
      { id: 'sub-1', text: 'Toggle List and Card views from top right', completed: true },
      { id: 'sub-2', text: 'Try Sticky Note mode in Settings', completed: false },
      { id: 'sub-3', text: 'Press Ctrl+Enter to quickly save new items', completed: false },
    ],
    completed: false,
    completedAt: null,
    priority: 'high',
    tags: ['welcome', 'quickstart'],
    pinned: true,
    color: 'yellow',
    createdAt: todayISO,
    updatedAt: todayISO,
    dueDate: new Date(now.getTime() + 86400000).toISOString().split('T')[0],
  },
  {
    id: 'sample-note-1',
    type: 'note',
    title: 'Zen Philosophy: Focus on One Thing',
    content: 'Simplicity is the ultimate sophistication.\n\nKeep your new tab uncluttered: capture quick ideas, check off today’s priorities, and breathe. Everything is saved locally with zero delay.',
    tags: ['inspiration', 'focus'],
    pinned: true,
    color: 'slate',
    createdAt: todayISO,
    updatedAt: todayISO,
  },
  {
    id: 'sample-todo-2',
    type: 'todo',
    title: 'Review project milestones for Q4',
    content: 'Check deliverable timeline and schedule quick sync with team.',
    completed: false,
    completedAt: null,
    priority: 'medium',
    tags: ['work', 'planning'],
    pinned: false,
    color: 'blue',
    createdAt: yesterdayISO,
    updatedAt: yesterdayISO,
  },
  {
    id: 'sample-note-2',
    type: 'note',
    title: 'Useful Terminal Commands',
    content: 'git commit -m "feat: modern new tab page"\ncurl -I https://example.com\nfind . -name "*.ts" -type f',
    tags: ['dev', 'cheatsheet'],
    pinned: false,
    color: 'green',
    createdAt: yesterdayISO,
    updatedAt: yesterdayISO,
  },
  {
    id: 'sample-todo-3',
    type: 'todo',
    title: 'Set up backup routine',
    content: 'ZenTab allows 1-click JSON and Markdown backup anytime from the settings modal.',
    completed: true,
    completedAt: twoDaysAgoISO,
    priority: 'low',
    tags: ['setup'],
    pinned: false,
    color: 'rose',
    createdAt: twoDaysAgoISO,
    updatedAt: twoDaysAgoISO,
  },
];
