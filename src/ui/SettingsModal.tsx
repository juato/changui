import React from 'react';
import { Box, Text } from 'ink';
import { EditorInfo, UserConfig } from '../core/config/userConfig.js';
import { Language, translations } from '../core/i18n/translations.js';

export interface SettingItem {
  type: 'editor' | 'language';
  id: string;
  label: string;
  installed?: boolean;
}

interface SettingsModalProps {
  items: SettingItem[];
  selectedIndex: number;
  currentConfig: UserConfig;
  width: number;
  height: number;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  items,
  selectedIndex,
  currentConfig,
  width,
  height,
}) => {
  const t = translations[currentConfig.language || 'en'].settings;

  return (
    <Box
      flexDirection="column"
      width={width}
      height={height}
      borderStyle="double"
      borderColor="green"
      paddingX={1}
      overflow="hidden"
    >
      {/* Header */}
      <Box height={1}>
        <Text bold color="green">
          ⚙️ {t.title}
        </Text>
      </Box>

      {/* List of Settings Items */}
      <Box flexDirection="column" flexGrow={1} marginTop={1} overflow="hidden">
        {items.map((item, idx) => {
          const isCursorSelected = idx === selectedIndex;
          const isCurrentConfig =
            item.type === 'editor'
              ? item.id === currentConfig.editor
              : item.id === currentConfig.language;

          const isHeader = item.id.startsWith('header_');

          if (isHeader) {
            return (
              <Box key={item.id} height={1} marginTop={idx > 0 ? 1 : 0}>
                <Text bold color="cyan">
                  --- {item.label} ---
                </Text>
              </Box>
            );
          }

          return (
            <Box key={`${item.type}:${item.id}`} height={1} gap={1}>
              <Text color={isCursorSelected ? 'green' : 'gray'}>
                {isCursorSelected ? '>' : ' '}
              </Text>
              <Text color={isCurrentConfig ? 'green' : 'white'} bold>
                [{isCurrentConfig ? 'x' : ' '}]
              </Text>
              <Text
                bold={isCursorSelected}
                color={
                  isCursorSelected
                    ? 'black'
                    : item.installed !== false
                    ? 'white'
                    : 'gray'
                }
                backgroundColor={isCursorSelected ? 'green' : undefined}
                wrap="truncate-end"
              >
                {item.label}
              </Text>
              {item.type === 'editor' &&
                (item.installed ? (
                  <Text color="green">{t.detected}</Text>
                ) : (
                  <Text color="gray">{t.notFound}</Text>
                ))}
            </Box>
          );
        })}
      </Box>

      {/* Footer */}
      <Box height={1} justifyContent="space-between">
        <Text color="gray">{t.instructions}</Text>
      </Box>
    </Box>
  );
};
