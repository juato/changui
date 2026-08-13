import React from 'react';
import { Box, Text } from 'ink';
import { FlatTreeItem } from '../core/types.js';

interface SearchModalProps {
  query: string;
  results: FlatTreeItem[];
  selectedIndex: number;
  width: number;
  height: number;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  query,
  results,
  selectedIndex,
  width,
  height,
}) => {
  // Border = 2 rows, Header = 1 row, Margin = 1 row, Footer = 1 row => reserved 5 rows
  const maxVisible = Math.max(2, height - 5);
  const startIdx = Math.max(0, Math.min(selectedIndex, results.length - maxVisible));
  const visibleResults = results.slice(startIdx, startIdx + maxVisible);

  return (
    <Box
      flexDirection="column"
      width={width}
      height={height}
      borderStyle="double"
      borderColor="yellow"
      paddingX={1}
      overflow="hidden"
    >
      {/* Search Input Line */}
      <Box height={1} gap={1}>
        <Text bold color="yellow">
          🔍 SEARCH FILES:
        </Text>
        <Text color="white" bold>
          {query}_
        </Text>
      </Box>

      {/* Dynamic Search Results List */}
      <Box flexDirection="column" flexGrow={1} marginTop={1} overflow="hidden">
        {results.length === 0 ? (
          <Box height={1}>
            <Text color="gray">No matching files found for "{query}".</Text>
          </Box>
        ) : (
          visibleResults.map((item, idx) => {
            const actualIdx = startIdx + idx;
            const isSelected = actualIdx === selectedIndex;
            const filePath = item.file?.path || item.node?.path || '';

            return (
              <Box key={item.id} height={1} gap={1}>
                <Text color={isSelected ? 'yellow' : 'gray'}>
                  {isSelected ? '>' : ' '}
                </Text>
                <Text
                  bold={isSelected}
                  color={isSelected ? 'black' : 'cyan'}
                  backgroundColor={isSelected ? 'yellow' : undefined}
                  wrap="truncate-end"
                >
                  {filePath}
                </Text>
              </Box>
            );
          })
        )}
      </Box>

      {/* Footer Navigation Info */}
      <Box height={1} justifyContent="space-between">
        <Text color="gray">[Type] Query  [Up/Down] Select  [Enter] Select & Jump  [Esc] Close</Text>
        <Text color="yellow">Matches: {results.length}</Text>
      </Box>
    </Box>
  );
};
