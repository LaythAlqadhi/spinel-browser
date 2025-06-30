import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface BrowserSettings {
  theme: 'light' | 'dark';
  defaultSearchEngine: 'google' | 'bing' | 'duckduckgo';
  clearHistoryOnExit: boolean;
  showSuggestions: boolean;
  blockPopups: boolean;
}

interface SettingsState {
  settings: BrowserSettings;
}

const defaultSettings: BrowserSettings = {
  theme: 'dark',
  defaultSearchEngine: 'google',
  clearHistoryOnExit: false,
  showSuggestions: true,
  blockPopups: true,
};

const initialState: SettingsState = {
  settings: defaultSettings,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateSettings: (state, action: PayloadAction<Partial<BrowserSettings>>) => {
      state.settings = { ...state.settings, ...action.payload };
    },

    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.settings.theme = action.payload;
    },

    setSearchEngine: (state, action: PayloadAction<'google' | 'bing' | 'duckduckgo'>) => {
      state.settings.defaultSearchEngine = action.payload;
    },

    toggleSuggestions: (state) => {
      state.settings.showSuggestions = !state.settings.showSuggestions;
    },

    togglePopupBlocking: (state) => {
      state.settings.blockPopups = !state.settings.blockPopups;
    },

    toggleClearHistoryOnExit: (state) => {
      state.settings.clearHistoryOnExit = !state.settings.clearHistoryOnExit;
    },

    resetSettings: (state) => {
      state.settings = defaultSettings;
    },
  },
});

export const {
  updateSettings,
  setTheme,
  setSearchEngine,
  toggleSuggestions,
  togglePopupBlocking,
  toggleClearHistoryOnExit,
  resetSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer;