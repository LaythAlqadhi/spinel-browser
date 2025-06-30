import { createSelector } from '@reduxjs/toolkit';
import { RootState } from './index';

// Tabs selectors
export const selectTabs = (state: RootState) => state.tabs.tabs;
export const selectActiveTabId = (state: RootState) => state.tabs.activeTabId;
export const selectIsPrivateMode = (state: RootState) => state.tabs.isPrivateMode;

export const selectActiveTab = createSelector(
  [selectTabs, selectActiveTabId],
  (tabs, activeTabId) => tabs.find(tab => tab.id === activeTabId)
);

export const selectRegularTabs = createSelector(
  [selectTabs],
  (tabs) => tabs.filter(tab => !tab.isPrivate)
);

export const selectPrivateTabs = createSelector(
  [selectTabs],
  (tabs) => tabs.filter(tab => tab.isPrivate)
);

export const selectTabsCount = createSelector(
  [selectRegularTabs, selectPrivateTabs],
  (regularTabs, privateTabs) => ({
    regular: regularTabs.length,
    private: privateTabs.length,
  })
);

// Bookmarks selectors
export const selectBookmarks = (state: RootState) => state.bookmarks.bookmarks;
export const selectBookmarkFolders = (state: RootState) => state.bookmarks.folders;

export const selectBookmarksByFolder = createSelector(
  [selectBookmarks, (state: RootState, folderId?: string) => folderId],
  (bookmarks, folderId) => bookmarks.filter(bookmark => bookmark.folderId === folderId)
);

export const selectIsBookmarked = createSelector(
  [selectBookmarks, (state: RootState, url: string) => url],
  (bookmarks, url) => bookmarks.some(bookmark => bookmark.url === url)
);

// History selectors
export const selectHistory = (state: RootState) => state.history.entries;

export const selectRecentHistory = createSelector(
  [selectHistory, (state: RootState, limit: number) => limit],
  (history, limit) => history.slice(0, limit)
);

export const selectHistoryByDate = createSelector(
  [selectHistory],
  (history) => {
    const grouped: { [key: string]: typeof history } = {};
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
  }
);

export const selectMostVisitedSites = createSelector(
  [selectHistory, (state: RootState, limit: number) => limit],
  (history, limit) => history
    .sort((a, b) => b.visitCount - a.visitCount)
    .slice(0, limit)
);

// Settings selectors
export const selectSettings = (state: RootState) => state.settings.settings;
export const selectTheme = (state: RootState) => state.settings.settings.theme;
export const selectSearchEngine = (state: RootState) => state.settings.settings.defaultSearchEngine;
export const selectShowSuggestions = (state: RootState) => state.settings.settings.showSuggestions;
export const selectBlockPopups = (state: RootState) => state.settings.settings.blockPopups;
export const selectClearHistoryOnExit = (state: RootState) => state.settings.settings.clearHistoryOnExit;

export const selectIsDarkMode = createSelector(
  [selectTheme],
  (theme) => theme === 'dark'
);