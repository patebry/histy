import React from 'react';
import { Box, Text } from 'ink';
import type { ViewMode } from '../types.js';

const CURSOR_CHAR = '█';

interface SearchBarProps {
  value: string;
  isActive: boolean;
  viewMode: ViewMode;
}

export function SearchBar({ value, isActive, viewMode }: SearchBarProps) {
  return (
    <Box borderStyle='round' borderColor={isActive ? 'cyan' : value ? 'yellow' : 'gray'} paddingX={1}>
      <Text bold color='cyan'>histy</Text>
      <Text dimColor> [{viewMode}]</Text>
      <Text color={isActive ? 'cyan' : value ? 'yellow' : 'gray'}>{'  / '}</Text>
      {isActive
        ? value
          ? <Text>{value}<Text color='cyan'>{CURSOR_CHAR}</Text></Text>
          : <Text dimColor>type to filter...<Text color='cyan'>{CURSOR_CHAR}</Text></Text>
        : value
          ? <Text color='yellow'>{value}</Text>
          : <Text dimColor>to search</Text>
      }
    </Box>
  );
}
