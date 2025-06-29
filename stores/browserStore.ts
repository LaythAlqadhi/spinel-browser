import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Tab {
  id: string;
  url: string;
  title: string;
  favicon?: string;
  thumbnail?: string;
  loading: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
  progress: number;
  createdAt: Date;
  isPrivate: boolean;
  desktopMode: boolean;
  zoomLevel: number;
}

export interface Bookmark {
  id: string;
  url: string;
  title: string;
  favicon?: string;
  folderId?: string;
  createdAt: Date;
}

export interface BookmarkFolder {
  id: string;
  name: string;
  createdAt: Date;
}

export interface HistoryEntry {
  id: string;
  url: string;
  title: string;
  favicon?: string;
  visitedAt: Date;
  visitCount: number;
}

export interface BrowserSettings {
  theme: 'light' | 'dark';
  defaultSearchEngine: 'google' | 'bing' | 'duckduckgo';
  clearHistoryOnExit: boolean;
  showSuggestions: boolean;
  blockPopups: boolean;
}

interface BrowserState {
  // Core state
  tabs: Tab[];
  activeTabId: string | null;
  bookmarks: Bookmark[];
  bookmarkFolders: BookmarkFolder[];
  history: HistoryEntry[];
  settings: BrowserSettings;
  theme: 'light' | 'dark';
  isInitialized: boolean;
  isPrivateMode: boolean;

  // Tab actions
  createTab: (url?: string, isPrivate?: boolean) => string;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  updateTab: (tabId: string, updates: Partial<Tab>) => void;
  toggleDesktopMode: (tabId: string) => void;
  setTabZoom: (tabId: string, zoomLevel: number) => void;
  closeAllPrivateTabs: () => void;

  // Bookmark actions
  addBookmark: (url: string, title: string, folderId?: string) => void;
  removeBookmark: (bookmarkId: string) => void;
  createBookmarkFolder: (name: string) => void;
  deleteBookmarkFolder: (folderId: string) => void;

  // History actions
  addHistoryEntry: (url: string, title: string, favicon?: string) => void;
  clearHistory: (selectedIds?: string[]) => void;
  searchHistory: (query: string) => HistoryEntry[];

  // Settings actions
  updateSettings: (updates: Partial<BrowserSettings>) => void;
  setTheme: (theme: 'light' | 'dark') => void;

  // Utility actions
  setPrivateMode: (isPrivate: boolean) => void;
  initializeStore: () => void;
}

const defaultSettings: BrowserSettings = {
  theme: 'dark',
  defaultSearchEngine: 'google',
  clearHistoryOnExit: false,
  showSuggestions: true,
  blockPopups: true,
};

export const useBrowserStore = create<BrowserState>()(
  persist(
    (set, get) => ({
      // Initial state
      tabs: [],
      activeTabId: null,
      bookmarks: [],
      bookmarkFolders: [],
      history: [],
      settings: defaultSettings,
      theme: 'dark',
      isInitialized: false,
      isPrivateMode: false,

      // Tab actions
      createTab: (url?: string, isPrivate?: boolean) => {
        const newTab: Tab = {
          id: Date.now().toString(),
          url: url || 'about:blank',
          title: 'New Tab',
          loading: false,
          canGoBack: false,
          canGoForward: false,
          progress: 0,
          createdAt: new Date(),
          isPrivate: isPrivate || false,
          desktopMode: false,
          zoomLevel: 100,
        };

        set((state) => ({
          tabs: [...state.tabs, newTab],
          activeTabId: newTab.id,
          isPrivateMode: newTab.isPrivate,
        }));

        return newTab.id;
      },

      closeTab: (tabId: string) => {
        set((state) => {
          const newTabs = state.tabs.filter(tab => tab.id !== tabId);
          let newActiveTabId = state.activeTabId;
          let newIsPrivateMode = state.isPrivateMode;

          if (state.activeTabId === tabId) {
            if (newTabs.length > 0) {
              const closedTabIndex = state.tabs.findIndex(tab => tab.id === tabId);
              if (closedTabIndex > 0) {
                newActiveTabId = newTabs[closedTabIndex - 1].id;
                newIsPrivateMode = newTabs[closedTabIndex - 1].isPrivate;
              } else {
                newActiveTabId = newTabs[0].id;
                newIsPrivateMode = newTabs[0].isPrivate;
              }
            } else {
              newActiveTabId = null;
              newIsPrivateMode = false;
            }
          }

          return {
            tabs: newTabs,
            activeTabId: newActiveTabId,
            isPrivateMode: newIsPrivateMode,
          };
        });
      },

      setActiveTab: (tabId: string) => {
        set((state) => {
          const activeTab = state.tabs.find(tab => tab.id === tabId);
          return {
            activeTabId: tabId,
            isPrivateMode: activeTab?.isPrivate || false,
          };
        });
      },

      updateTab: (tabId: string, updates: Partial<Tab>) => {
        set((state) => ({
          tabs: state.tabs.map(tab =>
            tab.id === tabId ? { ...tab, ...updates } : tab
          ),
        }));
      },

      toggleDesktopMode: (tabId: string) => {
        set((state) => ({
          tabs: state.tabs.map(tab =>
            tab.id === tabId 
              ? { ...tab, desktopMode: !tab.desktopMode }
              : tab
          ),
        }));
      },

      setTabZoom: (tabId: string, zoomLevel: number) => {
        set((state) => ({
          tabs: state.tabs.map(tab =>
            tab.id === tabId 
              ? { ...tab, zoomLevel }
              : tab
          ),
        }));
      },

      closeAllPrivateTabs: () => {
        set((state) => {
          const regularTabs = state.tabs.filter(tab => !tab.isPrivate);
          let newActiveTabId = state.activeTabId;
          let newIsPrivateMode = false;

          const activeTab = state.tabs.find(tab => tab.id === state.activeTabId);
          if (activeTab?.isPrivate) {
            if (regularTabs.length > 0) {
              newActiveTabId = regularTabs[0].id;
            } else {
              newActiveTabId = null;
            }
          }

          return {
            tabs: regularTabs,
            activeTabId: newActiveTabId,
            isPrivateMode: newIsPrivateMode,
          };
        });
      },

      // Bookmark actions
      addBookmark: (url: string, title: string, folderId?: string) => {
        const newBookmark: Bookmark = {
          id: Date.now().toString(),
          url,
          title,
          folderId,
          createdAt: new Date(),
        };

        set((state) => ({
          bookmarks: [...state.bookmarks, newBookmark],
        }));
      },

      removeBookmark: (bookmarkId: string) => {
        set((state) => ({
          bookmarks: state.bookmarks.filter(bookmark => bookmark.id !== bookmarkId),
        }));
      },

      createBookmarkFolder: (name: string) => {
        const newFolder: BookmarkFolder = {
          id: Date.now().toString(),
          name,
          createdAt: new Date(),
        };

        set((state) => ({
          bookmarkFolders: [...state.bookmarkFolders, newFolder],
        }));
      },

      deleteBookmarkFolder: (folderId: string) => {
        set((state) => ({
          bookmarkFolders: state.bookmarkFolders.filter(folder => folder.id !== folderId),
          bookmarks: state.bookmarks.filter(bookmark => bookmark.folderId !== folderId),
        }));
      },

      // History actions
      addHistoryEntry: (url: string, title: string, favicon?: string) => {
        set((state) => {
          // Don't add to history if in private mode
          const activeTab = state.tabs.find(tab => tab.id === state.activeTabId);
          if (activeTab?.isPrivate) {
            return state;
          }

          const existingEntry = state.history.find(entry => entry.url === url);
          
          if (existingEntry) {
            return {
              history: state.history.map(entry =>
                entry.url === url
                  ? { ...entry, visitedAt: new Date(), visitCount: entry.visitCount + 1 }
                  : entry
              ),
            };
          }

          const newEntry: HistoryEntry = {
            id: Date.now().toString(),
            url,
            title,
            favicon,
            visitedAt: new Date(),
            visitCount: 1,
          };

          return {
            history: [newEntry, ...state.history].slice(0, 1000), // Keep last 1000 entries
          };
        });
      },

      clearHistory: (selectedIds?: string[]) => {
        set((state) => ({
          history: selectedIds 
            ? state.history.filter(entry => !selectedIds.includes(entry.id))
            : [],
        }));
      },

      searchHistory: (query: string) => {
        const state = get();
        const lowerQuery = query.toLowerCase();
        return state.history.filter(entry =>
          entry.title.toLowerCase().includes(lowerQuery) ||
          entry.url.toLowerCase().includes(lowerQuery)
        );
      },

      // Settings actions
      updateSettings: (updates: Partial<BrowserSettings>) => {
        set((state) => ({
          settings: { ...state.settings, ...updates },
          theme: updates.theme || state.theme,
        }));
      },

      setTheme: (theme: 'light' | 'dark') => {
        set((state) => ({
          theme,
          settings: { ...state.settings, theme },
        }));
      },

      // Utility actions
      setPrivateMode: (isPrivate: boolean) => {
        set({ isPrivateMode: isPrivate });
      },

      initializeStore: () => {
        set((state) => {
          // Create initial tab if no tabs exist
          if (state.tabs.length === 0) {
            const newTab: Tab = {
              id: Date.now().toString(),
              url: 'about:blank',
              title: 'New Tab',
              loading: false,
              canGoBack: false,
              canGoForward: false,
              progress: 0,
              createdAt: new Date(),
              isPrivate: false,
              desktopMode: false,
              zoomLevel: 100,
            };

            return {
              tabs: [newTab],
              activeTabId: newTab.id,
              isPrivateMode: false,
              isInitialized: true,
            };
          }

          return {
            isInitialized: true,
          };
        });
      },
    }),
    {
      name: 'browser-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        tabs: state.tabs.map(tab => ({
          ...tab,
          loading: false, // Reset loading state
          progress: 0, // Reset progress
        })),
        activeTabId: state.activeTabId,
        bookmarks: state.bookmarks,
        bookmarkFolders: state.bookmarkFolders,
        history: state.settings.clearHistoryOnExit ? [] : state.history,
        settings: state.settings,
        theme: state.theme,
        isPrivateMode: state.isPrivateMode,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Convert date strings back to Date objects
          state.tabs = state.tabs.map(tab => ({
            ...tab,
            createdAt: new Date(tab.createdAt),
          }));
          
          state.bookmarks = state.bookmarks.map(bookmark => ({
            ...bookmark,
            createdAt: new Date(bookmark.createdAt),
          }));
          
          state.bookmarkFolders = state.bookmarkFolders.map(folder => ({
            ...folder,
            createdAt: new Date(folder.createdAt),
          }));
          
          state.history = state.history.map(entry => ({
            ...entry,
            visitedAt: new Date(entry.visitedAt),
          }));

          // Ensure active tab exists
          const activeTab = state.tabs.find(tab => tab.id === state.activeTabId);
          if (!activeTab && state.tabs.length > 0) {
            state.activeTabId = state.tabs[0].id;
            state.isPrivateMode = state.tabs[0].isPrivate || false;
          } else if (!activeTab) {
            state.activeTabId = null;
            state.isPrivateMode = false;
          } else {
            state.isPrivateMode = activeTab.isPrivate || false;
          }

          state.isInitialized = true;
        }
      },
    }
  )
);

// Convenience selectors
export const useTabsStore = () => {
  const tabs = useBrowserStore((state) => state.tabs);
  const activeTabId = useBrowserStore((state) => state.activeTabId);
  const isPrivateMode = useBrowserStore((state) => state.isPrivateMode);
  const createTab = useBrowserStore((state) => state.createTab);
  const closeTab = useBrowserStore((state) => state.closeTab);
  const setActiveTab = useBrowserStore((state) => state.setActiveTab);
  const updateTab = useBrowserStore((state) => state.updateTab);
  const toggleDesktopMode = useBrowserStore((state) => state.toggleDesktopMode);
  const setTabZoom = useBrowserStore((state) => state.setTabZoom);
  const closeAllPrivateTabs = useBrowserStore((state) => state.closeAllPrivateTabs);

  return {
    tabs,
    activeTabId,
    isPrivateMode,
    createTab,
    closeTab,
    setActiveTab,
    updateTab,
    toggleDesktopMode,
    setTabZoom,
    closeAllPrivateTabs,
  };
};

export const useBookmarksStore = () => {
  const bookmarks = useBrowserStore((state) => state.bookmarks);
  const bookmarkFolders = useBrowserStore((state) => state.bookmarkFolders);
  const addBookmark = useBrowserStore((state) => state.addBookmark);
  const removeBookmark = useBrowserStore((state) => state.removeBookmark);
  const createBookmarkFolder = useBrowserStore((state) => state.createBookmarkFolder);
  const deleteBookmarkFolder = useBrowserStore((state) => state.deleteBookmarkFolder);

  return {
    bookmarks,
    bookmarkFolders,
    addBookmark,
    removeBookmark,
    createBookmarkFolder,
    deleteBookmarkFolder,
  };
};

export const useHistoryStore = () => {
  const history = useBrowserStore((state) => state.history);
  const addHistoryEntry = useBrowserStore((state) => state.addHistoryEntry);
  const clearHistory = useBrowserStore((state) => state.clearHistory);
  const searchHistory = useBrowserStore((state) => state.searchHistory);

  return {
    history,
    addHistoryEntry,
    clearHistory,
    searchHistory,
  };
};

export const useSettingsStore = () => {
  const settings = useBrowserStore((state) => state.settings);
  const theme = useBrowserStore((state) => state.theme);
  const updateSettings = useBrowserStore((state) => state.updateSettings);
  const setTheme = useBrowserStore((state) => state.setTheme);

  return {
    settings,
    theme,
    updateSettings,
    setTheme,
  };
};