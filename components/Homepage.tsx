import React, { memo, useState, useRef, useCallback } from 'react';
import { useTheme } from 'tamagui';
import { TextInput, Dimensions } from 'react-native';
import { Search, Clock, Bookmark } from 'lucide-react-native';
import { useBrowserStore } from '@/stores/browserStore';
import FaviconImage from '@/components/ui/FaviconImage';
import { 
  YStack, 
  XStack, 
  Text, 
  Button,
  ScrollView,
  View,
  Input,
  Image
} from 'tamagui';

const { width } = Dimensions.get('window');

interface HomepageProps {
  onSearch: (query: string) => void;
}

const Homepage = memo<HomepageProps>(({ onSearch }) => {
  const { color } = useTheme();
  const { history, bookmarks } = useBrowserStore();
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<TextInput>(null);

  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
      setSearchQuery('');
    }
  }, [searchQuery, onSearch]);

  const handleQuickAction = useCallback((url: string) => {
    onSearch(url);
  }, [onSearch]);

  const recentHistory = history.slice(0, 6);
  const recentBookmarks = bookmarks.slice(0, 6);

  const QuickActionItem = memo<{ item: any; onPress: (url: string) => void }>(({ item, onPress }) => (
    <Button
      onPress={() => onPress(item.url)}
      height="auto"
      paddingVertical="$2"
    >
      <XStack alignItems="center" space="$3">
        <View
          width={32}
          height={32}
          borderRadius="$4"
          backgroundColor="$blue2"
          alignItems="center"
          justifyContent="center"
          overflow="hidden"
        >
          <FaviconImage favicon={item.favicon} size={16} />
        </View>
        <YStack flex={1}>
          <Text fontSize="$3" fontWeight="500" color="$color" numberOfLines={1}>
            {item.title}
          </Text>
          <Text fontSize="$2" color="$gray10" numberOfLines={1}>
            {item.url}
          </Text>
        </YStack>
      </XStack>
    </Button>
  ));

  return (
    <ScrollView 
      flex={1}
      backgroundColor="$background"
      showsVerticalScrollIndicator={false}
    >
      <YStack paddingHorizontal="$4" paddingTop="$15" paddingBottom="$10" space="$10">
        {/* App Icon Header */}
        <YStack alignItems="center" space="$4">
          <Image
            source={require('../assets/images/icon.png')}
            width={120}
            height={120}
            borderRadius="$6"
          />
        </YStack>

        {/* Search Section */}
        <YStack alignItems="center">
          <XStack
            width="100%"
            maxWidth={600}
            height={56}
            backgroundColor="$background"
            borderColor="$borderColor"
            borderWidth={2}
            borderRadius="$10"
            paddingHorizontal="$4"
            alignItems="center"
          >
            <Search size={20} color={color.val} />
            <Input
              ref={inputRef}
              flex={1}
              fontSize="$4"
              placeholder="Search the web or enter URL..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
              backgroundColor="transparent"
              placeholderTextColor="$gray10"
              borderWidth={0}
            />
          </XStack>
        </YStack>

        {/* Recent History */}
        {recentHistory.length > 0 && (
          <YStack space="$4">
            <XStack alignItems="center" space="$2">
              <Clock size={20} color={color.val} />
              <Text fontSize="$6" fontWeight="600" color="$color">
                Recently Visited
              </Text>
            </XStack>
            <YStack space="$2">
              {recentHistory.map((item, index) => (
                <QuickActionItem 
                  key={`history-${index}`} 
                  item={item} 
                  onPress={handleQuickAction} 
                />
              ))}
            </YStack>
          </YStack>
        )}

        {/* Recent Bookmarks */}
        {recentBookmarks.length > 0 && (
          <YStack space="$4">
            <XStack alignItems="center" space="$2">
              <Bookmark size={20} color={color.val} />
              <Text fontSize="$6" fontWeight="600" color="$color">
                Recent Bookmarks
              </Text>
            </XStack>
            <YStack space="$2">
              {recentBookmarks.map((item, index) => (
                <QuickActionItem 
                  key={`bookmark-${index}`} 
                  item={item} 
                  onPress={handleQuickAction} 
                />
              ))}
            </YStack>
          </YStack>
        )}
      </YStack>
    </ScrollView>
  );
});

Homepage.displayName = 'Homepage';

export default Homepage;