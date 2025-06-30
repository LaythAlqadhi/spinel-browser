import { useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectBookmarks,
  selectBookmarkFolders,
  selectBookmarksByFolder,
  selectIsBookmarked,
} from '@/store/selectors';
import {
  addBookmark,
  removeBookmark,
  createFolder,
  deleteFolder,
  updateBookmark,
} from '@/store/slices/bookmarksSlice';
import { Bookmark } from '@/store/slices/bookmarksSlice';

export function useBrowserBookmarks() {
  const dispatch = useAppDispatch();
  
  const bookmarks = useAppSelector(selectBookmarks) ?? [];
  const bookmarkFolders = useAppSelector(selectBookmarkFolders) ?? [];

  const handleAddBookmark = useCallback((url: string, title: string, folderId?: string) => {
    dispatch(addBookmark({ url, title, folderId }));
  }, [dispatch]);

  const handleRemoveBookmark = useCallback((bookmarkId: string) => {
    dispatch(removeBookmark({ bookmarkId }));
  }, [dispatch]);

  const handleCreateFolder = useCallback((name: string) => {
    dispatch(createFolder({ name }));
  }, [dispatch]);

  const handleDeleteFolder = useCallback((folderId: string) => {
    dispatch(deleteFolder({ folderId }));
  }, [dispatch]);

  const handleUpdateBookmark = useCallback((bookmarkId: string, updates: Partial<Bookmark>) => {
    dispatch(updateBookmark({ bookmarkId, updates }));
  }, [dispatch]);

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
    updateBookmark: handleUpdateBookmark,
    
    // Computed
    getBookmarksByFolder,
    searchBookmarksInFolder,
    isBookmarked,
    getBookmarkByUrl,
  };
}