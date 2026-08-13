import { useState, useCallback } from 'react';
import { useInput } from 'ink';
import { FlatTreeItem, FileDiffResult } from '../../core/types.js';
import { openFileInEditor } from '../../core/utils/openEditor.js';
import { UserConfig } from '../../core/config/userConfig.js';
import { translations, Language } from '../../core/i18n/translations.js';
import { SettingItem } from '../SettingsModal.js';

interface UseAppNavigationProps {
  exit: () => void;
  displayItems: FlatTreeItem[];
  selectedIndex: number;
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
  toggleNodeExpansion: (nodeId: string) => void;
  diffResult: FileDiffResult | null;
  setRightScrollOffset: React.Dispatch<React.SetStateAction<number>>;
  userConfig: UserConfig;
  settingItems: SettingItem[];
  updateConfig: (newConfig: UserConfig) => void;
  getEditorCommand: (editorId: string) => string;
  rootPath?: string;
  isSearchOpen: boolean;
  setIsSearchOpen: React.Dispatch<React.SetStateAction<boolean>>;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
}

export function useAppNavigation({
  exit,
  displayItems,
  selectedIndex,
  setSelectedIndex,
  toggleNodeExpansion,
  diffResult,
  setRightScrollOffset,
  userConfig,
  settingItems,
  updateConfig,
  getEditorCommand,
  rootPath,
  isSearchOpen,
  setIsSearchOpen,
  searchQuery,
  setSearchQuery,
}: UseAppNavigationProps) {
  const [focusedPanel, setFocusedPanel] = useState<'left' | 'right'>('left');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsSelectedIndex, setSettingsSelectedIndex] = useState(0);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = useCallback((message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const openSelectedFile = useCallback(
    (item: FlatTreeItem) => {
      if (item.kind === 'file' && item.file) {
        const chosenEditor = getEditorCommand(userConfig.editor);
        openFileInEditor(item.file.path, rootPath, chosenEditor);

        const fileName = item.file.path.split('/').pop() || item.file.path;
        showNotification(`Opened ${fileName} in ${userConfig.editor.toUpperCase()}`);
      }
    },
    [getEditorCommand, userConfig.editor, rootPath, showNotification]
  );

  useInput((input, key) => {
    // --- 1. LIVE SEARCH MODE ---
    if (isSearchOpen) {
      if (key.escape) {
        setIsSearchOpen(false);
        setSearchQuery('');
        return;
      }
      if (key.upArrow) {
        setSelectedIndex((prev) => Math.max(0, prev - 1));
        return;
      }
      if (key.downArrow) {
        setSelectedIndex((prev) => Math.min(displayItems.length - 1, prev + 1));
        return;
      }
      if (key.return) {
        const current = displayItems[selectedIndex];
        if (current && current.kind === 'file') {
          openSelectedFile(current);
        }
        setIsSearchOpen(false);
        return;
      }
      if (key.backspace || key.delete) {
        setSearchQuery((prev) => prev.slice(0, -1));
        setSelectedIndex(0);
        return;
      }
      if (input && input.length === 1) {
        setSearchQuery((prev) => prev + input);
        setSelectedIndex(0);
        return;
      }
      return;
    }

    // --- 2. SETTINGS MODAL MODE ---
    if (isSettingsOpen) {
      if (key.escape) {
        setIsSettingsOpen(false);
        return;
      }
      if (key.upArrow) {
        let nextIdx = settingsSelectedIndex - 1;
        while (nextIdx >= 0 && settingItems[nextIdx]?.id.startsWith('header_')) {
          nextIdx--;
        }
        if (nextIdx >= 0) {
          setSettingsSelectedIndex(nextIdx);
        }
        return;
      }
      if (key.downArrow) {
        let nextIdx = settingsSelectedIndex + 1;
        while (
          nextIdx < settingItems.length &&
          settingItems[nextIdx]?.id.startsWith('header_')
        ) {
          nextIdx++;
        }
        if (nextIdx < settingItems.length) {
          setSettingsSelectedIndex(nextIdx);
        }
        return;
      }
      if (key.return) {
        const chosen = settingItems[settingsSelectedIndex];
        if (chosen && !chosen.id.startsWith('header_')) {
          const updated: UserConfig = { ...userConfig };
          if (chosen.type === 'editor') {
            updated.editor = chosen.id;
          } else if (chosen.type === 'language') {
            updated.language = chosen.id as Language;
          }

          updateConfig(updated);

          const langT = translations[updated.language].settings;
          showNotification(`${langT.saved}: ${chosen.label}`);
        }
        setIsSettingsOpen(false);
        return;
      }
      return;
    }

    // --- 3. MAIN DASHBOARD MODE ---
    if (input === 'q' || (key.escape && focusedPanel === 'left')) {
      exit();
      return;
    }

    // Toggle Focus Panel with Tab
    if (key.tab) {
      setFocusedPanel((prev) => (prev === 'left' ? 'right' : 'left'));
      return;
    }

    // Open Live Search (ONLY 'f' or 'F')
    if (input === 'f' || input === 'F') {
      setIsSearchOpen(true);
      setSearchQuery('');
      setSelectedIndex(0);
      return;
    }

    // Open Settings (ONLY 's' or 'S')
    if (input === 's' || input === 'S') {
      setIsSettingsOpen(true);
      const firstValid = settingItems.findIndex((i) => !i.id.startsWith('header_'));
      setSettingsSelectedIndex(firstValid !== -1 ? firstValid : 0);
      return;
    }

    // Arrow keys navigation based on focused panel
    if (key.upArrow) {
      if (focusedPanel === 'left') {
        setSelectedIndex((prev) => Math.max(0, prev - 1));
      } else {
        setRightScrollOffset((prev) => Math.max(0, prev - 1));
      }
      return;
    }

    if (key.downArrow) {
      if (focusedPanel === 'left') {
        setSelectedIndex((prev) => Math.min(displayItems.length - 1, prev + 1));
      } else {
        const maxLines = diffResult?.lines.length || 0;
        setRightScrollOffset((prev) => Math.min(Math.max(0, maxLines - 1), prev + 1));
      }
      return;
    }

    // Enter Key (Open Editor for file or Toggle Expand for node)
    if (key.return) {
      const current = displayItems[selectedIndex];
      if (current && current.kind === 'file') {
        openSelectedFile(current);
      } else if (current && current.kind === 'node' && current.hasChildren) {
        toggleNodeExpansion(current.id);
      }
      return;
    }

    // Space Key (Toggle Expand Node)
    if (input === ' ') {
      const current = displayItems[selectedIndex];
      if (current && current.kind === 'node' && current.hasChildren) {
        toggleNodeExpansion(current.id);
      }
    }
  });

  return {
    focusedPanel,
    isSettingsOpen,
    settingsSelectedIndex,
    notification,
  };
}
