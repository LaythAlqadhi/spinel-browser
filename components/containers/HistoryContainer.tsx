import React, { useState, useCallback, useMemo, memo } from 'react';
import { useBrowserHistory } from '@/hooks/useBrowserHistory';
import { useBrowserTabs } from '@/hooks/useBrowserTabs';
import { useToastController } from '@tamagui/toast';
import HistoryItem from '@/components/ui/HistoryItem';
import { HistoryEntry } from '@/contexts/BrowserContext';

interface HistoryContainerProps {
  searchQuery: string;
  onClose: () => void;
}

const HistoryContainer = memo(({ searchQuery, onClose }: HistoryContainerProps) => {
  const { history, clearHistory, groupHistoryByDate } = useBrowserHistory();
  const { tabs, activeTabId, updateTab } = useBrowserTabs();
  const toast = useToastController();

  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const filteredHistory = useMemo(() => {
    return history.filter(entry =>
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.url.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [history, searchQuery]);

  const groupedHistory = useMemo(() => {
    return groupHistoryByDate();
  }, [groupHistoryByDate]);

  const handleHistoryPress = useCallback((entry: HistoryEntry) => {
    if (isSelectionMode) {
      toggleSelection(entry.id);
      return;
    }

    let targetTabId = activeTabId;

    if (!targetTabId || tabs.length === 0) {
      onClose();
      return;
    }

    updateTab(targetTabId, {
      url: entry.url,
      title: 'Loading...',
      loading: true
    });

    onClose();
  }, [isSelectionMode, activeTabId, tabs.length, updateTab, onClose]);

  const toggleSelection = useCallback((entryId: string) => {
    setSelectedItems(prev =>
      prev.includes(entryId)
        ? prev.filter(id => id !== entryId)
        : [...prev, entryId]
    );
  }, []);

  const handleLongPress = useCallback((entryId: string) => {
    if (!isSelectionMode) {
      setIsSelectionMode(true);
      setSelectedItems([entryId]);
    }
  }, [isSelectionMode]);

  const handleClearSelected = useCallback(() => {
    if (selectedItems.length === 0) return;

    clearHistory(selectedItems);
    toast.show('Selected History Deleted', {
      message: `${selectedItems.length} history items have been deleted.`,
    });
    setSelectedItems([]);
    setIsSelectionMode(false);
  }, [selectedItems, clearHistory, toast]);

  const exitSelectionMode = useCallback(() => {
    setIsSelectionMode(false);
    setSelectedItems([]);
  }, []);

  return {
    filteredHistory,
    groupedHistory,
    selectedItems,
    isSelectionMode,
    handleHistoryPress,
    handleLongPress,
    handleClearSelected,
    exitSelectionMode,
    HistoryItem,
  };
});

HistoryContainer.displayName = 'HistoryContainer';

export default HistoryContainer;