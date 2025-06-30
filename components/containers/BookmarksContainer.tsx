import React, { useState, useCallback, useMemo, memo } from 'react';
import { useBrowserBookmarks } from '@/hooks/useBrowserBookmarks';
import { useBrowserTabs } from '@/hooks/useBrowserTabs';
import { useToastController } from '@tamagui/toast';
import BookmarkItem from '@/components/ui/BookmarkItem';
import { Bookmark } from '@/contexts/BrowserContext';

interface BookmarksContainerProps {
  searchQuery: string;
  selectedFolderId: string | null;
  onClose: () => void;
}

const BookmarksContainer = memo(({ searchQuery, selectedFolderId, onClose }: BookmarksContainerProps) => {
  const { bookmarks } = useBrowserBookmarks();
  const { tabs, activeTabId, updateTab } = useBrowserTabs();
  const toast = useToastController();

  const filteredBookmarks = useMemo(() => {
    return bookmarks.filter(bookmark => {
      const matchesSearch = bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            bookmark.url.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (selectedFolderId === null) {
        return matchesSearch && !bookmark.folderId;
      } else {
        return matchesSearch && bookmark.folderId === selectedFolderId;
      }
    });
  }, [bookmarks, searchQuery, selectedFolderId]);

  const handleBookmarkPress = useCallback((bookmark: Bookmark) => {
    let targetTabId = activeTabId;
    
    if (!targetTabId || tabs.length === 0) {
      onClose();
      return;
    }

    updateTab(targetTabId, {
      url: bookmark.url,
      title: 'Loading...',
      loading: true
    });

    onClose();
  }, [activeTabId, tabs.length, updateTab, onClose]);

  const handleDeleteBookmark = useCallback((bookmarkId: string) => {
    // This would be handled by the parent component or hook
    toast.show('Bookmark Deleted', {
      message: 'The bookmark has been removed from your collection.',
    });
  }, [toast]);

  return {
    filteredBookmarks,
    handleBookmarkPress,
    handleDeleteBookmark,
    BookmarkItem,
  };
});

BookmarksContainer.displayName = 'BookmarksContainer';

export default BookmarksContainer;