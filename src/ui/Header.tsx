import React from 'react';
import { Box, Text } from 'ink';
import { Language, translations } from '../core/i18n/translations.js';

interface HeaderProps {
  isSearchOpen: boolean;
  searchQuery: string;
  displayItemsCount: number;
  editorName: string;
  focusedPanel: 'left' | 'right';
  language: Language;
}

export const Header: React.FC<HeaderProps> = ({
  isSearchOpen,
  searchQuery,
  displayItemsCount,
  editorName,
  focusedPanel,
  language,
}) => {
  const t = translations[language];

  return (
    <Box height={1} paddingX={1} justifyContent="space-between" overflow="hidden">
      {isSearchOpen ? (
        <Box gap={1}>
          <Text bold color="yellow">
            🔍 {t.search.prompt}
          </Text>
          <Text color="white" bold>
            {searchQuery}_
          </Text>
          <Text color="gray">
            ({t.search.matches}: {displayItemsCount}) {t.search.escToExit}
          </Text>
        </Box>
      ) : (
        <>
          <Text bold color="cyan" wrap="truncate-end">
            {t.header.title}
          </Text>
          <Text color="gray">
            {t.header.editor}: {editorName.toUpperCase()} | {t.header.focus}: {focusedPanel.toUpperCase()}
          </Text>
        </>
      )}
    </Box>
  );
};

