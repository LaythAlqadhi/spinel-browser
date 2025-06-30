import { useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectHistory,
  selectRecentHistory,
  selectHistoryByDate,
  selectMostVisitedSites,
} from '@/store/selectors';
import {
  addHistoryEntry,
  clearHistory,
  removeHistoryEntry,
  updateHistoryEntry,
} from '@/store/slices/historySlice';
import { HistoryEntry } from '@/store/slices/historySlice';

export function useBrowserHistory() {
  const dispatch = useAppDispatch();
  
  const history = useAppSelector(selectHistory) ?? [];

  const handleAddHistoryEntry = useCallback((url: string, title: string, favicon?: string) => {
    dispatch(addHistoryEntry({ url, title, favicon }));
  }, [dispatch]);

  const handleClearHistory = useCallback((selectedIds?: string[]) => {
    dispatch(clearHistory({ selectedIds }));
  }, [dispatch]);

  const handleRemoveHistoryEntry = useCallback((entryId: string) => {
    dispatch(removeHistoryEntry({ entryId }));
  }, [dispatch]);

  const handleUpdateHistoryEntry = useCallback((entryId: string, updates: Partial<HistoryEntry>) => {
    dispatch(updateHistoryEntry({ entryId, updates }));
  }, [dispatch]);

  const searchHistory = useCallback((query: string) => {
    const lowerQuery = query.toLowerCase();
    return history.filter(entry =>
      entry.title.toLowerCase().includes(lowerQuery) ||
      entry.url.toLowerCase().includes(lowerQuery)
    );
  }, [history]);

  const getHistoryByDate = useCallback((date: Date) => {
    const targetDate = date.toDateString();
    return history.filter(entry => 
      new Date(entry.visitedAt).toDateString() === targetDate
    );
  }, [history]);

  const getRecentHistory = useCallback((limit: number = 10) => {
    return history.slice(0, limit);
  }, [history]);

  const groupHistoryByDate = useCallback((filteredHistory?: HistoryEntry[]) => {
    const historyToGroup = filteredHistory || history;
    const grouped: { [key: string]: HistoryEntry[] } = {};
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    historyToGroup.forEach(entry => {
      const entryDate = new Date(entry.visitedAt);
      let dateKey: string;

      if (entryDate.toDateString() === today.toDateString()) {
        dateKey = 'Today';
      } else if (entryDate.toDateString() === yesterday.toDateString()) {
        dateKey = 'Yesterday';
      } else {
        dateKey = entryDate.toLocaleDateString();
      }

      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(entry);
    });

    return Object.entries(grouped).map(([title, data]) => ({
      title,
      data: data.sort((a, b) => new Date(b.visitedAt).getTime() - new Date(a.visitedAt).getTime()),
    }));
  }, [history]);

  const getMostVisitedSites = useCallback((limit: number = 10) => {
    return history
      .sort((a, b) => b.visitCount - a.visitCount)
      .slice(0, limit);
  }, [history]);

  return {
    // State
    history,
    
    // Actions
    addHistoryEntry: handleAddHistoryEntry,
    clearHistory: handleClearHistory,
    removeHistoryEntry: handleRemoveHistoryEntry,
    updateHistoryEntry: handleUpdateHistoryEntry,
    searchHistory,
    
    // Computed
    getHistoryByDate,
    getRecentHistory,
    groupHistoryByDate,
    getMostVisitedSites,
  };
}