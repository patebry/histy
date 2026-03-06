import React from 'react';
import { Box, Text } from 'ink';
import type { AppMode, ActionMessage, HistoryEntry } from '../types.js';

interface StatusBarProps {
  mode: AppMode;
  actionMessage: ActionMessage | null;
  selectedEntry: HistoryEntry | null;
  entryCount: number;
}

export function StatusBar({ mode, actionMessage, selectedEntry, entryCount }: StatusBarProps) {
  const rightContent = actionMessage
    ? <Text color={actionMessage.type === 'success' ? 'green' : 'red'}>{actionMessage.text}</Text>
    : selectedEntry
      ? <Text dimColor>{selectedEntry.command.length > 40 ? selectedEntry.command.slice(0, 40) + '…' : selectedEntry.command}</Text>
      : null;

  const hints = mode === 'search'
    ? <Text dimColor>type to filter  <Text color='cyan'>↑↓/j k</Text> navigate  <Text color='cyan'>enter</Text> done  <Text color='cyan'>ESC</Text> clear</Text>
    : <Text dimColor><Text color='cyan'>↑↓/j k</Text> navigate  <Text color='cyan'>/</Text> search  <Text color='cyan'>enter</Text> run  <Text color='cyan'>c</Text> copy  <Text color='cyan'>tab</Text> view  <Text color='cyan'>?</Text> help  <Text color='cyan'>q</Text> quit</Text>;

  return (
    <Box justifyContent='space-between' paddingX={1}>
      <Box>{hints}</Box>
      <Box><Text dimColor>{entryCount} commands  </Text>{rightContent}</Box>
    </Box>
  );
}
