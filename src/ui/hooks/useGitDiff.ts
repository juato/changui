import { useState, useMemo, useEffect } from 'react';
import { FlatTreeItem, FileDiffResult } from '../../core/types.js';
import { GitDiffReader } from '../../core/git/diff.js';

interface UseGitDiffProps {
  rootPath?: string;
  selectedItem: FlatTreeItem | null;
  selectedIndex: number;
}

export function useGitDiff({ rootPath, selectedItem, selectedIndex }: UseGitDiffProps) {
  const [diffResult, setDiffResult] = useState<FileDiffResult | null>(null);
  const [rightScrollOffset, setRightScrollOffset] = useState(0);

  const diffReader = useMemo(() => new GitDiffReader(rootPath), [rootPath]);

  // Reset scroll offset when selected item index changes
  useEffect(() => {
    setRightScrollOffset(0);
  }, [selectedIndex]);

  // Fetch diff asynchronously on selected file change
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

  return {
    diffResult,
    rightScrollOffset,
    setRightScrollOffset,
  };
}
