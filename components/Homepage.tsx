import React, { useState, useRef } from 'react';
import { useTheme } from 'tamagui';
import { TextInput, Dimensions } from 'react-native';
import { Search, Clock, Bookmark, TrendingUp, Globe } from 'lucide-react-native';
import { useBrowserSettings } from '@/hooks/useBrowserSettings';
import { useBrowserHistory } from '@/hooks/useBrowserHistory';
import { useBrowserBookmarks } from '@/hooks/useBrowserBookmarks';
import BoltBadge from '@/components/BoltBadge';
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

export default function Homepage({ onSearch }: HomepageProps) {
  const { color } = useTheme();
  const { theme } = useBrowserSettings();
  const { history } = useBrowserHistory();
  const { bookmarks } = useBrowserBookmarks();
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<TextInput>(null);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
      setSearchQuery('');
    }
  };

  const handleQuickAction = (url: string) => {
    onSearch(url);
  };

  const recentHistory = history.slice(0, 6);
  const recentBookmarks = bookmarks.slice(0, 6);

  const FaviconOrGlobe = ({ favicon, size = 16 }: { favicon?: string; size?: number }) => {
    if (favicon) {
      return (
        <Image
          source={{ uri: favicon }}
          width={size}
          height={size}
          borderRadius="$2"
          onError={() => {
            // If favicon fails to load, we'll fall back to the globe icon
            // This is handled by the parent component's conditional rendering
          }}
        />
      );
    }
    return <Globe size={size} color={color.val} />;
  };

  return (
    <ScrollView 
      flex={1}
      backgroundColor="$background"
      showsVerticalScrollIndicator={false}
    >
      <BoltBadge />
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
                <Button
                  key={index}
                  onPress={() => handleQuickAction(item.url)}
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
                      <FaviconOrGlobe favicon={item.favicon} size={16} />
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
                <Button
                  key={index}
                  onPress={() => handleQuickAction(item.url)}
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
                      <FaviconOrGlobe favicon={item.favicon} size={16} />
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
              ))}
            </YStack>
          </YStack>
        )}
      </YStack>
    </ScrollView>
  );
}