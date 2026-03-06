import React from 'react';
import { Box, Text, useStdout } from 'ink';
import type { HistoryEntry } from '../types.js';
import { HistoryRow, COL_TIME, COL_FREQ, UNSELECTED_PREFIX } from './HistoryRow.js';

interface HistoryListProps {
  entries: HistoryEntry[];
  selectedIndex: number;
}

const DEFAULT_TERMINAL_WIDTH = 80;
const ROW_PREFIX_WIDTH = 2;
const MIN_COMMAND_COL_WIDTH = 20;
const MAX_COMMAND_COL_WIDTH = 80;

const SEARCH_BAR_HEIGHT = 3;
const HEADER_ROW_HEIGHT = 1;
const STATUS_BAR_HEIGHT = 1;
const BUFFER_HEIGHT = 1;
const TOTAL_UI_OVERHEAD = SEARCH_BAR_HEIGHT + HEADER_ROW_HEIGHT + STATUS_BAR_HEIGHT + BUFFER_HEIGHT;

function calculateCommandColWidth(terminalWidth: number): number {
  const reserved = ROW_PREFIX_WIDTH + COL_TIME + COL_FREQ;
  const available = terminalWidth - reserved;
  return Math.min(MAX_COMMAND_COL_WIDTH, Math.max(MIN_COMMAND_COL_WIDTH, available));
}

export function HistoryList({ entries, selectedIndex }: HistoryListProps) {
  const { stdout } = useStdout();
  const termWidth = stdout?.columns ?? DEFAULT_TERMINAL_WIDTH;
  const termHeight = stdout?.rows ?? 24;

  const colCommand = calculateCommandColWidth(termWidth);
  const maxVisible = Math.max(1, termHeight - TOTAL_UI_OVERHEAD);

  let startIndex = 0;
  let endIndex = entries.length;

  if (entries.length > maxVisible) {
    const halfWindow = Math.floor(maxVisible / 2);
    startIndex = Math.max(0, selectedIndex - halfWindow);
    endIndex = startIndex + maxVisible;

    if (endIndex > entries.length) {
      endIndex = entries.length;
      startIndex = Math.max(0, endIndex - maxVisible);
    }
  }

  const visibleEntries = entries.slice(startIndex, endIndex);

  const cmdHeader = 'COMMAND'.padEnd(colCommand);
  const timeHeader = 'TIME'.padStart(COL_TIME);
  const freqHeader = 'FREQ'.padStart(COL_FREQ);

  return (
    <Box flexDirection='column'>
      <Box paddingX={1}>
        <Text>{UNSELECTED_PREFIX}</Text>
        <Text bold color='gray'>{cmdHeader}</Text>
        <Text bold color='gray'>{timeHeader}</Text>
        <Text bold color='gray'>{freqHeader}</Text>
      </Box>
      {entries.length === 0 ? (
        <Box paddingX={1}>
          <Text dimColor>No history entries found.</Text>
        </Box>
      ) : (
        visibleEntries.map((entry, i) => {
          const actualIndex = startIndex + i;
          return (
            <HistoryRow
              key={`${actualIndex}-${entry.command}`}
              entry={entry}
              isSelected={actualIndex === selectedIndex}
              colCommand={colCommand}
            />
          );
        })
      )}
    </Box>
  );
}
