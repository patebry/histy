import React from 'react';
import { Box, Text } from 'ink';
import type { HistoryEntry } from '../types.js';
import { formatTimeAgo } from '../utils/formatTimeAgo.js';

export const COL_TIME = 14;
export const COL_FREQ = 8;
export const SELECTION_ARROW = '▶ ';
export const UNSELECTED_PREFIX = '  ';

const HighlightBox = Box as React.ComponentType<
  React.ComponentProps<typeof Box> & { backgroundColor?: string }
>;

interface HistoryRowProps {
  entry: HistoryEntry;
  isSelected: boolean;
  colCommand: number;
}

export function HistoryRow({ entry, isSelected, colCommand }: HistoryRowProps) {
  const displayCmd = entry.command.replace(/\n/g, '↵');
  const cmdStr = displayCmd.slice(0, colCommand).padEnd(colCommand);
  const timeStr = formatTimeAgo(entry.timestamp).padStart(COL_TIME);
  const freqStr = String(entry.count).padStart(COL_FREQ);

  if (isSelected) {
    return (
      <HighlightBox backgroundColor='blue'>
        <Text color='cyan'>{SELECTION_ARROW}</Text>
        <Text color='cyan'>{cmdStr}</Text>
        <Text color='cyan'>{timeStr}</Text>
        <Text color='cyan'>{freqStr}</Text>
      </HighlightBox>
    );
  }

  return (
    <Box>
      <Text>{UNSELECTED_PREFIX}</Text>
      <Text>{cmdStr}</Text>
      <Text dimColor>{timeStr}</Text>
      <Text dimColor>{freqStr}</Text>
    </Box>
  );
}
