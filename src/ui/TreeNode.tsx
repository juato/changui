import React from 'react';
import { Box, Text } from 'ink';
import { ChangeStage, ChangeType } from '../core/types.js';

export interface TreeNodeProps {
  label: string;
  depth: number;
  isSelected: boolean;
  isNode: boolean;
  isExpanded?: boolean;
  changeCount?: number;
  icon?: string;
  stage?: ChangeStage;
  changeType?: ChangeType;
  width: number;
}

const getChangeSymbol = (stage?: ChangeStage, changeType?: ChangeType) => {
  if (stage === 'untracked') return '?';
  switch (changeType) {
    case 'added':
      return '+';
    case 'modified':
      return '~';
    case 'deleted':
      return '-';
    case 'renamed':
      return '>';
    default:
      return '~';
  }
};

const getChangeColor = (stage?: ChangeStage) => {
  if (stage === 'staged') return 'green';
  if (stage === 'unstaged') return 'yellow';
  return 'gray';
};

export const TreeNode: React.FC<TreeNodeProps> = ({
  label,
  depth,
  isSelected,
  isNode,
  isExpanded,
  changeCount = 0,
  icon = '+',
  stage,
  changeType,
  width,
}) => {
  // Indentation string (2 spaces per depth level)
  const indent = '  '.repeat(depth);

  // Maximum characters allowed on line to prevent flex wrapping
  const maxContentLength = Math.max(10, width - depth * 2 - 8);

  if (isNode) {
    const expandIcon = isExpanded ? 'v' : '>';
    const truncatedLabel =
      label.length > maxContentLength ? label.substring(0, maxContentLength - 1) + '~' : label;

    return (
      <Box height={1} overflow="hidden">
        <Text
          bold={isSelected}
          color={isSelected ? 'black' : 'cyan'}
          backgroundColor={isSelected ? 'cyan' : undefined}
          wrap="truncate-end"
        >
          {indent}
          {expandIcon} [{icon}] {truncatedLabel} {changeCount > 0 ? `(${changeCount})` : ''}
        </Text>
      </Box>
    );
  }

  // File Item
  const symbol = getChangeSymbol(stage, changeType);
  const color = getChangeColor(stage);
  const fileName = label.split('/').pop() || label;
  const truncatedFileName =
    fileName.length > maxContentLength
      ? fileName.substring(0, maxContentLength - 1) + '~'
      : fileName;

  return (
    <Box height={1} overflow="hidden">
      <Text
        bold={isSelected}
        color={isSelected ? 'black' : color}
        backgroundColor={isSelected ? (stage === 'staged' ? 'green' : 'yellow') : undefined}
        wrap="truncate-end"
      >
        {indent}  {symbol} {truncatedFileName}
      </Text>
    </Box>
  );
};
