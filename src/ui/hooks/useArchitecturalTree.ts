import { useState, useMemo, useEffect, useCallback } from 'react';
import { ArchitecturalTree, FlatTreeItem, WorkspaceNode } from '../../core/types.js';

interface UseArchitecturalTreeProps {
  tree: ArchitecturalTree | null;
  isSearchOpen: boolean;
  searchQuery: string;
}

export function useArchitecturalTree({
  tree,
  isSearchOpen,
  searchQuery,
}: UseArchitecturalTreeProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(() => new Set<string>());
  const [selectedIndex, setSelectedIndex] = useState(0);

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

  // Keep selected index within bounds when items change
  useEffect(() => {
    if (selectedIndex >= displayItems.length) {
      setSelectedIndex(Math.max(0, displayItems.length - 1));
    }
  }, [displayItems.length, selectedIndex]);

  const selectedItem = displayItems[selectedIndex] || null;

  const toggleNodeExpansion = useCallback((nodeId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);

  return {
    displayItems,
    selectedIndex,
    setSelectedIndex,
    selectedItem,
    toggleNodeExpansion,
  };
}
