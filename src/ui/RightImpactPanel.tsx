import React from 'react';
import { Box, Text } from 'ink';
import { ImpactAnalysis, FlatTreeItem, FileDiffResult } from '../core/types.js';
import { Language, translations } from '../core/i18n/translations.js';

interface RightImpactPanelProps {
  item: FlatTreeItem | null;
  impact: ImpactAnalysis;
  diff: FileDiffResult | null;
  width: number;
  height: number;
  isFocused?: boolean;
  rightScrollOffset?: number;
  language?: Language;
}

const getRiskBadge = (level: ImpactAnalysis['riskLevel']) => {
  switch (level) {
    case 'CRITICAL':
      return <Text color="red" bold>[CRITICAL]</Text>;
    case 'HIGH':
      return <Text color="magenta" bold>[HIGH]</Text>;
    case 'MEDIUM':
      return <Text color="yellow" bold>[MEDIUM]</Text>;
    case 'LOW':
      return <Text color="green" bold>[LOW]</Text>;
  }
};

export const RightImpactPanel: React.FC<RightImpactPanelProps> = ({
  item,
  impact,
  diff,
  width,
  height,
  isFocused = false,
  rightScrollOffset = 0,
  language = 'en',
}) => {
  const t = translations[language].rightImpact;
  const isFile = item?.kind === 'file' && item.file;
  const contentHeight = Math.max(2, height - 3);

  const techFormatted =
    impact.techStack && impact.techStack.length > 0
      ? impact.techStack.map((t) => `${t.name}${t.version ? ` v${t.version}` : ''}`).join(', ')
      : 'Generic / Unspecified';

  const diffLines = diff?.lines || [];
  const visibleDiffLines = diffLines.slice(rightScrollOffset, rightScrollOffset + contentHeight);
  const endIdx = Math.min(diffLines.length, rightScrollOffset + contentHeight);
  const scrollInfo =
    diffLines.length > 0 ? `${rightScrollOffset + 1}-${endIdx}/${diffLines.length}` : '';

  const hasMoreAbove = rightScrollOffset > 0;
  const hasMoreBelow = rightScrollOffset + contentHeight < diffLines.length;

  const borderColor = isFocused ? 'green' : isFile ? 'blue' : 'magenta';

  return (
    <Box
      flexDirection="column"
      width={width}
      height={height}
      borderStyle="round"
      borderColor={borderColor}
      paddingX={1}
      overflow="hidden"
    >
      {/* Panel Header (1 line) */}
      <Box height={1} justifyContent="space-between">
        <Box gap={1}>
          <Text bold color={isFocused ? 'green' : 'magenta'} wrap="truncate-end">
            {isFile ? `${t.diffTitle}: ${item.file?.path}` : t.impactTitle}
          </Text>
          {isFocused && <Text color="green" bold>[FOCUS]</Text>}
          {hasMoreAbove && <Text color="yellow">^</Text>}
          {hasMoreBelow && <Text color="yellow">v</Text>}
        </Box>
        {scrollInfo !== '' && <Text color="gray">[{scrollInfo}]</Text>}
      </Box>

      {/* Strictly bounded content viewport */}
      <Box flexDirection="column" height={contentHeight} overflow="hidden">
        {!item ? (
          <Box flexGrow={1} alignItems="center" justifyContent="center">
            <Text color="gray">{t.selectItem}</Text>
          </Box>
        ) : isFile ? (
          /* CODE DIFF VIEW WITH FULL SCROLLING */
          <Box flexDirection="column" height={contentHeight} overflow="hidden">
            {diffLines.length === 0 ? (
              <Text color="gray">{t.noDiff}</Text>
            ) : (
              visibleDiffLines.map((line, idx) => {
                let color = 'gray';

                if (line.type === 'add') {
                  color = 'green';
                } else if (line.type === 'delete') {
                  color = 'red';
                } else if (line.type === 'header') {
                  color = 'cyan';
                }

                return (
                  <Box key={idx} height={1} overflow="hidden">
                    <Text color={color} wrap="truncate-end">
                      {line.content}
                    </Text>
                  </Box>
                );
              })
            )}
          </Box>
        ) : (
          /* NODE IMPACT HUD */
          <Box flexDirection="column">
            {/* Row 1: Target */}
            <Box height={1}>
              <Text wrap="truncate-end">
                <Text bold color="white">{t.target}: </Text>
                <Text color="cyan">{item.node?.name}</Text>
              </Text>
            </Box>

            {/* Row 2: Risk Level */}
            <Box height={1}>
              <Text wrap="truncate-end">
                <Text bold color="white">{t.risk}: </Text>
                {getRiskBadge(impact.riskLevel)}
                <Text color="gray"> (Score:{impact.score})</Text>
              </Text>
            </Box>

            {/* Row 3: Tech Stack & Versions */}
            <Box height={1}>
              <Text wrap="truncate-end">
                <Text bold color="white">{t.tech}: </Text>
                <Text color="yellow">{techFormatted}</Text>
              </Text>
            </Box>

            {/* Row 4: Breaking Warning */}
            {impact.breakingChangeRisk && (
              <Box height={1}>
                <Text color="red" bold wrap="truncate-end">
                  {t.breakingRisk}
                </Text>
              </Box>
            )}

            {/* Row 5: Breakdown */}
            <Box height={1}>
              <Text wrap="truncate-end">
                <Text color="green">{t.staged}:{impact.staged} </Text>
                <Text color="yellow">{t.unstaged}:{impact.unstaged} </Text>
                <Text color="gray">{t.untracked}:{impact.untracked}</Text>
              </Text>
            </Box>

            {/* Row 6: Affected Targets */}
            <Box height={1}>
              <Text wrap="truncate-end">
                <Text bold color="white">{t.affected}: </Text>
                <Text color="cyan">{impact.affectedApps.join(', ')}</Text>
              </Text>
            </Box>

            {/* Row 7: Summary */}
            <Box height={1}>
              <Text color="gray" italic wrap="truncate-end">
                {impact.summary}
              </Text>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};
