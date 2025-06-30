import { useCallback, useMemo } from 'react';
import { useBrowserContext, Bookmark, BookmarkFolder } from '@/contexts/BrowserContext';

export function useBrowserBookmarks() {
  const { state, addBookmark, removeBookmark, createBookmarkFolder, deleteBookmarkFolder } = useBrowserContext();

  const bookmarks = useMemo(() => state.bookmarks, [state.bookmarks]);
  const bookmarkFolders = useMemo(() => state.bookmarkFolders, [state.bookmarkFolders]);

  const handleAddBookmark = useCallback((url: string, title: string, folderId?: string) => {
    addBookmark(url, title, folderId);
  }, [addBookmark]);

  const handleRemoveBookmark = useCallback((bookmarkId: string) => {
    removeBookmark(bookmarkId);
  }, [removeBookmark]);

  const handleCreateFolder = useCallback((name: string) => {
    createBookmarkFolder(name);
  }, [createBookmarkFolder]);

  const handleDeleteFolder = useCallback((folderId: string) => {
    deleteBookmarkFolder(folderId);
  }, [deleteBookmarkFolder]);

  const getBookmarksByFolder = useCallback((folderId?: string) => {
    return bookmarks.filter(bookmark => bookmark.folderId === folderId);
  }, [bookmarks]);

  const searchBookmarksInFolder = useCallback((query: string, folderId?: string) => {
    const folderBookmarks = getBookmarksByFolder(folderId);
    return folderBookmarks.filter(bookmark =>
      bookmark.title.toLowerCase().includes(query.toLowerCase()) ||
      bookmark.url.toLowerCase().includes(query.toLowerCase())
    );
  }, [getBookmarksByFolder]);

  const isBookmarked = useCallback((url: string) => {
    return bookmarks.some(bookmark => bookmark.url === url);
  }, [bookmarks]);

  const getBookmarkByUrl = useCallback((url: string) => {
    return bookmarks.find(bookmark => bookmark.url === url);
  }, [bookmarks]);

  return {
    // State
    bookmarks,
    bookmarkFolders,
    
    // Actions
    addBookmark: handleAddBookmark,
    removeBookmark: handleRemoveBookmark,
    createFolder: handleCreateFolder,
    deleteFolder: handleDeleteFolder,
    
    // Computed
    getBookmarksByFolder,
    searchBookmarksInFolder,
    isBookmarked,
    getBookmarkByUrl,
  };
}