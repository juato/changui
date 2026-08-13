import React from 'react';
import { Box, Text } from 'ink';
import { ArchitecturalTree } from '../core/types.js';
import { Language, translations } from '../core/i18n/translations.js';

interface BottomStatusBarProps {
  stats: ArchitecturalTree['stats'];
  width: number | string;
  notification?: string | null;
  language?: Language;
}

export const BottomStatusBar: React.FC<BottomStatusBarProps> = ({
  stats,
  width,
  notification,
  language = 'en',
}) => {
  const t = translations[language].statusBar;

  return (
    <Box
      width={width}
      height={3}
      borderStyle="round"
      borderColor="gray"
      paddingX={1}
      justifyContent="space-between"
      overflow="hidden"
    >
      <Box gap={2}>
        <Text color="cyan" bold>
          {t.stats}
        </Text>
        <Text color="green">{t.staged}:{stats.stagedCount}</Text>
        <Text color="yellow">{t.unstaged}:{stats.unstagedCount}</Text>
        <Text color="gray">{t.untracked}:{stats.untrackedCount}</Text>
        <Text color="white" bold>
          {t.total}:{stats.totalChanges}
        </Text>
        {notification && (
          <Text color="green" bold wrap="truncate-end">
            [{notification}]
          </Text>
        )}
      </Box>

      <Box gap={2}>
        <Text color="gray">{t.nav}</Text>
        <Text color="yellow">{t.search}</Text>
        <Text color="green">{t.settings}</Text>
        <Text color="cyan" bold>{t.open}</Text>
        <Text color="red">{t.quit}</Text>
      </Box>
    </Box>
  );
};
