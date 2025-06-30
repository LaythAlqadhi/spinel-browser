import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface HistoryEntry {
  id: string;
  url: string;
  title: string;
  favicon?: string;
  visitedAt: string;
  visitCount: number;
}

interface HistoryState {
  entries: HistoryEntry[];
}

const initialState: HistoryState = {
  entries: [],
};

const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    addHistoryEntry: (state, action: PayloadAction<{ url: string; title: string; favicon?: string }>) => {
      const existingEntry = state.entries.find(entry => entry.url === action.payload.url);
      
      if (existingEntry) {
        existingEntry.visitedAt = new Date().toISOString();
        existingEntry.visitCount += 1;
        existingEntry.title = action.payload.title; // Update title in case it changed
        if (action.payload.favicon) {
          existingEntry.favicon = action.payload.favicon;
        }
      } else {
        const newEntry: HistoryEntry = {
          id: Date.now().toString(),
          url: action.payload.url,
          title: action.payload.title,
          favicon: action.payload.favicon,
          visitedAt: new Date().toISOString(),
          visitCount: 1,
        };

        state.entries.unshift(newEntry);
        
        // Keep only last 1000 entries
        if (state.entries.length > 1000) {
          state.entries = state.entries.slice(0, 1000);
        }
      }
    },

    clearHistory: (state, action: PayloadAction<{ selectedIds?: string[] }>) => {
      if (action.payload.selectedIds) {
        state.entries = state.entries.filter(entry => !action.payload.selectedIds!.includes(entry.id));
      } else {
        state.entries = [];
      }
    },

    removeHistoryEntry: (state, action: PayloadAction<{ entryId: string }>) => {
      state.entries = state.entries.filter(entry => entry.id !== action.payload.entryId);
    },

    updateHistoryEntry: (state, action: PayloadAction<{ entryId: string; updates: Partial<HistoryEntry> }>) => {
      const entry = state.entries.find(entry => entry.id === action.payload.entryId);
      if (entry) {
        Object.assign(entry, action.payload.updates);
      }
    },
  },
});

export const {
  addHistoryEntry,
  clearHistory,
  removeHistoryEntry,
  updateHistoryEntry,
} = historySlice.actions;

export default historySlice.reducer;