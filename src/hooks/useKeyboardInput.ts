import { useInput } from 'ink';
import type { AppMode, ViewMode } from '../types.js';

interface UseKeyboardInputOptions {
  mode: AppMode;
  showHelp: boolean;
  searchQuery: string;
  filteredCount: number;
  setMode: (mode: AppMode) => void;
  setSearchQuery: (query: string | ((prev: string) => string)) => void;
  setSelectedIndex: (index: number | ((prev: number) => number)) => void;
  setShowHelp: (show: boolean) => void;
  setViewMode: (mode: ViewMode | ((prev: ViewMode) => ViewMode)) => void;
  onCopy: () => void;
  onExecuteAndExit: () => void;
  onRefresh: () => void;
  onExit: () => void;
}

const VIEW_CYCLE: ViewMode[] = ['recent', 'frequent', 'unique'];

export function useKeyboardInput(opts: UseKeyboardInputOptions) {
  const {
    mode, showHelp, searchQuery, filteredCount,
    setMode, setSearchQuery, setSelectedIndex, setShowHelp, setViewMode,
    onCopy, onExecuteAndExit, onRefresh, onExit,
  } = opts;

  useInput((input, key) => {
    // 1. Global: Ctrl+C always quits
    if (key.ctrl && input === 'c') {
      onExit();
      return;
    }

    // 2. Help toggle (navigate mode only)
    if (mode === 'navigate' && !showHelp && input === '?') {
      setShowHelp(true);
      return;
    }

    // 3. Help overlay catch-all: any key dismisses
    if (showHelp) {
      setShowHelp(false);
      return;
    }

    // 4. Navigate mode
    if (mode === 'navigate') {
      if (key.upArrow || input === 'k') {
        setSelectedIndex((prev: number) => Math.max(0, prev - 1));
        return;
      }
      if (key.downArrow || input === 'j') {
        setSelectedIndex((prev: number) => Math.min(filteredCount - 1, prev + 1));
        return;
      }
      if (input === 'g') {
        setSelectedIndex(0);
        return;
      }
      if (input === 'G') {
        setSelectedIndex(Math.max(0, filteredCount - 1));
        return;
      }
      if (input === '/') {
        setMode('search');
        return;
      }
      if (key.return) {
        onExecuteAndExit();
        return;
      }
      if (input === 'c') {
        onCopy();
        return;
      }
      if (key.tab) {
        setViewMode((prev: ViewMode) => {
          const idx = VIEW_CYCLE.indexOf(prev);
          return VIEW_CYCLE[(idx + 1) % VIEW_CYCLE.length];
        });
        setSelectedIndex(0);
        return;
      }
      if (input === 'r' || input === 'R') {
        onRefresh();
        return;
      }
      if (key.escape) {
        if (searchQuery) {
          setSearchQuery('');
        }
        return;
      }
      if (input === 'q') {
        onExit();
        return;
      }
      return;
    }

    // 5. Search mode
    if (mode === 'search') {
      if (key.escape) {
        setSearchQuery('');
        setMode('navigate');
        return;
      }
      if (key.backspace || key.delete) {
        setSearchQuery((prev: string) => prev.slice(0, -1));
        return;
      }
      if (key.upArrow) {
        setSelectedIndex((prev: number) => Math.max(0, prev - 1));
        return;
      }
      if (key.downArrow) {
        setSelectedIndex((prev: number) => Math.min(filteredCount - 1, prev + 1));
        return;
      }
      if (key.return) {
        setMode('navigate');
        return;
      }
      // Swallow control sequences
      if (key.ctrl || key.meta) return;
      // Printable character
      if (input && input.length === 1 && input >= ' ') {
        setSearchQuery((prev: string) => prev + input);
        setSelectedIndex(0);
        return;
      }
    }
  });
}
