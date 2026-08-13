import React, { useEffect, useState } from 'react';
import { Box, Text } from 'ink';
import { FlatTreeItem } from '../core/types.js';
import { TreeNode } from './TreeNode.js';
import { Language, translations } from '../core/i18n/translations.js';

interface LeftTreePanelProps {
  items: FlatTreeItem[];
  selectedIndex: number;
  width: number;
  height: number;
  isFocused?: boolean;
  language?: Language;
}

const getNodeIcon = (name: string, type?: string) => {
  if (name === '[configs]') return '=';
  if (type === 'root') return '#';
  if (type === 'package') return '@';
  if (type === 'app') return '*';
  if (type === 'layer') return '>';
  return '+';
};

export const LeftTreePanel: React.FC<LeftTreePanelProps> = ({
  items,
  selectedIndex,
  width,
  height,
  isFocused = true,
  language = 'en',
}) => {
  const t = translations[language].leftTree;

  // Outer Box has borderStyle="round" (2 border rows).
  // Header takes 1 line + 1 line margin = 2 rows.
  // Real visible row viewport height inside panel = height - 4.
  const maxVisibleRows = Math.max(1, height - 4);
  const [scrollOffset, setScrollOffset] = useState(0);

  // Recalculate scrollOffset dynamically anchored to active selectedIndex
  useEffect(() => {
    if (selectedIndex < scrollOffset) {
      setScrollOffset(selectedIndex);
    } else if (selectedIndex >= scrollOffset + maxVisibleRows) {
      setScrollOffset(selectedIndex - maxVisibleRows + 1);
    }

    // Auto adjust if item list shrinks (e.g. collapsing nodes)
    if (scrollOffset + maxVisibleRows > items.length) {
      setScrollOffset(Math.max(0, items.length - maxVisibleRows));
    }
  }, [selectedIndex, maxVisibleRows, items.length, scrollOffset]);

  const visibleItems = items.slice(scrollOffset, scrollOffset + maxVisibleRows);

  return (
    <Box
      flexDirection="column"
      width={width}
      height={height}
      borderStyle="round"
      borderColor={isFocused ? 'cyan' : 'gray'}
      paddingX={1}
      overflow="hidden"
    >
      {/* Header (1 line) */}
      <Box height={1} justifyContent="space-between">
        <Text bold color="cyan" wrap="truncate-end">
          {t.title}
        </Text>
        <Text color="gray">
          ({items.length > 0 ? selectedIndex + 1 : 0}/{items.length})
        </Text>
      </Box>

      {/* Strictly bounded scrollable viewport box */}
      <Box flexDirection="column" height={maxVisibleRows} overflow="hidden">
        {items.length === 0 ? (
          <Text color="gray">{t.noChanges}</Text>
        ) : (
          visibleItems.map((item, index) => {
            const actualIndex = scrollOffset + index;
            const isSelected = actualIndex === selectedIndex;

            if (item.kind === 'node' && item.node) {
              const icon = getNodeIcon(item.node.name, item.node.type);
              const totalChanges = item.node.changes.length;

              return (
                <TreeNode
                  key={item.id}
                  label={item.node.name}
                  depth={item.depth}
                  isSelected={isSelected}
                  isNode={true}
                  isExpanded={item.isExpanded}
                  changeCount={totalChanges}
                  icon={icon}
                  width={width}
                />
              );
            }

            if (item.kind === 'file' && item.file) {
              return (
                <TreeNode
                  key={item.id}
                  label={item.file.path}
                  depth={item.depth}
                  isSelected={isSelected}
                  isNode={false}
                  stage={item.file.stage}
                  changeType={item.file.type}
                  width={width}
                />
              );
            }

            return null;
          })
        )}
      </Box>
    </Box>
  );
};
