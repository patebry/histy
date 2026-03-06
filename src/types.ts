export interface HistoryEntry {
  command: string;
  timestamp: number | null;
  count: number;
}

export type AppMode = 'navigate' | 'search';

export type ViewMode = 'recent' | 'frequent' | 'unique';

export interface ActionMessage {
  type: 'success' | 'error';
  text: string;
}
