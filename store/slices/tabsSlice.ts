import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
  createdAt: string;
  isPrivate: boolean;
  desktopMode: boolean;
  zoomLevel: number;
}

interface TabsState {
  tabs: Tab[];
  activeTabId: string | null;
  isPrivateMode: boolean;
}

const initialState: TabsState = {
  tabs: [],
  activeTabId: null,
  isPrivateMode: false,
};

const tabsSlice = createSlice({
  name: 'tabs',
  initialState,
  reducers: {
    createTab: (state, action: PayloadAction<{ url?: string; isPrivate?: boolean }>) => {
      const newTab: Tab = {
        id: Date.now().toString(),
        url: action.payload.url || 'about:blank',
        title: 'New Tab',
        loading: false,
        canGoBack: false,
        canGoForward: false,
        progress: 0,
        createdAt: new Date().toISOString(),
        isPrivate: action.payload.isPrivate || false,
        desktopMode: false,
        zoomLevel: 100,
      };

      state.tabs.push(newTab);
      state.activeTabId = newTab.id;
      state.isPrivateMode = newTab.isPrivate;
    },

    closeTab: (state, action: PayloadAction<{ tabId: string }>) => {
      const tabIndex = state.tabs.findIndex(tab => tab.id === action.payload.tabId);
      if (tabIndex === -1) return;

      state.tabs.splice(tabIndex, 1);

      // Handle active tab selection
      if (state.activeTabId === action.payload.tabId) {
        if (state.tabs.length > 0) {
          // Activate the previous tab or first remaining tab
          const newActiveIndex = tabIndex > 0 ? tabIndex - 1 : 0;
          state.activeTabId = state.tabs[newActiveIndex].id;
          state.isPrivateMode = state.tabs[newActiveIndex].isPrivate;
        } else {
          state.activeTabId = null;
          state.isPrivateMode = false;
        }
      }
    },

    setActiveTab: (state, action: PayloadAction<{ tabId: string }>) => {
      const activeTab = state.tabs.find(tab => tab.id === action.payload.tabId);
      if (activeTab) {
        state.activeTabId = action.payload.tabId;
        state.isPrivateMode = activeTab.isPrivate;
      }
    },

    updateTab: (state, action: PayloadAction<{ tabId: string; updates: Partial<Tab> }>) => {
      const tab = state.tabs.find(tab => tab.id === action.payload.tabId);
      if (tab) {
        Object.assign(tab, action.payload.updates);
      }
    },

    toggleDesktopMode: (state, action: PayloadAction<{ tabId: string }>) => {
      const tab = state.tabs.find(tab => tab.id === action.payload.tabId);
      if (tab) {
        tab.desktopMode = !tab.desktopMode;
      }
    },

    setTabZoom: (state, action: PayloadAction<{ tabId: string; zoomLevel: number }>) => {
      const tab = state.tabs.find(tab => tab.id === action.payload.tabId);
      if (tab) {
        tab.zoomLevel = action.payload.zoomLevel;
      }
    },

    closeAllPrivateTabs: (state) => {
      const regularTabs = state.tabs.filter(tab => !tab.isPrivate);
      state.tabs = regularTabs;

      // If current active tab was private, switch to a regular tab
      const activeTab = state.tabs.find(tab => tab.id === state.activeTabId);
      if (!activeTab && regularTabs.length > 0) {
        state.activeTabId = regularTabs[0].id;
        state.isPrivateMode = false;
      } else if (!activeTab) {
        state.activeTabId = null;
        state.isPrivateMode = false;
      }
    },

    initializeTabs: (state) => {
      // Create initial tab if none exist
      if (state.tabs.length === 0) {
        const newTab: Tab = {
          id: Date.now().toString(),
          url: 'about:blank',
          title: 'New Tab',
          loading: false,
          canGoBack: false,
          canGoForward: false,
          progress: 0,
          createdAt: new Date().toISOString(),
          isPrivate: false,
          desktopMode: false,
          zoomLevel: 100,
        };

        state.tabs.push(newTab);
        state.activeTabId = newTab.id;
        state.isPrivateMode = false;
      }
    },
  },
});

export const {
  createTab,
  closeTab,
  setActiveTab,
  updateTab,
  toggleDesktopMode,
  setTabZoom,
  closeAllPrivateTabs,
  initializeTabs,
} = tabsSlice.actions;

export default tabsSlice.reducer;