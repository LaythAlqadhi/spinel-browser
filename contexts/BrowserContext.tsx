import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
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
  tabs: Tab[];
  activeTabId: string | null;
  bookmarks: Bookmark[];
  bookmarkFolders: BookmarkFolder[];
  history: HistoryEntry[];
  settings: BrowserSettings;
  theme: 'light' | 'dark';
  isInitialized: boolean;
  isPrivateMode: boolean;
}

type BrowserAction =
  | { type: 'CREATE_TAB'; payload: { url?: string; isPrivate?: boolean } }
  | { type: 'CLOSE_TAB'; payload: { tabId: string } }
  | { type: 'SET_ACTIVE_TAB'; payload: { tabId: string } }
  | { type: 'UPDATE_TAB'; payload: { tabId: string; updates: Partial<Tab> } }
  | { type: 'ADD_BOOKMARK'; payload: { url: string; title: string; folderId?: string } }
  | { type: 'REMOVE_BOOKMARK'; payload: { bookmarkId: string } }
  | { type: 'CREATE_BOOKMARK_FOLDER'; payload: { name: string } }
  | { type: 'DELETE_BOOKMARK_FOLDER'; payload: { folderId: string } }
  | { type: 'ADD_HISTORY_ENTRY'; payload: { url: string; title: string; favicon?: string } }
  | { type: 'CLEAR_HISTORY'; payload: { selectedIds?: string[] } }
  | { type: 'UPDATE_SETTINGS'; payload: { updates: Partial<BrowserSettings> } }
  | { type: 'SET_THEME'; payload: { theme: 'light' | 'dark' } }
  | { type: 'LOAD_PERSISTED_STATE'; payload: { state: Partial<BrowserState> } }
  | { type: 'SET_INITIALIZED'; payload: { initialized: boolean } }
  | { type: 'SET_PRIVATE_MODE'; payload: { isPrivate: boolean } }
  | { type: 'CLOSE_ALL_PRIVATE_TABS' }
  | { type: 'TOGGLE_DESKTOP_MODE'; payload: { tabId: string } }
  | { type: 'SET_TAB_ZOOM'; payload: { tabId: string; zoomLevel: number } };

const defaultSettings: BrowserSettings = {
  theme: 'dark',
  defaultSearchEngine: 'google',
  clearHistoryOnExit: false,
  showSuggestions: true,
  blockPopups: true,
};

const initialState: BrowserState = {
  tabs: [],
  activeTabId: null,
  bookmarks: [],
  bookmarkFolders: [],
  history: [],
  settings: defaultSettings,
  theme: 'dark',
  isInitialized: false,
  isPrivateMode: false,
};

function browserReducer(state: BrowserState, action: BrowserAction): BrowserState {
  switch (action.type) {
    case 'CREATE_TAB': {
      const newTab: Tab = {
        id: Date.now().toString(),
        url: action.payload.url || 'about:blank',
        title: 'New Tab',
        loading: false,
        canGoBack: false,
        canGoForward: false,
        progress: 0,
        createdAt: new Date(),
        isPrivate: action.payload.isPrivate || false,
        desktopMode: false,
        zoomLevel: 100,
      };

      return {
        ...state,
        tabs: [...state.tabs, newTab],
        activeTabId: newTab.id,
        isPrivateMode: newTab.isPrivate,
      };
    }

    case 'CLOSE_TAB': {
      const newTabs = state.tabs.filter(tab => tab.id !== action.payload.tabId);
      let newActiveTabId = state.activeTabId;
      let newIsPrivateMode = state.isPrivateMode;

      if (state.activeTabId === action.payload.tabId) {
        if (newTabs.length > 0) {
          // Find the next best tab to activate
          const closedTabIndex = state.tabs.findIndex(tab => tab.id === action.payload.tabId);
          if (closedTabIndex > 0) {
            // Activate the previous tab
            newActiveTabId = newTabs[closedTabIndex - 1].id;
            newIsPrivateMode = newTabs[closedTabIndex - 1].isPrivate;
          } else {
            // Activate the first remaining tab
            newActiveTabId = newTabs[0].id;
            newIsPrivateMode = newTabs[0].isPrivate;
          }
        } else {
          // No tabs left - this will be handled by the component
          newActiveTabId = null;
          newIsPrivateMode = false;
        }
      }

      return {
        ...state,
        tabs: newTabs,
        activeTabId: newActiveTabId,
        isPrivateMode: newIsPrivateMode,
      };
    }

    case 'SET_ACTIVE_TAB': {
      const activeTab = state.tabs.find(tab => tab.id === action.payload.tabId);
      return {
        ...state,
        activeTabId: action.payload.tabId,
        isPrivateMode: activeTab?.isPrivate || false,
      };
    }

    case 'UPDATE_TAB':
      return {
        ...state,
        tabs: state.tabs.map(tab =>
          tab.id === action.payload.tabId ? { ...tab, ...action.payload.updates } : tab
        ),
      };

    case 'TOGGLE_DESKTOP_MODE':
      return {
        ...state,
        tabs: state.tabs.map(tab =>
          tab.id === action.payload.tabId 
            ? { ...tab, desktopMode: !tab.desktopMode }
            : tab
        ),
      };

    case 'SET_TAB_ZOOM':
      return {
        ...state,
        tabs: state.tabs.map(tab =>
          tab.id === action.payload.tabId 
            ? { ...tab, zoomLevel: action.payload.zoomLevel }
            : tab
        ),
      };

    case 'ADD_BOOKMARK': {
      const newBookmark: Bookmark = {
        id: Date.now().toString(),
        url: action.payload.url,
        title: action.payload.title,
        folderId: action.payload.folderId,
        createdAt: new Date(),
      };

      return {
        ...state,
        bookmarks: [...state.bookmarks, newBookmark],
      };
    }

    case 'REMOVE_BOOKMARK':
      return {
        ...state,
        bookmarks: state.bookmarks.filter(bookmark => bookmark.id !== action.payload.bookmarkId),
      };

    case 'CREATE_BOOKMARK_FOLDER': {
      const newFolder: BookmarkFolder = {
        id: Date.now().toString(),
        name: action.payload.name,
        createdAt: new Date(),
      };

      return {
        ...state,
        bookmarkFolders: [...state.bookmarkFolders, newFolder],
      };
    }

    case 'DELETE_BOOKMARK_FOLDER':
      return {
        ...state,
        bookmarkFolders: state.bookmarkFolders.filter(folder => folder.id !== action.payload.folderId),
        bookmarks: state.bookmarks.filter(bookmark => bookmark.folderId !== action.payload.folderId),
      };

    case 'ADD_HISTORY_ENTRY': {
      const existingEntry = state.history.find(entry => entry.url === action.payload.url);
      
      if (existingEntry) {
        return {
          ...state,
          history: state.history.map(entry =>
            entry.url === action.payload.url
              ? { ...entry, visitedAt: new Date(), visitCount: entry.visitCount + 1 }
              : entry
          ),
        };
      }

      const newEntry: HistoryEntry = {
        id: Date.now().toString(),
        url: action.payload.url,
        title: action.payload.title,
        favicon: action.payload.favicon,
        visitedAt: new Date(),
        visitCount: 1,
      };

      return {
        ...state,
        history: [newEntry, ...state.history].slice(0, 1000), // Keep last 1000 entries
      };
    }

    case 'CLEAR_HISTORY':
      return {
        ...state,
        history: action.payload.selectedIds 
          ? state.history.filter(entry => !action.payload.selectedIds!.includes(entry.id))
          : [],
      };

    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload.updates },
        theme: action.payload.updates.theme || state.theme,
      };

    case 'SET_THEME':
      return {
        ...state,
        theme: action.payload.theme,
        settings: { ...state.settings, theme: action.payload.theme },
      };

    case 'LOAD_PERSISTED_STATE':
      return {
        ...state,
        ...action.payload.state,
      };

    case 'SET_INITIALIZED':
      return {
        ...state,
        isInitialized: action.payload.initialized,
      };

    case 'SET_PRIVATE_MODE':
      return {
        ...state,
        isPrivateMode: action.payload.isPrivate,
      };

    case 'CLOSE_ALL_PRIVATE_TABS': {
      const regularTabs = state.tabs.filter(tab => !tab.isPrivate);
      let newActiveTabId = state.activeTabId;
      let newIsPrivateMode = false;

      // If the current active tab is private, switch to a regular tab
      const activeTab = state.tabs.find(tab => tab.id === state.activeTabId);
      if (activeTab?.isPrivate) {
        if (regularTabs.length > 0) {
          newActiveTabId = regularTabs[0].id;
        } else {
          newActiveTabId = null;
        }
      }

      return {
        ...state,
        tabs: regularTabs,
        activeTabId: newActiveTabId,
        isPrivateMode: newIsPrivateMode,
      };
    }

    default:
      return state;
  }
}

interface BrowserContextType {
  state: BrowserState;
  createTab: (url?: string, isPrivate?: boolean) => string;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  updateTab: (tabId: string, updates: Partial<Tab>) => void;
  toggleDesktopMode: (tabId: string) => void;
  setTabZoom: (tabId: string, zoomLevel: number) => void;
  addBookmark: (url: string, title: string, folderId?: string) => void;
  removeBookmark: (bookmarkId: string) => void;
  createBookmarkFolder: (name: string) => void;
  deleteBookmarkFolder: (folderId: string) => void;
  addHistoryEntry: (url: string, title: string, favicon?: string) => void;
  clearHistory: (selectedIds?: string[]) => void;
  searchHistory: (query: string) => HistoryEntry[];
  updateSettings: (updates: Partial<BrowserSettings>) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setPrivateMode: (isPrivate: boolean) => void;
  closeAllPrivateTabs: () => void;
  initializeStore: () => Promise<void>;
}

const BrowserContext = createContext<BrowserContextType | undefined>(undefined);

const STORAGE_KEY = 'browser-storage';

interface BrowserProviderProps {
  children: ReactNode;
}

export function BrowserProvider({ children }: BrowserProviderProps) {
  const [state, dispatch] = useReducer(browserReducer, initialState);

  // Load persisted state on mount
  useEffect(() => {
    const loadPersistedState = async () => {
      try {
        const persistedData = await AsyncStorage.getItem(STORAGE_KEY);
        if (persistedData) {
          const parsedData = JSON.parse(persistedData);
          
          // Check if clear history on exit was enabled
          if (parsedData.settings?.clearHistoryOnExit) {
            // Clear history but keep other data
            parsedData.history = [];
          }

          // Convert date strings back to Date objects for tabs and ensure all required properties exist
          if (parsedData.tabs) {
            parsedData.tabs = parsedData.tabs.map((tab: any) => ({
              ...tab,
              createdAt: new Date(tab.createdAt),
              desktopMode: tab.desktopMode || false,
              zoomLevel: tab.zoomLevel || 100,
              // Reset temporary states on app restart
              loading: false,
              progress: 0,
            }));
            
            // Ensure active tab exists, if not reset to first tab or null
            const activeTab = parsedData.tabs.find((tab: any) => tab.id === parsedData.activeTabId);
            if (!activeTab && parsedData.tabs.length > 0) {
              parsedData.activeTabId = parsedData.tabs[0].id;
              parsedData.isPrivateMode = parsedData.tabs[0].isPrivate || false;
            } else if (!activeTab) {
              parsedData.activeTabId = null;
              parsedData.isPrivateMode = false;
            } else {
              parsedData.isPrivateMode = activeTab.isPrivate || false;
            }
          }

          // Convert date strings back to Date objects for bookmarks
          if (parsedData.bookmarks) {
            parsedData.bookmarks = parsedData.bookmarks.map((bookmark: any) => ({
              ...bookmark,
              createdAt: new Date(bookmark.createdAt),
            }));
          }

          // Convert date strings back to Date objects for bookmark folders
          if (parsedData.bookmarkFolders) {
            parsedData.bookmarkFolders = parsedData.bookmarkFolders.map((folder: any) => ({
              ...folder,
              createdAt: new Date(folder.createdAt),
            }));
          }

          // Convert date strings back to Date objects for history
          if (parsedData.history) {
            parsedData.history = parsedData.history.map((entry: any) => ({
              ...entry,
              visitedAt: new Date(entry.visitedAt),
            }));
          }
          
          dispatch({ type: 'LOAD_PERSISTED_STATE', payload: { state: parsedData } });
        }
      } catch (error) {
        console.error('Failed to load persisted state:', error);
      } finally {
        // Mark as initialized regardless of whether we loaded data or not
        dispatch({ type: 'SET_INITIALIZED', payload: { initialized: true } });
      }
    };

    loadPersistedState();
  }, []);

  // Persist state changes (including private tabs now)
  useEffect(() => {
    if (!state.isInitialized) return; // Don't persist until we've loaded initial state

    const persistState = async () => {
      try {
        // Reset temporary state for all tabs but keep private tabs
        const tabsToPersist = state.tabs.map(tab => ({
          ...tab,
          loading: false, // Reset loading state
          progress: 0, // Reset progress
        }));

        const stateToPersist = {
          tabs: tabsToPersist,
          activeTabId: state.activeTabId,
          bookmarks: state.bookmarks,
          bookmarkFolders: state.bookmarkFolders,
          history: state.history,
          settings: state.settings,
          theme: state.theme,
          isPrivateMode: state.isPrivateMode, // Persist private mode state
        };
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(stateToPersist));
      } catch (error) {
        console.error('Failed to persist state:', error);
      }
    };

    persistState();
  }, [
    state.tabs, 
    state.activeTabId, 
    state.bookmarks, 
    state.bookmarkFolders, 
    state.history, 
    state.settings, 
    state.theme,
    state.isPrivateMode,
    state.isInitialized
  ]);

  const createTab = (url?: string, isPrivate?: boolean): string => {
    const tabId = Date.now().toString();
    dispatch({ type: 'CREATE_TAB', payload: { url, isPrivate } });
    return tabId;
  };

  const closeTab = (tabId: string) => {
    dispatch({ type: 'CLOSE_TAB', payload: { tabId } });
  };

  const setActiveTab = (tabId: string) => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: { tabId } });
  };

  const updateTab = (tabId: string, updates: Partial<Tab>) => {
    dispatch({ type: 'UPDATE_TAB', payload: { tabId, updates } });
  };

  const toggleDesktopMode = (tabId: string) => {
    dispatch({ type: 'TOGGLE_DESKTOP_MODE', payload: { tabId } });
  };

  const setTabZoom = (tabId: string, zoomLevel: number) => {
    dispatch({ type: 'SET_TAB_ZOOM', payload: { tabId, zoomLevel } });
  };

  const addBookmark = (url: string, title: string, folderId?: string) => {
    dispatch({ type: 'ADD_BOOKMARK', payload: { url, title, folderId } });
  };

  const removeBookmark = (bookmarkId: string) => {
    dispatch({ type: 'REMOVE_BOOKMARK', payload: { bookmarkId } });
  };

  const createBookmarkFolder = (name: string) => {
    dispatch({ type: 'CREATE_BOOKMARK_FOLDER', payload: { name } });
  };

  const deleteBookmarkFolder = (folderId: string) => {
    dispatch({ type: 'DELETE_BOOKMARK_FOLDER', payload: { folderId } });
  };

  const addHistoryEntry = (url: string, title: string, favicon?: string) => {
    // Don't add to history if in private mode
    const activeTab = state.tabs.find(tab => tab.id === state.activeTabId);
    if (activeTab?.isPrivate) {
      return;
    }
    dispatch({ type: 'ADD_HISTORY_ENTRY', payload: { url, title, favicon } });
  };

  const clearHistory = (selectedIds?: string[]) => {
    dispatch({ type: 'CLEAR_HISTORY', payload: { selectedIds } });
  };

  const searchHistory = (query: string): HistoryEntry[] => {
    const lowerQuery = query.toLowerCase();
    return state.history.filter(entry =>
      entry.title.toLowerCase().includes(lowerQuery) ||
      entry.url.toLowerCase().includes(lowerQuery)
    );
  };

  const updateSettings = (updates: Partial<BrowserSettings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: { updates } });
  };

  const setTheme = (theme: 'light' | 'dark') => {
    dispatch({ type: 'SET_THEME', payload: { theme } });
  };

  const setPrivateMode = (isPrivate: boolean) => {
    dispatch({ type: 'SET_PRIVATE_MODE', payload: { isPrivate } });
  };

  const closeAllPrivateTabs = () => {
    dispatch({ type: 'CLOSE_ALL_PRIVATE_TABS' });
  };

  const initializeStore = async () => {
    // Wait for the state to be initialized from persistence
    if (!state.isInitialized) {
      return;
    }

    // Always ensure we have at least one tab
    if (state.tabs.length === 0) {
      createTab(); // This will create a blank tab with 'about:blank' URL
    }
  };

  const contextValue: BrowserContextType = {
    state,
    createTab,
    closeTab,
    setActiveTab,
    updateTab,
    toggleDesktopMode,
    setTabZoom,
    addBookmark,
    removeBookmark,
    createBookmarkFolder,
    deleteBookmarkFolder,
    addHistoryEntry,
    clearHistory,
    searchHistory,
    updateSettings,
    setTheme,
    setPrivateMode,
    closeAllPrivateTabs,
    initializeStore,
  };

  return (
    <BrowserContext.Provider value={contextValue}>
      {children}
    </BrowserContext.Provider>
  );
}

export function useBrowserContext() {
  const context = useContext(BrowserContext);
  if (context === undefined) {
    throw new Error('useBrowserContext must be used within a BrowserProvider');
  }
  return context;
}

// Convenience hooks for easier access to specific parts of the state
export function useBrowserState() {
  const { state } = useBrowserContext();
  return state;
}

export function useTabs() {
  const { state, createTab, closeTab, setActiveTab, updateTab, toggleDesktopMode, setTabZoom } = useBrowserContext();
  return {
    tabs: state.tabs,
    activeTabId: state.activeTabId,
    isPrivateMode: state.isPrivateMode,
    createTab,
    closeTab,
    setActiveTab,
    updateTab,
    toggleDesktopMode,
    setTabZoom,
  };
}

export function useBookmarks() {
  const { state, addBookmark, removeBookmark, createBookmarkFolder, deleteBookmarkFolder } = useBrowserContext();
  return {
    bookmarks: state.bookmarks,
    bookmarkFolders: state.bookmarkFolders,
    addBookmark,
    removeBookmark,
    createBookmarkFolder,
    deleteBookmarkFolder,
  };
}

export function useHistory() {
  const { state, addHistoryEntry, clearHistory, searchHistory } = useBrowserContext();
  return {
    history: state.history,
    addHistoryEntry,
    clearHistory,
    searchHistory,
  };
}

export function useSettings() {
  const { state, updateSettings, setTheme } = useBrowserContext();
  return {
    settings: state.settings,
    theme: state.theme,
    updateSettings,
    setTheme,
  };
}