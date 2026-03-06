import React from 'react';
import { Box, Text } from 'ink';

const KEYBINDINGS: Array<{ key: string; desc: string }> = [
  { key: '↑ / k', desc: 'Move up' },
  { key: '↓ / j', desc: 'Move down' },
  { key: 'g', desc: 'Jump to first' },
  { key: 'G', desc: 'Jump to last' },
  { key: '/ + type', desc: 'Filter commands' },
  { key: 'enter', desc: 'Run command + exit' },
  { key: 'c', desc: 'Copy to clipboard' },
  { key: 'tab', desc: 'Cycle view: recent → frequent → unique' },
  { key: 'r / R', desc: 'Refresh history' },
  { key: 'ESC', desc: 'Clear filter / exit search' },
  { key: '?', desc: 'Toggle this help' },
  { key: 'q', desc: 'Quit' },
  { key: 'ctrl+c', desc: 'Quit' },
];

const maxKeyLen = Math.max(...KEYBINDINGS.map(b => b.key.length));

export function HelpOverlay() {
  return (
    <Box borderStyle='round' borderColor='cyan' flexDirection='column' paddingX={2} paddingY={1}>
      <Text bold color='cyan'>  Keybindings</Text>
      <Text> </Text>
      {KEYBINDINGS.map(({ key, desc }) => (
        <Text key={key}>
          <Text color='cyan' bold>{key.padEnd(maxKeyLen)}</Text>{'  '}{desc}
        </Text>
      ))}
      <Text> </Text>
      <Text dimColor>Press any key to close</Text>
    </Box>
  );
}
