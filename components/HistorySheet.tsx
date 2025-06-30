import React, { useState } from 'react';
import { useTheme } from 'tamagui';
import { SectionList } from 'react-native';
import { History, Search, Trash2, Globe, Calendar, X } from 'lucide-react-native';
import { useBrowserHistory } from '@/hooks/useBrowserHistory';
import { useBrowserTabs } from '@/hooks/useBrowserTabs';
import { useBrowserSettings } from '@/hooks/useBrowserSettings';
import { useToastController } from '@tamagui/toast';
import {
  Sheet,
  YStack,
  XStack,
  Text,
  Button,
  Input,
  View
} from 'tamagui';

interface HistorySection {
  title: string;
  data: any[];
}

interface HistorySheetProps {
  visible: boolean;
  onClose: () => void;
}

export default function HistorySheet({ visible, onClose }: HistorySheetProps) {
  const { color } = useTheme();
  const {
    history,
    clearHistory,
    groupHistoryByDate,
  } = useBrowserHistory();
  const { tabs, activeTabId, updateTab } = useBrowserTabs();
  const { theme } = useBrowserSettings();
  const toast = useToastController();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const filteredHistory = history.filter(entry =>
    entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedHistory = (): HistorySection[] => {
    return groupHistoryByDate(filteredHistory);
  };

  const handleHistoryPress = (entry: any) => {
    if (isSelectionMode) {
      toggleSelection(entry.id);
      return;
    }

    let targetTabId = activeTabId;

    if (!targetTabId || tabs.length === 0) {
      onClose();
      return;
    }

    updateTab(targetTabId, {
      url: entry.url,
      title: 'Loading...',
      loading: true
    });

    onClose();
  };

  const toggleSelection = (entryId: string) => {
    setSelectedItems(prev =>
      prev.includes(entryId)
        ? prev.filter(id => id !== entryId)
        : [...prev, entryId]
    );
  };

  const handleClearAll = () => {
    clearHistory();
    setIsSelectionMode(false);
    setSelectedItems([]);
    toast.show('History Cleared', {
      message: 'All Browse history has been deleted.',
    });
  };

  const handleClearSelected = () => {
    if (selectedItems.length === 0) return;

    clearHistory(selectedItems);
    toast.show('Selected History Deleted', {
      message: `${selectedItems.length} history items have been deleted.`,
    });
    setSelectedItems([]);
    setIsSelectionMode(false);
  };

  const handleLongPress = (entryId: string) => {
    if (!isSelectionMode) {
      setIsSelectionMode(true);
      setSelectedItems([entryId]);
    }
  };

  const exitSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedItems([]);
  };

  const renderHistoryItem = ({ item }: { item: any }) => {
    const isSelected = selectedItems.includes(item.id);
    const visitTime = new Date(item.visitedAt).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <Button
        backgroundColor={isSelected ? '$gray4' : '$gray2'}
        onPress={() => handleHistoryPress(item)}
        onLongPress={() => handleLongPress(item.id)}
        height="auto"
        paddingVertical="$3"
        borderRadius="$0"
      >
        <XStack alignItems="center" space="$3" flex={1}>
          {isSelectionMode && (
            <View
              width={20}
              height={20}
              borderRadius="$10"
              borderWidth={2}
              borderColor="#007AFF"
              backgroundColor={isSelected ? '#007AFF' : 'transparent'}
              alignItems="center"
              justifyContent="center"
            >
              {isSelected && <Text color="white" fontSize="$2" fontWeight="600">✓</Text>}
            </View>
          )}

          <View>
            <Globe size={24} color={color.val} />
          </View>

          <YStack flex={1}>
            <Text fontSize="$4" fontWeight="500" numberOfLines={1} marginBottom="$1">
              {item.title}
            </Text>
            <Text fontSize="$3" color="$gray10" numberOfLines={1} marginBottom="$1">
              {item.url}
            </Text>
            <XStack alignItems="center">
              <Text fontSize="$2" color="$gray10">
                {visitTime}
              </Text>
              {item.visitCount > 1 && (
                <Text fontSize="$2" color="$gray10" marginLeft="$1">
                  • {item.visitCount} visits
                </Text>
              )}
            </XStack>
          </YStack>
        </XStack>
      </Button>
    );
  };

  const renderSectionHeader = ({ section }: { section: HistorySection }) => (
    <XStack
      alignItems="center"
      paddingHorizontal="$5"
      paddingVertical="$3"
      backgroundColor="$background"
      space="$2"
    >
      <Calendar size={16} color={color.val} />
      <Text fontSize="$4" fontWeight="600">
        {section.title}
      </Text>
    </XStack>
  );

  return (
    <Sheet
      open={visible}
      onOpenChange={onClose}
      snapPoints={[85]}
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
          {isSelectionMode ? (
            <>
              <Button
                backgroundColor="transparent"
                onPress={exitSelectionMode}
              >
                <Text fontSize="$4" fontWeight="600" color="#007AFF">Cancel</Text>
              </Button>
              <Text fontSize="$6" fontWeight="600" flex={1} textAlign="center">
                {selectedItems.length} Selected
              </Text>
              <Button
                backgroundColor="transparent"
                onPress={handleClearSelected}
              >
                <Text fontSize="$4" fontWeight="600" color="#FF3B30">Delete</Text>
              </Button>
            </>
          ) : (
            <>
              <Text fontSize="$6" fontWeight="600" color="$color">
                History
              </Text>
              <XStack space="$2">
                <Button
                  size="$3"
                  circular
                  backgroundColor="transparent"
                  onPress={handleClearAll}
                  icon={<Trash2 size={20} color="#FF3B30" />}
                />
                <Button
                  size="$3"
                  circular
                  icon={<X size={24} />}
                  onPress={onClose}
                  backgroundColor="transparent"
                />
              </XStack>
            </>
          )}
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
            placeholder="Search history..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            backgroundColor="transparent"
            borderWidth={0}
          />
        </XStack>

        {/* History List */}
        <Sheet.ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          {groupedHistory().length === 0 ? (
            <YStack alignItems="center" justifyContent="center" paddingVertical="$16">
              <History size={48} color={color.val} />
              <Text fontSize="$6" fontWeight="500" marginTop="$4" color="$gray10">
                {searchQuery ? 'No history found' : 'No Browse history'}
              </Text>
              <Text fontSize="$3" marginTop="$2" textAlign="center" color="$gray10">
                {searchQuery ? 'Try a different search term' : 'Your Browse history will appear here'}
              </Text>
            </YStack>
          ) : (
            groupedHistory().map((section) => (
              <YStack key={section.title}>
                {/* Section Header */}
                <XStack
                  alignItems="center"
                  paddingHorizontal="$5"
                  paddingVertical="$3"
                  backgroundColor="$background"
                  space="$2"
                >
                  <Calendar size={16} color={color.val} />
                  <Text fontSize="$4" fontWeight="600">
                    {section.title}
                  </Text>
                </XStack>

                {/* Section Items */}
                {section.data.map((item) => (
                  <React.Fragment key={item.id}>
                    {renderHistoryItem({ item })}
                  </React.Fragment>
                ))}
              </YStack>
            ))
          )}
        </Sheet.ScrollView>
      </Sheet.Frame>
    </Sheet>
  );
}