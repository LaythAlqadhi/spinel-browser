import { useCallback, useMemo } from 'react';
import { useBrowserContext, HistoryEntry } from '@/contexts/BrowserContext';

export function useBrowserHistory() {
  const { state, addHistoryEntry, clearHistory, searchHistory } = useBrowserContext();

  const history = useMemo(() => state.history, [state.history]);

  const handleAddHistoryEntry = useCallback((url: string, title: string, favicon?: string) => {
    addHistoryEntry(url, title, favicon);
  }, [addHistoryEntry]);

  const handleClearHistory = useCallback((selectedIds?: string[]) => {
    clearHistory(selectedIds);
  }, [clearHistory]);

  const handleSearchHistory = useCallback((query: string) => {
    return searchHistory(query);
  }, [searchHistory]);

  const getHistoryByDate = useCallback((date: Date) => {
    const targetDate = date.toDateString();
    return history.filter(entry => 
      entry.visitedAt.toDateString() === targetDate
    );
  }, [history]);

  const getRecentHistory = useCallback((limit: number = 10) => {
    return history.slice(0, limit);
  }, [history]);

  const groupHistoryByDate = useCallback(() => {
    const grouped: { [key: string]: HistoryEntry[] } = {};
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    history.forEach(entry => {
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
    searchHistory: handleSearchHistory,
    
    // Computed
    getHistoryByDate,
    getRecentHistory,
    groupHistoryByDate,
    getMostVisitedSites,
  };
}