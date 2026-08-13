import React, { useState, useMemo } from 'react';
import { Box, Text, useApp, useStdout } from 'ink';
import { ArchitecturalTree } from '../core/types.js';
import { ImpactAnalyzer } from '../core/mapper/impact.js';
import { Header } from './Header.js';
import { LeftTreePanel } from './LeftTreePanel.js';
import { RightImpactPanel } from './RightImpactPanel.js';
import { BottomStatusBar } from './BottomStatusBar.js';
import { SettingsModal } from './SettingsModal.js';

import { useUserConfig } from './hooks/useUserConfig.js';
import { useArchitecturalTree } from './hooks/useArchitecturalTree.js';
import { useGitDiff } from './hooks/useGitDiff.js';
import { useAppNavigation } from './hooks/useAppNavigation.js';

interface AppProps {
  tree: ArchitecturalTree | null;
  error: string | null;
}

export const App: React.FC<AppProps> = ({ tree, error }) => {
  const { exit } = useApp();
  const { stdout } = useStdout();

  const columns = stdout?.columns || 100;
  const rows = stdout?.rows || 28;

  // Search state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. User configuration & settings hook
  const {
    userConfig,
    lang,
    settingItems,
    updateConfig,
    getEditorCommand,
  } = useUserConfig();

  // 2. Architectural tree & selection hook
  const {
    displayItems,
    selectedIndex,
    setSelectedIndex,
    selectedItem,
    toggleNodeExpansion,
  } = useArchitecturalTree({
    tree,
    isSearchOpen,
    searchQuery,
  });

  // 3. Git diff fetching & right panel scroll hook
  const { diffResult, rightScrollOffset, setRightScrollOffset } = useGitDiff({
    rootPath: tree?.rootPath,
    selectedItem,
    selectedIndex,
  });

  // 4. Navigation & input controls hook
  const {
    focusedPanel,
    isSettingsOpen,
    settingsSelectedIndex,
    notification,
  } = useAppNavigation({
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
    rootPath: tree?.rootPath,
    isSearchOpen,
    setIsSearchOpen,
    searchQuery,
    setSearchQuery,
  });

  // Impact Analyzer calculation
  const analyzer = useMemo(() => new ImpactAnalyzer(), []);
  const impact = useMemo(() => {
    if (!tree) {
      return {
        riskLevel: 'LOW' as const,
        score: 0,
        affectedApps: [],
        summary: '',
        breakingChangeRisk: false,
        staged: 0,
        unstaged: 0,
        untracked: 0,
      };
    }
    return analyzer.analyze(selectedItem, tree.rootNode);
  }, [analyzer, selectedItem, tree]);

  if (error) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text color="red" bold>
          Error loading Changui HUD:
        </Text>
        <Text color="red">{error}</Text>
      </Box>
    );
  }

  if (!tree) {
    return (
      <Box padding={1}>
        <Text color="cyan">Initializing Changui Sci-Fi HUD...</Text>
      </Box>
    );
  }

  const targetRows = Math.max(10, rows - 1);
  const mainPanelHeight = Math.max(4, targetRows - 4);
  const leftWidth = Math.max(28, Math.floor(columns * 0.38));
  const rightWidth = columns - leftWidth;

  return (
    <Box flexDirection="column" width={columns} height={targetRows} padding={0} overflow="hidden">
      {/* Top Header / Live Search Prompt */}
      <Header
        isSearchOpen={isSearchOpen}
        searchQuery={searchQuery}
        displayItemsCount={displayItems.length}
        editorName={userConfig.editor}
        focusedPanel={focusedPanel}
        language={lang}
      />

      {/* Main Viewport: Settings Modal OR Live Panels */}
      {isSettingsOpen ? (
        <SettingsModal
          items={settingItems}
          selectedIndex={settingsSelectedIndex}
          currentConfig={userConfig}
          width={columns}
          height={mainPanelHeight}
        />
      ) : (
        <Box flexDirection="row" height={mainPanelHeight} width={columns} overflow="hidden">
          <LeftTreePanel
            items={displayItems}
            selectedIndex={selectedIndex}
            width={leftWidth}
            height={mainPanelHeight}
            isFocused={focusedPanel === 'left'}
            language={lang}
          />
          <RightImpactPanel
            item={selectedItem}
            impact={impact}
            diff={diffResult}
            width={rightWidth}
            height={mainPanelHeight}
            isFocused={focusedPanel === 'right'}
            rightScrollOffset={rightScrollOffset}
            language={lang}
          />
        </Box>
      )}

      {/* Bottom Status Bar */}
      <BottomStatusBar
        stats={tree.stats}
        width={columns}
        notification={notification}
        language={lang}
      />
    </Box>
  );
};
