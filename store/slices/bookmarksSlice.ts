import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Bookmark {
  id: string;
  url: string;
  title: string;
  favicon?: string;
  folderId?: string;
  createdAt: string;
}

export interface BookmarkFolder {
  id: string;
  name: string;
  createdAt: string;
}

interface BookmarksState {
  bookmarks: Bookmark[];
  folders: BookmarkFolder[];
}

const initialState: BookmarksState = {
  bookmarks: [],
  folders: [],
};

const bookmarksSlice = createSlice({
  name: 'bookmarks',
  initialState,
  reducers: {
    addBookmark: (state, action: PayloadAction<{ url: string; title: string; folderId?: string }>) => {
      const newBookmark: Bookmark = {
        id: Date.now().toString(),
        url: action.payload.url,
        title: action.payload.title,
        folderId: action.payload.folderId,
        createdAt: new Date().toISOString(),
      };

      state.bookmarks.push(newBookmark);
    },

    removeBookmark: (state, action: PayloadAction<{ bookmarkId: string }>) => {
      state.bookmarks = state.bookmarks.filter(bookmark => bookmark.id !== action.payload.bookmarkId);
    },

    createFolder: (state, action: PayloadAction<{ name: string }>) => {
      const newFolder: BookmarkFolder = {
        id: Date.now().toString(),
        name: action.payload.name,
        createdAt: new Date().toISOString(),
      };

      state.folders.push(newFolder);
    },

    deleteFolder: (state, action: PayloadAction<{ folderId: string }>) => {
      // Remove folder
      state.folders = state.folders.filter(folder => folder.id !== action.payload.folderId);
      // Remove bookmarks in this folder
      state.bookmarks = state.bookmarks.filter(bookmark => bookmark.folderId !== action.payload.folderId);
    },

    updateBookmark: (state, action: PayloadAction<{ bookmarkId: string; updates: Partial<Bookmark> }>) => {
      const bookmark = state.bookmarks.find(bookmark => bookmark.id === action.payload.bookmarkId);
      if (bookmark) {
        Object.assign(bookmark, action.payload.updates);
      }
    },
  },
});

export const {
  addBookmark,
  removeBookmark,
  createFolder,
  deleteFolder,
  updateBookmark,
} = bookmarksSlice.actions;

export default bookmarksSlice.reducer;