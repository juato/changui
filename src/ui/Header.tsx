import React from 'react';
import { Box, Text } from 'ink';
import chalk from 'chalk';
import { ArchitecturalTree } from '../core/types.js';

interface HeaderProps {
  tree: ArchitecturalTree;
}

export const Header: React.FC<HeaderProps> = ({ tree }) => {
  const { stats } = tree;

  return (
    <Box flexDirection="column" marginBottom={1}>
      <Box borderStyle="round" borderColor="cyan" paddingX={1}>
        <Text bold color="cyan">
          CHANGUI 🛠️ Architecture Git Status
        </Text>
      </Box>

      <Box gap={2} marginTop={1}>
        <Text bold>Summary:</Text>
        <Text color="green">Staged: {stats.stagedCount}</Text>
        <Text color="yellow">Unstaged: {stats.unstagedCount}</Text>
        <Text color="gray">Untracked: {stats.untrackedCount}</Text>
        <Text color="white" bold>
          Total: {stats.totalChanges}
        </Text>
      </Box>
    </Box>
  );
};
