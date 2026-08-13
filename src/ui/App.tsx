import React, { useState, useMemo, useEffect } from 'react';
import { Box, Text, useInput, useApp, useStdout } from 'ink';
import { ArchitecturalTree, FlatTreeItem, WorkspaceNode, FileDiffResult } from '../core/types.js';
import { ImpactAnalyzer } from '../core/mapper/impact.js';
import { GitDiffReader } from '../core/git/diff.js';
import { openFileInEditor } from '../core/utils/openEditor.js';
import { UserConfigManager, EditorInfo, UserConfig } from '../core/config/userConfig.js';
import { Language, translations } from '../core/i18n/translations.js';
import { LeftTreePanel } from './LeftTreePanel.js';
import { RightImpactPanel } from './RightImpactPanel.js';
import { BottomStatusBar } from './BottomStatusBar.js';
import { SettingsModal, SettingItem } from './SettingsModal.js';

interface AppProps {
  tree: ArchitecturalTree | null;
  error: string | null;
}

export const App: React.FC<AppProps> = ({ tree, error }) => {
  const { exit } = useApp();
  const { stdout } = useStdout();

  const columns = stdout?.columns || 100;
  const rows = stdout?.rows || 28;

  // Config Manager & Translations
  const configManager = useMemo(() => new UserConfigManager(), []);
  const [userConfig, setUserConfig] = useState<UserConfig>(() => configManager.loadConfig());
  const [detectedEditors, setDetectedEditors] = useState<EditorInfo[]>(() =>
    configManager.detectInstalledEditors()
  );

  const lang: Language = userConfig.language || 'en';
  const t = translations[lang];

  // Focus & Navigation State
  const [focusedPanel, setFocusedPanel] = useState<'left' | 'right'>('left');
  const [rightScrollOffset, setRightScrollOffset] = useState(0);

  // Search & Settings State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsSelectedIndex, setSettingsSelectedIndex] = useState(0);

  // Tree & Selection State
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(() => new Set<string>());
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [diffResult, setDiffResult] = useState<FileDiffResult | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Build Settings Menu Items List (Editors + Language)
  const settingItems: SettingItem[] = useMemo(() => {
    const list: SettingItem[] = [
      {
        type: 'editor',
        id: 'header_editor',
        label: t.settings.editorSection,
      },
    ];

    for (const ed of detectedEditors) {
      list.push({
        type: 'editor',
        id: ed.id,
        label: `${ed.name} (${ed.command})`,
        installed: ed.installed,
      });
    }

    list.push({
      type: 'language',
      id: 'header_lang',
      label: t.settings.languageSection,
    });

    list.push({
      type: 'language',
      id: 'en',
      label: 'English (en)',
    });

    list.push({
      type: 'language',
      id: 'es-AR',
      label: 'Español (Argentino) (es-AR)',
    });

    return list;
  }, [detectedEditors, t]);

  // Compute matching nodes for auto-expansion during live search
  const matchingNodeIds = useMemo(() => {
    if (!searchQuery.trim() || !tree?.rootNode) return new Set<string>();
    const q = searchQuery.toLowerCase();
    const set = new Set<string>();

    const checkNode = (node: WorkspaceNode): boolean => {
      let hasMatch = false;
      for (const f of node.changes) {
        if (f.path.toLowerCase().includes(q)) {
          hasMatch = true;
        }
      }
      for (const child of node.children) {
        if (checkNode(child)) {
          hasMatch = true;
        }
      }
      if (hasMatch) {
        set.add(node.id);
      }
      return hasMatch;
    };

    checkNode(tree.rootNode);
    return set;
  }, [searchQuery, tree]);

  // Combine manual expanded nodes + search auto-expanded nodes
  const effectiveExpandedNodes = useMemo(() => {
    if (isSearchOpen && searchQuery.trim().length > 0) {
      return new Set([...expandedNodes, ...matchingNodeIds]);
    }
    return expandedNodes;
  }, [expandedNodes, isSearchOpen, searchQuery, matchingNodeIds]);

  // Flatten tree based on expanded set
  const flatItems = useMemo(() => {
    if (!tree?.rootNode) return [];

    const result: FlatTreeItem[] = [];

    const traverse = (node: WorkspaceNode, depth: number, parentId?: string) => {
      const isExpanded = effectiveExpandedNodes.has(node.id);
      const hasChildren = node.children.length > 0 || node.changes.length > 0;

      result.push({
        id: node.id,
        kind: 'node',
        node,
        depth,
        parentId,
        isExpanded,
        hasChildren,
      });

      if (isExpanded) {
        for (const file of node.changes) {
          result.push({
            id: `${node.id}:${file.path}`,
            kind: 'file',
            file,
            depth: depth + 1,
            parentId: node.id,
          });
        }

        for (const child of node.children) {
          traverse(child, depth + 1, node.id);
        }
      }
    };

    traverse(tree.rootNode, 0);
    return result;
  }, [tree, effectiveExpandedNodes]);

  // Filter display items in tree live while typing search query
  const displayItems = useMemo(() => {
    if (!isSearchOpen || !searchQuery.trim()) {
      return flatItems;
    }
    const q = searchQuery.toLowerCase();
    return flatItems.filter((item) => {
      if (item.kind === 'file' && item.file) {
        return item.file.path.toLowerCase().includes(q);
      }
      if (item.kind === 'node' && item.node) {
        return matchingNodeIds.has(item.node.id);
      }
      return false;
    });
  }, [flatItems, isSearchOpen, searchQuery, matchingNodeIds]);

  // Keep selected index within bounds
  useEffect(() => {
    if (selectedIndex >= displayItems.length) {
      setSelectedIndex(Math.max(0, displayItems.length - 1));
    }
  }, [displayItems.length, selectedIndex]);

  const selectedItem = displayItems[selectedIndex] || null;

  // Reset right scroll offset when selected item changes
  useEffect(() => {
    setRightScrollOffset(0);
  }, [selectedIndex]);

  // Async Git Diff Reader for selected files
  const diffReader = useMemo(() => new GitDiffReader(tree?.rootPath), [tree?.rootPath]);

  useEffect(() => {
    let isCancelled = false;

    if (selectedItem && selectedItem.kind === 'file' && selectedItem.file) {
      const file = selectedItem.file;
      diffReader.getDiff(file.path, file.stage).then((res) => {
        if (!isCancelled) {
          setDiffResult(res);
        }
      });
    } else {
      setDiffResult(null);
    }

    return () => {
      isCancelled = true;
    };
  }, [selectedItem, diffReader]);

  // Input navigation & interaction handler
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
        if (current && current.kind === 'file' && current.file) {
          const chosenEditor =
            detectedEditors.find((e) => e.id === userConfig.editor)?.command || 'code';
          openFileInEditor(current.file.path, tree?.rootPath, chosenEditor);

          const fileName = current.file.path.split('/').pop() || current.file.path;
          setNotification(`Opened ${fileName} in ${userConfig.editor.toUpperCase()}`);
          setTimeout(() => setNotification(null), 3000);
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

          configManager.saveConfig(updated);
          setUserConfig(updated);

          const langT = translations[updated.language].settings;
          setNotification(`${langT.saved}: ${chosen.label}`);
          setTimeout(() => setNotification(null), 3000);
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
      // Position cursor at first valid non-header item
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
      if (current && current.kind === 'file' && current.file) {
        const chosenEditor =
          detectedEditors.find((e) => e.id === userConfig.editor)?.command || 'code';
        openFileInEditor(current.file.path, tree?.rootPath, chosenEditor);

        const fileName = current.file.path.split('/').pop() || current.file.path;
        setNotification(`Opened ${fileName} in ${userConfig.editor.toUpperCase()}`);
        setTimeout(() => setNotification(null), 3000);
      } else if (current && current.kind === 'node' && current.hasChildren) {
        setExpandedNodes((prev) => {
          const next = new Set(prev);
          if (next.has(current.id)) {
            next.delete(current.id);
          } else {
            next.add(current.id);
          }
          return next;
        });
      }
      return;
    }

    // Space Key (Toggle Expand Node)
    if (input === ' ') {
      const current = displayItems[selectedIndex];
      if (current && current.kind === 'node' && current.hasChildren) {
        setExpandedNodes((prev) => {
          const next = new Set(prev);
          if (next.has(current.id)) {
            next.delete(current.id);
          } else {
            next.add(current.id);
          }
          return next;
        });
      }
    }
  });

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
      {/* Top 1-line Header / Live Search Prompt */}
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
              ({t.search.matches}: {displayItems.length}) {t.search.escToExit}
            </Text>
          </Box>
        ) : (
          <>
            <Text bold color="cyan" wrap="truncate-end">
              {t.header.title}
            </Text>
            <Text color="gray">
              {t.header.editor}: {userConfig.editor.toUpperCase()} | {t.header.focus}: {focusedPanel.toUpperCase()}
            </Text>
          </>
        )}
      </Box>

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
