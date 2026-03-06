import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Box, useApp } from 'ink';
import type { HistoryEntry, AppMode, ViewMode, ActionMessage } from './types.js';
import { getHistory } from './utils/getHistory.js';
import { copyToClipboard } from './utils/copyToClipboard.js';
import { clampIndex } from './utils/clampIndex.js';
import { SearchBar } from './components/SearchBar.js';
import { HistoryList } from './components/HistoryList.js';
import { StatusBar } from './components/StatusBar.js';
import { HelpOverlay } from './components/HelpOverlay.js';
import { useKeyboardInput } from './hooks/useKeyboardInput.js';

interface AppProps {
  limit?: number;
  printMode?: boolean;
  onCommand?: (command: string) => void;
  _actionMessageTimeoutMs?: number;
}

export function App({ limit, printMode, onCommand, _actionMessageTimeoutMs = 2000 }: AppProps) {
  const { exit } = useApp();

  const [entries, setEntries] = useState<HistoryEntry[]>(() => getHistory(limit));
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [mode, setMode] = useState<AppMode>('navigate');
  const [viewMode, setViewMode] = useState<ViewMode>('recent');
  const [showHelp, setShowHelp] = useState(false);
  const [actionMessage, setActionMessage] = useState<ActionMessage | null>(null);
  const actionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Derive view-specific entries
  const viewEntries = useMemo(() => {
    switch (viewMode) {
      case 'recent':
        // All raw entries sorted by most recent (already sorted by getHistory)
        return entries;
      case 'frequent':
        // Deduplicated, sorted by count descending
        return [...entries].sort((a, b) => b.count - a.count);
      case 'unique':
        // Deduplicated, sorted by most recent (same as 'recent' since getHistory deduplicates)
        return entries;
    }
  }, [entries, viewMode]);

  // Filter by search query
  const filteredEntries = useMemo(() => {
    if (!searchQuery) return viewEntries;
    const q = searchQuery.toLowerCase();
    return viewEntries.filter((e) => e.command.toLowerCase().includes(q));
  }, [viewEntries, searchQuery]);

  // Clamp index
  const clampedIndex = clampIndex(selectedIndex, filteredEntries.length - 1);

  // Sync clamped index
  useEffect(() => {
    if (clampedIndex !== selectedIndex) {
      setSelectedIndex(clampedIndex);
    }
  }, [clampedIndex, selectedIndex]);

  // Clear action message after timeout
  useEffect(() => {
    if (actionMessage) {
      actionTimerRef.current = setTimeout(() => {
        setActionMessage(null);
      }, _actionMessageTimeoutMs);
      return () => {
        if (actionTimerRef.current) clearTimeout(actionTimerRef.current);
      };
    }
  }, [actionMessage, _actionMessageTimeoutMs]);

  const selectedEntry = filteredEntries[clampedIndex] ?? null;

  const handleCopy = useCallback(() => {
    if (!selectedEntry) return;
    const result = copyToClipboard(selectedEntry.command);
    if (result.success) {
      setActionMessage({ type: 'success', text: 'Copied to clipboard' });
    } else {
      setActionMessage({ type: 'error', text: `Copy failed: ${result.error}` });
    }
  }, [selectedEntry]);

  const handleExecuteAndExit = useCallback(() => {
    if (!selectedEntry) return;
    if (printMode) {
      process.stdout.write(selectedEntry.command);
    } else if (onCommand) {
      onCommand(selectedEntry.command);
    }
    exit();
  }, [selectedEntry, printMode, onCommand, exit]);

  const handleRefresh = useCallback(() => {
    setEntries(getHistory(limit));
    setActionMessage({ type: 'success', text: 'History refreshed' });
  }, [limit]);

  const handleExit = useCallback(() => {
    exit();
  }, [exit]);

  useKeyboardInput({
    mode,
    showHelp,
    searchQuery,
    filteredCount: filteredEntries.length,
    setMode,
    setSearchQuery,
    setSelectedIndex,
    setShowHelp,
    setViewMode,
    onCopy: handleCopy,
    onExecuteAndExit: handleExecuteAndExit,
    onRefresh: handleRefresh,
    onExit: handleExit,
  });

  return (
    <Box flexDirection="column">
      <SearchBar value={searchQuery} isActive={mode === 'search'} viewMode={viewMode} />
      <HistoryList entries={filteredEntries} selectedIndex={clampedIndex} />
      <StatusBar mode={mode} actionMessage={actionMessage} selectedEntry={selectedEntry} entryCount={filteredEntries.length} />
      {showHelp && <HelpOverlay />}
    </Box>
  );
}
