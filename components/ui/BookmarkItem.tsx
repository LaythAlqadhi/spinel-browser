import React, { memo } from 'react';
import { useTheme } from 'tamagui';
import { Globe, Trash2 } from 'lucide-react-native';
import { Bookmark } from '@/store/slices/bookmarksSlice';
import { 
  XStack, 
  YStack, 
  Text, 
  Button,
  View
} from 'tamagui';

interface BookmarkItemProps {
  bookmark: Bookmark;
  onPress: (bookmark: Bookmark) => void;
  onDelete: (bookmarkId: string) => void;
}

const BookmarkItem = memo(({ bookmark, onPress, onDelete }: BookmarkItemProps) => {
  const { color } = useTheme();

  const handlePress = () => {
    onPress(bookmark);
  };

  const handleDelete = () => {
    onDelete(bookmark.id);
  };

  return (
    <Button
      backgroundColor="$gray2"
      borderRadius="$0"
      height="auto"
      paddingVertical="$3"
      onPress={handlePress}
      pressStyle={{ backgroundColor: '$gray3' }}
    >
      <XStack alignItems="center" space="$3" flex={1}>
        <View>
          <Globe size={20} color={color.val} />
        </View>
        <YStack flex={1}>
          <Text fontSize="$4" fontWeight="500" numberOfLines={1}>
            {bookmark.title}
          </Text>
          <Text fontSize="$3" color="$gray10" numberOfLines={1}>
            {bookmark.url}
          </Text>
        </YStack>
        <Button
          size="$2"
          circular
          backgroundColor="transparent"
          onPress={handleDelete}
          icon={<Trash2 size={16} color="#FF3B30" />}
        />
      </XStack>
    </Button>
  );
});

BookmarkItem.displayName = 'BookmarkItem';

export default BookmarkItem;