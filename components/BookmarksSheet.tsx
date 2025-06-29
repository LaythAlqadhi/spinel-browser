import React, { useState } from 'react';
import { useTheme } from 'tamagui';
import { FlatList } from 'react-native';
import { Bookmark, FolderPlus, Search, Trash2, Folder, Globe, X } from 'lucide-react-native';
import { useBookmarksStore, useTabsStore, useSettingsStore } from '@/store/browserStore';
import { useToastController } from '@tamagui/toast';
import {
  Sheet,
  YStack,
  XStack,
  Text,
  Button,
  Input,
  ScrollView,
  View,
  Separator
} from 'tamagui';

interface BookmarksSheetProps {
  visible: boolean;
  onClose: () => void;
}

export default function BookmarksSheet({ visible, onClose }: BookmarksSheetProps) {
  const { color } = useTheme();
  const {
    bookmarks,
    bookmarkFolders,
    removeBookmark,
    createBookmarkFolder,
    deleteBookmarkFolder,
  } = useBookmarksStore();
  const { tabs, activeTabId, updateTab } = useTabsStore();
  const { theme } = useSettingsStore();
  const toast = useToastController();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // Filter bookmarks based on search query and folder selection
  const filteredBookmarks = bookmarks.filter(bookmark => {
    const matchesSearch = bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          bookmark.url.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedFolderId === null) {
      return matchesSearch && !bookmark.folderId;
    } else {
      return matchesSearch && bookmark.folderId === selectedFolderId;
    }
  });

  const handleBookmarkPress = (bookmark: any) => {
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
  };

  const handleDeleteBookmark = (bookmarkId: string) => {
    removeBookmark(bookmarkId);
    toast.show('Bookmark Deleted', {
      message: 'The bookmark has been removed from your collection.',
    });
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      createBookmarkFolder(newFolderName.trim());
      setNewFolderName('');
      setShowNewFolderModal(false);
      toast.show('Folder Created', {
        message: `"${newFolderName.trim()}" folder has been created successfully.`,
      });
    }
  };

  const handleDeleteFolder = (folderId: string) => {
    const folderBookmarks = bookmarks.filter(bookmark => bookmark.folderId === folderId);
    const folderName = bookmarkFolders.find(f => f.id === folderId)?.name || 'Unknown';
    
    deleteBookmarkFolder(folderId);
    
    if (folderBookmarks.length > 0) {
      toast.show('Folder Deleted', {
        message: `"${folderName}" and ${folderBookmarks.length} bookmarks have been deleted.`,
      });
    } else {
      toast.show('Folder Deleted', {
        message: `"${folderName}" folder has been deleted.`,
      });
    }
  };

  const renderFolder = ({ item }: { item: any }) => (
    <Button
      backgroundColor={selectedFolderId === item.id ? '$gray4' : '$gray2'}
      height="auto"
      paddingVertical="$3"
      marginHorizontal="$2"
      minWidth={120}
      onPress={() => setSelectedFolderId(selectedFolderId === item.id ? null : item.id)}
      pressStyle={{ backgroundColor: '$gray3' }}
    >
      <XStack alignItems="center" space="$2" flex={1}>
        <Folder size={20} color={color.val} />
        <Text fontSize="$4" fontWeight="500" flex={1}>
          {item.name}
        </Text>
        <Text fontSize="$3" color="$gray10">
          {bookmarks.filter(b => b.folderId === item.id).length}
        </Text>
        <Button
          size="$2"
          circular
          backgroundColor="transparent"
          onPress={() => handleDeleteFolder(item.id)}
          icon={<Trash2 size={16} color="#FF3B30" />}
        />
      </XStack>
    </Button>
  );

  const renderBookmark = ({ item }: { item: any }) => (
    <Button
      backgroundColor="$gray2"
      borderRadius="$0"
      height="auto"
      paddingVertical="$3"
      onPress={() => handleBookmarkPress(item)}
      pressStyle={{ backgroundColor: '$gray3' }}
    >
      <XStack alignItems="center" space="$3" flex={1}>
        <View>
          <Globe size={20} color={color.val} />
        </View>
        <YStack flex={1}>
          <Text fontSize="$4" fontWeight="500" numberOfLines={1}>
            {item.title}
          </Text>
          <Text fontSize="$3" color="$gray10" numberOfLines={1}>
            {item.url}
          </Text>
        </YStack>
        <Button
          size="$2"
          circular
          backgroundColor="transparent"
          onPress={() => handleDeleteBookmark(item.id)}
          icon={<Trash2 size={16} color="#FF3B30" />}
        />
      </XStack>
    </Button>
  );

  const rootBookmarksCount = bookmarks.filter(bookmark => !bookmark.folderId).length;

  return (
    <Sheet
      open={visible}
      onOpenChange={onClose}
      dismissOnSnapToBottom
    >
      <Sheet.Overlay />
      <Sheet.Handle />
      
      <Sheet.Frame
        padding="$0"
        backgroundColor="$background"
        borderTopLeftRadius="$6"
        borderTopRightRadius="$6"
      >
        {/* Header */}
        <XStack
          justifyContent="space-between"
          alignItems="center"
          paddingHorizontal="$4"
          paddingVertical="$4"
          borderBottomWidth={1}
          borderBottomColor="$borderColor"
        >
          <Text fontSize="$6" fontWeight="600" color="$color">
            Bookmarks
          </Text>
          <XStack space="$2">
            <Button
              size="$3"
              circular
              backgroundColor="transparent"
              onPress={() => setShowNewFolderModal(true)}
              icon={<FolderPlus size={20} color={color.val} />}
            />
            <Button
              size="$3"
              circular
              icon={<X size={24} />}
              onPress={onClose}
              backgroundColor="transparent"
            />
          </XStack>
        </XStack>

        {/* Search Bar */}
        <XStack
          alignItems="center"
          margin="$4"
          paddingHorizontal="$3"
          height={36}
          backgroundColor="$gray2"
          borderColor="$borderColor"
          borderWidth={1}
          borderRadius="$9"
        >
          <Search size={16} color={color.val} />
          <Input
            flex={1}
            fontSize="$4"
            placeholder="Search bookmarks..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            backgroundColor="transparent"
            borderWidth={0}
          />
        </XStack>

        {/* Folders */}
        {bookmarkFolders.length > 0 && (
          <YStack marginBottom="$4">
            <Text fontSize="$6" fontWeight="600" paddingHorizontal="$5" marginBottom="$3">
              Folders
            </Text>
            <FlatList
              data={bookmarkFolders}
              renderItem={renderFolder}
              keyExtractor={item => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
            />
          </YStack>
        )}

        {/* Current View Indicator */}
        <XStack paddingHorizontal="$5" paddingVertical="$2">
          {selectedFolderId ? (
            <XStack justifyContent="space-between" alignItems="center" flex={1}>
              <Text fontSize="$3" color="$gray10">
                In folder: {bookmarkFolders.find(f => f.id === selectedFolderId)?.name}
              </Text>
              <Button
                size="$2"
                backgroundColor="transparent"
                onPress={() => setSelectedFolderId(null)}
              >
                <Text fontSize="$3" color="#007AFF" fontWeight="500">
                  Show All
                </Text>
              </Button>
            </XStack>
          ) : (
            <Text fontSize="$3" color="$gray10" fontStyle="italic">
              Showing {rootBookmarksCount} bookmarks not in folders
            </Text>
          )}
        </XStack>

        {/* Bookmarks List */}
        <Sheet.ScrollView contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}>
          {filteredBookmarks.length === 0 ? (
            <YStack alignItems="center" justifyContent="center" paddingVertical="$16">
              <Bookmark size={48} />
              <Text fontSize="$6" fontWeight="500" marginTop="$4" color="$gray10">
                {searchQuery
                  ? 'No bookmarks found'
                  : selectedFolderId
                  ? 'No bookmarks in this folder'
                  : 'No bookmarks yet'}
              </Text>
              <Text fontSize="$3" marginTop="$2" textAlign="center" color="$gray10">
                {searchQuery
                  ? 'Try a different search term'
                  : selectedFolderId
                  ? 'Add bookmarks to this folder'
                  : 'Add bookmarks to access them quickly'}
              </Text>
            </YStack>
          ) : (
            filteredBookmarks.map((item) => (
              <React.Fragment key={item.id}>
                {renderBookmark({ item })}
              </React.Fragment>
            ))
          )}
        </Sheet.ScrollView>


        {/* New Folder Modal */}
        {showNewFolderModal && (
          <View
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            backgroundColor="rgba(0,0,0,0.5)"
            alignItems="center"
            justifyContent="center"
            zIndex={1000}
          >
            <View
              backgroundColor="$background"
              borderRadius="$4"
              padding="$6"
              margin="$4"
              width="90%"
              maxWidth={400}
            >
              <YStack space="$4">
                <Text fontSize="$6" fontWeight="600" textAlign="center">
                  New Folder
                </Text>
                <Input
                  placeholder="Folder name"
                  value={newFolderName}
                  onChangeText={setNewFolderName}
                  autoFocus
                  borderColor="$borderColor"
                  borderWidth={1}
                  borderRadius="$2"
                  paddingHorizontal="$3"
                  paddingVertical="$3"
                  fontSize="$4"
                />
                <XStack space="$3">
                  <Button
                    flex={1}
                    onPress={() => {
                      setShowNewFolderModal(false);
                      setNewFolderName('');
                    }}
                  >
                    <Text>Cancel</Text>
                  </Button>
                  <Button
                    flex={1}
                   themeInverse
                    onPress={handleCreateFolder}
                  >
                    <Text>Create</Text>
                  </Button>
                </XStack>
              </YStack>
            </View>
          </View>
        )}
      </Sheet.Frame>
    </Sheet>
  );
}